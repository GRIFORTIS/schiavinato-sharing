# Review & feedback

Schiavinato Sharing is **experimental** and **not audited**.

We welcome review from cryptographers, wallet architects, and implementers.

Prototype implementations are work in progress and may lag the current v0.6.0 specification. Please treat the specification, whitepaper, and test vectors as the review targets; implementation repositories should declare explicit spec/vector support before being treated as conformant.

## What to review
- **Manual recovery correctness**: validation checkpoints (row checksum + GIC), STOP/WARN/INFO semantics
- **Security analysis**: threat model assumptions, substitution/tampering scenarios, integrity bounds
- **Envelope format**: QR/Core Payload decoding rules, optional text export boundaries, backwards-compatibility rules
- **Test vectors**: clarity, completeness, cross-implementation reproducibility
- **Software implementation flow**: non-normative v0.6.0 flow diagrams in [`software-flows/`](software-flows/) showing ceremony sequence, resume modes, printer-tier branching, and coefficient-generation paths

## How to contribute feedback
- Open an issue in the spec repo:
  - **Spec review** (protocol/spec clarity/correctness)
  - **Security analysis** (threat model and security properties)
- Or open a pull request with edits to `manual_spec/`, `software_spec/`, `test_vectors/`, or the whitepaper.

## Proposal-first for changes
If you propose a behavior change (spec or code), please start with a proposal in `proposals/`.

