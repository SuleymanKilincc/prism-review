import re

from .schema import AnalyzeRequest, AnalyzeResponse

# Phrases that mean the PR text is talking to the reviewer (or to an AI) instead of
# describing a change. A real PR has no reason to say these.
SUSPICIOUS = re.compile(
    r"ignore (all |any |the )?(previous|prior|above)|disregard (the |all )?(previous|above|instructions)"
    r"|system prompt|as an ai|you are (a|an|now)\b|(dear|hey|hello) (ai|reviewer|assistant|model)"
    r"|to the (ai|reviewer|assistant|model)|(approve|merge|accept) this (pr|pull request|immediately|now)"
    r"|(set|mark|rate) (it|this)?\s*(as )?(low risk|quality 5|5/5)|needs_human",
    re.IGNORECASE,
)


def talks_to_reviewer(req: AnalyzeRequest) -> bool:
    return bool(SUSPICIOUS.search(f"{req.title}\n{req.description}\n{req.diff}"))


def apply_guard(req: AnalyzeRequest, resp: AnalyzeResponse) -> AnalyzeResponse:
    """If the PR text talks to the reviewer, a human must look, whatever the model said."""
    if not talks_to_reviewer(req):
        return resp
    reasons = ["PR text addresses the reviewer or an AI (possible prompt injection)"] + resp.reasons
    return resp.model_copy(update={"needs_human": True, "reasons": reasons[:4]})
