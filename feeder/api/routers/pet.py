from typing import List
from feeder.util.feeder import APIRouterWithMQTTClient
from feeder.api.models.pet import RegisteredPet
from feeder.database.models import Pet

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
async def update_pet(pet_id, update: RegisteredPet):
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
