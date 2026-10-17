# API contract

The frontend talks to the backend only through this contract. Change it only after telling the whole team.

## Analyse a pull request

`POST /analyze`

### Request (JSON)

```json
{
  "title": "Fix typo in README",
  "description": "recieve -> receive",
  "diff": "--- a/README.md\n+++ b/README.md\n-recieve\n+receive"
}
```

| Field | Type | Meaning |
|---|---|---|
| title | text | Pull request title |
| description | text | Pull request description (may be empty) |
| diff | text | The changes, as shown by Git |

### Response (JSON)

```json
{
  "category": "typo",
  "quality": 5,
  "risk": "low",
  "summary": "Fixes a spelling mistake in the README.",
  "reasons": ["Tiny, clear change", "No code touched"],
  "missing": [],
  "needs_human": false,
  "suggested_reply": "Thanks for the fix! Merging."
}
```

| Field | Type | Allowed values / meaning |
|---|---|---|
| category | text | bugfix, feature, docs, typo, refactor, spam, other |
| quality | whole number | 1 (noise) to 5 (ready to merge) |
| risk | text | low, medium, high |
| summary | text | One or two sentences, at most 240 characters |
| reasons | list of text | Why the model decided this (at most 4 short items) |
| missing | list of text | What is missing, e.g. "tests" (at most 4) |
| needs_human | true / false | A person must look at this pull request |
| suggested_reply | text | A polite reply the reviewer can send, at most 400 characters |

## Errors

If the model is not available, the backend answers with status 503 and:

```json
{ "detail": "Model is not available" }
```

If the request is missing a field, the backend answers with status 422 (FastAPI does this automatically).