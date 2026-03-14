import uuid
from typing import List
from datetime import datetime
from pydantic import BaseModel, Field


class ReceiptItemCreate(BaseModel):
    product_id: uuid.UUID
    warehouse_id: uuid.UUID
    quantity: int = Field(..., gt=0)


class ReceiptCreate(BaseModel):
    supplier: str = Field(..., min_length=1, max_length=255)
    items: List[ReceiptItemCreate]


class ReceiptItemOut(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    warehouse_id: uuid.UUID
    quantity: int

    model_config = {"from_attributes": True}


class ReceiptOut(BaseModel):
    id: uuid.UUID
    supplier: str
    status: str
    created_by: uuid.UUID
    created_at: datetime
    items: List[ReceiptItemOut] = []

    model_config = {"from_attributes": True}


class DeliveryItemCreate(BaseModel):
    product_id: uuid.UUID
    warehouse_id: uuid.UUID
    quantity: int = Field(..., gt=0)


class DeliveryCreate(BaseModel):
    customer: str = Field(..., min_length=1, max_length=255)
    items: List[DeliveryItemCreate]


class DeliveryItemOut(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    warehouse_id: uuid.UUID
    quantity: int

    model_config = {"from_attributes": True}


class DeliveryOut(BaseModel):
    id: uuid.UUID
    customer: str
    status: str
    created_by: uuid.UUID
    created_at: datetime
    items: List[DeliveryItemOut] = []

    model_config = {"from_attributes": True}
