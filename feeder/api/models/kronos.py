from typing import List, Optional

from pydantic import BaseModel

from feeder import settings


class NewFeeder(BaseModel):
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

    name: str
    uid: str
    osName: str
    type: str
    softwareName: str
    softwareVersion: str
    sdkVersion: str


class Gateway(BaseModel):
    hid: str
    pri: str
    applicationHid: str = settings.app_id
    softwareName: str = "SMART FEEDER"
    softwareReleaseName: str = "SMART FEEDER"
    type: str = "SMART FEEDER"


class BasePaginatedList(BaseModel):
    size: int = 0
    page: int = 0
    totalSize: int = 0
    totalPages: int = 1


class PaginatedGatewayList(BasePaginatedList):
    data: List[Gateway] = []


class AddGatewayResponse(BaseModel):
    hid: str
    message: str
    links: Optional[dict]
    pri: Optional[str]


class DeviceRegistration(BaseModel):
    gatewayHid: str
    uid: str


class PaginatedDeviceList(BasePaginatedList):
    data: List[DeviceRegistration] = []


class GatewayConfiguration(BaseModel):
    cloudPlatform: str = "IoTConnect"
    key: dict = {
        "apiKey": "efa2396b6f0bae3cc5fe5ef34829d60d91b96a625e55afabcea0e674f1a7ac43",
        "secretKey": "gEhFrm2hRvW2Km47lgt9xRBCtT9uH2Lx77WxYliNGJI=",
    }
