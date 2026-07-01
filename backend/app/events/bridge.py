"""Redis→in-process bridge that fans job events out to SSE subscribers."""

from __future__ import annotations

import asyncio
import contextlib
import json
from collections.abc import AsyncIterator
from functools import lru_cache

import structlog

from app.events.types import CHANNEL

logger = structlog.get_logger(__name__)


class EventBridge:
    """Subscribes to the Redis channel and rebroadcasts to local asyncio queues.

    Each SSE connection registers a queue via ``subscribe``; the background
    reader pushes every event to all queues. Redis is optional — if unavailable
    the bridge simply never delivers cross-process events (single-process dev
    still works because the worker can be co-located).
    """

    def __init__(self) -> None:
        self._subscribers: set[asyncio.Queue[dict]] = set()
        self._task: asyncio.Task[None] | None = None

    async def start(self) -> None:
        if self._task is not None:
            return
        self._task = asyncio.create_task(self._run())

    async def stop(self) -> None:
        if self._task is not None:
            self._task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await self._task
            self._task = None

    async def _run(self) -> None:
        try:
            import redis.asyncio as aioredis  # noqa: PLC0415

            from app.core.config.settings import get_settings  # noqa: PLC0415

            redis = aioredis.from_url(get_settings().redis_url)
            pubsub = redis.pubsub()
            await pubsub.subscribe(CHANNEL)
        except Exception:  # pragma: no cover - redis not available
            logger.info("events.bridge_disabled")
            return

        logger.info("events.bridge_started")
        async for message in pubsub.listen():
            if message.get("type") != "message":
                continue
            try:
                payload = json.loads(message["data"])
            except (ValueError, KeyError):
                continue
            for queue in list(self._subscribers):
                queue.put_nowait(payload)

    @contextlib.asynccontextmanager
    async def subscribe(self) -> AsyncIterator[asyncio.Queue[dict]]:
        queue: asyncio.Queue[dict] = asyncio.Queue()
        self._subscribers.add(queue)
        try:
            yield queue
        finally:
            self._subscribers.discard(queue)


@lru_cache
def get_event_bridge() -> EventBridge:
    return EventBridge()
