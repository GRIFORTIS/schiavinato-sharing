# Contributing to Schiavinato Sharing

This document is the **canonical** contributing policy for the Schiavinato Sharing protocol specification and its implementations.

## Security status (read first)

This project is **EXPERIMENTAL** and **NOT audited**. Do not use it for real funds.

Security policy / vulnerability reporting:
- https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/.github/SECURITY.md

## Repository map (where changes belong)

Schiavinato Sharing is split across repositories. **Protocol/spec truth lives in one place**:

- **Canonical protocol repo**: `schiavinato-sharing/`
  - Stable, heirs-first manual protocol: `manual_spec/`
  - Evolvable software envelope: `software_spec/`
  - Change control record: `proposals/`
  - Canonical vectors entry point (choose version there): `test_vectors/README.md`

Implementations (no protocol duplication; link to the canonical repo instead):
- HTML: https://github.com/GRIFORTIS/schiavinato-sharing-html
- JavaScript/TypeScript: https://github.com/GRIFORTIS/schiavinato-sharing-js
- Python: https://github.com/GRIFORTIS/schiavinato-sharing-py

## High-leverage ways to contribute

Bitcoin/crypto projects are bottlenecked on **review and testing**, not code volume.

Good first contributions:
- Review `manual_spec/` for long-term recoverability (heirs-first usability).
- Review validation checkpoints (row checksum + GIC semantics) for “no silent failure” properties.
- Review `software_spec/` for backwards decoding/version negotiation clarity.
- Validate implementations against canonical vectors:
  - https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/test_vectors/README.md

## Substantial contributions only (protect reviewer time)

We may close PRs that are low-value relative to review cost, including:
- Drive-by refactors, reformatting-only PRs, “cleanup” PRs without a clear security/usability/correctness benefit.
- Changes that reword safety posture toward “production-ready”, “audited”, “certified”, etc.
- Large, mixed-scope PRs (multiple unrelated changes bundled together).

If you want to help but don’t know where to start: pick an open issue and **review/test** an existing PR.

## Share early (avoid wasted work)

Before starting non-trivial work:
- Open an issue describing **what** you want to change and **why**.
- For protocol changes, open a proposal in `proposals/` (see below) before implementing across repos.

## Protocol changes (spec workflow)

### Proposals are mandatory for spec changes

Use `proposals/` for any change that affects:
- Manual procedure, validation semantics, or recoverability guarantees (`manual_spec/`).
- Envelope metadata, encoding/decoding, version negotiation (`software_spec/`).
- Canonical test vectors or their schema (`test_vectors/`).

A proposal must include (minimum):
- Motivation and scope
- Backwards compatibility (especially for heirs/manual recovery)
- Security impact
- Test vectors impact
- Migration plan (if any)

### Manual protocol stability (heirs-first)

`manual_spec/` is the primary long-term compatibility contract.

- Changes must be **rare**.
- Breaking changes require a **major version** and explicit recovery/migration guidance.

## Implementation changes (code workflow)

All implementations must remain compatible with the canonical spec and vectors.

PR expectations:
- **Focused scope** (one bugfix/feature per PR).
- **Explain why** (not just what).
- **Include a test plan**:
  - which automated tests you ran, and/or
  - exact manual steps to validate behavior.
- Update vectors/tests in the **same PR** when behavior changes.

## Commit hygiene (auditability)

- Keep commits **atomic** (do not mix formatting moves with behavior changes).
- Prefer small, reviewable diffs.
- Avoid large renames/moves unless necessary; explain them.

## Licensing

By contributing, you agree your contributions are licensed under this repository’s license unless explicitly stated otherwise in-file.

## Communication

- Use GitHub issues/PRs for technical discussion.
- For security issues, follow the security policy (do not open a public issue with exploit details).
