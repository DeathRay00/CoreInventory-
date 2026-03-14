import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.warehouse import Warehouse
from models.location import Location
from schemas.warehouse import WarehouseCreate, LocationCreate
from fastapi import HTTPException


async def create_warehouse(db: AsyncSession, data: WarehouseCreate) -> Warehouse:
    wh = Warehouse(name=data.name, address=data.address)
    db.add(wh)
    await db.flush()
    await db.refresh(wh)
    return wh


async def list_warehouses(db: AsyncSession, limit: int = 20, offset: int = 0) -> List[Warehouse]:
    result = await db.execute(select(Warehouse).order_by(Warehouse.name).limit(min(limit, 100)).offset(offset))
    return result.scalars().all()


async def get_warehouse(db: AsyncSession, warehouse_id: uuid.UUID) -> Warehouse:
    result = await db.execute(select(Warehouse).where(Warehouse.id == warehouse_id))
    wh = result.scalar_one_or_none()
    if not wh:
        raise HTTPException(
            status_code=404,
            detail={"code": "RESOURCE_NOT_FOUND", "message": "Warehouse not found", "details": None},
        )
    return wh


async def create_location(db: AsyncSession, data: LocationCreate) -> Location:
    # Ensure warehouse exists
    await get_warehouse(db, data.warehouse_id)
    loc = Location(warehouse_id=data.warehouse_id, name=data.name, rack_code=data.rack_code)
    db.add(loc)
    await db.flush()
    await db.refresh(loc)
    return loc


async def list_locations(
    db: AsyncSession, warehouse_id: Optional[uuid.UUID] = None, limit: int = 20, offset: int = 0
) -> List[Location]:
    query = select(Location)
    if warehouse_id:
        query = query.where(Location.warehouse_id == warehouse_id)
    query = query.order_by(Location.name).limit(min(limit, 100)).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()
