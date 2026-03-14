import random
import string
from typing import Optional

# In-memory OTP store: {email: otp_string}
# In production replace with Redis TTL keys
_otp_store: dict[str, str] = {}


def generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


def store_otp(email: str, otp: str) -> None:
    _otp_store[email.lower()] = otp


def verify_otp(email: str, otp: str) -> bool:
    stored = _otp_store.get(email.lower())
    if stored and stored == otp:
        del _otp_store[email.lower()]
        return True
    return False


def paginate(query, limit: int = 20, offset: int = 0):
    """Apply limit/offset to any SQLAlchemy select statement."""
    return query.limit(min(limit, 100)).offset(offset)
