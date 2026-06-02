from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from feeder.api.models.feeder import FeedEvent


class RegisteredPet(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    name: Optional[str] = None
    image: Optional[str] = None
    animal_type: Optional[str] = None
    weight: Optional[float] = None
    birthday: Optional[int] = None
    activity_level: Optional[int] = None
    device_hid: Optional[str] = None


class ScheduledFeed(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    event_id: Optional[int] = None
    name: Optional[str] = None
    time: Optional[int] = None
    enabled: Optional[bool] = None
    portion: Optional[float] = None
    result: Optional[FeedEvent] = None


class PetSchedule(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    events: List[ScheduledFeed]
