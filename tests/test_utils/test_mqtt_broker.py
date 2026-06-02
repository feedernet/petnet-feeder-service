import pytest


@pytest.mark.asyncio
async def test_mqtt_broker_default_config():
    from feeder.util.mqtt.broker import FeederBroker
    from feeder import settings

    broker = FeederBroker()
    tcp = broker.config["listeners"]["tcp-1"]
    assert tcp.bind == f"0.0.0.0:{settings.mqtt_port}"

    ssl_listener = broker.config["listeners"]["tcp-ssl-1"]
    assert ssl_listener.bind == f"0.0.0.0:{settings.mqtts_port}"
    assert ssl_listener.ssl is True
    assert str(ssl_listener.cafile) == settings.mqtts_public_key
    assert str(ssl_listener.certfile) == settings.mqtts_public_key
    assert str(ssl_listener.keyfile) == settings.mqtts_private_key


@pytest.mark.asyncio
async def test_mqtt_broker_config_overrides():
    from feeder.util.mqtt.broker import FeederBroker

    overrides = {"auth": {}}
    broker = FeederBroker(config_overrides=overrides)
    assert broker.config["auth"] == {}
