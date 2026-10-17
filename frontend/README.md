# prism-review frontend

Plain HTML, CSS and JavaScript. No frontend dependency installation or build step is required.

## Run with the existing backend

From the repository root, with Python dependencies installed:

```sh
python -m uvicorn backend.main:app
```

Open http://127.0.0.1:8000. FastAPI serves both the page and API; the default backend address is the page's origin, so no separate frontend server or CORS setup is needed.

Use the top-right language selector for **Türkçe / English**. The choice persists in this browser. Menus, forms, notifications, dates, CSV headers and bundled sample PRs follow the selected language. Submitted PR text and backend results are shown unchanged; switching language does not send another review request. User-edited reply drafts are preserved when switching languages. PR additions and draft edits remain session-only.

The page starts in **Demo mode** with fictional samples. To test the backend, open the gear icon and choose **API mode**, keeping the backend address equal to the page's address. The API model label comes from `GET /health`: `model: "fake"` displays Fake model, a reported name such as `gemma4:e4b` displays that name, and a missing model field displays Model not reported. Failed health checks display Model info unavailable. The frontend never infers the model from the score or from API mode alone. Switching to API mode does not turn the existing sample list into real GitHub data.

API requests use `POST /analyze` with exactly `title`, `description` and `diff`, as specified in `docs/api.md`. Description may be empty. On HTTP 503, the form explains that the model is not ready, retains the input and allows retrying. Connection failures, timeouts and invalid responses have separate messages in both languages.

## prism-review frontend checks

With Node.js 22 or later, from the repository root:

```sh
node --test frontend/tests/frontend.test.mjs
```

Optional PowerShell integration check with the backend already running:

```powershell
$env:PRISM_TEST_URL = 'http://127.0.0.1:8000'
node --test frontend/tests/frontend.test.mjs
```

For screenshots: choose English, leave Demo mode enabled, then open Overview, Pull requests, Analytics or a sample PR detail. API review content retains its original language.

## Presentation behavior

API submissions show a progress indicator explaining that the first request may take around 30 seconds. After a successful API review, its detail view shows the client-observed request duration in seconds. This includes network and server work and is not an isolated inference benchmark. Demo fixtures have no fabricated timings. Each API result retains the model information observed when it was requested. The human-decision notice stays near the top of every existing screen.
