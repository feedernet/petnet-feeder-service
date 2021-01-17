import pytest
from fastapi import HTTPException


def test_handle_registration_without_hid():
    from feeder.database.models import handle_potential_registration

    hid = "c3d89400068631f8138a57286982bea94370693d"

    # First, check that we are properly assigning empty fields
    model = {"uid": "smartfeeder-4b09fa082bbd-prod"}
    model = handle_potential_registration(model)
    assert model["hid"] == hid
    assert isinstance(model["discoveredAt"], int)

    # Now, check that we are properly ignoring already filled fields
    filled_model = {"uid": "testing", "hid": "present", "discoveredAt": 0}
    filled_model = handle_potential_registration(filled_model)
    assert filled_model["hid"] == "present"
    assert filled_model["discoveredAt"] == 0


@pytest.mark.asyncio
async def test_get_all_gateways_without_gateways():
    from feeder.database.models import KronosGateways

    assert await KronosGateways.get() == []

    with pytest.raises(HTTPException) as exc:
        await KronosGateways.get(gateway_hid="nothing")

    assert exc.value.status_code == 400
    assert exc.value.detail == "Unregistered Gateway (nothing)"


@pytest.mark.asyncio
async def test_insert_gateway_and_retrieve_it():
    from feeder.database.models import KronosGateways
    from feeder.api.models.kronos import NewGateway

    hid = "c3d89400068631f8138a57286982bea94370693d"
    gateway = NewGateway(
        name="SF20A",
        uid="smartfeeder-4b09fa082bbd-prod",
        osName="SMART FEEDER",
        type="Local",
        softwareName="SMART FEEDER",
        softwareVersion="2.8.0",
        sdkVersion="1.3.12",
    )

    rows_created = await KronosGateways.create(**gateway.dict())
    assert rows_created == 1

    all_gateways = await KronosGateways.get(gateway_hid=hid)
    target_gateway = all_gateways[0]
    assert target_gateway[0] == hid


@pytest.mark.asyncio
async def test_get_or_insert_gateway():
    from feeder.database.models import KronosGateways
    from feeder.api.models.kronos import NewGateway

    hid = "c3d89400068631f8138a57286982bea94370693d"
    gateway = NewGateway(
        name="SF20A",
        uid="smartfeeder-4b09fa082bbd-prod",
        osName="SMART FEEDER",
        type="Local",
        softwareName="SMART FEEDER",
        softwareVersion="2.8.0",
        sdkVersion="1.3.12",
    )

    rows_created = await KronosGateways.create(**gateway.dict())
    assert rows_created == 1

    result = await KronosGateways.get_or_insert(gateway_hid=hid)
    all_gateways = await KronosGateways.get()

    assert result[0] == hid
    assert len(all_gateways) == 1

    result = await KronosGateways.get_or_insert(gateway_hid="testing-new-hid")
    assert result[0] == "testing-new-hid"

    all_gateways = await KronosGateways.get()
    assert len(all_gateways) == 2
