import math
import hashlib
import secrets

from fastapi import APIRouter


class APIRouterWithMQTTClient(APIRouter):
    _client = None
    _broker = None

    @property
    def client(self):
        return self._client

    @client.setter
    def client(self, client):
        self._client = client

    @property
    def broker(self):
        return self._broker

    @broker.setter
    def broker(self, broker):
        self._broker = broker


def paginate_response(
    entities: list, current_page=1, max_page_size=10, total_override=0
) -> dict:
    list_length = len(entities)
    offset = (current_page - 1) * max_page_size
    page_size = max_page_size
    if list_length < max_page_size:
        page_size = list_length

    page_count = 0
    if page_size and not total_override:
        page_count = math.ceil(list_length / page_size)
    elif page_size and total_override:
        page_count = math.ceil(total_override / page_size)

    return {
        "size": page_size,
        "data": entities[offset : offset + page_size],
        "page": current_page,
        "totalSize": list_length,
        "totalPages": page_count,
    }


def generate_api_key() -> str:
    return secrets.token_hex(32)


def generate_feeder_hid(uid: str) -> str:
    return hashlib.sha1(uid.encode("utf-8")).hexdigest()


def check_connection(
    device: "Device", broker: "FeederBroker"  # noqa: F821
) -> "Device":  # noqa: F821
    # This is kinda gross... we are tapping into their internal sessions
    # storage.
    # TODO: If we end up forking HBMQTT, we should add an interface for this.
    sessions = broker._sessions
    connected = False
    if device.gatewayHid in sessions:
        connected = sessions[device.gatewayHid][0].transitions.is_connected()
    return {**device, "connected": connected}
