import time
import logging
import json
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("coreinventory")


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        user_id = None

        response = await call_next(request)

        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        log_entry = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "level": "INFO",
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "response_time_ms": elapsed_ms,
            "user_id": str(user_id) if user_id else None,
        }

        level = logging.WARNING if response.status_code >= 400 else logging.INFO
        logger.log(level, json.dumps(log_entry))
        return response
