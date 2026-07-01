"""HeuristicEnricher behaviour + the AI-facet contract (deterministic backend)."""

from __future__ import annotations

from app.core.config.settings import get_settings
from app.retrieval.embedder import get_embedder
from app.retrieval.enrichment import (
    AIEnrichment,
    EnrichmentInput,
    HeuristicEnricher,
    NullEnricher,
    get_enricher,
)
from app.retrieval.vector_store import get_vector_store
from app.schemas.knowledge import AIEnrichmentSchema, KnowledgeItemSchema
from app.workers.processor import DocumentProcessor, ProcessingContext
from tests.factories import make_item, make_processing_job, make_user, make_workspace


def _enricher() -> HeuristicEnricher:
    return HeuristicEnricher(get_settings())


def test_empty_content_yields_no_facet() -> None:
    assert _enricher().enrich(EnrichmentInput(content="   \n\t ")) is None


def test_summary_leads_with_opening_sentences() -> None:
    facet = _enricher().enrich(
        EnrichmentInput(content="First sentence here. Second one. Third thought.")
    )
    assert facet is not None
    assert facet.summary is not None
    assert facet.summary.startswith("First sentence here")


def test_mood_positive() -> None:
    facet = _enricher().enrich(
        EnrichmentInput(content="I love this. It's amazing and wonderful. Great success!")
    )
    assert facet is not None and facet.mood == "positive"


def test_mood_negative() -> None:
    facet = _enricher().enrich(
        EnrichmentInput(content="This is terrible. I hate the bug and the error. Awful failure.")
    )
    assert facet is not None and facet.mood == "negative"


def test_mood_mixed() -> None:
    facet = _enricher().enrich(
        EnrichmentInput(content="I love this amazing project but I hate the terrible awful bugs.")
    )
    assert facet is not None and facet.mood == "mixed"


def test_mood_neutral() -> None:
    facet = _enricher().enrich(
        EnrichmentInput(content="The meeting is scheduled for Monday at noon in room four.")
    )
    assert facet is not None and facet.mood == "neutral"


def test_topics_rank_by_frequency() -> None:
    facet = _enricher().enrich(
        EnrichmentInput(
            content=(
                "Kubernetes clusters scale well. Kubernetes deployments manage "
                "Kubernetes pods across nodes."
            )
        )
    )
    assert facet is not None
    assert "Kubernetes" in facet.topics
    # Stopwords / short tokens never become topics.
    assert all(len(t) >= 4 for t in facet.topics)
    assert "Well" not in facet.topics


def test_action_items_from_cues_and_imperatives() -> None:
    facet = _enricher().enrich(
        EnrichmentInput(
            content=(
                "Project notes.\n"
                "- Call the vendor tomorrow.\n"
                "- We need to update the roadmap.\n"
                "Send the invoice by Friday."
            )
        )
    )
    assert facet is not None
    items = " ".join(facet.action_items).lower()
    assert "call the vendor" in items
    assert "update the roadmap" in items
    assert len(facet.action_items) >= 2


def test_null_enricher_returns_none() -> None:
    assert NullEnricher().enrich(EnrichmentInput(content="anything at all here")) is None


def test_get_enricher_selects_by_backend() -> None:
    heuristic = get_enricher(get_settings())
    assert heuristic.name == "heuristic"
    disabled = get_enricher(get_settings().model_copy(update={"enrichment_backend": "none"}))
    assert isinstance(disabled, NullEnricher)


def test_as_facet_omits_empty_fields() -> None:
    facet = AIEnrichment(summary="hello", mood="positive")
    assert facet.as_facet() == {"summary": "hello", "mood": "positive"}
    assert AIEnrichment().is_empty()


def test_schema_serializes_snake_case_to_camel() -> None:
    """The stored snake_case facet validates and emits the camelCase wire shape."""
    stored = {
        "summary": "s",
        "mood": "positive",
        "topics": ["Alpha"],
        "key_moments": ["a moment"],
        "action_items": ["do the thing"],
    }
    dumped = AIEnrichmentSchema.model_validate(stored).model_dump(by_alias=True)
    assert dumped["keyMoments"] == ["a moment"]
    assert dumped["actionItems"] == ["do the thing"]
    assert dumped["mood"] == "positive"


async def _make_ctx(session):  # noqa: ANN001
    user = await make_user(session)
    ws = await make_workspace(session, user)
    item = await make_item(
        session,
        user,
        ws,
        content="We shipped the release. It was a great success and everyone was happy.",
    )
    upload, job = await make_processing_job(session, item, user)
    await session.commit()
    return ProcessingContext(
        job=job,
        item=item,
        upload=upload,
        session=session,
        embedder=get_embedder(),
        vector_store=get_vector_store(),
        settings=get_settings(),
    )


async def test_extract_populates_ai_facet(db_session) -> None:
    proc = DocumentProcessor()
    ctx = await _make_ctx(db_session)

    updates = await proc.extract(ctx)

    assert isinstance(updates["ai"], dict)
    assert updates["ai"]["summary"]
    assert updates["ai"]["mood"] == "positive"

    # The persisted facet round-trips through the wire schema (camelCase).
    for key, value in updates.items():
        setattr(ctx.item, key, value)
    dumped = KnowledgeItemSchema.model_validate(ctx.item).model_dump(by_alias=True)
    assert dumped["ai"]["mood"] == "positive"
