import string


def test_api_router_with_mqtt_client():
    from feeder.util.feeder import APIRouterWithMQTTClient

    client = "client"
    broker = "broker"
    router = APIRouterWithMQTTClient()
    router.client = client
    router.broker = broker

    assert router.client == client
    assert router.broker == broker


def test_pagination_with_three_items_three_per_page():
    from feeder.util.feeder import paginate_response

    items = ["item1", "item2", "item3"]

    page = paginate_response(items, max_page_size=3)
    assert page["size"] == 3
    assert page["data"] == items
    assert page["page"] == 1
    assert page["totalSize"] == 3
    assert page["totalPages"] == 1


def test_pagination_with_six_items_three_per_page():
    from feeder.util.feeder import paginate_response

    items = ["item1", "item2", "item3", "item4", "item5", "item6"]

    page1 = paginate_response(items, max_page_size=3)
    assert page1["size"] == 3
    assert page1["data"] == ["item1", "item2", "item3"]
    assert page1["page"] == 1
    assert page1["totalSize"] == 6
    assert page1["totalPages"] == 2

    page2 = paginate_response(items, current_page=2, max_page_size=3)
    assert page2["size"] == 3
    assert page2["data"] == ["item4", "item5", "item6"]
    assert page2["page"] == 2
    assert page2["totalSize"] == 6
    assert page2["totalPages"] == 2


def test_pagination_with_no_items():
    from feeder.util.feeder import paginate_response

    items = []
    page = paginate_response(items)
    assert page["size"] == 0
    assert page["data"] == items
    assert page["page"] == 1
    assert page["totalSize"] == 0
    assert page["totalPages"] == 0


def test_pagination_with_three_items_three_per_page_override_size():
    from feeder.util.feeder import paginate_response

    items = ["item1", "item2", "item3"]
    page = paginate_response(items, max_page_size=3, total_override=100)
    assert page["size"] == 3
    assert page["data"] == items
    assert page["page"] == 1
    assert page["totalSize"] == 100
    assert page["totalPages"] == 34


def test_generate_api_key():
    from feeder.util.feeder import generate_api_key

    key = generate_api_key()
    assert all(c in string.hexdigits for c in key)
    assert len(key) == 64


def test_generate_feeder_hid():
    from feeder.util.feeder import generate_feeder_hid

    uid = "smartfeeder-1337f33d-123456"
    hid = generate_feeder_hid(uid)
    assert hid == "d9eae8344910399224153df53f12400ceb8c5707"


def test_check_feeder_broker_connection(mocker):
    from feeder.util.feeder import check_connection

    class MockDevice(dict):
        gatewayHid = "gateway_hid"

    device = MockDevice()
    session = mocker.Mock()
    broker = mocker.Mock()
    broker._sessions = {"gateway_hid": (session, None)}
    session.return_value.transitions.is_connected.return_value = True
    results = check_connection(device=device, broker=broker)
    assert results["connected"]
