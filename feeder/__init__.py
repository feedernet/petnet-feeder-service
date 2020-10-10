import logging

from feeder.util.mkcert import generate_self_signed_certificate
from feeder.config import Settings


settings = Settings()

if settings.debug:
    logger = logging.getLogger("feeder")
    uvicorn = logging.getLogger("uvicorn")
    broker = logging.getLogger("hbmqtt")
    logger.setLevel(logging.DEBUG)
    for handler in logger.handlers:
        handler.setLevel(logging.DEBUG)
