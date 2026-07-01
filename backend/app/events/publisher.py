"""Event publisher. Publishes to Redis when available; degrades to a no-op log."""

from __future__ import annotations

import json
from functools import lru_cache

import structlog

from app.events.types import CHANNEL, JobEvent

logger = structlog.get_logger(__name__)


class EventPublisher:
    """Publishes JobEvents to a Redis channel.

    Redis is optional: if the client/library is unavailable the publisher logs
    and returns, so the worker pipeline never fails because of the event bus.
    """

    def __init__(self) -> None:
        self._redis: object | None = None
        self._unavailable = False

    async def _get_redis(self) -> object | None:
        if self._redis is not None or self._unavailable:
            return self._redis
        try:
            import redis.asyncio as aioredis  # noqa: PLC0415

            from app.core.config.settings import get_settings  # noqa: PLC0415

            self._redis = aioredis.from_url(get_settings().redis_url)
        except Exception:  # pragma: no cover - redis not configured/installed
            self._unavailable = True
            logger.info("events.redis_unavailable")
        return self._redis

    async def publish(self, event: JobEvent) -> None:
        redis = await self._get_redis()
        if redis is None:
            logger.debug("events.publish_noop", type=event.type.value, job_id=event.job_id)
            return
        try:
            await redis.publish(CHANNEL, json.dumps(event.to_dict()))  # type: ignore[attr-defined]
        except Exception:  # pragma: no cover - transient redis failure
            logger.warning("events.publish_failed", type=event.type.value, exc_info=True)


@lru_cache
def get_event_publisher() -> EventPublisher:
    return EventPublisher()
