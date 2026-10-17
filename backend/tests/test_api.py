import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from backend import main
from backend.fake_model import ModelUnavailable
from backend.schema import AnalyzeResponse

client = TestClient(main.app)

PR = {"title": "Fix typo in README", "description": "recieve -> receive", "diff": "-recieve\n+receive"}

GOOD_ANSWER = {
    "category": "typo",
    "quality": 5,
    "risk": "low",
    "summary": "Fixes a spelling mistake.",
    "reasons": ["Tiny change"],
    "missing": [],
    "needs_human": False,
    "suggested_reply": "Thanks!",
}


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_analyze_returns_valid_answer():
    r = client.post("/analyze", json=PR)
    assert r.status_code == 200
    AnalyzeResponse(**r.json())  # fits the schema
    assert r.json()["category"] == "typo"


def test_hacktoberfest_is_spam():
    pr = {**PR, "title": "Hacktoberfest PR", "description": ""}
    assert client.post("/analyze", json=pr).json()["category"] == "spam"


def test_missing_field_gives_422():
    assert client.post("/analyze", json={"title": "only a title"}).status_code == 422


def test_invalid_category_is_rejected():
    with pytest.raises(ValidationError):
        AnalyzeResponse(**{**GOOD_ANSWER, "category": "poem"})


def test_quality_out_of_range_is_rejected():
    with pytest.raises(ValidationError):
        AnalyzeResponse(**{**GOOD_ANSWER, "quality": 6})


def test_model_down_gives_503(monkeypatch):
    def broken(req):
        raise ModelUnavailable()

    monkeypatch.setattr(main, "run_model", broken)
    r = client.post("/analyze", json=PR)
    assert r.status_code == 503
    assert r.json() == {"detail": "Model is not available"}
