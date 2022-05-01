import math


def test_current_timestamp():
    from feeder.util import get_current_timestamp

    timestamp = get_current_timestamp()
    assert isinstance(timestamp, int)
    assert int(math.log10(timestamp)) + 1 == 13


def test_offset_timestamp():
    from feeder.util import get_relative_timestamp

    timestamp = get_relative_timestamp(0, "UTC")
    assert isinstance(timestamp, int)
    assert int(math.log10(timestamp)) + 1 == 13

    timestamp_offset = get_relative_timestamp(3600, "UTC")
    assert isinstance(timestamp_offset, int)
    assert int(math.log10(timestamp)) + 1 == 13

    assert timestamp < timestamp_offset


def test_offset_timestamp_invalid_timezone():
    from feeder.util import get_relative_timestamp

    timestamp = get_relative_timestamp(0, "notarealzone")
    assert isinstance(timestamp, int)
    assert int(math.log10(timestamp)) + 1 == 13

    timestamp_offset = get_relative_timestamp(3600, "notarealzone")
    assert isinstance(timestamp_offset, int)
    assert int(math.log10(timestamp)) + 1 == 13

    assert timestamp < timestamp_offset
