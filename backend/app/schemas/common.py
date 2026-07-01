"""Shared schema base (CamelModel) + generic pagination wrapper."""

from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict


def to_camel(value: str) -> str:
    head, *tail = value.split("_")
    return head + "".join(word.capitalize() for word in tail)


class CamelModel(BaseModel):
    """Base for every wire DTO: snake_case in Python, camelCase on the wire."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


ItemT = TypeVar("ItemT")


class Page(CamelModel, Generic[ItemT]):
    items: list[ItemT]
    total: int
    page: int
    page_size: int
