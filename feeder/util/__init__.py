import logging
from datetime import datetime, time

import pytz

MICROSEC_IN_SEC = 1000000

logger = logging.getLogger()


def get_current_timestamp() -> int:
    now = datetime.timestamp(datetime.now())
    return int(now * MICROSEC_IN_SEC)


def get_relative_timestamp(seconds_since_midnight: int, timezone: str) -> int:
    try:
        zone = pytz.timezone(timezone)
    except pytz.exceptions.UnknownTimeZoneError:
        logger.exception("Failed to map feeder timezone!")
        zone = None

    midnight = datetime.combine(datetime.now(zone), time.min)
    timestamp = datetime.timestamp(midnight) + seconds_since_midnight
    return int(timestamp * MICROSEC_IN_SEC)
