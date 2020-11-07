from typing import Optional, List
from pydantic import BaseModel
from feeder.api.models import BasePaginatedList


class GenericResponse(BaseModel):
    success: str = "ok"


class TriggerFeeding(BaseModel):
    portion: float = 0.0625


class FeedEvent(BaseModel):
    device_name: Optional[str]
    device_hid: str
    timestamp: int
    start_time: int
    end_time: int
    pour: Optional[int]
    full: Optional[int]
    grams_expected: int
    grams_actual: int
    hopper_start: int
    hopper_end: int
    source: int
    fail: bool
    trip: Optional[bool]
    lrg: Optional[bool]
    vol: Optional[bool]
    bowl: Optional[bool]
    recipe_id: str
    error: Optional[str]


class FeedHistory(BasePaginatedList):
    data: List[FeedEvent]
