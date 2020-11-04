import logging
from fastapi import HTTPException
from sqlalchemy import Boolean, Column, Integer, ForeignKey, Table, Text, Float, func, select, desc
from sqlalchemy.sql.expression import literal
from sqlite3 import IntegrityError

from feeder.util.feeder import generate_api_key, generate_feeder_hid
from feeder.util import get_current_timestamp
from feeder.database.session import db, metadata

logger = logging.getLogger(__name__)


def handle_potential_registration(model: dict):
    if "hid" not in model and "uid" in model:
        model["hid"] = generate_feeder_hid(model["uid"])
    if "discoveredAt" not in model:
        model["discoveredAt"] = get_current_timestamp()
    return model


gateways = Table(
    "kronos_gateway",
    metadata,
    Column("hid", Text(), primary_key=True, index=True),
    Column("name", Text(), nullable=True),
    Column("uid", Text(), nullable=True),
    Column("osName", Text(), nullable=True),
    Column("type", Text(), nullable=True),
    Column("softwareName", Text(), nullable=True),
    Column("softwareVersion", Text(), nullable=True),
    Column("sdkVersion", Text(), nullable=True),
    Column("discoveredAt", Integer(), nullable=False),
    Column("apiKey", Text(), nullable=False),
)


class KronosGateways:
    @classmethod
    async def get(cls, gateway_hid=""):
        query = gateways.select()
        if gateway_hid:
            query = query.where(gateways.c.hid == gateway_hid)

        results = await db.fetch_all(query)
        if gateway_hid and not results:
            raise HTTPException(
                status_code=400, detail=f"Unregistered Gateway ({gateway_hid})"
            )
        results = await db.fetch_all(query)
        return results

    @classmethod
    async def create(cls, **gateway):
        gateway = handle_potential_registration(gateway)
        if "apiKey" not in gateway:
            gateway["apiKey"] = generate_api_key()

        query = gateways.insert().values(**gateway)
        results = await db.execute(query)
        return results

    @classmethod
    async def get_or_insert(cls, *, gateway_hid):
        query = gateways.select().where(gateways.c.hid == gateway_hid)
        results = await db.fetch_all(query)
        if not results:
            await KronosGateways.create(hid=gateway_hid)
            results = await db.fetch_all(query)
        return results[0]


devices = Table(
    "kronos_device",
    metadata,
    Column("hid", Text(), primary_key=True, index=True),
    Column("name", Text(), nullable=True),
    Column("uid", Text(), nullable=True),
    Column("type", Text(), nullable=True),
    Column("gatewayHid", Text(), ForeignKey("kronos_gateway.hid"), nullable=False),
    Column("softwareName", Text(), nullable=True),
    Column("softwareVersion", Text(), nullable=True),
    Column("discoveredAt", Integer(), nullable=False),
    Column("lastPingedAt", Integer(), nullable=True),
)


class KronosDevices:
    @classmethod
    async def get(cls, gateway_hid="", device_hid=""):
        query = devices.select()
        if gateway_hid:
            query = query.where(devices.c.gatewayHid == gateway_hid)
        if device_hid:
            query = query.where(devices.c.hid == device_hid)

        results = await db.fetch_all(query)
        if gateway_hid and not results:
            raise HTTPException(
                status_code=400, detail=f"No devices registered for Gateway: {gateway_hid}"
            )
        if device_hid and not results:
            raise HTTPException(
                status_code=400, detail=f"No devices found with HID: {device_hid}"
            )
        return results

    @classmethod
    async def create(cls, **device):
        device = handle_potential_registration(device)

        query = devices.insert().values(**device)
        results = await db.execute(query)
        return results

    @classmethod
    async def get_or_insert(cls, *, gateway_hid, device_hid):
        query = devices.select().where(devices.c.gatewayHid == gateway_hid)
        results = await db.fetch_all(query)
        if not results:
            gateway = await KronosGateways.get_or_insert(gateway_hid=gateway_hid)
            await KronosDevices.create(hid=device_hid, gatewayHid=gateway.hid)
            results = await db.fetch_all(query)
        return results[0]

    @classmethod
    async def ping(cls, *, gateway_hid, device_hid):
        await KronosDevices.get_or_insert(gateway_hid=gateway_hid, device_hid=device_hid)
        query = devices.update().where(devices.c.hid == device_hid).values(
            lastPingedAt=get_current_timestamp()
        )
        results = await db.execute(query)
        return results

    @classmethod
    async def update(cls, *, device_hid: str, name: str):
        query = devices.update().where(devices.c.hid == device_hid).values(
            name=name
        )
        results = await db.execute(query)
        return results


sensor_data = Table(
    "kronos_device_sensors",
    metadata,
    Column("device_hid", Text(), ForeignKey("kronos_device.hid"), primary_key=True),
    Column("timestamp", Integer(), nullable=False),
    Column("voltage", Float(), nullable=False),
    Column("usb_power", Boolean(), nullable=False),
    Column("charging", Boolean(), nullable=False),
    Column("ir", Boolean(), nullable=False),
    Column("rssi", Integer(), nullable=False)
)


class DeviceTelemetryData:
    @classmethod
    async def get(cls, device_hid):
        query = sensor_data.select().where(sensor_data.c.device_hid == device_hid)
        results = await db.fetch_all(query)
        if not results:
            raise HTTPException(
                status_code=400, detail="Unknown device or device has not yet reported!"
            )
        return results[0]

    @classmethod
    async def report(cls, *, gateway_hid: str, device_hid: str, voltage: float, usb_power: bool, charging: bool,
                     ir: bool, rssi: int):
        sensors = {
            "timestamp": get_current_timestamp(),
            "voltage": voltage,
            "usb_power": usb_power,
            "charging": charging,
            "ir": ir,
            "rssi": rssi
        }
        query_last_report = sensor_data.select().where(sensor_data.c.device_hid == device_hid)
        last_report = await db.fetch_all(query_last_report)

        if last_report:
            query = sensor_data.update().where(sensor_data.c.device_hid == device_hid).values(
                **sensors
            )
        else:
            # We may have never seen this device before, so make sure the device exists.
            device = await KronosDevices.get_or_insert(device_hid=device_hid, gateway_hid=gateway_hid)
            query = sensor_data.insert().values(device_hid=device.hid, **sensors)

        results = await db.execute(query)
        return results


feeding_event = Table(
    "feed_event",
    metadata,
    Column("device_hid", Text(), ForeignKey("kronos_device.hid"), primary_key=True),
    Column("start_time", Integer(), primary_key=True),
    Column("end_time", Integer(), nullable=False, default=0, server_default="0"),
    Column("timestamp", Integer(), nullable=False),
    Column("pour", Integer(), nullable=True, default=0, server_default="0"),
    Column("full", Integer(), nullable=True, default=0, server_default="0"),
    Column("grams_expected", Integer(), nullable=False, default=0, server_default="0"),
    Column("grams_actual", Integer(), nullable=False, default=0, server_default="0"),
    Column("hopper_start", Integer(), nullable=False, default=0, server_default="0"),
    Column("hopper_end", Integer(), nullable=False, default=0, server_default="0"),
    Column("source", Integer(), nullable=True, default=0, server_default="0"),
    Column("fail", Boolean(), nullable=False, default=False, server_default=literal(False)),
    Column("trip", Boolean(), nullable=True, default=False, server_default=literal(False)),
    Column("lrg", Boolean(), nullable=True, default=False, server_default=literal(False)),
    Column("vol", Boolean(), nullable=True, default=False, server_default=literal(False)),
    Column("bowl", Boolean(), nullable=True, default=False, server_default=literal(False)),
    Column("error", Text(), nullable=True),
    Column("recipe_id", Text(), nullable=False, default="UNKNOWN", server_default="UNKNOWN"),
)


class FeedingResult:
    @classmethod
    async def get(cls, device_hid="", offset=0, limit=10):
        join = feeding_event.join(devices, feeding_event.c.device_hid == devices.c.hid)
        query = select(
            [feeding_event, devices.c.name.label("device_name")]
        ).select_from(join).order_by(desc(feeding_event.c.start_time))
        if device_hid:
            query = query.where(feeding_event.c.device_hid == device_hid)
        query.offset(offset).limit(limit)
        return await db.fetch_all(query)

    @classmethod
    async def count(cls, device_hid=""):
        """
        We are going to be paginating these and we need a quick way to
        derive a page count.
        """
        query = select([func.count()]).select_from(feeding_event)
        if device_hid:
            query = query.where(feeding_event.c.device_hid == device_hid)
        return await db.fetch_val(query)

    @classmethod
    async def report(cls, *, device_hid: str, start_time: int, end_time: int, pour: int, full: int, grams_expected: int,
                     grams_actual: int, hopper_start: int, hopper_end: int, recipe_id: str, fail: bool, source=None,
                     trip=None, lrg=None, vol=None, bowl=None, error=None):
        query = feeding_event.insert().values(
            device_hid=device_hid,
            timestamp=get_current_timestamp(),
            start_time=start_time * 1000000,
            end_time=end_time * 1000000,
            pour=pour,
            full=full,
            grams_expected=grams_expected,
            grams_actual=grams_actual,
            hopper_start=hopper_start,
            hopper_end=hopper_end,
            source=source,
            fail=fail,
            trip=trip,
            lrg=lrg,
            vol=vol,
            bowl=bowl,
            recipe_id=recipe_id,
            error=error
        )
        try:
            return await db.execute(query)
        except IntegrityError:
            logger.exception("Unable to save feed result!")


schedules = Table(
    "feeding_schedule",
    metadata,
    Column("device_hid", Text(), ForeignKey("kronos_device.hid"), primary_key=True),
    # This is the number of seconds since 12:00AM
    Column("time", Integer(), primary_key=True)
)
