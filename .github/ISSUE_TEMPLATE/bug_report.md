---
name: Bug report (spec / vectors / docs)
about: Report a correctness issue, inconsistency, or documentation bug in the canonical specification repository
title: "[BUG] "
labels: ["bug"]
assignees: ""
---

## Summary
<!-- 1-2 sentences. -->

## Where is the problem?
<!-- Check all that apply. -->
- [ ] `manual_spec`
- [ ] `software_spec`
- [ ] `test_vectors`
- [ ] `whitepaper`
- [ ] `docs/` (review entry point, diagrams, etc.)
- [ ] `research/` (experiments)
- [ ] Other (describe):

Links (file + section, if possible):

## What happened (actual)

## What you expected

## Evidence / reproduction
<!-- Minimal reproducible example. Examples: mismatched vector, contradicting requirement, ambiguous wording. -->
- Steps (if applicable):
  1.
  2.
  3.
- Test vector reference (if applicable):
- Version/tag/commit:

## Impact
- [ ] Critical (security issue, data loss, silent corruption)
- [ ] High (blocks review/implementation)
- [ ] Medium (workaround exists)
- [ ] Low (minor / cosmetic)

## Security note (read first)
If this could be a vulnerability or would help an attacker:
- Do **not** post exploit details publicly
- Report privately via `security@grifortis.com` (security policy: https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md)

Never include real seeds/mnemonics, private keys, or real shares in issues, logs, screenshots, or attachments.

## If this is an implementation bug
If the issue is specific to an implementation (HTML / JS / Python), please open it in the appropriate repository:
- HTML: https://github.com/GRIFORTIS/schiavinato-sharing-html/issues
- JS/TS: https://github.com/GRIFORTIS/schiavinato-sharing-js/issues
- Python: https://github.com/GRIFORTIS/schiavinato-sharing-py/issues

