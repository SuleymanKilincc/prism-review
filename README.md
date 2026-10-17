# prism-review

A local-first pull request review assistant for freelance developers and small agencies. Prism aims to help maintainers make a first pass over client pull requests using an open-weight model running on their own machine.

Built by **team Localhost** for **Hacktoberfest Elazığ Hack Day**.

## Current status

This repository is an early backend prototype. It currently includes:

- A FastAPI API accepting a pull request title, description, and diff.
- A Pydantic-validated review response with category, quality, risk, summary, reasons, missing information, a human-review flag, and a suggested reply.
- A deterministic fake model for development and tests, with no model download or external API key required.
- Tests for API behavior, response validation, and model-unavailable handling.

**Real AI review is not connected yet.** Gemma 4 through Ollama is the planned local inference backend. The browser interface and GitHub integration are also not implemented. At present, you submit PR text directly to the API.

## Why local?

Freelancers may need to review client code that they cannot send to a hosted AI service. The planned local inference workflow keeps review inputs on the developer's machine, avoids per-request inference fees, and allows reviews without an internet connection once the required software and model are installed.

Prism returns review suggestions. It does not post comments, merge pull requests, or close them; a maintainer makes the final decision.

## Quick start

Use **Python 3.10 or later**. Run these commands from the repository root:

```bash
git clone https://github.com/SuleymanKilincc/prism-review.git
cd prism-review
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

On Windows, create the environment with `py -m venv .venv` and activate it in PowerShell with `.venv\Scripts\Activate.ps1` before running the install and server commands.

Once the server starts:

- Open [Swagger UI](http://127.0.0.1:8000/docs) to try the API interactively.
- Open [the health endpoint](http://127.0.0.1:8000/health) to check that the server is running.
- View [the OpenAPI schema](http://127.0.0.1:8000/openapi.json).

There is no homepage yet: `/` returns 404 while the `frontend/` directory is absent. The backend is already set up to serve that directory when it is added; restart the server after creating it.

## Try a review

With the server running, use a second terminal:

```bash
curl http://127.0.0.1:8000/health
```

Expected response:

```json
{"status": "ok"}
```

Submit a sample pull request:

```bash
curl -X POST http://127.0.0.1:8000/analyze \
  -H 'Content-Type: application/json' \
  -d '{"title":"Fix typo in README","description":"Correct a spelling mistake","diff":"-recieve\n+receive"}'
```

The current fake model returns:

```json
{
  "category": "typo",
  "quality": 5,
  "risk": "low",
  "summary": "Fixes a spelling mistake.",
  "reasons": ["Tiny, clear change", "No code touched"],
  "missing": [],
  "needs_human": false,
  "suggested_reply": "Thanks for the fix! Merging."
}
```

All three request fields are required; `description` may be an empty string. Missing fields return HTTP `422`. If a model adapter raises `ModelUnavailable`, the API returns HTTP `503` with `{"detail":"Model is not available"}`.

See [the API contract](docs/api.md) for the complete response schema and allowed values.

### Fake model limitations

The fake model only checks for keywords across the title, description, and diff:

1. Text containing `hacktoberfest` receives a fixed `spam` response.
2. Otherwise, text containing `typo` receives a fixed `typo` response.
3. Everything else receives a generic response with `needs_human: true`.

These are development fixtures, not meaningful judgments about a contribution. The sample reply mentioning merging is only returned text; no GitHub action occurs. Even when `needs_human` is false, a maintainer should review the result.

## Run tests

With the virtual environment activated and dependencies installed:

```bash
python -m pytest backend/tests -q
```

Tests use FastAPI's in-process test client and the fake model. They do not require a running server, Ollama, a GPU, or GitHub credentials.

## Project layout

```text
prism-review/
├── backend/
│   ├── main.py            # FastAPI routes and optional frontend serving
│   ├── schema.py          # Request and response validation
│   ├── fake_model.py      # Deterministic development model
│   └── tests/
│       └── test_api.py    # API and schema tests
├── docs/
│   └── api.md             # Shared API contract
├── CLAUDE.md              # Project brief and team working conventions
├── requirements.txt       # Runtime and test dependencies
└── LICENSE                # MIT license
```

The stack is Python, FastAPI, Uvicorn, and Pydantic, with pytest and HTTPX for testing. The Ollama Python package is listed as a dependency for the planned model integration; the current application does not call it.

## Planned work

- Connect local Gemma 4 inference through Ollama.
- Add structured model output validation, a retry, and long-diff handling.
- Treat PR text as untrusted input and add prompt-injection safeguards.
- Build a browser interface served by the backend.
- Evaluate review quality against a hand-labelled set of pull requests.
- Add automated CI checks.

## Contributing

Work on a feature branch and open a pull request for review before merging into `main`. Run the tests before submitting changes. Coordinate API changes with the team using [docs/api.md](docs/api.md), and keep secrets and client code out of the repository.

## License

Released under the [MIT License](LICENSE).
