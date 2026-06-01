from pydantic import BaseSettings

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": True,
    "formatters": {
        "json": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(name)s %(levelname)s %(message)s"
        }
    },
    "handlers": {
        "default": {
            "formatter": "json",
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
        "amqtt": {"handlers": ["default"], "level": "INFO", "propagate": False},
        "databases": {"handlers": ["default"], "level": "INFO", "propagate": False},
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
    app_root: str = ""
    domain: str = ""  # Added as SAN to self-signed cert
