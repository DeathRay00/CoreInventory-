import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class TransferCreate(BaseModel):
    product_id: uuid.UUID
    from_warehouse_id: uuid.UUID
    to_warehouse_id: uuid.UUID
    quantity: int = Field(..., gt=0)


class TransferOut(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    from_warehouse_id: uuid.UUID
    to_warehouse_id: uuid.UUID
    quantity: int
    status: str
    created_by: Optional[uuid.UUID]
    created_at: datetime

    model_config = {"from_attributes": True}


class AdjustmentCreate(BaseModel):
    product_id: uuid.UUID
    warehouse_id: uuid.UUID
    quantity_change: int
    reason: str = Field(..., min_length=3, max_length=500)


class AdjustmentOut(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    warehouse_id: uuid.UUID
    quantity_change: int
    reason: str
    created_by: Optional[uuid.UUID]
    created_at: datetime

    model_config = {"from_attributes": True}


class StockOut(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    warehouse_id: uuid.UUID
    location_id: Optional[uuid.UUID]
    quantity: int

    model_config = {"from_attributes": True}


class LedgerOut(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    warehouse_id: uuid.UUID
    change_type: str
    quantity_change: int
    reference_id: Optional[uuid.UUID]
    user_id: Optional[uuid.UUID]
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertOut(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    warehouse_id: uuid.UUID
    current_stock: int
    reorder_level: int
    is_resolved: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardOut(BaseModel):
    total_products: int
    total_stock_value: int
    low_stock_count: int
    out_of_stock_count: int
    pending_receipts: int
    pending_deliveries: int
    pending_transfers: int
    active_alerts: int
