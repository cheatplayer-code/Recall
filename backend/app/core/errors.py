"""Domain exceptions mapped to HTTP responses by the API layer."""

from __future__ import annotations


class DomainError(Exception):
    """Base for all domain errors. Carries an HTTP status + machine code."""

    status_code: int = 400
    code: str = "bad_request"

    def __init__(self, message: str, *, details: list[str] | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details or []


class BadRequestError(DomainError):
    status_code = 400
    code = "bad_request"


class NotFoundError(DomainError):
    status_code = 404
    code = "not_found"


class ConflictError(DomainError):
    status_code = 409
    code = "conflict"


class UnauthorizedError(DomainError):
    status_code = 401
    code = "unauthorized"


class ForbiddenError(DomainError):
    status_code = 403
    code = "forbidden"


class PayloadTooLargeError(DomainError):
    status_code = 413
    code = "payload_too_large"


class UnsupportedMediaTypeError(DomainError):
    status_code = 415
    code = "unsupported_media_type"
