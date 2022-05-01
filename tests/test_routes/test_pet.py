from fastapi.testclient import TestClient

SAMPLE_PET = {
    "name": "Minnie",
    "image": "base64data",
    "animal_type": "cat",
    "weight": 3628.74,
    "birthday": 1483164000000,
    "activity_level": 5,
}


class MockPet:
    def __init__(self, device_hid: str):
        self.device_hid = device_hid


def test_list_pets(client: TestClient):
    response = client.get("/api/v1/pet")
    assert response.status_code == 200
    assert response.json() == []


def test_create_list_and_delete_pets(client: TestClient):
    response = client.get("/api/v1/pet/1")
    assert response.status_code == 404
    assert response.json() == {"detail": "No pet found with ID 1"}

    response = client.post("/api/v1/pet", json=SAMPLE_PET)
    assert response.status_code == 200
    assert response.json() == {"id": 1, **SAMPLE_PET, "device_hid": None}

    response = client.get("/api/v1/pet/1")
    assert response.status_code == 200
    assert response.json() == {"id": 1, **SAMPLE_PET, "device_hid": None}

    response = client.get("/api/v1/pet")
    assert response.status_code == 200
    assert len(response.json()) == 1

    response = client.delete("/api/v1/pet/1")
    assert response.status_code == 200

    response = client.get("/api/v1/pet/1")
    assert response.status_code == 404
    assert response.json() == {"detail": "No pet found with ID 1"}


def test_update_pet(client: TestClient):
    response = client.post("/api/v1/pet", json=SAMPLE_PET)
    pet_id = response.json()["id"]

    response = client.put(f"/api/v1/pet/{pet_id}", json={"name": "Bad Kitty!"})
    assert response.status_code == 200
    assert response.json()["name"] == "Bad Kitty!"


def test_set_and_get_pet_schedule(
    client: TestClient, with_registered_device: None, mocker
):
    from tests.test_database_models import SAMPLE_DEVICE_HID

    response = client.post("/api/v1/pet", json=SAMPLE_PET)
    pet_id = response.json()["id"]

    schedule_url = f"/api/v1/pet/{pet_id}/schedule"
    response = client.get(schedule_url)
    assert response.status_code == 200
    assert response.json() == {"events": []}

    meal_info = {"name": "Breakfast", "time": 3600, "portion": 0.0625}
    response = client.post(schedule_url, json=meal_info)
    assert response.status_code == 400
    assert response.json() == {
        "detail": "Can't schedule event on pet without assigned feeder!"
    }

    cmd = mocker.patch("feeder.api.routers.pet.router.client.send_cmd_schedule")
    client.put(f"/api/v1/pet/{pet_id}", json={"device_hid": SAMPLE_DEVICE_HID})

    response = client.post(schedule_url, json=meal_info)
    assert len(response.json()["events"]) == 1
    assert response.json()["events"][0] == {
        **meal_info,
        "event_id": 1,
        "enabled": True,
        "result": None,
    }
    cmd.assert_called_once()

    mocker.patch("feeder.api.routers.pet.get_pet", return_value=MockPet(""))
    response = client.post(schedule_url, json=meal_info)
    assert response.status_code == 400
    assert response.json() == {
        "detail": "Can't schedule event on pet without assigned feeder!"
    }

    mocker.patch(
        "feeder.api.routers.pet.get_pet", return_value=MockPet(SAMPLE_DEVICE_HID)
    )
    mocker.patch("feeder.api.routers.pet.KronosDevices.get", return_value=[])
    response = client.post(schedule_url, json=meal_info)
    assert response.status_code == 500
    assert response.json() == {"detail": "Assigned device doesn't exist!"}


def test_set_and_get_pet_schedule_after_feed(
    client: TestClient, with_sample_feed: None, mocker
):
    from tests.test_database_models import SAMPLE_DEVICE_HID

    response = client.post(
        "/api/v1/pet", json={**SAMPLE_PET, "device_hid": SAMPLE_DEVICE_HID}
    )
    pet_id = response.json()["id"]
    schedule_url = f"/api/v1/pet/{pet_id}/schedule"

    mocker.patch("feeder.api.routers.pet.router.client.send_cmd_schedule")
    meal_info = {"name": "Breakfast", "time": 0, "portion": 0.0625}
    response = client.post(schedule_url, json=meal_info)
    assert response.json()["events"][0]["result"] is None

    meal_info = {"time": 3600}
    response = client.put(f"{schedule_url}/1", json=meal_info)
    assert response.json()["events"][0]["result"]["device_hid"] == SAMPLE_DEVICE_HID

    mocker.patch("feeder.api.routers.pet.get_pet", return_value=MockPet(""))
    response = client.put(f"{schedule_url}/1", json=meal_info)
    assert response.status_code == 400
    assert response.json() == {
        "detail": "Can't update event on pet without assigned feeder!"
    }

    mocker.patch(
        "feeder.api.routers.pet.get_pet", return_value=MockPet(SAMPLE_DEVICE_HID)
    )
    mocker.patch("feeder.api.routers.pet.KronosDevices.get", return_value=[])
    response = client.put(f"{schedule_url}/1", json=meal_info)
    assert response.status_code == 500
    assert response.json() == {"detail": "Assigned device doesn't exist!"}


def test_delete_scheduled_event(
    client: TestClient, with_registered_device: None, mocker
):
    from tests.test_database_models import SAMPLE_DEVICE_HID

    response = client.post(
        "/api/v1/pet", json={**SAMPLE_PET, "device_hid": SAMPLE_DEVICE_HID}
    )
    pet_id = response.json()["id"]
    schedule_url = f"/api/v1/pet/{pet_id}/schedule"

    mocker.patch("feeder.api.routers.pet.router.client.send_cmd_schedule")
    meal_info = {"name": "Breakfast", "time": 0, "portion": 0.0625}
    response = client.post(schedule_url, json=meal_info)
    evtid = response.json()["events"][0]["event_id"]

    response = client.delete(f"{schedule_url}/{evtid}")
    assert response.status_code == 200
    assert response.json()["events"] == []

    mocker.patch("feeder.api.routers.pet.get_pet", return_value=MockPet(""))
    response = client.delete(f"{schedule_url}/{evtid}")
    assert response.status_code == 400
    assert response.json() == {
        "detail": "Can't update event on pet without assigned feeder!"
    }

    mocker.patch(
        "feeder.api.routers.pet.get_pet", return_value=MockPet(SAMPLE_DEVICE_HID)
    )
    mocker.patch("feeder.api.routers.pet.KronosDevices.get", return_value=[])
    response = client.delete(f"{schedule_url}/{evtid}")
    assert response.status_code == 500
    assert response.json() == {"detail": "Assigned device doesn't exist!"}
