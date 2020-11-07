from typing import List, Optional

from pydantic import BaseModel

from feeder import settings
from feeder.api.models import BasePaginatedList


class NewGateway(BaseModel):
    """
    This is the structure of a new feeder registering itself.
    Example: {
        "name":"SF Gateway",
        "uid":"smartfeeder-795ae773737d",
        "osName":"FreeRTOS",
        "type":"Local",
        "softwareName":"SMART FEEDER",
        "softwareVersion":"2.8.0",
        "sdkVersion":"1.3.12"
    }
    """

    name: Optional[str]
    uid: Optional[str]
    osName: Optional[str]
    type: Optional[str]
    softwareName: Optional[str]
    softwareVersion: Optional[str]
    sdkVersion: Optional[str]


class Gateway(NewGateway):
    hid: str
    pri: str
    applicationHid: str = settings.app_id
    discoveredAt: int = 0

    class Config:
        orm_mode = True


class PaginatedGatewayList(BasePaginatedList):
    data: List[Gateway] = []


class AddGatewayResponse(BaseModel):
    hid: str
    message: str
    links: Optional[dict]
    pri: Optional[str]


class NewDevice(BaseModel):
    """
    Example: {
        'name': 'SF20A',
        'type': 'SMART FEEDER',
        'uid': 'smartfeeder-4b09fa082bbd-prod',
        'gatewayHid': 'd48d71fb4478ed189b37699ac1ea665fbed5a577',
        'softwareName': 'SMART FEEDER',
        'softwareVersion': '2.8.0'
    }
    """
    name: Optional[str]
    type: Optional[str]
    uid: Optional[str]
    gatewayHid: str
    softwareName: Optional[str]
    softwareVersion: Optional[str]


class Device(NewDevice):
    hid: str
    discoveredAt: int = 0
    lastPingedAt: Optional[int] = 0
    frontButton: Optional[bool]
    timezone: Optional[str]

    class Config:
        orm_mode = True


class DeviceUpdate(BaseModel):
    name: Optional[str]
    timezone: Optional[str]
    frontButton: Optional[bool]


class DeviceTelemetry(BaseModel):
    timestamp: int
    voltage: float
    usb_power: bool
    charging: bool
    ir: bool
    rssi: int


class PaginatedDeviceList(BasePaginatedList):
    data: List[Device] = []


class GatewayConfiguration(BaseModel):
    cloudPlatform: str
    key: dict
