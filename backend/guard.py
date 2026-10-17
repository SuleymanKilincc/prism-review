import re
import unicodedata

from .schema import AnalyzeRequest, AnalyzeResponse

# This is a heuristic (a list of phrases), not a proof. It can miss attacks and it can raise
# false alarms. A match only means "a human must look"; it never makes anything safer by itself.
#
# The phrases mean the PR text is talking to the reviewer (or to an AI) instead of describing a
# change. Where a bare word is also normal (for example "system prompt" or "needs_human" in docs),
# we only match it together with a command word such as "show" or "set ... to false".
# Turkish letters are written as classes like [ıi], so text typed without diacritics also matches.
_ENGLISH = [
    r"ignore (all |any |the )?(previous|prior|above)",
    r"disregard (the |all )?(previous|above|instructions)",
    r"(ignore|disregard|forget|override)\b[^.\n]{0,30}\b(rules|guidelines|policy|policies|instructions)",
    r"as an ai\b|you are (a|an|now)\b|(dear|hey|hello) (ai|reviewer|assistant|model)",
    r"to the (ai|reviewer|assistant|model)\b|\bai[- ]?review(er)?\b|automated (reader|reviewer)",
    r"(approve|merge|accept) this (pr|pull request|immediately|now)",
    r"(accept|approve) the (change|pr|pull request)\b",
    r"(set|mark|rate) (it|this)?\s*(as )?(low risk|quality 5|5/5)",
    r"\bonly instruction\b|\[(system|assistant)\]|(^|\n)\s*assistant\s*:",
    # telling the reviewer what to answer
    r"(mark|label|report|rate|state|say|write|answer|respond)\b[^.\n]{0,25}\b(safe|low[- ]risk|risk low|trusted|ready to merge|no security issues)",
    # asking to skip the human or the analysis
    r"(skip|bypass|without|no need for|do(n't| not) (ask for|require|request))\b[^.\n]{0,15}\b(human |manual |detailed |further )?(review|analysis)",
    r"no (further |more )?(human |manual )?review (is )?(needed|required|necessary)",
    r"(human|manual) review (is )?(not|un)(needed|required|necessary)",
    # asking for the prompt or the answer fields
    r"(print|show|reveal|display|repeat|output|leak|dump|expose)\b[^.\n]{0,40}\b(system|hidden|initial) (prompt|instructions?)",
    r"\b(set|make|mark|change|force|turn|put|return|report)\b[^.\n]{0,30}needs_human[^.\n]{0,20}\b(false|no)\b",
    r"\"needs_human\"\s*:\s*false.{0,300}\"risk\"|\"risk\"\s*:.{0,300}\"needs_human\"\s*:\s*false",
]
_TURKISH = [
    r"[öo]nceki\s+(talimat|y[öo]nerge|komut|kural)\w*\s+(g[öo]rmezden|yoksay|unut|dikkate alma|ge[çc]ersiz)",
    r"(talimat|y[öo]nerge|kural)\w*\s+(g[öo]rmezden gel|yoksay|unut)",
    r"\bsen art[ıi]k\b",
    r"\bpr['’]?[ıi]?\s+(hemen\s+)?(onayla|kabul et)|bu (pr|pull request|de[ğg]i[şs]ik\w*)[^.\n]{0,15}(onayla|kabul et)",
    r"risk\w*\s+(d[üu][şs][üu]k|low)\s*(olarak\s*)?(i[şs]aretle|yaz|belirt)|d[üu][şs][üu]k risk(\s+olarak)?\s*(i[şs]aretle|yaz|belirt)",
    r"insan\s+(incelemesi|kontrol[üu]|onay[ıi])\w*\s*(gerekmez|gerekmiyor|isteme\w*)",
    r"incelemeden\s+ge[çc]|yorum yazmadan\s+ge[çc]",
    r"de[ğg]erlendirme(yi)? yapan model|de[ğg]erlendiren (model|sistem)|otomatik okuyan sistem|yapay zek[âa]\s*,|asistan\s*:",
    r"(g[öo]ster|yaz|payla[şs]|s[öo]yle)\w*[^.\n]{0,40}sistem (prompt|talimat)|sistem (prompt|talimat)\w*[^.\n]{0,40}(g[öo]ster|yaz|payla[şs]|aynen)",
    r"needs_human[^.\n]{0,25}(false|yanl[ıi][şs])[^.\n]{0,15}(yap|olarak|ayarla|i[şs]aretle)",
]
SUSPICIOUS = [re.compile(p, re.IGNORECASE) for p in _ENGLISH + _TURKISH]

# Characters that hide words from a text match: zero-width characters, letters from other
# alphabets that look like Latin ones, and digits used as letters ("1gn0re").
_INVISIBLE = dict.fromkeys(map(ord, "​‌‍‎‏⁠﻿­"))
_LOOKALIKES = str.maketrans("аеорсхуіѕј", "aeopcxyisj")  # Cyrillic -> Latin
_LEET = str.maketrans("013457@$", "oieastas")


def _variants(text: str):
    """The text as written, and the text with hidden-word tricks undone."""
    plain = unicodedata.normalize("NFKC", text).translate(_INVISIBLE)
    plain = plain.translate(_LOOKALIKES)
    return [text, plain, plain.translate(_LEET)]


def talks_to_reviewer(req: AnalyzeRequest) -> bool:
    text = f"{req.title}\n{req.description}\n{req.diff}"
    return any(p.search(v) for v in _variants(text) for p in SUSPICIOUS)


def apply_guard(req: AnalyzeRequest, resp: AnalyzeResponse) -> AnalyzeResponse:
    """If the PR text talks to the reviewer, a human must look, whatever the model said."""
    if not talks_to_reviewer(req):
        return resp
    reasons = ["PR text addresses the reviewer or an AI (possible prompt injection)"] + resp.reasons
    return resp.model_copy(update={"needs_human": True, "reasons": reasons[:4]})
