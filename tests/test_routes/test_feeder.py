import pytz
import datetime

from fastapi.testclient import TestClient


def test_feeder_list_no_devices(client: TestClient):
    response = client.get("/api/v1/feeder")
    assert response.status_code == 200
    assert response.json() == []


def test_feeder_list_devices(client: TestClient, with_registered_device: None):
    from tests.test_database_models import SAMPLE_DEVICE_HID

    response = client.get("/api/v1/feeder")
    assert response.status_code == 200
    devices = response.json()
    assert len(devices) == 1
    assert devices[0]["hid"] == SAMPLE_DEVICE_HID


def test_feeder_list_feed_history(client: TestClient, with_sample_feed: None):
    from tests.test_database_models import SAMPLE_DEVICE_HID

    response = client.get("/api/v1/feeder/history")
    assert response.status_code == 200
    results = response.json()
    assert len(results["data"]) == 1

    response = client.get(f"/api/v1/feeder/{SAMPLE_DEVICE_HID}/history")
    assert response.status_code == 200
    results = response.json()
    assert len(results["data"]) == 1


def test_feeder_get_device(client: TestClient, with_registered_device: None):
    from tests.test_database_models import SAMPLE_DEVICE_HID

    response = client.get(f"/api/v1/feeder/{SAMPLE_DEVICE_HID}")
    assert response.status_code == 200
    device = response.json()
    assert device["hid"] == SAMPLE_DEVICE_HID


def test_feeder_delete_device(client: TestClient, with_registered_device: None):
    from tests.test_database_models import SAMPLE_DEVICE_HID

    response = client.delete(f"/api/v1/feeder/{SAMPLE_DEVICE_HID}")
    assert response.status_code == 200

    response = client.get("/api/v1/feeder")
    assert response.status_code == 200
    assert response.json() == []


def test_feeder_telem(client: TestClient, with_registered_device: None):
    from tests.test_database_models import SAMPLE_DEVICE_HID

    response = client.get(f"/api/v1/feeder/{SAMPLE_DEVICE_HID}/telemetry")
    assert response.status_code == 400
    assert response.json()["detail"] == "Unknown device or device has not yet reported!"


def test_feeder_update_device(client: TestClient, with_stored_recipe: None, mocker):
    from tests.test_database_models import SAMPLE_DEVICE_HID, SAMPLE_GATEWAY_HID

    timezone = mocker.patch(
        "feeder.api.routers.feeder.router.client.send_cmd_utc_offset"
    )
    front_button = mocker.patch(
        "feeder.api.routers.feeder.router.client.send_cmd_button"
    )
    recipe = mocker.patch("feeder.api.routers.feeder.router.client.send_cmd_budget")

    response = client.put(
        f"/api/v1/feeder/{SAMPLE_DEVICE_HID}",
        json={"timezone": "America/Chicago", "frontButton": False, "currentRecipe": 1},
    )
    assert response.status_code == 200
    device = response.json()
    assert device["hid"] == SAMPLE_DEVICE_HID
    assert device["timezone"] == "America/Chicago"
    assert not device["frontButton"]
    assert device["currentRecipe"] == 1

    timezone.assert_called_once_with(
        gateway_id=SAMPLE_GATEWAY_HID,
        device_id=SAMPLE_DEVICE_HID,
        utc_offset=int(
            datetime.datetime.now(pytz.timezone("America/Chicago"))
            .utcoffset()
            .total_seconds()
        ),
    )
    front_button.assert_called_once_with(
        gateway_id=SAMPLE_GATEWAY_HID, device_id=SAMPLE_DEVICE_HID, enable=False
    )
    recipe.assert_called_once_with(
        gateway_id=SAMPLE_GATEWAY_HID,
        device_id=SAMPLE_DEVICE_HID,
        recipe_id=1,
        tbsp_per_feeding=1,
        g_per_tbsp=8,
        budget_tbsp=3,
    )


def test_feeder_update_device_seperate_calls(
    client: TestClient, with_stored_recipe: None, mocker
):
    from tests.test_database_models import SAMPLE_DEVICE_HID, SAMPLE_GATEWAY_HID

    timezone = mocker.patch(
        "feeder.api.routers.feeder.router.client.send_cmd_utc_offset"
    )
    front_button = mocker.patch(
        "feeder.api.routers.feeder.router.client.send_cmd_button"
    )
    recipe = mocker.patch("feeder.api.routers.feeder.router.client.send_cmd_budget")

    response = client.put(
        f"/api/v1/feeder/{SAMPLE_DEVICE_HID}",
        json={
            "timezone": "Not A Real Timezone",
        },
    )
    assert response.status_code == 500
    assert response.json()["detail"] == "Unknown timezone!"

    response = client.put(
        f"/api/v1/feeder/{SAMPLE_DEVICE_HID}",
        json={
            "timezone": "America/Chicago",
        },
    )
    assert response.status_code == 200
    device = response.json()
    assert device["hid"] == SAMPLE_DEVICE_HID
    assert device["timezone"] == "America/Chicago"

    response = client.put(
        f"/api/v1/feeder/{SAMPLE_DEVICE_HID}",
        json={
            "frontButton": False,
        },
    )
    assert response.status_code == 200
    device = response.json()
    assert device["hid"] == SAMPLE_DEVICE_HID
    assert not device["frontButton"]

    response = client.put(
        f"/api/v1/feeder/{SAMPLE_DEVICE_HID}", json={"currentRecipe": 1}
    )
    assert response.status_code == 200
    device = response.json()
    assert device["hid"] == SAMPLE_DEVICE_HID
    assert device["currentRecipe"] == 1

    # Test that sending an unknown recipe doesn't send
    # an error, but also doesn't send anything to the feeder.
    response = client.put(
        f"/api/v1/feeder/{SAMPLE_DEVICE_HID}", json={"currentRecipe": 999}
    )
    assert response.status_code == 200

    timezone.assert_called_once_with(
        gateway_id=SAMPLE_GATEWAY_HID,
        device_id=SAMPLE_DEVICE_HID,
        utc_offset=int(
            datetime.datetime.now(pytz.timezone("America/Chicago"))
            .utcoffset()
            .total_seconds()
        ),
    )
    front_button.assert_called_once_with(
        gateway_id=SAMPLE_GATEWAY_HID, device_id=SAMPLE_DEVICE_HID, enable=False
    )
    recipe.assert_called_once_with(
        gateway_id=SAMPLE_GATEWAY_HID,
        device_id=SAMPLE_DEVICE_HID,
        recipe_id=1,
        tbsp_per_feeding=1,
        g_per_tbsp=8,
        budget_tbsp=3,
    )


def test_feeder_set_hopper(client: TestClient, with_stored_recipe: None):
    from tests.test_database_models import SAMPLE_DEVICE_HID

    response = client.post(
        f"/api/v1/feeder/{SAMPLE_DEVICE_HID}/hopper",
        json={
            "level": 100,
        },
    )
    assert response.status_code == 200

    response = client.get(f"/api/v1/feeder/{SAMPLE_DEVICE_HID}/hopper")
    assert response.status_code == 200
    assert response.json()["level"] == 100


def test_feeder_reboot(client: TestClient, with_registered_device: None, mocker):
    from tests.test_database_models import SAMPLE_DEVICE_HID, SAMPLE_GATEWAY_HID

    cmd = mocker.patch("feeder.api.routers.feeder.router.client.send_cmd_reboot")
    response = client.post(f"/api/v1/feeder/{SAMPLE_DEVICE_HID}/restart")
    assert response.status_code == 200
    cmd.assert_called_once_with(
        gateway_id=SAMPLE_GATEWAY_HID, device_id=SAMPLE_DEVICE_HID
    )


def test_feeder_feed(client: TestClient, with_registered_device: None, mocker):
    from tests.test_database_models import SAMPLE_DEVICE_HID, SAMPLE_GATEWAY_HID

    cmd = mocker.patch("feeder.api.routers.feeder.router.client.send_cmd_feed")
    response = client.post(
        f"/api/v1/feeder/{SAMPLE_DEVICE_HID}/feed", json={"portion": 0.0625}
    )
    assert response.status_code == 200
    cmd.assert_called_once_with(
        gateway_id=SAMPLE_GATEWAY_HID, device_id=SAMPLE_DEVICE_HID, portion=0.0625
    )


def test_feeder_raw(client: TestClient, with_registered_device: None, mocker):
    from tests.test_database_models import SAMPLE_DEVICE_HID, SAMPLE_GATEWAY_HID

    response = client.post(
        f"/api/v1/feeder/{SAMPLE_DEVICE_HID}/raw", json={"command": "test", "args": {}}
    )
    assert response.status_code == 403
    assert (
        response.json()["detail"] == "Raw communication only available in DEBUG mode!"
    )

    mocker.patch("feeder.api.routers.feeder.settings.debug", return_value=True)
    cmd = mocker.patch("feeder.api.routers.feeder.router.client.send_cmd")
    response = client.post(
        f"/api/v1/feeder/{SAMPLE_DEVICE_HID}/raw", json={"command": "test", "args": {}}
    )
    assert response.status_code == 200
    cmd.assert_called_once_with(SAMPLE_GATEWAY_HID, SAMPLE_DEVICE_HID, "test", {})


def test_feeder_get_recipe_none(client: TestClient, with_registered_device: None):
    from tests.test_database_models import SAMPLE_DEVICE_HID

    response = client.get(f"/api/v1/feeder/{SAMPLE_DEVICE_HID}/recipe")
    assert response.status_code == 400
    assert response.json()["detail"] == "No recipe set for this device!"


def test_feeder_get_recipe(client: TestClient, with_stored_recipe: None):
    from tests.test_database_models import SAMPLE_DEVICE_HID

    response = client.get(f"/api/v1/feeder/{SAMPLE_DEVICE_HID}/recipe")
    assert response.status_code == 200
    assert response.json()["tbsp_per_feeding"] == 1


def test_feeder_new_recipe(client: TestClient, with_registered_device: None, mocker):
    from tests.test_database_models import SAMPLE_DEVICE_HID, SAMPLE_GATEWAY_HID

    cmd = mocker.patch("feeder.api.routers.feeder.router.client.send_cmd_budget")

    recipe = {
        "g_per_tbsp": 7,
        "tbsp_per_feeding": 1,
        "name": "Recipe Name One",
        "budget_tbsp": 3,
    }
    response = client.put(f"/api/v1/feeder/{SAMPLE_DEVICE_HID}/recipe", json=recipe)
    assert response.status_code == 200
    assert response.json() == {"id": 1, **recipe}

    cmd.assert_called_once_with(
        gateway_id=SAMPLE_GATEWAY_HID,
        device_id=SAMPLE_DEVICE_HID,
        recipe_id=1,
        tbsp_per_feeding=recipe["tbsp_per_feeding"],
        g_per_tbsp=recipe["g_per_tbsp"],
        budget_tbsp=recipe["budget_tbsp"],
    )

    response = client.put(
        f"/api/v1/feeder/{SAMPLE_DEVICE_HID}/recipe", json={**recipe, "g_per_tbsp": 8}
    )

    assert response.status_code == 200
    assert response.json() == {"id": 1, **recipe, "g_per_tbsp": 8}
