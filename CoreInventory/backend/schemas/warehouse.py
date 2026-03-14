import uuid
from typing import Optional
from pydantic import BaseModel, Field


class WarehouseCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    address: Optional[str] = None


class WarehouseOut(BaseModel):
    id: uuid.UUID
    name: str
    address: Optional[str]

    model_config = {"from_attributes": True}


class LocationCreate(BaseModel):
    warehouse_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=150)
    rack_code: Optional[str] = Field(None, max_length=50)


class LocationOut(BaseModel):
    id: uuid.UUID
    warehouse_id: uuid.UUID
    name: str
    rack_code: Optional[str]

    model_config = {"from_attributes": True}
