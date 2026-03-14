-- CoreInventory PostgreSQL Schema
-- Run: psql -U postgres -d coreinventory -f schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUM types
CREATE TYPE user_role AS ENUM ('inventory_manager', 'warehouse_staff');
CREATE TYPE receipt_status AS ENUM ('draft', 'validated');
CREATE TYPE delivery_status AS ENUM ('draft', 'packed', 'validated');
CREATE TYPE transfer_status AS ENUM ('pending', 'completed');
CREATE TYPE ledger_change_type AS ENUM ('receipt', 'delivery', 'transfer_in', 'transfer_out', 'adjustment');

-- Users
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role        user_role NOT NULL DEFAULT 'warehouse_staff',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);

-- Categories
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) NOT NULL UNIQUE,
    description TEXT
);

-- Products
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    sku             VARCHAR(100) NOT NULL UNIQUE,
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    unit_of_measure VARCHAR(50) NOT NULL DEFAULT 'pcs',
    reorder_level   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);

-- Warehouses
CREATE TABLE warehouses (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name    VARCHAR(150) NOT NULL,
    address TEXT
);

-- Locations (racks/shelves within a warehouse)
CREATE TABLE locations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    name         VARCHAR(150) NOT NULL,
    rack_code    VARCHAR(50)
);
CREATE INDEX idx_locations_warehouse ON locations(warehouse_id);

-- Stock (current quantity per product per warehouse per location)
CREATE TABLE stock (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    location_id  UUID REFERENCES locations(id) ON DELETE SET NULL,
    quantity     INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT uq_stock_product_warehouse_location UNIQUE (product_id, warehouse_id, location_id)
);
CREATE INDEX idx_stock_product ON stock(product_id);
CREATE INDEX idx_stock_warehouse ON stock(warehouse_id);

-- Receipts (incoming stock)
CREATE TABLE receipts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier    VARCHAR(255) NOT NULL,
    status      receipt_status NOT NULL DEFAULT 'draft',
    created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_receipts_status ON receipts(status);

CREATE TABLE receipt_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id   UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity     INTEGER NOT NULL CHECK (quantity > 0)
);
CREATE INDEX idx_receipt_items_receipt ON receipt_items(receipt_id);

-- Deliveries (outgoing stock)
CREATE TABLE deliveries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer    VARCHAR(255) NOT NULL,
    status      delivery_status NOT NULL DEFAULT 'draft',
    created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_deliveries_status ON deliveries(status);

CREATE TABLE delivery_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id  UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity     INTEGER NOT NULL CHECK (quantity > 0)
);
CREATE INDEX idx_delivery_items_delivery ON delivery_items(delivery_id);

-- Transfers (inter-warehouse movement)
CREATE TABLE transfers (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id       UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    from_warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    to_warehouse_id  UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity         INTEGER NOT NULL CHECK (quantity > 0),
    status           transfer_status NOT NULL DEFAULT 'pending',
    created_by       UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by       UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stock Adjustments
CREATE TABLE adjustments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id    UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity_change INTEGER NOT NULL,
    reason          VARCHAR(500) NOT NULL,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stock Ledger (immutable audit trail)
CREATE TABLE stock_ledger (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id    UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    change_type     ledger_change_type NOT NULL,
    quantity_change INTEGER NOT NULL,
    reference_id    UUID,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ledger_product ON stock_ledger(product_id);
CREATE INDEX idx_ledger_warehouse ON stock_ledger(warehouse_id);
CREATE INDEX idx_ledger_created ON stock_ledger(created_at DESC);

-- Low Stock Alerts
CREATE TABLE alerts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id  UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    current_stock INTEGER NOT NULL,
    reorder_level INTEGER NOT NULL,
    is_resolved   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
