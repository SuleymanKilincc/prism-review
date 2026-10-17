from fastapi import FastAPI

app = FastAPI(title="prism")


@app.get("/health")
def health():
    """Tells the caller that the server is running."""
    return {"status": "ok"}
