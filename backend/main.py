from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from .fake_model import ModelUnavailable, fake_review
from .schema import AnalyzeRequest, AnalyzeResponse

app = FastAPI(title="prism")

# The function that reviews a PR. Today it is the fake model;
# later we swap in the real Ollama client here.
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
