from fastapi import FastAPI, HTTPException

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
