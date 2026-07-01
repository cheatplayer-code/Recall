"""FastAPI application factory."""

from __future__ import annotations

import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.errors import register_exception_handlers
from app.api.health import router as health_router
from app.api.middleware import RequestContextMiddleware
from app.api.v1.router import api_router
from app.core.config.settings import get_settings
from app.core.logging import configure_logging
from app.events.bridge import get_event_bridge

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    bridge = get_event_bridge()
    await bridge.start()

    worker_task = None
    if settings.run_worker_in_process:
        import asyncio  # noqa: PLC0415

        from app.workers.worker import ProcessingWorker  # noqa: PLC0415

        worker = ProcessingWorker(settings=settings)
        worker_task = asyncio.create_task(worker.run_forever())
        app.state.worker = worker

    logger.info("app.started", environment=settings.environment)
    try:
        yield
    finally:
        await bridge.stop()
        if worker_task is not None:
            app.state.worker.stop()
            worker_task.cancel()


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging()

    app = FastAPI(title="Recall API", version="0.1.0", lifespan=lifespan)

    # CORS: explicit origins in prod; permissive localhost in dev.
    if settings.environment == "development":
        app.add_middleware(
            CORSMiddleware,
            allow_origin_regex=r"http://localhost(:\d+)?",
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    else:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    app.add_middleware(RequestContextMiddleware)

    register_exception_handlers(app)

    app.include_router(health_router)
    app.include_router(health_router, prefix="/api/v1")
    app.include_router(api_router, prefix="/api/v1")

    # Serve uploaded files over HTTP.
    os.makedirs(settings.storage_dir, exist_ok=True)
    app.mount("/storage", StaticFiles(directory=settings.storage_dir), name="storage")

    return app


app = create_app()
