from typing import List
from feeder.util import get_relative_timestamp
from feeder.util.feeder import APIRouterWithMQTTClient
from feeder.api.models.pet import RegisteredPet, PetSchedule, ScheduledFeed
from feeder.database.models import Pet, FeedingSchedule, FeedingResult

# Right now this doesn't use the MQTT client, but when a pet is assigned
# a feeder or a scheduled feed, we will need to send that to the feeder.
router = APIRouterWithMQTTClient()


@router.get("", response_model=List[RegisteredPet])
@router.get("/", response_model=List[RegisteredPet])
async def list_pets():
    return await Pet.get()


@router.post("", response_model=RegisteredPet)
@router.post("/", response_model=RegisteredPet)
async def create_pet(new_pet: RegisteredPet):
    pet_id = await Pet.create(
        name=new_pet.name,
        animal_type=new_pet.animal_type,
        weight=new_pet.weight,
        birthday=new_pet.birthday,
        image=new_pet.image,
        activity_level=new_pet.activity_level,
        device_hid=new_pet.device_hid,
    )
    return await get_pet(pet_id)


@router.get("/{pet_id}", response_model=RegisteredPet)
async def get_pet(pet_id: int):
    results = await Pet.get(pet_id=pet_id)
    return results[0]


@router.put("/{pet_id}", response_model=RegisteredPet)
async def update_pet(pet_id: int, update: RegisteredPet):
    pet_id = await Pet.update(
        pet_id=pet_id,
        name=update.name,
        animal_type=update.animal_type,
        weight=update.weight,
        birthday=update.birthday,
        image=update.image,
        activity_level=update.activity_level,
        device_hid=update.device_hid,
    )
    return await get_pet(pet_id)


@router.delete("/{pet_id}")
async def delete_pet(pet_id: int):
    await Pet.delete(pet_id=pet_id)


async def get_schedule_for_pet(pet: RegisteredPet):
    schedule = await FeedingSchedule.get_for_pet(pet.id)
    for idx, event in enumerate(schedule):
        target_time = get_relative_timestamp(event["time"])
        dispense_result = await FeedingResult.dispensed_at(
            device_id=pet.device_hid, timestamp=target_time
        )
        schedule[idx] = {
            **event,
            "result": dispense_result
        }

    return {"events": schedule}


@router.get("/{pet_id}/schedule", response_model=PetSchedule)
async def get_schedule(pet_id: int):
    pet = await get_pet(pet_id)
    return await get_schedule_for_pet(pet)


@router.post("/{pet_id}/schedule", response_model=PetSchedule)
async def new_feed_event(pet_id: int, updated_event: ScheduledFeed):
    pet = await get_pet(pet_id)
    await FeedingSchedule.create_event(
        pet_id=pet_id,
        name=updated_event.name,
        time=updated_event.time
    )
    return await get_schedule_for_pet(pet)


@router.put("/{pet_id}/schedule/{event_id}", response_model=PetSchedule)
async def update_feed_event(pet_id: int, event_id: int, updated_event: ScheduledFeed):
    pet = await get_pet(pet_id)
    await FeedingSchedule.update_event(
        event_id=event_id,
        name=updated_event.name,
        time=updated_event.time,
        enabled=updated_event.enabled
    )
    return await get_schedule_for_pet(pet)


@router.delete("/{pet_id}/schedule/{event_id}", response_model=PetSchedule)
async def delete_feed_event(pet_id: int, event_id: int):
    pet = await get_pet(pet_id)
    await FeedingSchedule.delete_event(event_id=event_id)
    return await get_schedule_for_pet(pet)
