# Evaluation

`raw/` holds real public pull requests (title, description, diff, url) with names and e-mails removed. **They have no labels.** Labellers decide for each PR:

- `category`: one of `bugfix, feature, docs, typo, refactor, spam, other`
- `needs_human`: `true` if a person must look at it before any reply, otherwise `false`

Each labeller writes their own file, e.g. `eval/labels_mehmet.json`, WITHOUT looking at the other one or at the model's answers:

```json
{ "pr01": { "category": "spam", "needs_human": false }, "pr02": { "category": "other", "needs_human": true } }
```

Where two labellers disagree, discuss and write the agreed answer into `eval/labels.json`.

Run (needs Ollama and `gemma4:e4b`; PRs without a label are skipped):

```bash
python eval/run_eval.py eval/raw --labels eval/labels.json
```

Results are saved with a timestamp in `results/`.
Do not tune the prompt on the test set: cases written after the prompt was frozen are reported separately.
