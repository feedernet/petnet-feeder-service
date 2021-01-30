def test_mqtt_broker_default_config():
    from feeder.util.mqtt.broker import FeederBroker
    from feeder import settings

    broker = FeederBroker()
    assert broker.config["listeners"]["tcp-1"] == {
        "bind": f"0.0.0.0:{settings.mqtt_port}"
    }
    assert broker.config["listeners"]["tcp-ssl-1"] == {
        "bind": f"0.0.0.0:{settings.mqtts_port}",
        "ssl": True,
        "cafile": settings.mqtts_public_key,
        "certfile": settings.mqtts_public_key,
        "keyfile": settings.mqtts_private_key,
    }


def test_mqtt_broker_config_overrides():
    from feeder.util.mqtt.broker import FeederBroker

    overrides = {"auth": {}}
    broker = FeederBroker(config_overrides=overrides)
    assert broker.config["auth"] == {}
