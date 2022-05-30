import pytest
import logging
from amqtt.broker import Action


class MockSession:
    def __init__(self, username: str = "", password: str = "") -> None:
        self.username = username
        self.password = password


class MockContext:
    logger = logging.getLogger("tests.test_utils.test_mqtt_plugins")

    def __init__(self, auth_enabled: bool = True, topic_check_enabled: bool = True):
        self.config = {"auth": None, "topic-check": None}
        if auth_enabled:
            self.config["auth"] = {"plugins": ["auth_petnet"]}
        if topic_check_enabled:
            self.config["topic-check"] = {"enabled": True, "plugins": ["topic_petnet"]}


@pytest.mark.asyncio
async def test_mqtt_auth_plugin_auth_disabled():
    from feeder.util.mqtt.authentication import PetnetAuthPlugin

    mock_context = MockContext(auth_enabled=False)
    mock_session = MockSession()
    assert not await PetnetAuthPlugin(mock_context).authenticate(session=mock_session)


@pytest.mark.asyncio
async def test_mqtt_auth_plugin_without_username():
    from feeder.util.mqtt.authentication import PetnetAuthPlugin

    mock_context = MockContext()
    mock_session = MockSession(password="password")
    assert not await PetnetAuthPlugin(mock_context).authenticate(session=mock_session)


@pytest.mark.asyncio
async def test_mqtt_auth_plugin_nonmatching_username():
    from feeder.util.mqtt.authentication import PetnetAuthPlugin

    mock_context = MockContext()
    mock_session = MockSession(username="random", password="password")
    assert not await PetnetAuthPlugin(mock_context).authenticate(session=mock_session)


@pytest.mark.asyncio
async def test_mqtt_auth_plugin_local():
    from feeder.util.mqtt.authentication import (
        PetnetAuthPlugin,
        local_username,
        local_password,
    )

    mock_context = MockContext()
    mock_session = MockSession(local_username, local_password)
    assert await PetnetAuthPlugin(mock_context).authenticate(session=mock_session)


@pytest.mark.asyncio
async def test_mqtt_auth_plugin_device(with_registered_device: None):
    from feeder.util.mqtt.authentication import PetnetAuthPlugin
    from tests.test_database_models import SAMPLE_GATEWAY, SAMPLE_GATEWAY_HID

    mock_context = MockContext()
    mock_session = MockSession(
        f"/pegasus:{SAMPLE_GATEWAY_HID}", SAMPLE_GATEWAY["apiKey"]
    )
    assert await PetnetAuthPlugin(mock_context).authenticate(session=mock_session)


@pytest.mark.asyncio
async def test_mqtt_auth_plugin_device_wrong_key(with_registered_device: None):
    from feeder.util.mqtt.authentication import PetnetAuthPlugin
    from tests.test_database_models import SAMPLE_GATEWAY_HID

    mock_context = MockContext()
    mock_session = MockSession(f"/pegasus:{SAMPLE_GATEWAY_HID}", "wrong")
    assert not await PetnetAuthPlugin(mock_context).authenticate(session=mock_session)


@pytest.mark.asyncio
async def test_mqtt_auth_plugin_no_device():
    from feeder.util.mqtt.authentication import PetnetAuthPlugin
    from tests.test_database_models import SAMPLE_GATEWAY, SAMPLE_GATEWAY_HID

    mock_context = MockContext()
    mock_session = MockSession(
        f"/pegasus:{SAMPLE_GATEWAY_HID}", SAMPLE_GATEWAY["apiKey"]
    )
    assert not await PetnetAuthPlugin(mock_context).authenticate(session=mock_session)


@pytest.mark.asyncio
async def test_mqtt_topic_plugin_filtering_disabled():
    from feeder.util.mqtt.topic import PetnetTopicPlugin

    mock_context = MockContext(topic_check_enabled=False)
    mock_session = MockSession()
    assert not await PetnetTopicPlugin(mock_context).topic_filtering(
        session=mock_session, topic="#"
    )


@pytest.mark.asyncio
async def test_mqtt_topic_plugin_local_user():
    from feeder.util.mqtt.topic import PetnetTopicPlugin, local_username

    mock_context = MockContext()
    mock_session = MockSession(username=local_username)
    assert await PetnetTopicPlugin(mock_context).topic_filtering(
        session=mock_session, topic="#"
    )


@pytest.mark.asyncio
async def test_mqtt_topic_plugin_without_topic():
    from feeder.util.mqtt.topic import PetnetTopicPlugin

    mock_context = MockContext()
    mock_session = MockSession(username="random")
    assert not await PetnetTopicPlugin(mock_context).topic_filtering(
        session=mock_session
    )


@pytest.mark.asyncio
async def test_mqtt_topic_plugin_random_user():
    from feeder.util.mqtt.topic import PetnetTopicPlugin

    mock_context = MockContext()
    mock_session = MockSession(username="random")
    assert not await PetnetTopicPlugin(mock_context).topic_filtering(
        session=mock_session, topic="#"
    )


@pytest.mark.asyncio
async def test_mqtt_topic_plugin_device_correct_topic():
    from feeder.util.mqtt.topic import PetnetTopicPlugin
    from tests.test_database_models import SAMPLE_GATEWAY_HID

    mock_context = MockContext()
    mock_session = MockSession(username=f"/pegasus:{SAMPLE_GATEWAY_HID}")
    assert await PetnetTopicPlugin(mock_context).topic_filtering(
        session=mock_session,
        action=Action.subscribe,
        topic=f"krs/api/stg/{SAMPLE_GATEWAY_HID}",
    )
    assert await PetnetTopicPlugin(mock_context).topic_filtering(
        session=mock_session,
        action=Action.subscribe,
        topic=f"krs/cmd/stg/{SAMPLE_GATEWAY_HID}",
    )
    assert await PetnetTopicPlugin(mock_context).topic_filtering(
        session=mock_session,
        action=Action.publish,
        topic=f"krs.tel.gts.{SAMPLE_GATEWAY_HID}",
    )


@pytest.mark.asyncio
async def test_mqtt_topic_plugin_device_wrong_topic_pattern_match():
    from feeder.util.mqtt.topic import PetnetTopicPlugin
    from tests.test_database_models import SAMPLE_GATEWAY_HID

    mock_context = MockContext()
    mock_session = MockSession(username=f"/pegasus:{SAMPLE_GATEWAY_HID}")
    assert not await PetnetTopicPlugin(mock_context).topic_filtering(
        session=mock_session, action=Action.subscribe, topic="krs/cmd/stg/wrong-hid"
    )
    assert not await PetnetTopicPlugin(mock_context).topic_filtering(
        session=mock_session, action=Action.publish, topic="krs.tel.gts.wrong-hid"
    )


@pytest.mark.asyncio
async def test_mqtt_topic_plugin_device_wrong_topic_pattern_miss():
    from feeder.util.mqtt.topic import PetnetTopicPlugin
    from tests.test_database_models import SAMPLE_GATEWAY_HID

    mock_context = MockContext()
    mock_session = MockSession(username=f"/pegasus:{SAMPLE_GATEWAY_HID}")
    assert not await PetnetTopicPlugin(mock_context).topic_filtering(
        session=mock_session, action=Action.subscribe, topic="wrong-hid"
    )
    assert not await PetnetTopicPlugin(mock_context).topic_filtering(
        session=mock_session, action=Action.publish, topic="wrong-hid"
    )


@pytest.mark.asyncio
async def test_mqtt_topic_plugin_device_unknown_action_miss():
    from feeder.util.mqtt.topic import PetnetTopicPlugin
    from tests.test_database_models import SAMPLE_GATEWAY_HID

    mock_context = MockContext()
    mock_session = MockSession(username=f"/pegasus:{SAMPLE_GATEWAY_HID}")
    assert not await PetnetTopicPlugin(mock_context).topic_filtering(
        session=mock_session,
        action="explode",
        topic=f"krs.tel.gts.{SAMPLE_GATEWAY_HID}",
    )
