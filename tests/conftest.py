import string
import tempfile
import pathlib
import random
from os import environ
from typing import Callable, Tuple

import pytest
import alembic.config
from fastapi import FastAPI
from fastapi.testclient import TestClient
from amqtt.client import MQTTClient, QOS_2

from tests.certificates import PRIVATE_KEY, PUBLIC_KEY


@pytest.fixture(scope="session")
def test_certificates() -> Tuple[str, str]:
    return PRIVATE_KEY, PUBLIC_KEY


@pytest.fixture(scope="session")
def find_free_port() -> Callable:
    """
    Returns a factory that finds the next free port that is available on the OS
    This is a bit of a hack, it does this by creating a new socket, and calling
    bind with the 0 port. The operating system will assign a brand new port,
    which we can find out using getsockname(). Once we have the new port
    information we close the socket thereby returning it to the free pool.
    This means it is technically possible for this function to return the same
    port twice (for example if run in very quick succession), however operating
    systems return a random port number in the default range (1024 - 65535),
    and it is highly unlikely for two processes to get the same port number.
    In other words, it is possible to flake, but incredibly unlikely.
    """

    def _find_free_port() -> int:
        import socket

        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind(("0.0.0.0", 0))
        portnum = s.getsockname()[1]
        s.close()

        return portnum

    return _find_free_port


@pytest.fixture(scope="session", autouse=True)
def testing_environment(
    test_certificates: Tuple[str, str], find_free_port: Callable
) -> None:
    location = pathlib.Path(tempfile.gettempdir())
    rand_str = "".join(random.choices(string.ascii_letters + string.digits, k=6))

    # Have sqlite use an im-memory database
    db_path = location / f"feedernet.{rand_str}.db"
    environ["DATABASE_PATH"] = str(db_path)

    # Write certificates to temporary files
    priv_path = location / f"feedernet-priv.{rand_str}.pem"
    cert_path = location / f"feedernet-cert.{rand_str}.pem"
    with open(priv_path, "w") as cert_file:
        cert_file.write(test_certificates[0])

    with open(cert_path, "w") as cert_file:
        cert_file.write(test_certificates[1])

    # Configure app to use temporary certs
    environ["MQTTS_PRIVATE_KEY"] = str(priv_path)
    environ["MQTTS_PUBLIC_KEY"] = str(cert_path)

    # Set ports to random values
    environ["MQTT_PORT"] = str(find_free_port())
    environ["MQTTS_PORT"] = str(find_free_port())
    environ["HTTP_PORT"] = str(find_free_port())

    yield

    # Clean up temporary files
    for file_path in [db_path, priv_path, cert_path]:
        try:
            file_path.unlink()
        except FileNotFoundError:
            pass


@pytest.fixture(autouse=True)
async def apply_migrations() -> None:
    print("Running migrations with DB:", environ["DATABASE_PATH"])
    alembic.config.main(argv=["upgrade", "head"])
    yield
    alembic.config.main(argv=["downgrade", "base"])


@pytest.fixture
def app(apply_migrations: None) -> FastAPI:
    from feeder.main import create_application

    print("Starting application with DB:", environ["DATABASE_PATH"])
    return create_application()


@pytest.fixture
def client(app: FastAPI) -> TestClient:
    return TestClient(app)


@pytest.fixture
@pytest.mark.asyncio
async def with_registered_gateway() -> None:
    from tests.test_database_models import SAMPLE_GATEWAY
    from feeder.database.models import KronosGateways

    await KronosGateways.create(**SAMPLE_GATEWAY)


@pytest.fixture
@pytest.mark.asyncio
async def with_registered_device(with_registered_gateway: None) -> None:
    from tests.test_database_models import SAMPLE_DEVICE
    from feeder.database.models import KronosDevices

    await KronosDevices.create(**SAMPLE_DEVICE)


@pytest.fixture
@pytest.mark.asyncio
async def with_sample_feed(with_registered_device: None) -> None:
    from tests.test_database_models import SAMPLE_DEVICE_HID
    from feeder.database.models import FeedingResult
    from feeder.util import get_relative_timestamp

    feed_time = int(get_relative_timestamp(3600, "") / 1000)
    await FeedingResult.report(
        device_hid=SAMPLE_DEVICE_HID,
        start_time=feed_time,
        end_time=feed_time,
        pour=1,
        full=1,
        grams_expected=1,
        grams_actual=1,
        hopper_start=1,
        hopper_end=1,
        recipe_id="E0000001",
        fail=False,
        source=6,
    )


@pytest.fixture
@pytest.mark.asyncio
async def with_stored_recipe(with_registered_device: None) -> None:
    from tests.test_database_models import SAMPLE_DEVICE_HID
    from feeder.database.models import StoredRecipe, KronosDevices

    await StoredRecipe.create(
        name="Sample", g_per_tbsp=8, tbsp_per_feeding=1, budget_tbsp=3
    )

    await KronosDevices.update(device_hid=SAMPLE_DEVICE_HID, recipe_id=1)


@pytest.fixture
@pytest.mark.asyncio
async def mqtt_client() -> MQTTClient:
    from feeder.util.mqtt.authentication import local_username, local_password
    from feeder.util.mqtt.broker import FeederBroker
    from feeder.util.mqtt.client import FeederClient
    from feeder import settings

    broker = FeederBroker()
    await broker.start()
    client = FeederClient()
    await client.connect(
        f"mqtt://{local_username}:{local_password}@localhost:{settings.mqtt_port}"
    )
    await client.subscribe([("#", QOS_2)])
    message = await client.deliver_message()
    packet = message.publish_packet
    assert b"HBMQTT version" in packet.payload.data

    yield client

    await client.disconnect()
    await broker.shutdown()
