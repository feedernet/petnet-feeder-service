import logging
from typing import Optional

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse

from feeder.api.models.kronos import (
    PaginatedGatewayList,
    AddGatewayResponse,
    NewFeeder,
    DeviceRegistration,
    GatewayConfiguration,
    PaginatedDeviceList,
)
from feeder.util.feeder import paginate_response, generate_feeder_hid

logger = logging.getLogger(__name__)
kronos_headers = {
    "content-type": "application/json;charset=UTF-8"
}
gateways = {}

router = APIRouter()


@router.get("/gateways", response_model=PaginatedGatewayList)
async def get_feeders():
    formatted_feeders = [
        {"hid": feeder_hid, "pri": f"arw:pgs:gwy:{feeder_hid}"}
        for feeder_hid in gateways.keys()
    ]

    return paginate_response(
        entities=formatted_feeders, max_page_size=len(formatted_feeders)
    )


@router.post("/gateways", response_model=AddGatewayResponse)
async def add_gateway(feeder: NewFeeder):
    gateway_hid = generate_feeder_hid(feeder.uid)
    if gateway_hid not in gateways.keys():
        gateways[gateway_hid] = {}
        content = {"hid": gateway_hid, "message": "OK"}
    else:
        content = {"hid": gateway_hid, "message": "gateway is already registered"}

    return JSONResponse(content=content, headers=kronos_headers)


@router.get("/devices", response_model=PaginatedDeviceList)
async def get_devices(gateway_hid: Optional[str] = Query(None, alias="gatewayHid")):
    if gateway_hid:
        if gateway_hid in gateways:
            devices = list(gateways[gateway_hid].values())
            logger.info(devices)
        else:
            raise HTTPException(status_code=400, detail="Gateway ID not found!")
    else:
        devices = []
        for gateway in gateways:
            devices += gateways[gateway].values()

    content = paginate_response(entities=devices, max_page_size=len(devices))
    return JSONResponse(content=content, headers=kronos_headers)


@router.post("/devices", response_model=AddGatewayResponse)
async def register_feeder(device: DeviceRegistration):
    if device.gatewayHid not in gateways.keys():
        raise HTTPException(status_code=400, detail="Gateway not found!")

    device_hid = generate_feeder_hid(device.uid)

    if device_hid not in gateways[device.gatewayHid].keys():
        gateways[device.gatewayHid][device_hid] = dict(device)

    content = {
        "hid": device_hid,
        "links": {},
        "message": "device is already registered",
        "pri": f"arw:krn:dev:{device_hid}",
    }
    return JSONResponse(content=content, headers=kronos_headers)


@router.get("/gateways/{gateway_id}/config", response_model=GatewayConfiguration)
async def get_static_gateway_conf(gateway_id: str):
    logger.debug("Sending static config for gateway: %s", gateway_id)
    static_config = {
        "cloudPlatform": "IoTConnect",
        "key": {
            "apiKey": "efa2396b6f0bae3cc5fe5ef34829d60d91b96a625e55afabcea0e674f1a7ac43",
            "secretKey": "gEhFrm2hRvW2Km47lgt9xRBCtT9uH2Lx77WxYliNGJI=",
        }
    }
    return JSONResponse(content=static_config, headers=kronos_headers)
