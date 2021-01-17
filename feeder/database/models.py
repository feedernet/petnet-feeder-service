# pylint: disable=no-value-for-parameter
# SQLAlchemy uses parameter injecting decorators... pylint no-likey
# https://github.com/sqlalchemy/sqlalchemy/issues/4656

import logging
from sqlite3 import IntegrityError

from fastapi import HTTPException
from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    ForeignKey,
    Table,
    Text,
    Float,
    func,
    select,
    desc,
)
from sqlalchemy.sql.expression import literal

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
    Column("timezone", Text(), nullable=True),
    Column("frontButton", Boolean(), nullable=True),
    Column("currentRecipe", Integer(), ForeignKey("recipes.id"), nullable=True),
    Column("black", Boolean(), nullable=True),
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
                status_code=400,
                detail=f"No devices registered for Gateway: {gateway_hid}",
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
        await KronosDevices.get_or_insert(
            gateway_hid=gateway_hid, device_hid=device_hid
        )
        query = (
            devices.update()
            .where(devices.c.hid == device_hid)
            .values(lastPingedAt=get_current_timestamp())
        )
        results = await db.execute(query)
        return results

    @classmethod
    async def update(
        cls,
        *,
        device_hid: str,
        name: str = None,
        timezone: str = None,
        front_button: bool = None,
        recipe_id: int = None,
        black: bool = None,
    ):
        values = {}
        if name is not None:
            values["name"] = name
        if timezone is not None:
            values["timezone"] = timezone
        if front_button is not None:
            values["frontButton"] = front_button
        if recipe_id is not None:
            values["currentRecipe"] = recipe_id
        if black is not None:
            values["black"] = black
        query = devices.update().where(devices.c.hid == device_hid).values(**values)
        results = await db.execute(query)
        return results

    @classmethod
    async def delete(cls, device_id):
        device = await KronosDevices.get(device_hid=device_id)
        await DeviceTelemetryData.clear_for_device(device_id)
        await FeedingResult.clear_for_device(device_id)

        device_query = devices.delete().where(devices.c.hid == device_id)
        gateway_query = gateways.delete().where(gateways.c.hid == device[0].hid)
        await db.execute(device_query)
        await db.execute(gateway_query)


sensor_data = Table(
    "kronos_device_sensors",
    metadata,
    Column("device_hid", Text(), ForeignKey("kronos_device.hid"), primary_key=True),
    Column("timestamp", Integer(), nullable=False),
    Column("voltage", Float(), nullable=False),
    Column("usb_power", Boolean(), nullable=False),
    Column("charging", Boolean(), nullable=False),
    Column("ir", Boolean(), nullable=False),
    Column("rssi", Integer(), nullable=False),
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
    async def report(
        cls,
        *,
        gateway_hid: str,
        device_hid: str,
        voltage: float,
        usb_power: bool,
        charging: bool,
        ir: bool,
        rssi: int,
    ):
        sensors = {
            "timestamp": get_current_timestamp(),
            "voltage": voltage,
            "usb_power": usb_power,
            "charging": charging,
            "ir": ir,
            "rssi": rssi,
        }
        query_last_report = sensor_data.select().where(
            sensor_data.c.device_hid == device_hid
        )
        last_report = await db.fetch_all(query_last_report)

        if last_report:
            query = (
                sensor_data.update()
                .where(sensor_data.c.device_hid == device_hid)
                .values(**sensors)
            )
        else:
            # We may have never seen this device before, so make sure the device exists.
            device = await KronosDevices.get_or_insert(
                device_hid=device_hid, gateway_hid=gateway_hid
            )
            query = sensor_data.insert().values(device_hid=device.hid, **sensors)

        results = await db.execute(query)
        return results

    @classmethod
    async def clear_for_device(cls, device_id):
        query = sensor_data.delete().where(sensor_data.c.device_hid == device_id)
        return await db.execute(query)


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
    Column(
        "fail", Boolean(), nullable=False, default=False, server_default=literal(False)
    ),
    Column(
        "trip", Boolean(), nullable=True, default=False, server_default=literal(False)
    ),
    Column(
        "lrg", Boolean(), nullable=True, default=False, server_default=literal(False)
    ),
    Column(
        "vol", Boolean(), nullable=True, default=False, server_default=literal(False)
    ),
    Column(
        "bowl", Boolean(), nullable=True, default=False, server_default=literal(False)
    ),
    Column("error", Text(), nullable=True),
    Column(
        "recipe_id", Text(), nullable=False, default="UNKNOWN", server_default="UNKNOWN"
    ),
)


class FeedingResult:
    @classmethod
    async def get(cls, device_hid="", offset=0, limit=10):
        join = feeding_event.join(devices, feeding_event.c.device_hid == devices.c.hid)
        query = (
            select([feeding_event, devices.c.name.label("device_name")])
            .select_from(join)
            .order_by(desc(feeding_event.c.start_time))
        )
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
    async def report(
        cls,
        *,
        device_hid: str,
        start_time: int,
        end_time: int,
        pour: int,
        full: int,
        grams_expected: int,
        grams_actual: int,
        hopper_start: int,
        hopper_end: int,
        recipe_id: str,
        fail: bool,
        source=None,
        trip=None,
        lrg=None,
        vol=None,
        bowl=None,
        error=None,
    ):
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
            error=error,
        )
        try:
            return await db.execute(query)
        except IntegrityError:
            logger.exception("Unable to save feed result!")

    @classmethod
    async def clear_for_device(cls, device_id):
        query = feeding_event.delete().where(feeding_event.c.device_hid == device_id)
        return await db.execute(query)


pets = Table(
    "pets",
    metadata,
    Column("id", Integer(), primary_key=True),
    Column("name", Integer(), nullable=False),
    Column("image", Text(), nullable=True),
    Column("animal_type", Text(), nullable=False),
    Column("weight", Float(), nullable=False),
    Column("birthday", Integer(), nullable=False),
    Column("activity_level", Integer(), nullable=False),
    Column("device_hid", Text(), ForeignKey("kronos_device.hid"), nullable=True),
)


class Pet:
    @classmethod
    async def get(cls, pet_id: int = None):
        query = pets.select()
        if pet_id is not None:
            query = query.where(pets.c.id == pet_id)

        results = await db.fetch_all(query)
        if not results and pet_id:
            logger.error("No pets found with ID: %d", pet_id)
            raise HTTPException(404, detail=f"No pet found with ID {pet_id}")

        if not results:
            raise HTTPException(404, detail="No pets found!")

        return results

    @classmethod
    async def create(
        cls,
        *,
        name: str,
        animal_type: str,
        weight: float,
        birthday: int,
        image: str = None,
        activity_level: int,
        device_hid: str = None,
    ):
        values = {
            "name": name,
            "animal_type": animal_type,
            "weight": weight,
            "birthday": birthday,
            "activity_level": activity_level,
        }

        if image is not None:
            values["image"] = image

        if device_hid is not None:
            # Ensure the device exists
            await KronosDevices.get(device_hid=device_hid)
            values["device_hid"] = device_hid

        query = pets.insert().values(**values)
        return await db.execute(query)

    @classmethod
    async def delete(cls, pet_id: int):
        query = pets.delete().where(pets.c.id == pet_id)
        return await db.execute(query)

    @classmethod
    async def update(
        cls,
        pet_id: int,
        name: str = None,
        animal_type: str = None,
        weight: float = None,
        birthday: int = None,
        image: str = None,
        activity_level: int = None,
        device_hid: str = None,
    ):
        values = {}
        if name:
            values["name"] = name
        if animal_type:
            values["animal_type"] = animal_type
        if weight:
            values["weight"] = weight
        if birthday:
            values["birthday"] = birthday
        if activity_level:
            values["activity_level"] = activity_level
        if image:
            values["image"] = image
        if device_hid:
            values["device_hid"] = device_hid

        query = pets.update().where(pets.c.id == pet_id).values(**values)
        return await db.execute(query)


recipes = Table(
    "recipes",
    metadata,
    Column("id", Integer(), primary_key=True),
    Column("name", Text(), nullable=True),
    Column("g_per_tbsp", Integer(), nullable=False),
    Column("tbsp_per_feeding", Integer(), nullable=False),
    Column("budget_tbsp", Integer(), nullable=False),
)


class StoredRecipe:
    @classmethod
    async def get(cls, recipe_id: int = None):
        query = recipes.select()
        if recipe_id is not None:
            query = query.where(recipes.c.id == recipe_id)

        return await db.fetch_all(query)

    @classmethod
    async def create(
        cls,
        *,
        name: str = "",
        g_per_tbsp: int,
        tbsp_per_feeding: int,
        budget_tbsp: int = 0,
    ):
        query = recipes.insert().values(
            name=name or None,
            g_per_tbsp=g_per_tbsp,
            tbsp_per_feeding=tbsp_per_feeding,
            budget_tbsp=budget_tbsp or tbsp_per_feeding,
        )
        return await db.execute(query)

    @classmethod
    async def update(
        cls,
        recipe_id: int,
        name: str = None,
        g_per_tbsp: int = None,
        tbsp_per_feeding: int = None,
        budget_tbsp: int = None,
    ):
        values = {}
        if name:
            values["name"] = name
        if g_per_tbsp:
            values["g_per_tbsp"] = g_per_tbsp
        if tbsp_per_feeding:
            values["tbsp_per_feeding"] = tbsp_per_feeding
        if budget_tbsp:
            values["budget_tbsp"] = budget_tbsp
        query = recipes.update().where(recipes.c.id == recipe_id).values(**values)
        return await db.execute(query)


# We will store a level reference every time someone manually updates the amount
# of food in the hopper. From there we can find the latest reference and subtract
# the total volume of all feed results since that reference. That will give us a
# estimate of how much food remains.
hopper_level_references = Table(
    "hopper_references",
    metadata,
    Column("device_hid", Text(), ForeignKey("kronos_device.hid"), primary_key=True),
    Column("timestamp", Integer(), primary_key=True),
    Column("level", Integer(), nullable=False),
)


class HopperLevelRef:
    @classmethod
    async def get(cls, device_id):
        # Fun fact: according to my napkin math, if you measured Jeff Bezos'
        # wealth in rice like that viral TikTok, you could fit ~14% of it
        # in the hopper of your smart pet feeder.
        max_hopper_cups = 20.5
        tbsp_per_cup = 16

        device_results = await KronosDevices.get(device_hid=device_id)
        device = device_results[0]
        latest_ref_query = (
            hopper_level_references.select()
            .order_by(desc(hopper_level_references.c.timestamp))
            .where(hopper_level_references.c.device_hid == device_id)
        )
        latest_ref = await db.fetch_one(latest_ref_query)
        if not latest_ref:
            raise HTTPException(404, detail=f"Hopper level not set for {device_id}")

        logger.debug(
            "Hopper level last set to %d on %d", latest_ref.level, latest_ref.timestamp
        )

        dispensed_grams_query = (
            select([func.sum(feeding_event.c.grams_expected)])
            .select_from(feeding_event)
            .where(feeding_event.c.start_time >= latest_ref.timestamp)
            .where(feeding_event.c.device_hid == device_id)
        )
        # TODO: So, this isn't _technically_ the most correct way to do this.
        # We are making the assumption that all of the dispensed feeds from the last reference
        # are the current recipe. While this isn't an unfair assumption, since food level
        # would change and should be updated by the user if the food changes, we are relying on
        # the user to do the right thing... Which, yah, good luck with that.
        dispensed_grams = await db.fetch_val(dispensed_grams_query)
        if not dispensed_grams:
            dispensed_grams = 0
        logger.debug(
            "%d grams of food have been dispensed since %d",
            dispensed_grams,
            latest_ref.timestamp,
        )
        recipe_query = recipes.select().where(recipes.c.id == device.currentRecipe)
        recipe = await db.fetch_one(recipe_query)
        if not recipe:
            raise HTTPException(
                400, detail="No recipe set for device, cannot calculate hopper level!"
            )
        dispensed_cups = (dispensed_grams / recipe.g_per_tbsp) / tbsp_per_cup
        logger.debug(
            "Using recipeId (%d), at %d g/tbsp, that is %f cups",
            recipe.id,
            recipe.g_per_tbsp,
            dispensed_cups,
        )
        ref_level_cups = (latest_ref.level / 100) * max_hopper_cups
        current_cups = ref_level_cups - dispensed_cups
        logger.debug(
            "%f cups minus %f cups equals %f cups remaining",
            ref_level_cups,
            dispensed_cups,
            current_cups,
        )
        return (current_cups / max_hopper_cups) * 100

    @classmethod
    async def set(cls, *, device_id: str, level: int):
        target_device = await KronosDevices.get(device_hid=device_id)
        query = hopper_level_references.insert().values(
            device_hid=target_device[0].hid,
            timestamp=get_current_timestamp(),
            level=level,
        )
        return await db.execute(query)


schedules = Table(
    "pet_feed_schedule",
    metadata,
    Column("pet_id", Text(), ForeignKey("pets.id"), primary_key=True),
    # This is the number of seconds since 12:00AM
    Column("time", Integer(), primary_key=True),
    Column("enabled", Boolean(), nullable=False),
)
