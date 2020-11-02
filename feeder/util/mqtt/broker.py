from os.path import abspath

from feeder import settings
from hbmqtt.broker import Broker


class FeederBroker(Broker):
    def __init__(self, config_overrides=None):
        if config_overrides is None:
            config_overrides = {}

        config = {
            "listeners": {
                "default": {"max-connections": 50000, "type": "tcp"},
                "tcp-1": {"bind": f"0.0.0.0:{settings.mqtt_port}"},
                "tcp-ssl-1": {
                    "bind": f"0.0.0.0:{settings.mqtts_port}",
                    "ssl": True,
                    "cafile": abspath(settings.mqtts_public_key),
                    "certfile": abspath(settings.mqtts_public_key),
                    "keyfile": abspath(settings.mqtts_private_key),
                },
            },
            "auth": {"plugins": ["auth_petnet"]},
            "topic-check": {"enabled": True, "plugins": ["topic_petnet"]},
        }

        if config_overrides:
            config.update(config_overrides)

        super().__init__(config=config)
