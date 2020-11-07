import logging
import datetime
from typing import List

import pytz
from fastapi import HTTPException
from sqlite3 import IntegrityError

from feeder.api.models.kronos import Device, DeviceTelemetry, DeviceUpdate
from feeder.util.feeder import APIRouterWithMQTTClient, paginate_response
from feeder.database.models import KronosDevices, DeviceTelemetryData, FeedingResult
from feeder.api.models.feeder import (
    TriggerFeeding,
    GenericResponse,
    FeedHistory
)

logger = logging.getLogger(__name__)
router = APIRouterWithMQTTClient()


@router.get("", response_model=List[Device])
@router.get("/", response_model=List[Device])
async def get_devices():
    return await KronosDevices.get()


@router.get("/history", response_model=FeedHistory)
async def get_history(size: int = 10, page: int = 1):
    count_all = await FeedingResult.count()
    history = await FeedingResult.get(
        offset=page * size,
        limit=size
    )
    return paginate_response(
        entities=[{**result} for result in history],
        current_page=page,
        max_page_size=size,
        total_override=count_all
    )


@router.get("/{device_id}", response_model=Device)
async def get_single_device(device_id: str):
    device = await KronosDevices.get(device_hid=device_id)
    return device[0]


@router.put("/{device_id}", response_model=Device)
async def update_single_device(device_id: str, updated: DeviceUpdate):
    await KronosDevices.update(
        device_hid=device_id,
        name=updated.name,
        timezone=updated.timezone,
        front_button=updated.frontButton
    )
    devices = await KronosDevices.get(device_hid=device_id)
    device = devices[0]

    if updated.timezone is not None:
        try:
            timezone = pytz.timezone(updated.timezone)
            offset = int(datetime.datetime.now(timezone).utcoffset().total_seconds())
            await router.client.send_cmd_utc_offset(
                gateway_id=device.gatewayHid,
                device_id=device_id,
                utc_offset=offset)
        except pytz.exceptions.UnknownTimeZoneError:
            logger.exception("Unable to set timezone!")
            raise HTTPException(500, detail="Unknown timezone!")

    if updated.frontButton is not None:
        await router.client.send_cmd_button(
            gateway_id=device.gatewayHid,
            device_id=device_id,
            enable=updated.frontButton)

    return device


@router.delete("/{device_id}")
async def get_single_device(device_id: str):
    try:
        await KronosDevices.delete(device_id)
    except IntegrityError:
        logger.exception("Unable to delete device: %s", device_id)
        raise HTTPException(500, "Error deleting device!")


@router.get("/{device_id}/telemetry", response_model=DeviceTelemetry)
async def get_device_telemetry(device_id: str):
    return await DeviceTelemetryData.get(device_hid=device_id)


@router.get("/{device_id}/history", response_model=FeedHistory)
async def get_history(device_id: str, size: int = 10, page: int = 1):
    count_all = await FeedingResult.count(device_hid=device_id)
    history = await FeedingResult.get(
        device_hid=device_id,
        offset=page * size,
        limit=size
    )
    return paginate_response(
        entities=[{**result} for result in history],
        current_page=page,
        max_page_size=size,
        total_override=count_all
    )


@router.post("/{device_id}/restart", response_model=GenericResponse)
async def restart_feeder(device_id: str):
    devices = await KronosDevices.get(device_hid=device_id)
    device = devices[0]
    logger.debug("Restarting %s", device_id)
    await router.client.send_cmd_reboot(gateway_id=device.gatewayHid, device_id=device_id)


@router.post("/{gateway_id}/{device_id}/feed", response_model=GenericResponse)
async def trigger_feeding(device_id: str, feed: TriggerFeeding):
    devices = await KronosDevices.get(device_hid=device_id)
    device = devices[0]
    logging.debug("Dispensing %f cups of food from %s", feed.portion, device_id)
    await router.client.send_cmd_feed(gateway_id=device.gatewayHid, device_id=device_id, portion=feed.portion)
