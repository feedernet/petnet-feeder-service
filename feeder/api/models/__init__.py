from pydantic import BaseModel, ConfigDict


class OrmModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class BasePaginatedList(BaseModel):
    size: int = 0
    page: int = 0
    totalSize: int = 0
    totalPages: int = 1
