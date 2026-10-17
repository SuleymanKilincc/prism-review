from .schema import AnalyzeRequest, AnalyzeResponse


class ModelUnavailable(Exception):
    """Raised when the model cannot answer (the API turns it into a 503)."""


def fake_review(req: AnalyzeRequest) -> AnalyzeResponse:
    """A pretend model. It looks for a few words and returns a fixed answer.
    Used for the UI, for tests and for CI, so nothing real is ever called."""
    text = f"{req.title} {req.description} {req.diff}".lower()

    if "hacktoberfest" in text:
        return AnalyzeResponse(
            category="spam",
            quality=1,
            risk="low",
            summary="Looks like a low-effort change made only to collect a Hacktoberfest contribution.",
            reasons=["Mentions Hacktoberfest", "No real improvement to the project"],
            missing=["a real reason for the change"],
            needs_human=False,
            suggested_reply="Thanks for your interest! We can't accept this change, as it doesn't improve the project.",
        )

    if "typo" in text:
        return AnalyzeResponse(
            category="typo",
            quality=5,
            risk="low",
            summary="Fixes a spelling mistake.",
            reasons=["Tiny, clear change", "No code touched"],
            missing=[],
            needs_human=False,
            suggested_reply="Thanks for the fix! Merging.",
        )

    return AnalyzeResponse(
        category="other",
        quality=3,
        risk="medium",
        summary="General change. This is a fake answer, a real review needs the model.",
        reasons=["Fake model: no real analysis was done"],
        missing=["a real review"],
        needs_human=True,
        suggested_reply="Thanks for the pull request! A maintainer will take a look soon.",
    )
