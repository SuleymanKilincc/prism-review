"""Run labelled pull requests through the real model and report how well it did.

Usage:
    python eval/run_eval.py eval/raw --labels eval/labels.json
    python eval/run_eval.py my_cases.json

A case file is a JSON list (or a folder of JSON files) of
    {"id", "title", "description", "diff", "url", "label": {"category": "...", "needs_human": true}}
Labels may also come from --labels: {"pr01": {"category": "...", "needs_human": false}, ...}
Cases WITHOUT a label are never run. If the model fails (for example Ollama is down),
the case counts as failed; the script does not crash.
"""
import argparse
import hashlib
import json
import statistics
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import ollama  # noqa: E402

from backend.fake_model import ModelUnavailable  # noqa: E402
from backend.model_client import MAX_DIFF_CHARS, MODEL, SYSTEM_PROMPT, ollama_review  # noqa: E402
from backend.schema import AnalyzeRequest, AnalyzeResponse  # noqa: E402

CATEGORIES = set(AnalyzeResponse.model_json_schema()["properties"]["category"]["enum"])
RESULTS_DIR = Path(__file__).parent / "results"


class CountingClient:
    """Wraps an Ollama client and counts chat calls. More than one call for a case
    means the first answer was not valid JSON for our schema (the client retried)."""

    def __init__(self, inner):
        self.inner = inner
        self.calls = 0

    def chat(self, **kwargs):
        self.calls += 1
        return self.inner.chat(**kwargs)


def load_cases(path: Path, labels_path=None):
    if path.is_dir():
        cases = [json.loads(f.read_text(encoding="utf-8")) for f in sorted(path.glob("*.json"))]
    else:
        cases = json.loads(path.read_text(encoding="utf-8"))
    if labels_path:
        labels = json.loads(Path(labels_path).read_text(encoding="utf-8"))
        for c in cases:
            if c["id"] in labels:
                c["label"] = labels[c["id"]]
    return cases


def check_label(case):
    label = case["label"]
    if label.get("category") not in CATEGORIES or not isinstance(label.get("needs_human"), bool):
        raise SystemExit(
            f"Bad label for {case['id']}: {label} (category must be one of {sorted(CATEGORIES)}, "
            "needs_human must be true or false)"
        )


def run_case(case, inner_client):
    client = CountingClient(inner_client)
    req = AnalyzeRequest(title=case["title"], description=case["description"], diff=case["diff"])
    start = time.perf_counter()
    try:
        got = ollama_review(req, client=client).model_dump()
        status = "ok"
    except ModelUnavailable as e:  # the API would answer 503 here
        got, status = {"error": str(e)}, "failed"
    return {
        "id": case["id"],
        "url": case.get("url", ""),
        "status": status,
        "got": got,
        "expected": case["label"],
        "seconds": round(time.perf_counter() - start, 2),
        "first_try_valid": client.calls == 1 and status == "ok",
    }


def summarize(results):
    n = len(results)
    ok = [r for r in results if r["status"] == "ok"]
    cat_right = [r for r in ok if r["got"]["category"] == r["expected"]["category"]]
    nh_right = [r for r in ok if r["got"]["needs_human"] == r["expected"]["needs_human"]]
    secs = [r["seconds"] for r in ok]
    wrong = []
    for r in results:
        if r["status"] != "ok":
            wrong.append({"id": r["id"], "url": r["url"], "problem": "model failed", "detail": r["got"].get("error", "")})
            continue
        if r["got"]["category"] != r["expected"]["category"]:
            wrong.append({"id": r["id"], "url": r["url"], "problem": "category",
                          "expected": r["expected"]["category"], "got": r["got"]["category"]})
        if r["got"]["needs_human"] != r["expected"]["needs_human"]:
            wrong.append({"id": r["id"], "url": r["url"], "problem": "needs_human",
                          "expected": r["expected"]["needs_human"], "got": r["got"]["needs_human"]})
    return {
        "cases": n,
        "failed": n - len(ok),
        "category_accuracy": f"{len(cat_right)}/{n}",
        "needs_human_agreement": f"{len(nh_right)}/{n}",
        "first_try_valid_json": f"{sum(r['first_try_valid'] for r in results)}/{n}",
        "seconds_mean": round(statistics.mean(secs), 2) if secs else None,
        "seconds_median": round(statistics.median(secs), 2) if secs else None,
        "seconds_max": max(secs) if secs else None,
        "wrong_cases": wrong,
    }


def git_commit():
    r = subprocess.run(["git", "rev-parse", "--short", "HEAD"], capture_output=True, text=True, cwd=ROOT)
    return r.stdout.strip()


def main(argv=None, client=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cases", help="a JSON file or a folder of JSON files")
    ap.add_argument("--labels", help="JSON file {id: {category, needs_human}}")
    ap.add_argument("--out", default=str(RESULTS_DIR))
    args = ap.parse_args(argv)

    cases = load_cases(Path(args.cases), args.labels)
    labelled = [c for c in cases if c.get("label")]
    skipped = [c["id"] for c in cases if not c.get("label")]
    for c in labelled:
        check_label(c)
    print(f"{len(labelled)} labelled cases, {len(skipped)} unlabelled skipped.")
    if not labelled:
        return 1

    client = client or ollama.Client(timeout=180)
    # The first real call loads the model and builds the answer grammar: slow. Do it once
    # with a throw-away case so it does not count in the timings.
    print("warming up (not timed)...")
    run_case({"id": "warmup", "title": "Fix typo", "description": "", "diff": "-teh\n+the",
              "label": {"category": "typo", "needs_human": False}}, client)

    results = []
    for i, c in enumerate(labelled, 1):
        r = run_case(c, client)
        results.append(r)
        print(f"[{i}/{len(labelled)}] {r['id']}: {r['status']} {r['seconds']}s")

    report = {
        "when": datetime.now().isoformat(timespec="seconds"),
        "model": MODEL,
        "git_commit": git_commit(),
        "prompt_sha256": hashlib.sha256(SYSTEM_PROMPT.encode()).hexdigest()[:12],
        "max_diff_chars": MAX_DIFF_CHARS,
        "cases_file": str(args.cases),
        "unlabelled_skipped": skipped,
        "summary": summarize(results),
        "results": results,
    }
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / f"{datetime.now():%Y%m%d-%H%M%S}.json"
    out_file.write_text(json.dumps(report, indent=1, ensure_ascii=False), encoding="utf-8")

    s = report["summary"]
    print(f"\nCategory accuracy:      {s['category_accuracy']}")
    print(f"needs_human agreement:  {s['needs_human_agreement']}")
    print(f"Valid JSON first try:   {s['first_try_valid_json']}")
    print(f"Seconds per case:       mean {s['seconds_mean']}, median {s['seconds_median']}, max {s['seconds_max']}")
    print(f"Failed (model error):   {s['failed']}")
    for w in s["wrong_cases"]:
        print("  wrong:", w)
    print("Saved:", out_file)
    return 0


if __name__ == "__main__":
    sys.exit(main())
