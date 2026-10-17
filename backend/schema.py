from typing import List, Literal

from pydantic import BaseModel, Field, StringConstraints
from typing_extensions import Annotated

# One short line per list item. docs/api.md says "short" but gives no number,
# so this limit is our own choice.
ShortText = Annotated[str, StringConstraints(max_length=160)]


class AnalyzeRequest(BaseModel):
    title: str
    description: str  # may be empty, but the field itself is required
    diff: str


class AnalyzeResponse(BaseModel):
    category: Literal["bugfix", "feature", "docs", "typo", "refactor", "spam", "other"]
    quality: int = Field(ge=1, le=5)
    risk: Literal["low", "medium", "high"]
    summary: str = Field(max_length=240)
    reasons: List[ShortText] = Field(max_length=4)
    missing: List[ShortText] = Field(max_length=4)
    needs_human: bool
    suggested_reply: str = Field(max_length=400)
