from typing import Optional, List
from feeder.api.models import OrmModel
from feeder.api.models.feeder import FeedEvent


class RegisteredPet(OrmModel):

    id: Optional[int] = None
    name: Optional[str] = None
    image: Optional[str] = None
    animal_type: Optional[str] = None
    weight: Optional[float] = None
    birthday: Optional[int] = None
    activity_level: Optional[int] = None
    device_hid: Optional[str] = None


class ScheduledFeed(OrmModel):

    event_id: Optional[int] = None
    name: Optional[str] = None
    time: Optional[int] = None
    enabled: Optional[bool] = None
    portion: Optional[float] = None
    result: Optional[FeedEvent] = None


class PetSchedule(OrmModel):

    events: List[ScheduledFeed]
