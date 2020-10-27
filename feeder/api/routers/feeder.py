import logging
from typing import List

from feeder.api.models.kronos import Device, DeviceTelemetry
from feeder.util.feeder import APIRouterWithMQTTClient, paginate_response
from feeder.database.models import KronosDevices, DeviceTelemetryData, FeedingResult
from feeder.api.models.feeder import (
    FrontButton,
    UTCOffset,
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
    return await KronosDevices.get(device_hid=device_id)


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


@router.post("/{gateway_id}/{device_id}/button", response_model=GenericResponse)
async def set_button(gateway_id: str, device_id: str, button: FrontButton):
    logger.debug("Enabling front button: %r", button.enable)
    await router.client.send_cmd_button(gateway_id, device_id=device_id, enable=button.enable)


@router.post("/{gateway_id}/{device_id}/restart", response_model=GenericResponse)
async def restart_feeder(gateway_id: str, device_id: str):
    logger.debug("Restarting feeder")
    await router.client.send_cmd_reboot(gateway_id, device_id=device_id)


@router.post("/{gateway_id}/{device_id}/utc_offset", response_model=GenericResponse)
async def set_feeder_offset(gateway_id: str, device_id: str, offset: UTCOffset):
    logger.debug("Setting feeder to UTC offset: %d", offset.utc_offset)
    await router.client.send_cmd_utc_offset(gateway_id, device_id=device_id, utc_offset=offset.utc_offset)


@router.post("/{gateway_id}/{device_id}/feed", response_model=GenericResponse)
async def trigger_feeding(gateway_id: str, device_id: str, feed: TriggerFeeding):
    logging.debug("Dispensing %f cups of food from hopper", feed.portion)
    await router.client.send_cmd_feed(gateway_id, device_id=device_id, portion=feed.portion)
