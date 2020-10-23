from fastapi import HTTPException
from sqlalchemy import Boolean, Column, Integer, ForeignKey, Table, Text, Float
from sqlite3 import IntegrityError
import logging

from feeder.util.feeder import generate_feeder_hid
from feeder.util import get_current_timestamp
from feeder.database.session import db, metadata


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
    Column("discoveredAt", Integer(), nullable=False)
)


class KronosGateways:
    @classmethod
    async def get(cls, gateway_hid = ""):
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
    async def get_by_hid(cls, device_hid=""):
        query = devices.select()
        if device_hid:
            query = query.where(devices.c.hid == device_hid)


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
        device = await KronosDevices.get_or_insert(gateway_hid=gateway_hid, device_hid=device_hid)
        query = devices.update().where(devices.c.hid == device_hid).values(
            lastPingedAt=get_current_timestamp()
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
    async def report(cls, *, gateway_hid: str, device_hid: str, voltage: float, usb_power: bool, charging: bool, ir: bool, rssi: int):
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
    "feeding_event",
    metadata,
    Column("id", Integer(), primary_key=True),
    Column("timestamp", Integer(), nullable=False),
    Column("device_hid", Text(), ForeignKey("kronos_device.hid"), nullable=False)
)

schedules = Table(
    "feeding_schedule",
    metadata,
    Column("device_hid", Text(), ForeignKey("kronos_device.hid"), primary_key=True),
    # This is the number of seconds since 12:00AM
    Column("time", Integer(), primary_key=True)
)
