import json
from unittest import mock

import pytest

from hbmqtt.client import MQTTClient
from fastapi.exceptions import HTTPException


def test_generate_task_id():
    from feeder.util.mqtt.client import generate_task_id

    assert len(generate_task_id()) == 32


def test_build_cmd():
    from feeder.util.mqtt.client import build_command
    from tests.test_database_models import SAMPLE_DEVICE_HID

    command = "test.sample"
    args = {"array": ["test"]}
    result = build_command(SAMPLE_DEVICE_HID, command, args)
    assert (
        b'"name": "SendCommand", "encrypted": false, "parameters": '
        b'{"deviceHid": "c3d89400068631f8138a57286982bea94370693d", '
        b'"command": "test.sample", "payload": "{\\"array\\": [\\"test\\"]}"}}'
    ) in result


@pytest.mark.asyncio
async def test_commit_telem_device_ping(with_registered_device: None):
    from tests.test_database_models import SAMPLE_GATEWAY_HID, SAMPLE_DEVICE_HID
    from feeder.util.mqtt.client import commit_telemetry_data
    from feeder.database.models import KronosDevices

    devices = await KronosDevices.get(device_hid=SAMPLE_DEVICE_HID)
    assert devices[0].lastPingedAt is None

    await commit_telemetry_data(
        gateway_id=SAMPLE_GATEWAY_HID,
        payload={"_|deviceHid": SAMPLE_DEVICE_HID, "s|msg_type": "hb"},
    )

    devices = await KronosDevices.get(device_hid=SAMPLE_DEVICE_HID)
    assert devices[0].lastPingedAt is not None


@pytest.mark.asyncio
async def test_commit_telem_device_sensors(with_registered_device: None):
    from tests.test_database_models import SAMPLE_GATEWAY_HID, SAMPLE_DEVICE_HID
    from feeder.util.mqtt.client import commit_telemetry_data
    from feeder.database.models import DeviceTelemetryData

    with pytest.raises(HTTPException) as exc:
        await DeviceTelemetryData.get(device_hid=SAMPLE_DEVICE_HID)
    assert exc.value.status_code == 400
    assert exc.value.detail == "Unknown device or device has not yet reported!"

    await commit_telemetry_data(
        gateway_id=SAMPLE_GATEWAY_HID,
        payload={
            "_|deviceHid": SAMPLE_DEVICE_HID,
            "s|msg_type": "sensor",
            "f|voltage": 4500,
            "i|usb": 1,
            "i|chg": 1,
            "i|ir": 0,
            "i|rssi": 99,
        },
    )

    telemetry = await DeviceTelemetryData.get(device_hid=SAMPLE_DEVICE_HID)
    assert telemetry[0] == SAMPLE_DEVICE_HID
    assert telemetry[2] == 4.5
    assert telemetry[3] is True
    assert telemetry[4] is True
    assert telemetry[5] is False
    assert telemetry[6] == 99


@pytest.mark.asyncio
async def test_commit_telem_feed_result(with_registered_device: None):
    from tests.test_database_models import SAMPLE_GATEWAY_HID, SAMPLE_DEVICE_HID
    from feeder.util.mqtt.client import commit_telemetry_data
    from feeder.database.models import FeedingResult

    assert len(await FeedingResult.get(device_hid=SAMPLE_DEVICE_HID)) == 0

    await commit_telemetry_data(
        gateway_id=SAMPLE_GATEWAY_HID,
        payload={
            "_|deviceHid": SAMPLE_DEVICE_HID,
            "s|msg_type": "feed_result",
            "i|stime": 1,
            "i|etime": 2,
            "i|pour": 3,
            "i|full": 4,
            "f|e_g": 5,
            "f|a_g": 6,
            "f|h_s": 7,
            "f|h_e": 8,
            "i|src": 9,
            "b|fail": False,
            "b|trip": True,
            "b|lrg": False,
            "b|vol": False,
            "b|bowl": True,
            "s|rid": "E000001",
            "s|err": "",
        },
    )

    results = await FeedingResult.get(device_hid=SAMPLE_DEVICE_HID)
    assert results[0].device_hid == SAMPLE_DEVICE_HID
    assert results[0].start_time == 1000000
    assert results[0].end_time == 2000000
    assert results[0].pour == 3
    assert results[0].full == 4
    assert results[0].grams_expected == 5
    assert results[0].grams_actual == 6
    assert results[0].hopper_start == 7
    assert results[0].hopper_end == 8
    assert results[0].source == 9
    assert results[0].fail is False
    assert results[0].trip is True
    assert results[0].lrg is False
    assert results[0].vol is False
    assert results[0].bowl is True
    assert results[0].recipe_id == "E000001"
    assert results[0].error == ""


@pytest.mark.asyncio
async def test_mqtt_client_calls_telem(mqtt_client: MQTTClient, mocker: mock):
    from tests.test_database_models import SAMPLE_GATEWAY_HID

    telem_func = mocker.patch("feeder.util.mqtt.client.commit_telemetry_data")
    await mqtt_client.publish(f"krs.tel.gts.{SAMPLE_GATEWAY_HID}", message=b"{}")

    message = await mqtt_client.deliver_message()
    packet = message.publish_packet
    await mqtt_client.handle_message(packet)

    telem_func.assert_called_once_with(SAMPLE_GATEWAY_HID, {})


@pytest.mark.asyncio
async def test_mqtt_client_handle_request_ack(mqtt_client: MQTTClient):
    from tests.test_database_models import SAMPLE_GATEWAY_HID

    await mqtt_client.publish(
        f"krs.api.gts.{SAMPLE_GATEWAY_HID}", message=b'{"requestId": 1}'
    )

    message = await mqtt_client.deliver_message()
    packet = message.publish_packet
    await mqtt_client.handle_message(packet)

    message = await mqtt_client.deliver_message()
    packet = message.publish_packet
    assert packet.variable_header.topic_name == f"krs/api/stg/{SAMPLE_GATEWAY_HID}"
    payload = json.loads(packet.payload.data)
    assert payload == {
        "requestId": 1,
        "eventName": "GatewayToServer_ApiRequest",
        "encrypted": False,
        "parameters": {"status": "OK"},
    }


@pytest.mark.asyncio
async def test_mqtt_client_generic_send(mqtt_client: MQTTClient):
    from tests.test_database_models import SAMPLE_GATEWAY_HID, SAMPLE_DEVICE_HID

    await mqtt_client.send_cmd(SAMPLE_GATEWAY_HID, SAMPLE_DEVICE_HID, "test", {})
    message = await mqtt_client.deliver_message()
    packet = message.publish_packet
    assert packet.variable_header.topic_name == f"krs/cmd/stg/{SAMPLE_GATEWAY_HID}"
    payload = json.loads(packet.payload.data)
    assert payload["parameters"] == {
        "deviceHid": SAMPLE_DEVICE_HID,
        "command": "test",
        "payload": "{}",
    }


@pytest.mark.asyncio
async def test_mqtt_client_commands(mqtt_client: MQTTClient):
    from tests.test_database_models import SAMPLE_GATEWAY_HID, SAMPLE_DEVICE_HID

    command_map = {
        mqtt_client.send_cmd_feed: ("feed", {}, '{"portion": 0.0625}'),
        mqtt_client.send_cmd_button: ("button_enable_remote", {}, '{"enable": true}'),
        mqtt_client.send_cmd_reboot: ("reboot", {}, "{}"),
        mqtt_client.send_cmd_utc_offset: ("utc_offset", {}, '{"utc_offset": 0}'),
        mqtt_client.send_cmd_budget: (
            "budget",
            {"recipe_id": 1, "tbsp_per_feeding": 1, "g_per_tbsp": 7, "budget_tbsp": 3},
            '{"recipe": "E0000001", "tbsp_per_feeding": 1, "g_per_tbsp": 7, "budget_tbsp": 3}',
        ),
    }

    for cmd, data in command_map.items():
        await cmd(SAMPLE_GATEWAY_HID, SAMPLE_DEVICE_HID, **data[1])
        message = await mqtt_client.deliver_message()
        packet = message.publish_packet
        assert packet.variable_header.topic_name == f"krs/cmd/stg/{SAMPLE_GATEWAY_HID}"
        payload = json.loads(packet.payload.data)
        assert payload["parameters"] == {
            "deviceHid": SAMPLE_DEVICE_HID,
            "command": data[0],
            "payload": data[2],
        }


@pytest.mark.asyncio
async def test_mqtt_client_schedule_modern(
    mqtt_client: MQTTClient, with_registered_device: None
):
    from feeder.database.models import Pet, FeedingSchedule
    from tests.test_database_models import SAMPLE_DEVICE_HID, SAMPLE_GATEWAY_HID

    modern_pet = await Pet.create(
        name="modern",
        animal_type="dog",
        weight=1,
        birthday=1,
        activity_level=1,
        device_hid=SAMPLE_DEVICE_HID,
    )

    # Finally, lets make some schedules
    await FeedingSchedule.create_event(
        pet_id=modern_pet, name="modern", time=3600, portion=0.0625
    )

    modern_schedule = await FeedingSchedule.get_for_pet(pet_id=modern_pet)
    await mqtt_client.send_cmd_schedule(
        SAMPLE_GATEWAY_HID, SAMPLE_DEVICE_HID, events=modern_schedule
    )

    modern_api_calls = [
        ("schedule_clear", "{}"),
        ("schedule_mod_start", '{"size": 1}'),
        (
            "schedule_add",
            (
                '[{"index": 0, "data": {"active": true, "automatic": true, '
                '"feeding_id": "c3d89400068631f8_feed1_1:00AM", "name": "FEED0", '
                '"portion": 0.0625, "reminder": true, "time": 3600}}]'
            ),
        ),
        ("schedule_mod_end", "{}"),
    ]

    for command, response in modern_api_calls:
        message = await mqtt_client.deliver_message()
        packet = message.publish_packet
        assert packet.variable_header.topic_name == f"krs/cmd/stg/{SAMPLE_GATEWAY_HID}"
        payload = json.loads(packet.payload.data)
        assert payload["parameters"] == {
            "deviceHid": SAMPLE_DEVICE_HID,
            "command": command,
            "payload": response,
        }


@pytest.mark.asyncio
async def test_mqtt_client_schedule_legacy(mqtt_client: MQTTClient):
    from feeder.util.feeder import generate_feeder_hid
    from feeder.database.models import (
        KronosGateways,
        KronosDevices,
        Pet,
        FeedingSchedule,
    )
    from tests.test_database_models import SAMPLE_DEVICE, SAMPLE_GATEWAY

    # We need a legacy device to test the old scheduling API logic.
    # The default device created by "with_registered_device" is set to 2.8.0
    legacy_gateway = {
        **SAMPLE_GATEWAY,
        "softwareVersion": "2.3.2",
        "uid": "smartfeeder-895ae773737d",
    }
    legacy_gateway_hid = generate_feeder_hid("smartfeeder-895ae773737d")
    await KronosGateways.create(**legacy_gateway)

    legacy_device = {
        **SAMPLE_DEVICE,
        "softwareVersion": "2.3.2",
        "uid": "smartfeeder-895ae773737d-prod",
        "gatewayHid": legacy_gateway_hid,
    }
    await KronosDevices.create(**legacy_device)
    legacy_device_hid = generate_feeder_hid("smartfeeder-895ae773737d-prod")

    legacy_pet = await Pet.create(
        name="legacy",
        animal_type="dog",
        weight=1,
        birthday=1,
        activity_level=1,
        device_hid=legacy_device_hid,
    )

    await FeedingSchedule.create_event(
        pet_id=legacy_pet, name="legacy", time=3600, portion=0.0625
    )

    legacy_schedule = await FeedingSchedule.get_for_pet(pet_id=legacy_pet)
    await mqtt_client.send_cmd_schedule(
        legacy_gateway_hid, legacy_device_hid, events=legacy_schedule
    )

    message = await mqtt_client.deliver_message()
    packet = message.publish_packet
    assert packet.variable_header.topic_name == f"krs/cmd/stg/{legacy_gateway_hid}"
    payload = json.loads(packet.payload.data)
    assert payload["parameters"] == {
        "deviceHid": legacy_device_hid,
        "command": "schedule",
        "payload": (
            '[{"active": true, "automatic": true, '
            '"feeding_id": "93c346ad8d668ef6_feed1_1:00AM", "name": "FEED0", '
            '"portion": 0.0625, "reminder": true, "time": 3600}]'
        ),
    }


@pytest.mark.asyncio
async def test_mqtt_client_schedule_legacy_without_version(mqtt_client: MQTTClient):
    from feeder.util.feeder import generate_feeder_hid
    from feeder.database.models import (
        KronosGateways,
        KronosDevices,
        Pet,
        FeedingSchedule,
    )
    from tests.test_database_models import SAMPLE_DEVICE, SAMPLE_GATEWAY

    # We need a legacy device to test the old scheduling API logic.
    # The default device created by "with_registered_device" is set to 2.8.0
    legacy_gateway = {
        **SAMPLE_GATEWAY,
        "softwareVersion": None,
        "uid": "smartfeeder-895ae773737d",
    }
    legacy_gateway_hid = generate_feeder_hid("smartfeeder-895ae773737d")
    await KronosGateways.create(**legacy_gateway)

    legacy_device = {
        **SAMPLE_DEVICE,
        "softwareVersion": None,
        "uid": "smartfeeder-895ae773737d-prod",
        "gatewayHid": legacy_gateway_hid,
    }
    await KronosDevices.create(**legacy_device)
    legacy_device_hid = generate_feeder_hid("smartfeeder-895ae773737d-prod")

    legacy_pet = await Pet.create(
        name="legacy",
        animal_type="dog",
        weight=1,
        birthday=1,
        activity_level=1,
        device_hid=legacy_device_hid,
    )

    await FeedingSchedule.create_event(
        pet_id=legacy_pet, name="legacy", time=3600, portion=0.0625
    )

    legacy_schedule = await FeedingSchedule.get_for_pet(pet_id=legacy_pet)
    await mqtt_client.send_cmd_schedule(
        legacy_gateway_hid, legacy_device_hid, events=legacy_schedule
    )

    message = await mqtt_client.deliver_message()
    packet = message.publish_packet
    assert packet.variable_header.topic_name == f"krs/cmd/stg/{legacy_gateway_hid}"
    payload = json.loads(packet.payload.data)
    assert payload["parameters"] == {
        "deviceHid": legacy_device_hid,
        "command": "schedule",
        "payload": (
            '[{"active": true, "automatic": true, '
            '"feeding_id": "93c346ad8d668ef6_feed1_1:00AM", "name": "FEED0", '
            '"portion": 0.0625, "reminder": true, "time": 3600}]'
        ),
    }

@pytest.mark.asyncio
async def test_mqtt_client_handle_api_unicode_error(mqtt_client: MQTTClient, mocker):
    from tests.test_database_models import SAMPLE_GATEWAY_HID

    await mqtt_client.publish(
        f"krs.api.gts.{SAMPLE_GATEWAY_HID}", message=b'{"requestId": 1}'
    )

    message = await mqtt_client.deliver_message()
    packet = message.publish_packet

    mocker.patch(
        "feeder.util.mqtt.client.json.loads",
        side_effect=UnicodeDecodeError("", b"", 0, 1, "")
    )
    returns = await mqtt_client.handle_message(packet)
    assert returns is None


@pytest.mark.asyncio
async def test_mqtt_client_handle_telemetry_unicode_error(mqtt_client: MQTTClient, mocker):
    from tests.test_database_models import SAMPLE_GATEWAY_HID

    await mqtt_client.publish(
        f"krs.tel.gts.{SAMPLE_GATEWAY_HID}", message=b'{"requestId": 1}'
    )

    message = await mqtt_client.deliver_message()
    packet = message.publish_packet

    mocker.patch(
        "feeder.util.mqtt.client.json.loads",
        side_effect=UnicodeDecodeError("", b"", 0, 1, "")
    )
    returns = await mqtt_client.handle_message(packet)
    assert returns is None


@pytest.mark.asyncio
async def test_mqtt_client_handle_unknown_topic(mqtt_client: MQTTClient):
    from tests.test_database_models import SAMPLE_GATEWAY_HID

    await mqtt_client.publish(
        f"krs.api.foobar.{SAMPLE_GATEWAY_HID}", message=b'{"requestId": 1}'
    )

    message = await mqtt_client.deliver_message()
    packet = message.publish_packet

    returns = await mqtt_client.handle_message(packet)
    assert returns is None
