import sqlite3
import uuid
from datetime import datetime
from auth.hashing import hash_password

def setup():
    conn = sqlite3.connect('coreinventory.db')
    cursor = conn.cursor()
    # Execute schema
    with open('schema.sql', 'r') as f:
        schema = f.read()
    
    # SQLite doesn't support ENUM natively like this schema
    # We strip ENUM creation from postgres schema for sqlite testing
    schema = schema.replace('CREATE TYPE user_role AS ENUM (''inventory_manager'', ''warehouse_staff'');', '')
    schema = schema.replace('user_role', 'VARCHAR(50)')
    schema = schema.replace('UUID PRIMARY KEY DEFAULT gen_random_uuid()', 'VARCHAR(36) PRIMARY KEY')
    schema = schema.replace('UUID', 'VARCHAR(36)')
    schema = schema.replace('TIMESTAMPTZ', 'DATETIME')
    
    try:
        cursor.executescript(schema)
    except Exception as e:
        pass # Tables might exist

    # Create admin
    admin_id = str(uuid.uuid4())
    pw_hash = hash_password('admin123')
    
    try:
        cursor.execute("INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                       (admin_id, 'Admin', 'admin@company.com', pw_hash, 'inventory_manager', datetime.now()))
        conn.commit()
        print('Created admin@company.com with password: admin123')
    except Exception as e:
        print(f'Error creating admin: {e}')
    
    conn.close()

if __name__ == '__main__':
    setup()
