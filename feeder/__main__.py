import os
import logging
from logging.config import dictConfig

import uvicorn

from feeder import settings
from feeder.main import get_application
from feeder.config import LOGGING_CONFIG
from feeder.util.mkcert import generate_self_signed_certificate, domain_in_subjects

logger = logging.getLogger("feeder")
if settings.debug:
    for named_logger in LOGGING_CONFIG["loggers"]:
        if named_logger:
            LOGGING_CONFIG["loggers"][named_logger]["level"] = "DEBUG"
    LOGGING_CONFIG["loggers"]["hbmqtt.client.plugins"] = {"level": "INFO"}
    LOGGING_CONFIG["loggers"]["hbmqtt.broker.plugins"] = {"level": "INFO"}
    LOGGING_CONFIG["loggers"]["hbmqtt.mqtt.protocol.handler"] = {"level": "INFO"}
dictConfig(LOGGING_CONFIG)

app = get_application()

if __name__ == "__main__":
    public_key = os.path.abspath(settings.mqtts_public_key)
    private_key = os.path.abspath(settings.mqtts_private_key)

    if not os.path.exists(public_key) and not os.path.exists(private_key):
        logger.warning("Generating self-signed key pair!")
        certificate_pair = generate_self_signed_certificate()
        with open(public_key, "wb") as f:
            logger.info("Writing new public key to %s", public_key)
            f.write(certificate_pair[0])
        with open(private_key, "wb") as f:
            logger.info("Writing new private key to %s", private_key)
            f.write(certificate_pair[1])
    elif not domain_in_subjects(public_key, settings.domain) and settings.domain:
        logger.warning(
            "The certificates provided are not valid for %s!", settings.domain
        )
        logger.warning(
            """If you aren't using these certificates in your SSL proxy,
you can ignore this message.
To generate new certificates, please delete the existing certificates and restart
this application.
"""
        )

    uvicorn.run("feeder.__main__:app", host="0.0.0.0", port=settings.http_port)
