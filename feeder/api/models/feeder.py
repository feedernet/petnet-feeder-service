from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict
from feeder.api.models import BasePaginatedList


class GenericResponse(BaseModel):
    success: str = "ok"


class TriggerFeeding(BaseModel):
    portion: float = 0.0625


class FeedEvent(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    device_name: Optional[str] = None
    device_hid: str
    timestamp: int
    start_time: int
    end_time: int
    pour: Optional[int] = None
    full: Optional[int] = None
    grams_expected: int
    grams_actual: int
    hopper_start: int
    hopper_end: int
    source: int
    fail: bool
    trip: Optional[bool] = None
    lrg: Optional[bool] = None
    vol: Optional[bool] = None
    bowl: Optional[bool] = None
    recipe_id: str
    error: Optional[str] = None


class FeedHistory(BasePaginatedList):
    data: List[FeedEvent]


class HopperLevel(BaseModel):
    level: int


class Recipe(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    name: Optional[str] = ""
    tbsp_per_feeding: Optional[int] = None
    g_per_tbsp: Optional[int] = None
    budget_tbsp: Optional[int] = None


class RawMQTTMessage(BaseModel):
    command: str
    args: Any = {}
