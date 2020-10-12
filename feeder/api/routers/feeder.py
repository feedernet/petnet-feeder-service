import logging

from feeder.util.feeder import APIRouterWithMQTTClient

from feeder.api.models.feeder import (
    FrontButton,
    UTCOffset,
    TriggerFeeding,
    GenericResponse,
)

logger = logging.getLogger(__name__)
router = APIRouterWithMQTTClient()


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
    await router.client.send_cmd_utc_offset(gateway_id, device_id=device_id ,utc_offset=offset.utc_offset)


@router.post("/{gateway_id}/{device_id}/feed", response_model=GenericResponse)
async def trigger_feeding(gateway_id: str, device_id: str, feed: TriggerFeeding):
    logging.debug("Dispensing %f cups of food from hopper", feed.portion)
    await router.client.send_cmd_feed(gateway_id, device_id=device_id, portion=feed.portion)
