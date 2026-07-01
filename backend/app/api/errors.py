"""Map domain exceptions to the JSON error envelope."""

from __future__ import annotations

import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.errors import DomainError

logger = structlog.get_logger(__name__)


def _envelope(code: str, message: str, details: list, request: Request, status: int) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    return JSONResponse(
        status_code=status,
        content={
            "error": {"code": code, "message": message, "details": details},
            "requestId": request_id,
        },
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def _domain_error(request: Request, exc: DomainError) -> JSONResponse:
        return _envelope(exc.code, exc.message, exc.details, request, exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def _validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        return _envelope(
            "validation_error", "Request validation failed.",
            [str(e) for e in exc.errors()], request, 422,
        )

    @app.exception_handler(Exception)
    async def _unhandled(request: Request, exc: Exception) -> JSONResponse:
        logger.error("api.unhandled_error", exc_info=True)
        return _envelope("internal_error", "An unexpected error occurred.", [], request, 500)
