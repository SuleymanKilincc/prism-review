# Frontend

Plain HTML, CSS and JavaScript. No frontend dependency installation or build step is required.

## Run with the existing backend

From the repository root, with Python dependencies installed:

```sh
python -m uvicorn backend.main:app
```

Open http://127.0.0.1:8000. FastAPI serves both the page and API; the default backend address is the page's origin, so no separate frontend server or CORS setup is needed.

Use the top-right language selector for **Türkçe / English**. The choice persists in this browser. Menus, forms, notifications, dates, CSV headers and bundled sample PRs follow the selected language. Submitted PR text and backend results are shown unchanged; switching language does not send another review request. User-edited reply drafts are preserved when switching languages. PR additions and draft edits remain session-only.

The page starts in **Demo mode** with fictional samples. To test the backend, open the gear icon and choose **API mode**, keeping the backend address equal to the page's address. The current backend uses a deterministic fake model, not Gemma. Switching to API mode does not turn the existing sample list into real GitHub data.

API requests use `POST /analyze` with exactly `title`, `description` and `diff`, as specified in `docs/api.md`. Description may be empty. On HTTP 503, the form explains that the model is not ready, retains the input and allows retrying. Connection failures, timeouts and invalid responses have separate messages in both languages.

## Frontend checks

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
