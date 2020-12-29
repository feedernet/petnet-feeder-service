from datetime import datetime, time

MICROSEC_IN_SEC = 1000000


def get_current_timestamp() -> int:
    now = datetime.timestamp(datetime.now())
    return int(now * MICROSEC_IN_SEC)


def get_relative_timestamp(seconds_since_midnight: int) -> int:
    midnight = datetime.combine(datetime.today(), time.min)
    timestamp = datetime.timestamp(midnight) + seconds_since_midnight
    return int(timestamp * MICROSEC_IN_SEC)
