from pydantic import BaseSettings

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": True,
    "formatters": {
        "default": {
            "format": "%(asctime)s   %(levelname)-8s %(name)s: %(message)s",
        }
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stderr",
        }
    },
    "loggers": {
        "": {"handlers": ["default"], "level": "INFO"},
        "feeder": {"handlers": ["default"], "level": "INFO", "propagate": False},
        "uvicorn.error": {"handlers": ["default"], "level": "INFO", "propagate": False},
        "uvicorn.access": {
            "handlers": ["default"],
            "level": "INFO",
            "propagate": False,
        },
        "hbmqtt": {"handlers": ["default"], "level": "INFO", "propagate": False},
    },
}


class Settings(BaseSettings):
    app_name: str = "IoT Pet Feeder API Replacement"
    app_description: str = (
        "My pet feeder's cloud being shutdown was on my 2020 BINGO card."
    )
    app_id: str = "38973487e8241ea4483e88ef8ca7934c8663dc25"
    debug: bool = False
    database_path: str = "./data.db"
    mqtt_port: int = 1883
    mqtts_port: int = 8883
    mqtts_public_key: str = "./cert.pem"
    mqtts_private_key: str = "./pkey.pem"
    http_port: int = 5000
