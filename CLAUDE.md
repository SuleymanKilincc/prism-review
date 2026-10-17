# Project brief: team Localhost, Hacktoberfest Elazig Hack Day

## What this is
A hackathon project built from scratch tonight (kick-off 17 Oct 2026 19:00, jury presentation 18 Oct 04:30).
Team "Localhost": 3 university students with little coding experience, so keep explanations simple.
Talk to the team in Turkish. Code, comments, README and the article are in English.

## Rules and judging (from the organisers' kick-off deck)
- New project only, public GitHub repo, MIT licence. Team of up to 4, each member has a DEV (dev.to) username.
- The core must be open: an open-weight model running locally and/or open-source agent frameworks.
- Theme (week 2) "Side Hustle": a small, specific tool a real person would pay for.
- The jury's key question: why is the open approach better here than a closed API?
- Criteria by weight: article quality (heaviest), theme fit, creativity, technical implementation, partner technology.
- Prizes we aim for: Best Use of Gemma 4, Best Use of GitHub Copilot, Best Open-Source AI Project.
- AI assistants are allowed. We record agent sessions with DevRelay.

## The idea (working name: <prism>)
A local assistant that does a first-pass review of GitHub pull requests for freelance developers and small
agencies who cannot send client code to the cloud (NDA). Input: PR title, description and diff.
Output (JSON, fixed schema): category, quality 1-5, risk (low/medium/high), summary, reasons, missing, needs_human,
suggested_reply. It never merges or closes anything; a human decides.
Why local: client code never leaves the laptop, zero cost per PR, works offline, no vendor lock-in.

## Decisions already made
- Python 3.10, FastAPI + uvicorn backend, one HTML/CSS/JS page served by the backend (no separate server, no CORS).
- Model: gemma4:e4b through Ollama (about 4.6 GiB VRAM on an 8 GB RTX 4060; the first call is slow, warm it up).
  Fallback / comparison: qwen3.5:9b. Skip gemma2:9b (does not fully fit the GPU).
- Pydantic schema, passed to Ollama as `format` so the reply is always valid JSON; validate again, retry once.
- Use temperature 0, think=False, num_ctx 8192, truncate long diffs (about 6000 characters).
- PR text is untrusted data (prompt injection): say so in the system prompt AND add a code-level guard
  that forces needs_human when the PR text talks to the reviewer.
- A fake model for the UI and for tests; CI never calls a real model. Check real GPU memory with nvidia-smi
  (ollama ps reports gemma4 size wrongly).
- Measure with a hand-labelled set of PRs; report cases written after the prompt was tuned separately.
  Earlier private experiments are only background: re-measure everything for the article tonight.

## Roles (branch per task, small pull requests)
1. AI / backend (<Süleyman(me)>): backend/, schema, prompt, model client, evaluation.
2. Frontend (<Mehmet>): frontend/, cards, colours, demo flow.
3. DevOps / docs / pitch (<Eren>): repo, GitHub Actions CI, README, article, slides, demo video.

## Working rules
- Small steps. After each step run it, show the result, and explain in 2-3 simple Turkish sentences what changed and why.
- Never push, merge or delete without asking. Work on feature branches; `main` always works; CI must be green.
- No secrets in the repo (.env is git-ignored). Everyone must be able to explain their own code to the jury.
- Keep docs/ARTICLE_NOTES.md updated as we go: decisions, numbers, problems and fixes, screenshots to take.