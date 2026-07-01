"""Standalone worker entrypoint: ``python -m app.workers.run``."""

from __future__ import annotations

import asyncio

import structlog

from app.core.logging import configure_logging
from app.workers.worker import ProcessingWorker

logger = structlog.get_logger(__name__)


async def _main() -> None:
    configure_logging()
    worker = ProcessingWorker()
    await worker.run_forever()


def main() -> None:
    try:
        asyncio.run(_main())
    except KeyboardInterrupt:  # pragma: no cover
        logger.info("worker.interrupted")


if __name__ == "__main__":
    main()
