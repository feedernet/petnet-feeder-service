from fastapi.testclient import TestClient


def test_kronos_gateway_list_no_devices(client: TestClient):
    response = client.get("/api/v1/kronos/devices")
    assert response.status_code == 200
    assert response.json()["data"] == []
