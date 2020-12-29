from typing import Optional, List
from pydantic import BaseModel
from feeder.api.models.feeder import FeedEvent


class RegisteredPet(BaseModel):
    id: Optional[int]
    name: Optional[str]
    image: Optional[str]
    animal_type: Optional[str]
    weight: Optional[float]
    birthday: Optional[int]
    activity_level: Optional[int]
    device_hid: Optional[str]


class ScheduledFeed(BaseModel):
    event_id: Optional[int]
    name: Optional[str]
    time: Optional[int]
    enabled: Optional[bool]
    result: Optional[FeedEvent] = None


class PetSchedule(BaseModel):
    events: List[ScheduledFeed]
