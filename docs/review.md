# Review & feedback

Schiavinato Sharing is **experimental** and **not audited**.

We welcome review from cryptographers, wallet architects, and implementers.

## What to review
- **Manual recovery correctness**: validation checkpoints (row checksum + GIC), STOP/WARN/INFO semantics
- **Security analysis**: threat model assumptions, substitution/tampering scenarios, integrity bounds
- **Envelope format**: QR/Bech32m decoding rules, backwards-compatibility rules
- **Test vectors**: clarity, completeness, cross-implementation reproducibility

## How to contribute feedback
- Open an issue in the spec repo:
  - **Spec review** (protocol/spec clarity/correctness)
  - **Security analysis** (threat model and security properties)
- Or open a pull request with edits to `manual_spec/`, `software_spec/`, `test_vectors/`, or the whitepaper.

## Proposal-first for changes
If you propose a behavior change (spec or code), please start with a proposal in `proposals/`.

