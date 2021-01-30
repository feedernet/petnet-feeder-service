import math


def test_current_timestamp():
    from feeder.util import get_current_timestamp

    timestamp = get_current_timestamp()
    assert isinstance(timestamp, int)
    assert int(math.log10(timestamp)) + 1 == 16


def test_offset_timestamp():
    from feeder.util import get_relative_timestamp

    timestamp = get_relative_timestamp(0)
    assert isinstance(timestamp, int)
    assert int(math.log10(timestamp)) + 1 == 16

    timestamp_offset = get_relative_timestamp(3600)
    assert isinstance(timestamp_offset, int)
    assert int(math.log10(timestamp)) + 1 == 16

    assert timestamp < timestamp_offset
