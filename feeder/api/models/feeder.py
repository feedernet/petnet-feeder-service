from pydantic import BaseModel


class GenericResponse(BaseModel):
    success: str = "ok"


class FrontButton(BaseModel):
    enable: bool = True


class UTCOffset(BaseModel):
    utc_offset: int = -7


class TriggerFeeding(BaseModel):
    portion: float = 0.0625
