import uuid
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from models.product import Product
from models.category import Category
from schemas.product import ProductCreate, ProductUpdate, CategoryCreate
from fastapi import HTTPException, status
from services.ledger_service import create_ledger_entry


# ── Category service ──────────────────────────────────────────────────────────

async def create_category(db: AsyncSession, data: CategoryCreate) -> Category:
    existing = await db.execute(select(Category).where(Category.name == data.name))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail={"code": "VALIDATION_ERROR", "message": "Category name already exists", "details": None},
        )
    cat = Category(name=data.name, description=data.description)
    db.add(cat)
    await db.flush()
    await db.refresh(cat)
    return cat


async def list_categories(db: AsyncSession, limit: int = 20, offset: int = 0) -> List[Category]:
    result = await db.execute(select(Category).order_by(Category.name).limit(min(limit, 100)).offset(offset))
    return result.scalars().all()


# ── Product service ───────────────────────────────────────────────────────────

async def create_product(db: AsyncSession, data: ProductCreate, user_id: uuid.UUID | None = None) -> Product:
    dup = await db.execute(select(Product).where(Product.sku == data.sku))
    if dup.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail={"code": "VALIDATION_ERROR", "message": f"SKU '{data.sku}' already exists", "details": None},
        )
    product = Product(**data.model_dump())
    db.add(product)
    await db.flush()

    # Create ledger entry for product creation
    await create_ledger_entry(
        db=db,
        product_id=product.id,
        warehouse_id=None,
        change_type="product_creation",
        quantity_change=0,
        reference_id=None,
        user_id=user_id,
    )

    await db.refresh(product)
    return product


async def list_products(
    db: AsyncSession,
    search: Optional[str] = None,
    category_id: Optional[uuid.UUID] = None,
    limit: int = 20,
    offset: int = 0,
) -> List[Product]:
    query = select(Product)
    if search:
        query = query.where(or_(Product.name.ilike(f"%{search}%"), Product.sku.ilike(f"%{search}%")))
    if category_id:
        query = query.where(Product.category_id == category_id)
    query = query.order_by(Product.name).limit(min(limit, 100)).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()


async def get_product(db: AsyncSession, product_id: uuid.UUID) -> Product:
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(
            status_code=404,
            detail={"code": "RESOURCE_NOT_FOUND", "message": "Product not found", "details": None},
        )
    return product


async def update_product(db: AsyncSession, product_id: uuid.UUID, data: ProductUpdate) -> Product:
    product = await get_product(db, product_id)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(product, field, value)
    await db.flush()
    await db.refresh(product)
    return product


async def delete_product(db: AsyncSession, product_id: uuid.UUID) -> None:
    product = await get_product(db, product_id)
    await db.delete(product)
    await db.flush()
