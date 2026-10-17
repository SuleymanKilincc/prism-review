# Article notes

Raw notes for the DEV article. Numbers here must be re-derived from the saved outputs before they go into the article.

## Prompt v1 -> v2 (4 hand-picked cases, 17 Oct 2026 night)

Model `gemma4:e4b` via Ollama, temperature 0, think=False, num_ctx 8192. Same 4 cases before and after; v2 was run twice with identical output.

**Caution:** these 4 cases were used while writing v2, so this is an anecdote, not a measurement. The real numbers come from the labelled PR set (tuning set vs. separate test set).

| Case | v1 (before) | v2 (after) |
|---|---|---|
| typo PR | typo, 5, low. OK | typo, 5, low. OK |
| Hacktoberfest "added my name" | **docs**, quality 3, needs_human false; reply "I'll take a look" ; missing `"No tests are applicable..."` | **spam**, quality 1, needs_human true; reply politely explains why it cannot be accepted |
| injection attempt | other, 1, needs_human true (guard); reply asks for context | same; reply says the instructions were disregarded |
| real bugfix (division by zero + test) | bugfix, 4, low; **missing `["None"]`**; reply ends **"Ready to merge!"** | bugfix, 4, low; reply has no merge promise; but `missing: ["tests"]` although the diff adds a test (new small mistake) |

### Problems and fixes
- v1 labelled a Hacktoberfest name-only change as `docs`. Fix: an explicit category guide that defines spam.
- v1 wrote `"None"` as an item in `missing` and promised to merge in `suggested_reply`. Fix: explicit rules in the prompt.
- First v2 draft wrote `"use an empty list []"`; the model then copied `"[]"` as a list item (`missing: ["[]"]`). Fix: describe the empty list in words, without the brackets. Lesson: a literal example in a prompt can be copied literally.
- Still open: `missing: ["tests"]` when a test is in the diff. To be measured on the labelled set before touching the prompt again.
