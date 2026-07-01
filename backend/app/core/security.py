"""Password hashing + JWT encode/decode.

Implemented with the standard library (PBKDF2-HMAC-SHA256 for passwords, HS256
for JWTs) to avoid heavy crypto dependencies. The signing secret comes only from
settings — never hardcoded.
"""

from __future__ import annotations

import base64
import datetime
import hashlib
import hmac
import json
import secrets
from typing import Any, Literal

from app.core.config.settings import get_settings

_PBKDF2_ROUNDS = 200_000
_ALGO = "pbkdf2_sha256"


# --- passwords -----------------------------------------------------------
def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _PBKDF2_ROUNDS)
    return f"{_ALGO}${_PBKDF2_ROUNDS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, rounds_s, salt_hex, digest_hex = stored.split("$")
        if algo != _ALGO:
            return False
        rounds = int(rounds_s)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
    except (ValueError, AttributeError):
        return False
    candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, rounds)
    return hmac.compare_digest(candidate, expected)


# --- JWT (HS256) ---------------------------------------------------------
def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


TokenType = Literal["access", "refresh"]


def create_token(subject: str, token_type: TokenType) -> str:
    settings = get_settings()
    ttl = (
        settings.access_token_ttl_seconds
        if token_type == "access"
        else settings.refresh_token_ttl_seconds
    )
    now = datetime.datetime.now(datetime.UTC)
    payload = {
        "sub": subject,
        "type": token_type,
        "iat": int(now.timestamp()),
        "exp": int((now + datetime.timedelta(seconds=ttl)).timestamp()),
    }
    return _encode(payload, settings.secret_key)


def _encode(payload: dict[str, Any], secret: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    segments = [
        _b64url_encode(json.dumps(header, separators=(",", ":")).encode()),
        _b64url_encode(json.dumps(payload, separators=(",", ":")).encode()),
    ]
    signing_input = ".".join(segments).encode()
    signature = hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()
    segments.append(_b64url_encode(signature))
    return ".".join(segments)


def decode_token(token: str) -> dict[str, Any]:
    """Decode and verify a JWT. Raises ValueError on any failure."""
    settings = get_settings()
    try:
        header_b64, payload_b64, sig_b64 = token.split(".")
    except ValueError as exc:
        raise ValueError("Malformed token") from exc

    signing_input = f"{header_b64}.{payload_b64}".encode()
    expected = hmac.new(settings.secret_key.encode(), signing_input, hashlib.sha256).digest()
    if not hmac.compare_digest(expected, _b64url_decode(sig_b64)):
        raise ValueError("Invalid token signature")

    payload: dict[str, Any] = json.loads(_b64url_decode(payload_b64))
    exp = payload.get("exp")
    if exp is not None and datetime.datetime.now(datetime.UTC).timestamp() > exp:
        raise ValueError("Token expired")
    return payload
