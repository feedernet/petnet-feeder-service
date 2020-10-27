from pydantic import BaseModel


class BasePaginatedList(BaseModel):
    size: int = 0
    page: int = 0
    totalSize: int = 0
    totalPages: int = 1