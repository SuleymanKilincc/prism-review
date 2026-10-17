import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from .fake_model import ModelUnavailable, fake_review
from .schema import AnalyzeRequest, AnalyzeResponse

# PRISM_MODEL=ollama uses the real local model. Anything else (the default) uses the
# fake model, so tests, CI and the UI work without a GPU.
USE_OLLAMA = os.environ.get("PRISM_MODEL", "fake") == "ollama"


@asynccontextmanager
async def lifespan(app):
    if USE_OLLAMA:
        from .model_client import warm_up

        warm_up()
    yield


app = FastAPI(title="prism", lifespan=lifespan)

if USE_OLLAMA:
    from .model_client import ollama_review as run_model
else:
    run_model = fake_review


@app.get("/health")
def health():
    """Tells the caller that the server is running."""
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    """Reviews one pull request. See docs/api.md."""
    try:
        return run_model(req)
    except ModelUnavailable:
        raise HTTPException(status_code=503, detail="Model is not available")


# Serve the frontend/ folder from the same server, so the page and the API share
# one address and no CORS settings are needed. This must stay LAST: a mount at "/"
# would otherwise swallow the routes above. If frontend/ does not exist yet we skip
# the mount (StaticFiles would crash on every request); restart the server once it does.
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
if FRONTEND_DIR.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
