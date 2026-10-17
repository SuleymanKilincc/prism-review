"""Download real public pull requests for the evaluation set. READ-ONLY: it only
uses `gh search` and `gh pr diff`. It writes eval/raw/NNN.json with title,
description, diff and url. It does NOT write labels (humans do that), and it does
not remember which search found which PR, so labellers are not influenced.

Usage:  python eval/fetch_raw.py
"""
import json
import random
import re
import subprocess
from pathlib import Path

RAW = Path(__file__).parent / "raw"
MAX_DIFF = 6000  # same limit the model client uses

# (how many we want, [searches]). The searches are only a way to find candidates.
BUCKETS = [
    (4, [["fix typo", "--merged"], ["typo in readme", "--merged"]]),
    (3, [["improve documentation", "--merged"], ["docs add usage example", "--merged"]]),
    (4, [["fix crash null", "--merged"], ["fix bug off by one", "--merged"], ["fix incorrect result", "--merged"]]),
    (3, [["add support for option", "--merged"], ["feat add new flag", "--merged"]]),
    (2, [["refactor extract function", "--merged"], ["refactor simplify", "--merged"]]),
    (4, [["hacktoberfest added my name", "--state", "closed"], ["add my name contributors hacktoberfest", "--state", "closed"]]),
    (2, [["update github actions workflow permissions", "--merged"], ["change authentication token validation", "--merged"],
         ["bump dependency version", "--merged"]]),
]

EMAIL = re.compile(r"[\w.+-]+@[\w-]+(\.[\w-]+)+")
MENTION = re.compile(r"(?<![\w/])@([A-Za-z0-9][A-Za-z0-9-]{0,38})\b")
# "- [Real Name](https://github.com/username)" lines (contributor lists) and bare profile links
PROFILE_LINK = re.compile(r"\[([^\]\n]+)\]\(https?://(?:www\.)?github\.com/([A-Za-z0-9-]+)/?\)")
PROFILE_URL = re.compile(r"https?://(?:www\.)?github\.com/([A-Za-z0-9-]+)/?(?=[\s)\]\"']|$)")
# Names that no pattern catches (found by reading the downloaded files by eye).
KNOWN_NAMES = ["Biswanath Das", "Anna Dodson", "Jamie Tanna", "Sainath"]
SIGNOFF = re.compile(r"^(Signed-off-by|Co-authored-by):.*$", re.MULTILINE | re.IGNORECASE)


def gh(*args):
    r = subprocess.run(["gh", *args], capture_output=True, text=True, encoding="utf-8")
    return r.returncode, r.stdout


def scrub(text: str) -> str:
    text = SIGNOFF.sub("", text)
    text = EMAIL.sub("user@example.com", text)
    text = PROFILE_LINK.sub("[Contributor Name](https://github.com/username)", text)
    text = PROFILE_URL.sub("https://github.com/username", text)
    for name in KNOWN_NAMES:
        text = text.replace(name, "Some Person")
    return MENTION.sub("@user", text)


def candidates(search):
    code, out = gh("search", "prs", *search, "--limit", "40", "--json", "url,title,body,author,isDraft,repository")
    return json.loads(out) if code == 0 and out.strip() else []


def main():
    chosen, seen_repos = [], set()
    for quota, searches in BUCKETS:
        got = 0
        for search in searches:
            for pr in candidates(search):
                if got >= quota:
                    break
                repo = pr["repository"]["nameWithOwner"]
                if pr["author"].get("is_bot") or pr["isDraft"] or repo in seen_repos:
                    continue
                code, diff = gh("pr", "diff", pr["url"])
                if code != 0 or not diff.strip() or len(diff) >= MAX_DIFF or "GIT binary patch" in diff:
                    continue
                seen_repos.add(repo)
                chosen.append({"title": scrub(pr["title"]), "description": scrub(pr["body"] or ""),
                               "diff": scrub(diff), "url": pr["url"]})
                got += 1
            if got >= quota:
                break
        print(f"bucket wanted {quota}, got {got}")
    random.Random(17).shuffle(chosen)  # order must not reveal the bucket
    for old in RAW.glob("*.json"):
        old.unlink()
    for i, case in enumerate(chosen, 1):
        case = {"id": f"pr{i:02d}", **case}
        (RAW / f"{case['id']}.json").write_text(json.dumps(case, indent=1, ensure_ascii=False), encoding="utf-8")
    print("saved", len(chosen), "PRs to", RAW)


if __name__ == "__main__":
    main()
