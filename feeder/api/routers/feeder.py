import logging
import datetime
from typing import List

import pytz
from fastapi import HTTPException

from feeder import settings
from feeder.api.models.kronos import Device, DeviceTelemetry, DeviceUpdate
from feeder.util.feeder import (
    APIRouterWithMQTTClient,
    paginate_response,
    check_connection,
)
from feeder.database.models import (
    KronosDevices,
    DeviceTelemetryData,
    FeedingResult,
    HopperLevelRef,
    StoredRecipe,
)
from feeder.api.models.feeder import (
    TriggerFeeding,
    GenericResponse,
    FeedHistory,
    HopperLevel,
    Recipe,
    RawMQTTMessage,
)

logger = logging.getLogger(__name__)
router = APIRouterWithMQTTClient()


@router.get("", response_model=List[Device])
@router.get("/", response_model=List[Device])
async def get_devices():
    return [
        check_connection(device, router.broker) for device in await KronosDevices.get()
    ]


@router.get("/history", response_model=FeedHistory)
async def get_history(size: int = 10, page: int = 1):
    count_all = await FeedingResult.count()
    history = await FeedingResult.get(offset=page * size, limit=size)
    return paginate_response(
        entities=[{**result} for result in history],
        current_page=page,
        max_page_size=size,
        total_override=count_all,
    )


@router.get("/{device_id}", response_model=Device)
async def get_single_device(device_id: str):
    device = [
        check_connection(device, router.broker)
        for device in await KronosDevices.get(device_hid=device_id)
    ]
    return device[0]


@router.put("/{device_id}", response_model=Device)
async def update_single_device(device_id: str, updated: DeviceUpdate):
    await KronosDevices.update(
        device_hid=device_id,
        name=updated.name,
        timezone=updated.timezone,
        front_button=updated.frontButton,
        recipe_id=updated.currentRecipe,
        black=updated.black,
    )
    devices = await KronosDevices.get(device_hid=device_id)
    device = devices[0]

    if updated.timezone is not None:
        try:
            timezone = pytz.timezone(updated.timezone)
            offset = int(datetime.datetime.now(timezone).utcoffset().total_seconds())
            await router.client.send_cmd_utc_offset(
                gateway_id=device.gatewayHid, device_id=device_id, utc_offset=offset
            )
        except pytz.exceptions.UnknownTimeZoneError:
            logger.exception("Unable to set timezone!")
            raise HTTPException(500, detail="Unknown timezone!")

    if updated.frontButton is not None:
        await router.client.send_cmd_button(
            gateway_id=device.gatewayHid,
            device_id=device_id,
            enable=updated.frontButton,
        )

    if updated.currentRecipe is not None:
        recipe_results = await StoredRecipe.get(recipe_id=updated.currentRecipe)
        if len(recipe_results) > 0:
            recipe = recipe_results[0]
            await router.client.send_cmd_budget(
                gateway_id=device.gatewayHid,
                device_id=device_id,
                recipe_id=recipe.id,
                tbsp_per_feeding=recipe.tbsp_per_feeding,
                g_per_tbsp=recipe.g_per_tbsp,
                budget_tbsp=recipe.budget_tbsp,
            )

    return check_connection(device, router.broker)


@router.delete("/{device_id}")
async def delete_single_device(device_id: str):
    await KronosDevices.delete(device_id)


@router.get("/{device_id}/telemetry", response_model=DeviceTelemetry)
async def get_device_telemetry(device_id: str):
    return await DeviceTelemetryData.get(device_hid=device_id)


@router.get("/{device_id}/history", response_model=FeedHistory)
async def get_device_history(device_id: str, size: int = 10, page: int = 1):
    count_all = await FeedingResult.count(device_hid=device_id)
    history = await FeedingResult.get(
        device_hid=device_id, offset=page * size, limit=size
    )
    return paginate_response(
        entities=[{**result} for result in history],
        current_page=page,
        max_page_size=size,
        total_override=count_all,
    )


@router.post("/{device_id}/hopper", response_model=HopperLevel)
async def set_hopper_level_reference(device_id: str, level: HopperLevel):
    await HopperLevelRef.set(device_id=device_id, level=level.level)
    return {"level": level.level}


@router.get("/{device_id}/hopper", response_model=HopperLevel)
async def get_hopper_level(device_id: str):
    level = await HopperLevelRef.get(device_id)
    return {"level": level}


@router.post("/{device_id}/restart", response_model=GenericResponse)
async def restart_feeder(device_id: str):
    devices = await KronosDevices.get(device_hid=device_id)
    device = devices[0]
    logger.debug("Restarting %s", device_id)
    await router.client.send_cmd_reboot(
        gateway_id=device.gatewayHid, device_id=device_id
    )


@router.post("/{device_id}/feed", response_model=GenericResponse)
async def trigger_feeding(device_id: str, feed: TriggerFeeding):
    devices = await KronosDevices.get(device_hid=device_id)
    device = devices[0]
    logging.debug("Dispensing %f cups of food from %s", feed.portion, device_id)
    await router.client.send_cmd_feed(
        gateway_id=device.gatewayHid, device_id=device_id, portion=feed.portion
    )


@router.post("/{device_id}/raw")
async def publish_raw_message(device_id: str, message: RawMQTTMessage):
    if not settings.debug:
        raise HTTPException(
            403, detail="Raw communication only available in DEBUG mode!"
        )
    devices = await KronosDevices.get(device_hid=device_id)
    device = devices[0]
    logger.debug(
        "RAW MQTT MESSAGE [GW: %s] [D: %s] CMD: %s ARGS: %s",
        device.gatewayHid,
        device.hid,
        message.command,
        message.args,
    )
    await router.client.send_cmd(
        device.gatewayHid, device.hid, message.command, message.args
    )


@router.get("/{device_id}/recipe", response_model=Recipe)
async def get_current_recipe(device_id: str):
    devices = await KronosDevices.get(device_hid=device_id)
    device = devices[0]
    if not device.currentRecipe:
        raise HTTPException(400, detail="No recipe set for this device!")
    recipe = await StoredRecipe.get(recipe_id=device.currentRecipe)
    return recipe[0]


@router.put("/{device_id}/recipe", response_model=Recipe)
async def create_or_update_recipe(device_id: str, recipe: Recipe):
    devices = await KronosDevices.get(device_hid=device_id)
    device = devices[0]
    if not device.currentRecipe:
        logger.debug("Setting initial recipe for feeder: %s", device_id)
        new_recipe = await StoredRecipe.create(
            g_per_tbsp=recipe.g_per_tbsp,
            tbsp_per_feeding=recipe.tbsp_per_feeding,
            name=recipe.name,
            budget_tbsp=recipe.budget_tbsp,
        )
        await KronosDevices.update(device_hid=device_id, recipe_id=new_recipe)
        results = await StoredRecipe.get(recipe_id=new_recipe)
    else:
        logger.debug("Updating recipe for feeder: %s", device_id)
        await StoredRecipe.update(
            recipe_id=device.currentRecipe,
            g_per_tbsp=recipe.g_per_tbsp,
            tbsp_per_feeding=recipe.tbsp_per_feeding,
            name=recipe.name,
            budget_tbsp=recipe.budget_tbsp,
        )
        results = await StoredRecipe.get(recipe_id=device.currentRecipe)

    target_recipe = results[0]
    await router.client.send_cmd_budget(
        gateway_id=device.gatewayHid,
        device_id=device.hid,
        recipe_id=target_recipe.id,
        tbsp_per_feeding=target_recipe.tbsp_per_feeding,
        g_per_tbsp=target_recipe.g_per_tbsp,
        budget_tbsp=target_recipe.budget_tbsp,
    )
    return target_recipe
