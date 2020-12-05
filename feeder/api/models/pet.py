from typing import Optional
from pydantic import BaseModel


class RegisteredPet(BaseModel):
    id: Optional[int]
    name: Optional[str]
    image: Optional[str]
    animal_type: Optional[str]
    weight: Optional[float]
    birthday: Optional[int]
    activity_level: Optional[int]
    device_hid: Optional[str]

