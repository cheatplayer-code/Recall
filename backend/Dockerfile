# Recall backend (API + worker share one image).
FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps kept minimal; ML extras are installed only in images that need them.
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
# Install the base package + pgvector + redis extras (no GPU ML libs by default).
RUN pip install --upgrade pip && pip install ".[pgvector,redis]" || true

COPY . .
RUN pip install -e ".[pgvector,redis]"

EXPOSE 8000

# Default command runs the API; the worker service overrides this in compose.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
