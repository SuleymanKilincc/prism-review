import json
from types import SimpleNamespace

import pytest

from eval.run_eval import main

GOOD_TYPO = (
    '{"category":"typo","quality":5,"risk":"low","summary":"Fixes a typo.","reasons":["Tiny"],'
    '"missing":[],"needs_human":false,"suggested_reply":"Thanks!"}'
)


class StubClient:
    """Answers every question with the replies given, in order; the last one repeats."""

    def __init__(self, *replies):
        self.replies = list(replies)
        self.calls = 0

    def chat(self, **kwargs):
        self.calls += 1
        r = self.replies.pop(0) if len(self.replies) > 1 else self.replies[0]
        if isinstance(r, Exception):
            raise r
        return SimpleNamespace(message=SimpleNamespace(content=r))


def make_cases(tmp_path, labels):
    cases = [
        {"id": cid, "title": "Fix typo", "description": "", "diff": "-teh\n+the", "url": f"https://x/{cid}",
         **({"label": lab} if lab else {})}
        for cid, lab in labels.items()
    ]
    f = tmp_path / "cases.json"
    f.write_text(json.dumps(cases), encoding="utf-8")
    return str(f)


def report_of(tmp_path):
    files = list((tmp_path / "out").glob("*.json"))
    assert len(files) == 1
    return json.loads(files[0].read_text(encoding="utf-8"))


def run(tmp_path, labels, client):
    out = tmp_path / "out"
    code = main([make_cases(tmp_path, labels), "--out", str(out)], client=client)
    return code


def test_unlabelled_cases_are_not_run(tmp_path):
    client = StubClient(GOOD_TYPO)
    run(tmp_path, {"a": {"category": "typo", "needs_human": False}, "b": None}, client)
    rep = report_of(tmp_path)
    assert rep["unlabelled_skipped"] == ["b"]
    assert [r["id"] for r in rep["results"]] == ["a"]
    assert client.calls == 2  # 1 warm-up + 1 labelled case; nothing for "b"


def test_metrics_and_wrong_list(tmp_path):
    labels = {"a": {"category": "typo", "needs_human": False}, "b": {"category": "docs", "needs_human": True}}
    run(tmp_path, labels, StubClient(GOOD_TYPO))
    s = report_of(tmp_path)["summary"]
    assert s["category_accuracy"] == "1/2"
    assert s["needs_human_agreement"] == "1/2"
    assert s["first_try_valid_json"] == "2/2"
    assert {w["problem"] for w in s["wrong_cases"]} == {"category", "needs_human"}
    assert all(w["id"] == "b" for w in s["wrong_cases"])


def test_model_down_counts_as_failed_not_crash(tmp_path):
    code = run(tmp_path, {"a": {"category": "typo", "needs_human": False}}, StubClient(ConnectionError("down")))
    assert code == 0
    s = report_of(tmp_path)["summary"]
    assert s["failed"] == 1
    assert s["category_accuracy"] == "0/1"
    assert s["wrong_cases"][0]["problem"] == "model failed"


def test_retry_means_not_valid_first_try(tmp_path):
    # warm-up gets a good answer, then the case gets garbage first and a good answer on the retry
    client = StubClient(GOOD_TYPO, "not json", GOOD_TYPO)
    run(tmp_path, {"a": {"category": "typo", "needs_human": False}}, client)
    r = report_of(tmp_path)["results"][0]
    assert r["status"] == "ok"
    assert r["first_try_valid"] is False


def test_bad_label_is_rejected(tmp_path):
    with pytest.raises(SystemExit):
        run(tmp_path, {"a": {"category": "poem", "needs_human": False}}, StubClient(GOOD_TYPO))
