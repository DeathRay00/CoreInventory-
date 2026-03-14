import sqlite3
from auth.hashing import hash_password

def update_password():
    conn = sqlite3.connect('coreinventory.db')
    cursor = conn.cursor()
    
    email = 'admin@company.com'
    new_password = '----------'
    pw_hash = hash_password(new_password)
    
    try:
        cursor.execute("UPDATE users SET password_hash = ? WHERE email = ?", (pw_hash, email))
        if cursor.rowcount > 0:
            conn.commit()
            print(f'Successfully updated password for {email}')
        else:
            print(f'User {email} not found.')
    except Exception as e:
        print(f'Error updating password: {e}')
    finally:
        conn.close()

if __name__ == '__main__':
    update_password()
