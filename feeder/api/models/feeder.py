from typing import Optional, List, Any
from pydantic import BaseModel
from feeder.api.models import BasePaginatedList, OrmModel


class GenericResponse(BaseModel):
    success: str = "ok"


class TriggerFeeding(BaseModel):
    portion: float = 0.0625


class FeedEvent(OrmModel):

    device_name: Optional[str] = None
    device_hid: str
    timestamp: int
    start_time: Optional[int] = None
    end_time: Optional[int] = None
    pour: Optional[int] = None
    full: Optional[int] = None
    grams_expected: Optional[int] = None
    grams_actual: Optional[int] = None
    hopper_start: Optional[int] = None
    hopper_end: Optional[int] = None
    source: Optional[int] = None
    fail: Optional[bool] = None
    trip: Optional[bool] = None
    lrg: Optional[bool] = None
    vol: Optional[bool] = None
    bowl: Optional[bool] = None
    recipe_id: Optional[str] = None
    error: Optional[str] = None


class FeedHistory(BasePaginatedList):
    data: List[FeedEvent]


class HopperLevel(BaseModel):
    level: int


class Recipe(OrmModel):

    id: Optional[int] = None
    name: Optional[str] = ""
    tbsp_per_feeding: Optional[int] = None
    g_per_tbsp: Optional[int] = None
    budget_tbsp: Optional[int] = None


class RawMQTTMessage(BaseModel):
    command: str
    args: Any = {}
