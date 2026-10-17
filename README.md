# prism-review

A local-first pull request review assistant for freelance developers and small agencies. Prism aims to help maintainers make a first pass over client pull requests using an open-weight model running on their own machine.

Built by **team Localhost** for **Hacktoberfest Elazığ Hack Day**.

## Current status

This repository is a working hackathon prototype with:

- A FastAPI API accepting a pull request title, description, and diff.
- Local Ollama inference, using `gemma4:e4b` by default, with schema-constrained JSON output, validation, and one retry for invalid output.
- A code-level guard that flags text addressing the reviewer or an AI for human review in Ollama mode.
- A browser dashboard with Turkish/English language selection, PR search and filters, review details, editable reply drafts, analytics, and CSV export.
- A deterministic fake backend and a separate frontend Demo mode for development without a model.
- Backend and frontend tests, GitHub Actions CI, and an evaluation runner for labelled PRs.

**GitHub integration is not implemented.** Paste the PR title, description, and diff into the interface or submit them directly to the API. The dashboard starts with fictional sample PRs; its charts are not live GitHub metrics.

## Why local?

Freelancers may need to review client code that they cannot send to a hosted AI service. With Ollama running locally, the inference workflow keeps review inputs on the developer's machine, avoids per-request inference fees, and allows reviews without an internet connection once the required software and model are installed.

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

- Open [the dashboard](http://127.0.0.1:8000/) to explore the interface.
- Open [Swagger UI](http://127.0.0.1:8000/docs) to try the API interactively.
- Open [the health endpoint](http://127.0.0.1:8000/health) to check that the server is running.
- View [the OpenAPI schema](http://127.0.0.1:8000/openapi.json).

This starts the **fake backend** by default. No frontend build step, Ollama installation, GPU, or API key is needed for this mode.

## Use the browser interface

1. Open [the dashboard](http://127.0.0.1:8000/). It starts in **Demo mode**, which generates sample assessments in the browser without calling the backend.
2. Use the top-right language selector to switch between **Türkçe** and **English**. PR text and backend responses retain their original language.
3. Open the gear icon and select **API mode** to send new reviews to the backend. Keep the backend address equal to the page's origin (`http://127.0.0.1:8000` when using the commands above).
4. Add a PR with its title, description, and diff, then inspect the result and edit or copy the suggested reply.

API mode uses whichever model the backend was started with; it does not enable Ollama by itself. Existing sample PRs remain fictional after switching modes. Language and settings persist in browser storage, while added PRs and edited reply drafts last only for the current page session.

See [the frontend guide](frontend/README.md) for interface details. The backend model is controlled by the environment variables below.

## Enable local AI reviews

Install Ollama and download the model before starting the backend. In a separate terminal, start the Ollama service if it is not already running:

```bash
ollama serve
```

Then, with the Python environment activated:

```bash
ollama pull gemma4:e4b
PRISM_MODEL=ollama python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Stop the previous backend process before starting this one on the same port. On PowerShell, set the environment variable before starting Uvicorn:

```powershell
$env:PRISM_MODEL = "ollama"
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Open the dashboard and choose **API mode** to use real inference. Startup attempts to warm up the model; loading it can take time.

| Variable | Default | Purpose |
|---|---|---|
| `PRISM_MODEL` | `fake` | Set exactly to `ollama` to enable real inference; other values use the fake backend. |
| `PRISM_MODEL_NAME` | `gemma4:e4b` | Select a model already downloaded into Ollama. Used only in Ollama mode. |

Restart the backend after changing these variables. `/health` reports the configured model name, but does not check Ollama connectivity. Missing models, connection failures, or invalid output after the retry result in HTTP `503` from `/analyze`.

The Ollama client sends the response JSON schema, uses temperature `0`, disables thinking, and requests an `8192`-token context. Diffs longer than **6,000 characters** are truncated and marked before inference. The guard scans the full request for selected suspicious phrases and forces `needs_human: true` when it matches. This heuristic can miss attacks or flag legitimate text; all results still need human judgment.

## Try a review

With the server running, use a second terminal:

```bash
curl http://127.0.0.1:8000/health
```

Expected response:

```json
{"status": "ok", "model": "fake"}
```

Submit a sample pull request:

```bash
curl -X POST http://127.0.0.1:8000/analyze \
  -H 'Content-Type: application/json' \
  -d '{"title":"Fix typo in README","description":"Correct a spelling mistake","diff":"-recieve\n+receive"}'
```

With the default fake backend, this request returns the following fixed response. Ollama results may differ:

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

The fake backend only checks for keywords across the title, description, and diff:

1. Text containing `hacktoberfest` receives a fixed `spam` response.
2. Otherwise, text containing `typo` receives a fixed `typo` response.
3. Everything else receives a generic response with `needs_human: true`.

These are development fixtures, not meaningful judgments about a contribution. The sample reply mentioning merging is only returned text; no GitHub action occurs. Even when `needs_human` is false, a maintainer should review the result.

## Run tests

With the virtual environment activated and dependencies installed:

```bash
python -m pytest backend/tests -q
```

Backend tests use the in-process API client, fake model, and mocked Ollama clients. Run them with the default fake backend (`PRISM_MODEL` unset). They do not require a running server, Ollama, a GPU, or GitHub credentials.

For frontend checks, use **Node.js 22 or later**; there are no npm dependencies to install:

```bash
node --test frontend/tests/frontend.test.mjs
```

[GitHub Actions CI](.github/workflows/ci.yml) runs Python syntax checks and backend tests on Python 3.12, plus frontend tests on Node.js 22, for pushes and pull requests.

## Project layout

```text
prism-review/
├── backend/
│   ├── main.py            # API, model selection, warm-up, frontend serving
│   ├── model_client.py    # Ollama prompt, structured output, validation, retry
│   ├── guard.py           # Prompt-injection phrase detection
│   ├── schema.py          # Request and response validation
│   ├── fake_model.py      # Deterministic development model
│   └── tests/             # API, model client, prompt, and evaluation tests
├── frontend/              # HTML/CSS/JS dashboard, translations, and tests
├── eval/
│   ├── raw/               # Public PR inputs for labelling
│   ├── run_eval.py        # Local-model evaluation runner
│   └── results/           # Timestamped evaluation reports
├── docs/
│   ├── api.md             # Shared API contract
│   └── ARTICLE_NOTES.md   # Prompt experiments and article notes
├── .github/workflows/ci.yml
├── CLAUDE.md              # Project brief and team working conventions
├── requirements.txt       # Runtime and test dependencies
└── LICENSE                # MIT license
```

The stack is Python, FastAPI, Uvicorn, Pydantic, and Ollama, with plain HTML/CSS/JavaScript in the browser. Tests use pytest, HTTPX, and Node.js's built-in test runner.

## Evaluation

The repository includes 22 public PR inputs in `eval/raw/`, with separate annotations in `eval/labels_eren.json` and `eval/labels_mehmet.json`. These are individual annotations, not reconciled ground truth. The separate `eval/labels_codex.json` file contains AI-generated suggestions and must not be described as independent human labels. Follow [the evaluation guide](eval/README.md) to resolve disagreements using a shared rubric and save the agreed labels as `eval/labels.json` before running:

```bash
python eval/run_eval.py eval/raw --labels eval/labels.json
```

The runner calls Ollama directly and uses `PRISM_MODEL_NAME` (default `gemma4:e4b`); it does not require the API server or `PRISM_MODEL=ollama`. Ollama must be running with the chosen model downloaded. Unlabelled cases are skipped. Reports in `eval/results/` include category accuracy, agreement on `needs_human`, first-try valid JSON, latency, failures, and model/prompt metadata.

The four exploratory cases in [the article notes](docs/ARTICLE_NOTES.md) were used to tune the prompt and are not an independent benchmark. Keep prompt-tuning cases separate from evaluation cases.

### Preliminary runs on 22 PRs

Two saved runs use `gemma4:e4b`, code commit `b0adfff`, prompt hash `189e450025c0`, and the same 22 PR inputs. Each run compares its predictions with one person's annotations. The reports are submitted in [PR #24](https://github.com/SuleymanKilincc/prism-review/pull/24); the links below pin the reviewed report revision.

| Metric | Run compared with Mehmet's labels | Run compared with Eren's labels |
|---|---:|---:|
| PRs evaluated | 22 | 22 |
| Category matches | 19/22 | 5/22 |
| `needs_human` matches | 12/22 | 9/22 |
| Valid JSON on first try | 22/22 | 22/22 |
| Median seconds per case, excluding warm-up | 1.78 | 1.83 |
| Failed cases | 0 | 0 |
| Saved report | [01:52 run](https://github.com/SuleymanKilincc/prism-review/blob/5b307af72835eafaef3faee498a144b83f03824e/eval/results/20261018-015213.json) | [01:53 run](https://github.com/SuleymanKilincc/prism-review/blob/5b307af72835eafaef3faee498a144b83f03824e/eval/results/20261018-015300.json) |

**These are comparisons with individual annotations, not accuracy against agreed ground truth.** The two annotators agree on category for 5/22 cases and on `needs_human` for 15/22. Eren received AI-generated explanations and summaries before submitting labels; see [PR #22](https://github.com/SuleymanKilincc/prism-review/pull/22) for that context. Annotation methods and the shared rubric must be documented when reporting reconciled results.

Category predictions match across the two runs, but `needs_human` differs for `pr06` and `pr20`; complete responses also differ. These are separate inference runs, not one set of answers scored twice. Report metadata omits the label-file path; each run's annotations were identified by matching all saved `expected` entries to the corresponding label file.

The sample is small and selected through keyword searches. There is no separate test split. Timing covers the review call after warm-up, not the complete browser request. Keep these PR-classification results separate from the prompt-injection experiments in [the article notes](docs/ARTICLE_NOTES.md).

<!-- Reserved for a reconciled evaluation table: add agreed-label provenance,
annotation-method limitations, model/prompt/commit metadata, and a saved report.
Do not replace individual-run results with an unsupported headline accuracy.
-->

## Limitations and next steps

- Reviews can be wrong, including overlooking tests already present in a diff. Human review remains necessary.
- Long diffs are truncated, and the model does not inspect the rest of a repository.
- Add GitHub integration to import PR titles, descriptions, and diffs; any future comment posting must require human approval. PRs currently have to be entered manually.
- Add contributor history as review context; it is not currently fetched or considered.
- Add a readiness check that verifies Ollama connectivity and availability of the configured model. The current `/health` endpoint only reports the running API and configured model name.
- The dashboard uses session-only PR data rather than a persistent database.
- Reconcile the individual annotations, record annotation assistance and rubric decisions, and run the evaluation before reporting quality metrics.

## Contributing

Work on a feature branch and open a pull request for review before merging into `main`. Run the tests before submitting changes. Coordinate API changes with the team using [docs/api.md](docs/api.md), and keep secrets and client code out of the repository.

## License

Released under the [MIT License](LICENSE).
