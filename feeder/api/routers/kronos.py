import logging
from typing import Optional

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from sqlite3 import IntegrityError

from feeder.api.models.kronos import (
    PaginatedGatewayList,
    AddGatewayResponse,
    NewGateway,
    NewDevice,
    GatewayConfiguration,
    PaginatedDeviceList,
)
from feeder.util.feeder import paginate_response, generate_feeder_hid
from feeder.database.models import KronosGateways, KronosDevices

logger = logging.getLogger(__name__)
kronos_headers = {"content-type": "application/json;charset=UTF-8"}

router = APIRouter()


@router.get("/gateways", response_model=PaginatedGatewayList)
async def get_gateways():
    all_gateways = await KronosGateways.get()
    formatted_feeders = [
        {"pri": f"arw:pgs:gwy:{gateway['hid']}", **gateway} for gateway in all_gateways
    ]

    return paginate_response(
        entities=formatted_feeders, max_page_size=len(formatted_feeders)
    )


@router.post("/gateways", response_model=AddGatewayResponse)
async def add_gateway(gateway: NewGateway):
    gateway_hid = generate_feeder_hid(gateway.uid)
    try:
        await KronosGateways.create(**gateway.dict())
        content = {"hid": gateway_hid, "message": "OK"}
    except IntegrityError:
        logger.debug("Gateway (%s) already registered!", gateway_hid)
        content = {"hid": gateway_hid, "message": "gateway is already registered"}
        return JSONResponse(content=content, headers=kronos_headers)

    return JSONResponse(content=content, headers=kronos_headers)


@router.get("/devices", response_model=PaginatedDeviceList)
async def get_devices(gateway_hid: Optional[str] = Query(None, alias="gatewayHid")):
    devices = await KronosDevices.get(gateway_hid=gateway_hid)
    device_array = [{**device} for device in devices]

    content = paginate_response(entities=device_array, max_page_size=len(devices))
    return JSONResponse(content=content, headers=kronos_headers)


@router.post("/devices", response_model=AddGatewayResponse)
async def register_feeder(device: NewDevice):
    # Generate the feeder device HID
    device_hid = generate_feeder_hid(device.uid)

    try:
        await KronosDevices.create(**device.dict())
    except IntegrityError:
        logger.debug("Device (%s) already registered!", device_hid)

    content = {
        "hid": device_hid,
        "links": {},
        "message": "device is already registered",
        "pri": f"arw:krn:dev:{device_hid}",
    }
    return JSONResponse(content=content, headers=kronos_headers)


@router.put("/gateways/{gateway_id}/checkin")
async def gateway_checkin(gateway_id: str):
    try:
        await KronosGateways.create(hid=gateway_id)
        logger.debug(f"New gateway seen: {gateway_id}")
    except IntegrityError:
        logger.debug(f"Check-in for gateway: {gateway_id}")


@router.get("/gateways/{gateway_id}/config", response_model=GatewayConfiguration)
async def get_static_gateway_conf(gateway_id: str):
    logger.debug("Sending config for gateway: %s", gateway_id)
    gateways = await KronosGateways.get(gateway_hid=gateway_id)
    static_config = {
        "cloudPlatform": "IoTConnect",
        "key": {
            "apiKey": gateways[0]["apiKey"],
            "secretKey": "gEhFrm2hRvW2Km47lgt9xRBCtT9uH2Lx77WxYliNGJI=",
        },
    }
    return JSONResponse(content=static_config, headers=kronos_headers)
