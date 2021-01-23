import pytest
from fastapi import HTTPException

SAMPLE_GATEWAY_HID = "488533283e3f06ca4ae929fd01f50a9259dd393f"
SAMPLE_GATEWAY = {
    "name": "SF20A",
    "uid": "smartfeeder-795ae773737d",
    "osName": "SMART FEEDER",
    "type": "Local",
    "softwareName": "SMART FEEDER",
    "softwareVersion": "2.8.0",
    "sdkVersion": "1.3.12",
}

SAMPLE_DEVICE_HID = "c3d89400068631f8138a57286982bea94370693d"
SAMPLE_DEVICE = {
    "name": "SF20A",
    "type": "SMART FEEDER",
    "uid": "smartfeeder-4b09fa082bbd-prod",
    "gatewayHid": "488533283e3f06ca4ae929fd01f50a9259dd393f",
    "softwareName": "SMART FEEDER",
    "softwareVersion": "2.8.0",
}


def test_handle_registration_without_hid():
    from feeder.database.models import handle_potential_registration

    # First, check that we are properly assigning empty fields
    model = {"uid": SAMPLE_GATEWAY["uid"]}
    model = handle_potential_registration(model)
    assert model["hid"] == SAMPLE_GATEWAY_HID
    assert isinstance(model["discoveredAt"], int)

    # Now, check that we are properly ignoring already filled fields
    filled_model = {"uid": "testing", "hid": "present", "discoveredAt": 0}
    filled_model = handle_potential_registration(filled_model)
    assert filled_model["hid"] == "present"
    assert filled_model["discoveredAt"] == 0


@pytest.mark.asyncio
async def test_get_all_gateways_without_gateways():
    from feeder.database.models import KronosGateways

    assert await KronosGateways.get() == []

    with pytest.raises(HTTPException) as exc:
        await KronosGateways.get(gateway_hid="nothing")

    assert exc.value.status_code == 400
    assert exc.value.detail == "Unregistered Gateway (nothing)"


@pytest.mark.asyncio
async def test_insert_gateway_and_retrieve_it():
    from feeder.database.models import KronosGateways
    from feeder.api.models.kronos import NewGateway

    gateway = NewGateway(**SAMPLE_GATEWAY)

    rows_created = await KronosGateways.create(**gateway.dict())
    assert rows_created == 1

    all_gateways = await KronosGateways.get(gateway_hid=SAMPLE_GATEWAY_HID)
    target_gateway = all_gateways[0]
    assert target_gateway[0] == SAMPLE_GATEWAY_HID


@pytest.mark.asyncio
async def test_get_or_insert_gateway():
    from feeder.database.models import KronosGateways
    from feeder.api.models.kronos import NewGateway

    gateway = NewGateway(**SAMPLE_GATEWAY)

    rows_created = await KronosGateways.create(**gateway.dict())
    assert rows_created == 1

    result = await KronosGateways.get_or_insert(gateway_hid=SAMPLE_GATEWAY_HID)
    all_gateways = await KronosGateways.get()

    assert result[0] == SAMPLE_GATEWAY_HID
    assert len(all_gateways) == 1

    result = await KronosGateways.get_or_insert(gateway_hid="testing-new-hid")
    assert result[0] == "testing-new-hid"

    all_gateways = await KronosGateways.get()
    assert len(all_gateways) == 2


@pytest.mark.asyncio
async def test_get_device_parameters(with_registered_device: None):
    from feeder.database.models import KronosDevices

    assert len(await KronosDevices.get()) == 1
    assert len(await KronosDevices.get(gateway_hid=SAMPLE_GATEWAY_HID)) == 1
    assert len(await KronosDevices.get(device_hid=SAMPLE_DEVICE_HID)) == 1

    with pytest.raises(HTTPException) as exc:
        await KronosDevices.get(gateway_hid="none")

    assert exc.value.status_code == 400
    assert exc.value.detail == "No devices registered for Gateway: none"

    with pytest.raises(HTTPException) as exc:
        await KronosDevices.get(device_hid="none")

    assert exc.value.status_code == 400
    assert exc.value.detail == "No devices found with HID: none"


@pytest.mark.asyncio
async def test_get_device_create_and_retrieve(with_registered_gateway: None):
    from feeder.database.models import KronosDevices

    assert await KronosDevices.get() == []

    rows_modified = await KronosDevices.create(**SAMPLE_DEVICE)
    assert rows_modified == 1

    devices = await KronosDevices.get()
    assert len(devices) == 1
    assert devices[0][0] == SAMPLE_DEVICE_HID


@pytest.mark.asyncio
async def test_get_or_insert_device(with_registered_gateway: None):
    from feeder.database.models import KronosDevices, KronosGateways
    from feeder.api.models.kronos import NewDevice

    device = NewDevice(**SAMPLE_DEVICE)

    rows_created = await KronosDevices.create(**device.dict())
    assert rows_created == 1

    result = await KronosDevices.get_or_insert(
        device_hid=SAMPLE_DEVICE_HID, gateway_hid=SAMPLE_GATEWAY_HID
    )
    all_devices = await KronosDevices.get()

    assert result[0] == SAMPLE_DEVICE_HID
    assert len(all_devices) == 1

    await KronosGateways.create(hid="testing-gateway-hid")
    result = await KronosDevices.get_or_insert(
        device_hid="testing-device-hid", gateway_hid="testing-gateway-hid"
    )
    assert result[0] == "testing-device-hid"

    all_devices = await KronosDevices.get()
    assert len(all_devices) == 2


@pytest.mark.asyncio
async def test_ping_device(with_registered_device: None):
    from feeder.database.models import KronosDevices

    device = await KronosDevices.get(device_hid=SAMPLE_DEVICE_HID)
    assert device[0][8] is None

    await KronosDevices.ping(
        device_hid=SAMPLE_DEVICE_HID, gateway_hid=SAMPLE_GATEWAY_HID
    )
    device_with_ping = await KronosDevices.get(device_hid=SAMPLE_DEVICE_HID)
    assert isinstance(device_with_ping[0][8], int)

    await KronosDevices.ping(
        device_hid=SAMPLE_DEVICE_HID, gateway_hid=SAMPLE_GATEWAY_HID
    )
    device_with_new_ping = await KronosDevices.get(device_hid=SAMPLE_DEVICE_HID)
    assert device_with_new_ping[0][8] > device_with_ping[0][8]


@pytest.mark.asyncio
async def test_update_device_single_call(with_registered_device: None):
    from feeder.database.models import KronosDevices, StoredRecipe

    device = await KronosDevices.get(device_hid=SAMPLE_DEVICE_HID)
    assert device[0][1] != "testing"
    assert device[0][9] != "America/Chicago"
    assert device[0][10] is not False
    assert device[0][11] != 1
    assert device[0][12] is not True

    # We need to create a recipe so that the key exists.
    await StoredRecipe.create(
        name="test_recipe", g_per_tbsp=7, tbsp_per_feeding=1, budget_tbsp=3
    )

    await KronosDevices.update(
        device_hid=SAMPLE_DEVICE_HID,
        name="testing",
        timezone="America/Chicago",
        front_button=False,
        recipe_id=1,
        black=True,
    )

    device = await KronosDevices.get(device_hid=SAMPLE_DEVICE_HID)
    assert device[0][1] == "testing"
    assert device[0][9] == "America/Chicago"
    assert device[0][10] is False
    assert device[0][11] == 1
    assert device[0][12] is True


@pytest.mark.asyncio
async def test_update_device_multiple_call(with_registered_device: None):
    from feeder.database.models import KronosDevices, StoredRecipe

    # We need to create a recipe so that the key exists.
    await StoredRecipe.create(
        name="test_recipe", g_per_tbsp=7, tbsp_per_feeding=1, budget_tbsp=3
    )

    rows_updated = await KronosDevices.update(
        device_hid=SAMPLE_DEVICE_HID,
        name="testing",
    )
    assert rows_updated == 1
    rows_updated = await KronosDevices.update(
        device_hid=SAMPLE_DEVICE_HID,
        timezone="America/Chicago",
    )
    assert rows_updated == 1
    rows_updated = await KronosDevices.update(
        device_hid=SAMPLE_DEVICE_HID,
        front_button=False,
    )
    assert rows_updated == 1
    rows_updated = await KronosDevices.update(
        device_hid=SAMPLE_DEVICE_HID,
        recipe_id=1,
    )
    assert rows_updated == 1
    rows_updated = await KronosDevices.update(device_hid=SAMPLE_DEVICE_HID, black=True)
    assert rows_updated == 1

    device = await KronosDevices.get(device_hid=SAMPLE_DEVICE_HID)
    assert device[0][1] == "testing"
    assert device[0][9] == "America/Chicago"
    assert device[0][10] is False
    assert device[0][11] == 1
    assert device[0][12] is True


@pytest.mark.asyncio
async def test_delete_device(with_registered_device: None):
    from feeder.database.models import (
        KronosGateways,
        KronosDevices,
        DeviceTelemetryData,
        FeedingResult,
    )

    assert len(await KronosGateways.get()) == 1
    assert len(await KronosDevices.get()) == 1

    # Create telemetry data and feed result so we can make sure they
    # get deleted along with the device.
    await DeviceTelemetryData.report(
        gateway_hid=SAMPLE_GATEWAY_HID,
        device_hid=SAMPLE_DEVICE_HID,
        voltage=4.5,
        usb_power=True,
        charging=False,
        ir=False,
        rssi=99,
    )
    await FeedingResult.report(
        device_hid=SAMPLE_DEVICE_HID,
        start_time=1,
        end_time=2,
        pour=3,
        full=4,
        grams_expected=5,
        grams_actual=6,
        hopper_start=7,
        hopper_end=8,
        recipe_id="E000001",
        fail=False,
    )

    telem = await DeviceTelemetryData.get(device_hid=SAMPLE_DEVICE_HID)
    assert telem[0] == SAMPLE_DEVICE_HID
    assert len(await FeedingResult.get(device_hid=SAMPLE_DEVICE_HID)) == 1

    await KronosDevices.delete(device_id=SAMPLE_DEVICE_HID)

    assert len(await KronosGateways.get()) == 0
    assert len(await KronosDevices.get()) == 0
    with pytest.raises(HTTPException) as exc:
        assert await DeviceTelemetryData.get(device_hid=SAMPLE_DEVICE_HID)
    assert exc.value.status_code == 400
    assert exc.value.detail == "Unknown device or device has not yet reported!"
    assert len(await FeedingResult.get(device_hid=SAMPLE_DEVICE_HID)) == 0


@pytest.mark.asyncio
async def test_report_device_telemetry(with_registered_device: None):
    from feeder.database.models import DeviceTelemetryData

    with pytest.raises(HTTPException) as exc:
        assert await DeviceTelemetryData.get(device_hid=SAMPLE_DEVICE_HID)
    assert exc.value.status_code == 400
    assert exc.value.detail == "Unknown device or device has not yet reported!"

    rows_modified = await DeviceTelemetryData.report(
        gateway_hid=SAMPLE_GATEWAY_HID,
        device_hid=SAMPLE_DEVICE_HID,
        voltage=4.5,
        usb_power=True,
        charging=False,
        ir=False,
        rssi=99,
    )
    assert rows_modified == 1

    data = await DeviceTelemetryData.get(device_hid=SAMPLE_DEVICE_HID)
    assert data[0] == SAMPLE_DEVICE_HID
    assert data[2] == 4.5
    assert data[3] is True
    assert data[4] is False
    assert data[5] is False
    assert data[6] == 99

    # Test overwriting the last data
    rows_modified = await DeviceTelemetryData.report(
        gateway_hid=SAMPLE_GATEWAY_HID,
        device_hid=SAMPLE_DEVICE_HID,
        voltage=5.1,
        usb_power=False,
        charging=True,
        ir=True,
        rssi=98,
    )
    assert rows_modified == 1

    data = await DeviceTelemetryData.get(device_hid=SAMPLE_DEVICE_HID)
    assert data[0] == SAMPLE_DEVICE_HID
    assert data[2] == 5.1
    assert data[3] is False
    assert data[4] is True
    assert data[5] is True
    assert data[6] == 98


@pytest.mark.asyncio
async def test_create_feed_result(with_registered_device: None):
    from feeder.database.models import FeedingResult

    assert len(await FeedingResult.get()) == 0

    rows_modified = await FeedingResult.report(
        device_hid=SAMPLE_DEVICE_HID,
        start_time=1,
        end_time=2,
        pour=3,
        full=4,
        grams_expected=5,
        grams_actual=6,
        hopper_start=7,
        hopper_end=8,
        recipe_id="E000001",
        fail=False,
    )

    assert rows_modified == 1

    assert len(await FeedingResult.get()) == 1
    assert len(await FeedingResult.get(device_hid=SAMPLE_DEVICE_HID)) == 1
    assert await FeedingResult.count() == 1
    assert await FeedingResult.count(device_hid=SAMPLE_DEVICE_HID) == 1


@pytest.mark.asyncio
async def test_create_duplicate_feeds(with_registered_device: None):
    from feeder.database.models import FeedingResult

    assert len(await FeedingResult.get()) == 0
    first_feed = await FeedingResult.report(
        device_hid=SAMPLE_DEVICE_HID,
        start_time=1,
        end_time=2,
        pour=3,
        full=4,
        grams_expected=5,
        grams_actual=6,
        hopper_start=7,
        hopper_end=8,
        recipe_id="E000001",
        fail=False,
    )
    assert first_feed == 1

    second_feed = await FeedingResult.report(
        device_hid=SAMPLE_DEVICE_HID,
        start_time=1,
        end_time=2,
        pour=3,
        full=4,
        grams_expected=5,
        grams_actual=6,
        hopper_start=7,
        hopper_end=8,
        recipe_id="E000001",
        fail=False,
    )
    assert second_feed is None
    assert await FeedingResult.count() == 1


@pytest.mark.asyncio
async def test_create_pets(with_registered_device: None):
    from feeder.database.models import Pet

    with pytest.raises(HTTPException) as exc:
        await Pet.get()
    assert exc.value.status_code == 404
    assert exc.value.detail == "No pets found!"

    with pytest.raises(HTTPException) as exc:
        await Pet.get(pet_id=1)
    assert exc.value.status_code == 404
    assert exc.value.detail == "No pet found with ID 1"

    pet_id = await Pet.create(
        name="Fido", animal_type="dog", weight=1000, birthday=1, activity_level=5
    )
    assert pet_id == 1

    pet_id = await Pet.create(
        name="Fido",
        animal_type="dog",
        weight=1000,
        birthday=1,
        image="base64data",
        activity_level=5,
        device_hid=SAMPLE_DEVICE_HID,
    )
    assert pet_id == 2

    pets = await Pet.get()
    assert len(pets) == 2

    pet = await Pet.get(pet_id=1)
    assert pet[0][0] == 1
    assert pet[0][1] == "Fido"
    assert pet[0][2] is None
    assert pet[0][3] == "dog"
    assert pet[0][4] == 1000
    assert pet[0][5] == 1
    assert pet[0][6] == 5
    assert pet[0][7] is None

    pet = await Pet.get(pet_id=2)
    assert pet[0][2] == "base64data"
    assert pet[0][7] == SAMPLE_DEVICE_HID


@pytest.mark.asyncio
async def test_delete_pet():
    from feeder.database.models import Pet

    pet_id = await Pet.create(
        name="Fido", animal_type="dog", weight=1000, birthday=1, activity_level=5
    )
    assert pet_id == 1

    await Pet.delete(pet_id=1)
    with pytest.raises(HTTPException) as exc:
        await Pet.get(pet_id=1)
    assert exc.value.status_code == 404
    assert exc.value.detail == "No pet found with ID 1"


@pytest.mark.asyncio
async def test_update_pet_single_call(with_registered_device: None):
    from feeder.database.models import Pet

    pet_id = await Pet.create(
        name="Fido", animal_type="dog", weight=1000, birthday=1, activity_level=5
    )
    assert pet_id == 1

    row_modified = await Pet.update(
        pet_id=1,
        name="Minnie",
        animal_type="cat",
        weight=500,
        birthday=1234,
        image="base64data",
        activity_level=9,
        device_hid=SAMPLE_DEVICE_HID,
    )
    assert row_modified == 1

    pet = await Pet.get(pet_id=1)
    assert pet[0][0] == 1
    assert pet[0][1] == "Minnie"
    assert pet[0][2] == "base64data"
    assert pet[0][3] == "cat"
    assert pet[0][4] == 500
    assert pet[0][5] == 1234
    assert pet[0][6] == 9
    assert pet[0][7] == SAMPLE_DEVICE_HID


@pytest.mark.asyncio
async def test_update_pet_multi_call(with_registered_device: None):
    from feeder.database.models import Pet

    pet_id = await Pet.create(
        name="Fido", animal_type="dog", weight=1000, birthday=1, activity_level=5
    )
    assert pet_id == 1

    row_modified = await Pet.update(
        pet_id=1,
        name="Minnie",
    )
    assert row_modified == 1
    row_modified = await Pet.update(
        pet_id=1,
        animal_type="cat",
    )
    assert row_modified == 1
    row_modified = await Pet.update(
        pet_id=1,
        weight=500,
    )
    assert row_modified == 1
    row_modified = await Pet.update(
        pet_id=1,
        birthday=1234,
    )
    assert row_modified == 1
    row_modified = await Pet.update(
        pet_id=1,
        image="base64data",
    )
    assert row_modified == 1
    row_modified = await Pet.update(
        pet_id=1,
        activity_level=9,
    )
    assert row_modified == 1
    row_modified = await Pet.update(pet_id=1, device_hid=SAMPLE_DEVICE_HID)
    assert row_modified == 1

    pet = await Pet.get(pet_id=1)
    assert pet[0][0] == 1
    assert pet[0][1] == "Minnie"
    assert pet[0][2] == "base64data"
    assert pet[0][3] == "cat"
    assert pet[0][4] == 500
    assert pet[0][5] == 1234
    assert pet[0][6] == 9
    assert pet[0][7] == SAMPLE_DEVICE_HID


@pytest.mark.asyncio
async def test_create_recipe():
    from feeder.database.models import StoredRecipe

    assert len(await StoredRecipe.get()) == 0
    assert len(await StoredRecipe.get(recipe_id=1)) == 0

    row_modified = await StoredRecipe.create(
        name="sample", g_per_tbsp=7, tbsp_per_feeding=1, budget_tbsp=3
    )
    assert row_modified == 1

    recipes = await StoredRecipe.get(recipe_id=1)
    assert len(recipes) == 1
    assert recipes[0][0] == 1
    assert recipes[0][1] == "sample"
    assert recipes[0][2] == 7
    assert recipes[0][3] == 1
    assert recipes[0][4] == 3


@pytest.mark.asyncio
async def test_update_recipe_single_call():
    from feeder.database.models import StoredRecipe

    row_modified = await StoredRecipe.create(
        name="sample", g_per_tbsp=7, tbsp_per_feeding=1, budget_tbsp=3
    )
    assert row_modified == 1

    row_modified = await StoredRecipe.update(
        recipe_id=1, name="updated", g_per_tbsp=10, tbsp_per_feeding=2, budget_tbsp=6
    )
    assert row_modified == 1

    recipes = await StoredRecipe.get(recipe_id=1)
    assert len(recipes) == 1
    assert recipes[0][0] == 1
    assert recipes[0][1] == "updated"
    assert recipes[0][2] == 10
    assert recipes[0][3] == 2
    assert recipes[0][4] == 6


@pytest.mark.asyncio
async def test_update_recipe_multi_call():
    from feeder.database.models import StoredRecipe

    row_modified = await StoredRecipe.create(
        name="sample", g_per_tbsp=7, tbsp_per_feeding=1, budget_tbsp=3
    )
    assert row_modified == 1

    row_modified = await StoredRecipe.update(
        recipe_id=1,
        name="updated",
    )
    assert row_modified == 1
    row_modified = await StoredRecipe.update(
        recipe_id=1,
        g_per_tbsp=10,
    )
    assert row_modified == 1
    row_modified = await StoredRecipe.update(
        recipe_id=1,
        tbsp_per_feeding=2,
    )
    assert row_modified == 1
    row_modified = await StoredRecipe.update(recipe_id=1, budget_tbsp=6)
    assert row_modified == 1

    recipes = await StoredRecipe.get(recipe_id=1)
    assert len(recipes) == 1
    assert recipes[0][0] == 1
    assert recipes[0][1] == "updated"
    assert recipes[0][2] == 10
    assert recipes[0][3] == 2
    assert recipes[0][4] == 6


@pytest.mark.asyncio
async def test_set_hopper_level(with_registered_device: None):
    from feeder.database.models import (
        HopperLevelRef,
        StoredRecipe,
        KronosDevices,
        FeedingResult,
    )
    from feeder.util import get_current_timestamp

    with pytest.raises(HTTPException) as exc:
        await HopperLevelRef.get(device_id=SAMPLE_DEVICE_HID)
    assert exc.value.status_code == 404
    assert exc.value.detail == f"Hopper level not set for {SAMPLE_DEVICE_HID}"

    await HopperLevelRef.set(device_id=SAMPLE_DEVICE_HID, level=100)

    with pytest.raises(HTTPException) as exc:
        await HopperLevelRef.get(device_id=SAMPLE_DEVICE_HID)
    assert exc.value.status_code == 400
    assert (
        exc.value.detail == "No recipe set for device, cannot calculate hopper level!"
    )

    await StoredRecipe.create(
        name="sample", g_per_tbsp=10, tbsp_per_feeding=1, budget_tbsp=3
    )
    await KronosDevices.update(device_hid=SAMPLE_DEVICE_HID, recipe_id=1)

    level = await HopperLevelRef.get(device_id=SAMPLE_DEVICE_HID)
    assert level == 100

    for index in range(100):
        row_mod = await FeedingResult.report(
            device_hid=SAMPLE_DEVICE_HID,
            start_time=int(get_current_timestamp() / 1000000) + index,
            end_time=2,
            pour=3,
            full=4,
            grams_expected=5,
            grams_actual=10,
            hopper_start=7,
            hopper_end=8,
            recipe_id="E000001",
            fail=False,
        )
        assert row_mod == index + 1

    level = await HopperLevelRef.get(device_id=SAMPLE_DEVICE_HID)
    assert int(level) == 84
