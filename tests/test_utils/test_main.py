import math


def test_current_timestamp():
    from feeder.util import get_current_timestamp

    timestamp = get_current_timestamp()
    assert isinstance(timestamp, int)
    assert int(math.log10(timestamp)) + 1 == 16
