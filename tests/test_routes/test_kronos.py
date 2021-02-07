from fastapi.testclient import TestClient


def test_kronos_gateway_list_no_devices(client: TestClient):
    response = client.get("/api/v1/kronos/gateways")
    assert response.status_code == 200
    assert response.json()["data"] == []


def test_kronos_gateway_list_devices(client: TestClient, with_registered_gateway: None):
    from tests.test_database_models import SAMPLE_GATEWAY_HID

    response = client.get("/api/v1/kronos/gateways")
    assert response.status_code == 200
    gateways = response.json()["data"]
    assert len(gateways) == 1
    assert gateways[0]["hid"] == SAMPLE_GATEWAY_HID


def test_kronos_gateway_creation(client: TestClient):
    from tests.test_database_models import SAMPLE_GATEWAY_HID, SAMPLE_GATEWAY

    response = client.post("/api/v1/kronos/gateways", json=SAMPLE_GATEWAY)
    assert response.status_code == 200
    assert response.json() == {"hid": SAMPLE_GATEWAY_HID, "message": "OK"}


def test_kronos_gateway_update(client: TestClient, with_registered_gateway: None):
    from tests.test_database_models import SAMPLE_GATEWAY_HID, SAMPLE_GATEWAY

    response = client.post(
        "/api/v1/kronos/gateways", json={**SAMPLE_GATEWAY, "softwareVersion": "2.9.0"}
    )
    assert response.status_code == 200
    assert response.json() == {
        "hid": SAMPLE_GATEWAY_HID,
        "message": "gateway is already registered",
    }

    response = client.get("/api/v1/kronos/gateways")
    assert response.status_code == 200
    gateways = response.json()["data"]
    assert len(gateways) == 1
    assert gateways[0]["softwareVersion"] == "2.9.0"


def test_kronos_devices_list_no_devices(client: TestClient):
    response = client.get("/api/v1/kronos/devices")
    assert response.status_code == 200
    assert response.json()["data"] == []


def test_kronos_devices_list_devices(client: TestClient, with_registered_device: None):
    from tests.test_database_models import SAMPLE_DEVICE_HID

    response = client.get("/api/v1/kronos/devices")
    assert response.status_code == 200
    gateways = response.json()["data"]
    assert len(gateways) == 1
    assert gateways[0]["hid"] == SAMPLE_DEVICE_HID


def test_kronos_device_creation(client: TestClient):
    from tests.test_database_models import SAMPLE_DEVICE_HID, SAMPLE_DEVICE

    response = client.post("/api/v1/kronos/devices", json=SAMPLE_DEVICE)
    assert response.status_code == 200
    assert response.json() == {
        "hid": SAMPLE_DEVICE_HID,
        "links": {},
        "message": "device is already registered",
        "pri": f"arw:krn:dev:{SAMPLE_DEVICE_HID}",
    }


def test_kronos_device_update(client: TestClient, with_registered_device: None):
    from tests.test_database_models import SAMPLE_DEVICE_HID, SAMPLE_DEVICE

    response = client.post(
        "/api/v1/kronos/devices", json={**SAMPLE_DEVICE, "softwareVersion": "2.9.0"}
    )
    assert response.status_code == 200
    assert response.json() == {
        "hid": SAMPLE_DEVICE_HID,
        "links": {},
        "message": "device is already registered",
        "pri": f"arw:krn:dev:{SAMPLE_DEVICE_HID}",
    }

    response = client.get("/api/v1/kronos/devices")
    assert response.status_code == 200
    devices = response.json()["data"]
    assert len(devices) == 1
    assert devices[0]["softwareVersion"] == "2.9.0"


def test_kronos_existing_gateway_checkin(
    client: TestClient, with_registered_gateway: None
):
    from tests.test_database_models import SAMPLE_GATEWAY_HID

    response = client.put(f"/api/v1/kronos/gateways/{SAMPLE_GATEWAY_HID}/checkin")
    assert response.status_code == 200


def test_kronos_new_gateway_checkin(client: TestClient):
    from tests.test_database_models import SAMPLE_GATEWAY_HID

    response = client.put(f"/api/v1/kronos/gateways/{SAMPLE_GATEWAY_HID}/checkin")
    assert response.status_code == 200

    response = client.get("/api/v1/kronos/gateways")
    assert response.status_code == 200
    gateways = response.json()["data"]
    assert len(gateways) == 1
    assert gateways[0]["hid"] == SAMPLE_GATEWAY_HID


def test_kronos_get_existing_gateway_config(
    client: TestClient, with_registered_gateway: None
):
    from tests.test_database_models import SAMPLE_GATEWAY_HID, SAMPLE_GATEWAY

    response = client.get(f"/api/v1/kronos/gateways/{SAMPLE_GATEWAY_HID}/config")
    assert response.status_code == 200
    assert response.json() == {
        "cloudPlatform": "IoTConnect",
        "key": {
            "apiKey": SAMPLE_GATEWAY["apiKey"],
            "secretKey": "gEhFrm2hRvW2Km47lgt9xRBCtT9uH2Lx77WxYliNGJI=",
        },
    }


def test_kronos_get_unknown_gateway_config(client: TestClient):
    response = client.get("/api/v1/kronos/gateways/unknown/config")
    assert response.status_code == 400
    assert response.json() == {"detail": "Unregistered Gateway (unknown)"}
