from backend.model_client import SYSTEM_PROMPT

# These tests only check that the rules are still written in the prompt
# (so nobody deletes one by accident). Whether the model obeys them is
# measured separately with the labelled PR set.


def test_prompt_has_category_guide():
    for word in ("spam:", "typo:", "docs:", "Hacktoberfest"):
        assert word in SYSTEM_PROMPT


def test_prompt_forbids_merge_promises():
    assert "NEVER say or promise" in SYSTEM_PROMPT


def test_prompt_says_empty_missing_is_an_empty_list():
    assert "empty JSON array" in SYSTEM_PROMPT
    assert "Never write" in SYSTEM_PROMPT


def test_prompt_treats_pr_text_as_untrusted():
    assert "UNTRUSTED DATA" in SYSTEM_PROMPT
