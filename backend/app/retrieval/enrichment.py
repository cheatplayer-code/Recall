"""Enrichment seam — the single place extracted content becomes an AI facet.

Contract (kept stable for the rest of the system):

    enrich(EnrichmentInput) -> AIEnrichment | None   # None when there's nothing
                                                     # meaningful to enrich

The facet (``title``, ``summary``, ``mood``, ``topics``, ``key_moments``,
``action_items``) is exactly what the frontend ``AIEnrichment`` type renders on
memory cards and the detail view. It is persisted verbatim on
``KnowledgeItem.ai`` and serialized (camelCase) by ``AIEnrichmentSchema``.

Two implementations, mirroring the embedder/reranker seams:

* ``HeuristicEnricher`` — dependency-free, deterministic NLP over the extracted
  text (sentiment lexicon, keyword frequency, cue-phrase extraction). Stable
  across runs, no GPU/network. This is the default and the CI/test backend; it
  must keep working when selected via config.
* ``NullEnricher`` — produces nothing (``enrich`` returns ``None``); selected
  with ``enrichment_backend="none"`` to disable enrichment entirely.

A heavier backend (e.g. an LLM that fills the same ``AIEnrichment`` shape) can be
added here and selected via ``settings.enrichment_backend`` without touching any
caller. ``get_enricher()`` selects the implementation from settings and caches
it per backend.
"""

from __future__ import annotations

import re
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Literal

import structlog

from app.core.config.settings import Settings

logger = structlog.get_logger(__name__)

# The four moods the frontend understands (``Mood`` in src/types/knowledge.ts).
# The enricher never emits anything else; ``moodGlow`` falls back to neutral for
# unknown values, but we keep the contract tight on the write side.
Mood = Literal["positive", "neutral", "negative", "mixed"]


@dataclass(slots=True)
class EnrichmentInput:
    """Everything an enricher needs, derived from the extracted item."""

    content: str
    title: str = ""
    item_type: str = "note"


@dataclass(slots=True)
class AIEnrichment:
    """The per-memory AI facet. Fields map 1:1 to the frontend type."""

    title: str | None = None
    summary: str | None = None
    mood: Mood | None = None
    topics: list[str] = field(default_factory=list)
    key_moments: list[str] = field(default_factory=list)
    action_items: list[str] = field(default_factory=list)

    def as_facet(self) -> dict[str, object]:
        """Compact JSON for the ``ai`` column — omit empty fields entirely.

        Keys are snake_case (the schema field names). ``AIEnrichmentSchema``
        (a ``CamelModel`` with ``populate_by_name``) validates them and emits
        camelCase on the wire.
        """
        facet: dict[str, object] = {}
        if self.title:
            facet["title"] = self.title
        if self.summary:
            facet["summary"] = self.summary
        if self.mood:
            facet["mood"] = self.mood
        if self.topics:
            facet["topics"] = self.topics
        if self.key_moments:
            facet["key_moments"] = self.key_moments
        if self.action_items:
            facet["action_items"] = self.action_items
        return facet

    def is_empty(self) -> bool:
        return not self.as_facet()


class EnrichmentProvider(ABC):
    """Interface every enrichment backend must satisfy."""

    @abstractmethod
    def enrich(self, req: EnrichmentInput) -> AIEnrichment | None:
        """Derive the AI facet, or ``None`` when there's nothing to enrich."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Short identifier for logging/metrics."""


class NullEnricher(EnrichmentProvider):
    """Disables enrichment — always returns ``None``."""

    def enrich(self, req: EnrichmentInput) -> AIEnrichment | None:
        return None

    @property
    def name(self) -> str:
        return "none"


# --------------------------------------------------------------------------- #
# Heuristic backend
# --------------------------------------------------------------------------- #

# Compact sentiment lexicons — enough to give cards an emotional tint without a
# model. Matched as whole, lowercased word stems.
_POSITIVE_WORDS = frozenset(
    """
    love loved lovely great greatest good better best amazing awesome excellent
    wonderful fantastic happy happier delighted excited exciting grateful thankful
    thanks proud success successful win won winning achieve achieved achievement
    progress improve improved improvement beautiful brilliant enjoy enjoyed
    enjoyable glad hope hopeful inspiring inspired celebrate celebration positive
    perfect pleased optimistic breakthrough milestone reward rewarding gain
    """.split()
)
_NEGATIVE_WORDS = frozenset(
    """
    hate hated bad worse worst terrible awful horrible sad sadder unhappy angry
    upset frustrated frustrating fail failed failure failing lost losing broken
    bug bugs error errors issue issues problem problems worried worry anxious
    afraid fear stress stressed stressful pain painful difficult hard struggle
    struggling disappointed disappointing regret sorry hurt tired exhausted
    overwhelmed negative crisis blocker blocked delay delayed
    """.split()
)

# Words that never make good topics.
_STOPWORDS = frozenset(
    """
    the a an and or but if then else for to of in on at by with from into over
    under about as is are was were be been being do does did doing have has had
    having will would shall should can could may might must not no nor so than
    that this these those it its it's they them their there here what which who
    whom whose when where why how all any both each few more most other some such
    only own same too very just also may i me my we us our you your he she his
    her him them they’re i’m don’t can’t won’t it’s that’s there’s get got go
    going one two three new like get make made really thing things way ways lot
    lots much many said says say per via etc using used use also however
    well back even still ever around across quite rather along among able upon
    onto want wants need needs know knew let lets said done being
    """.split()
)

# Cue phrases that mark an action item / follow-up.
_ACTION_CUES = (
    "need to",
    "needs to",
    "have to",
    "has to",
    "should",
    "must",
    "todo",
    "to-do",
    "to do",
    "action item",
    "follow up",
    "follow-up",
    "let's",
    "let us",
    "remember to",
    "make sure",
    "don't forget",
    "do not forget",
    "next step",
    "next steps",
    "we will",
    "i will",
    "i'll",
    "we'll",
)

# Common imperative openers — a line starting with one of these reads as a task.
_IMPERATIVE_VERBS = frozenset(
    """
    call email send review finish complete schedule book buy fix update write
    prepare submit check ask contact remember plan create add remove read watch
    build test deploy draft share confirm reply respond order pay renew cancel
    sign upload download install configure investigate research fix refactor
    document verify validate follow reach ping message notify remind
    """.split()
)

_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")
_WORD = re.compile(r"[a-z0-9][a-z0-9'\-]*")


class HeuristicEnricher(EnrichmentProvider):
    """Deterministic, dependency-free enrichment over the extracted text.

    Every facet is derived with simple, stable NLP so the same content always
    yields the same facet — enough to make the grid read as an emotional,
    topical map and to power summaries/action items without any ML runtime.
    """

    def __init__(self, settings: Settings) -> None:
        self._max_chars = max(1, settings.enrichment_max_chars)
        self._max_topics = max(0, settings.enrichment_max_topics)
        self._max_key_moments = max(0, settings.enrichment_max_key_moments)
        self._max_action_items = max(0, settings.enrichment_max_action_items)
        self._summary_max_chars = max(1, settings.enrichment_summary_max_chars)

    @property
    def name(self) -> str:
        return "heuristic"

    def enrich(self, req: EnrichmentInput) -> AIEnrichment | None:
        text = _normalize_ws((req.content or "")[: self._max_chars])
        if not text:
            return None

        sentences = _sentences(text)
        tokens = [m.group(0) for m in _WORD.finditer(text.lower())]

        topics = self._topics(tokens)
        summary = self._summary(sentences, text)
        facet = AIEnrichment(
            title=self._title(sentences, req.title),
            summary=summary,
            mood=self._mood(tokens),
            topics=topics,
            key_moments=self._key_moments(sentences, summary, set(topics)),
            action_items=self._action_items(text, sentences),
        )
        if facet.is_empty():
            return None
        logger.debug(
            "enrichment.heuristic",
            item_type=req.item_type,
            mood=facet.mood,
            topics=len(facet.topics),
            key_moments=len(facet.key_moments),
            action_items=len(facet.action_items),
        )
        return facet

    # -- individual facets ------------------------------------------------
    def _summary(self, sentences: list[str], text: str) -> str | None:
        """The opening one or two sentences, capped to a readable length."""
        if not sentences:
            return _truncate(text, self._summary_max_chars)
        summary = sentences[0]
        # Add a second sentence if the first is short and one more fits.
        if len(summary) < self._summary_max_chars * 0.6 and len(sentences) > 1:
            candidate = f"{summary} {sentences[1]}"
            if len(candidate) <= self._summary_max_chars:
                summary = candidate
        return _truncate(summary, self._summary_max_chars)

    def _title(self, sentences: list[str], existing: str) -> str | None:
        """A short headline. Skip it when the item already has a real title."""
        if not sentences:
            return None
        headline = _truncate(sentences[0], 72, ellipsis=False).rstrip(".!?,;: ")
        if not headline:
            return None
        # Don't echo a title the user/upload already gave us.
        if existing and _normalize_ws(existing).lower() == headline.lower():
            return None
        return headline

    def _mood(self, tokens: list[str]) -> Mood:
        pos = sum(1 for t in tokens if t in _POSITIVE_WORDS)
        neg = sum(1 for t in tokens if t in _NEGATIVE_WORDS)
        if pos == 0 and neg == 0:
            return "neutral"
        if pos >= 2 and neg >= 2:
            return "mixed"
        if pos > neg:
            return "positive"
        if neg > pos:
            return "negative"
        return "mixed"

    def _topics(self, tokens: list[str]) -> list[str]:
        if self._max_topics == 0:
            return []
        counts: dict[str, int] = {}
        order: dict[str, int] = {}
        for index, token in enumerate(tokens):
            if len(token) < 4 or token in _STOPWORDS or token.isdigit():
                continue
            counts[token] = counts.get(token, 0) + 1
            order.setdefault(token, index)
        if not counts:
            return []
        # Most frequent first; ties broken by first appearance (stable, readable).
        ranked = sorted(counts, key=lambda w: (-counts[w], order[w]))
        return [_titlecase(w) for w in ranked[: self._max_topics]]

    def _key_moments(
        self, sentences: list[str], summary: str | None, topic_set: set[str]
    ) -> list[str]:
        """Salient lines — the sentences that carry the memory's substance."""
        if self._max_key_moments == 0 or len(sentences) < 2:
            return []
        topic_words = {t.lower() for t in topic_set}
        scored: list[tuple[float, int, str]] = []
        for index, sentence in enumerate(sentences):
            words = [m.group(0) for m in _WORD.finditer(sentence.lower())]
            if len(words) < 4:
                continue
            density = sum(1 for w in words if w in topic_words)
            signal = 1.0 if sentence.endswith(("!", "?")) else 0.0
            has_number = 0.5 if any(c.isdigit() for c in sentence) else 0.0
            score = density + signal + has_number
            scored.append((score, index, sentence))
        scored.sort(key=lambda item: (-item[0], item[1]))

        summary_norm = _normalize_ws(summary or "").lower()
        moments: list[str] = []
        for score, _index, sentence in scored:
            if score <= 0:
                break
            clean = _truncate(sentence, 140)
            if clean.lower() in summary_norm or clean.lower() == summary_norm:
                continue
            if clean not in moments:
                moments.append(clean)
            if len(moments) >= self._max_key_moments:
                break
        return moments

    def _action_items(self, text: str, sentences: list[str]) -> list[str]:
        if self._max_action_items == 0:
            return []
        # Consider both sentences and raw lines (bulleted todo lists rarely end
        # in a period, so line-splitting catches what sentence-splitting misses).
        candidates: list[str] = []
        seen: set[str] = set()
        for raw in [*sentences, *text.splitlines()]:
            candidate = _clean_action(raw)
            if not candidate or candidate.lower() in seen:
                continue
            if _looks_like_action(candidate):
                seen.add(candidate.lower())
                candidates.append(_truncate(candidate, 140))
            if len(candidates) >= self._max_action_items:
                break
        return candidates


# --------------------------------------------------------------------------- #
# Text helpers
# --------------------------------------------------------------------------- #
def _normalize_ws(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _sentences(text: str) -> list[str]:
    parts = [_normalize_ws(s) for s in _SENTENCE_SPLIT.split(text)]
    return [s for s in parts if s]


def _truncate(text: str, limit: int, *, ellipsis: bool = True) -> str:
    text = _normalize_ws(text)
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0].rstrip(",.;:!? ")
    cut = cut or text[:limit]
    return f"{cut}…" if ellipsis else cut


def _titlecase(word: str) -> str:
    return word[:1].upper() + word[1:] if word else word


def _clean_action(raw: str) -> str:
    # Strip common list bullet/checkbox markers.
    return re.sub(r"^\s*(?:[-*•]|\[\s?\]|\d+[.)])\s*", "", raw).strip()


def _looks_like_action(sentence: str) -> bool:
    lower = sentence.lower()
    if any(cue in lower for cue in _ACTION_CUES):
        return True
    first = _WORD.match(lower)
    return bool(first and first.group(0) in _IMPERATIVE_VERBS)


# --------------------------------------------------------------------------- #
# Selection
# --------------------------------------------------------------------------- #
_enrichers: dict[str, EnrichmentProvider] = {}


def _build_enricher(settings: Settings) -> EnrichmentProvider:
    backend = settings.enrichment_backend
    if backend == "heuristic":
        return HeuristicEnricher(settings)
    if backend == "none":
        return NullEnricher()
    raise ValueError(f"Unknown enrichment_backend: {backend!r}")


def get_enricher(settings: Settings) -> EnrichmentProvider:
    """Return the enrichment provider selected by settings (cached per backend)."""
    key = settings.enrichment_backend
    cached = _enrichers.get(key)
    if cached is not None:
        return cached
    provider = _build_enricher(settings)
    _enrichers[key] = provider
    return provider
