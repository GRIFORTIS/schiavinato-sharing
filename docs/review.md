# Review & feedback

Schiavinato Sharing is **experimental** and **not audited**.

We welcome review from cryptographers, wallet architects, implementers, and custody practitioners.

Prototype implementations are work in progress and may lag the current v0.6.0 specification. Please treat the specification, whitepaper, and test vectors as the review targets; implementation repositories should declare explicit spec/vector support before being treated as conformant.

## What to review

High-value review targets:

- **Arithmetic confidentiality**: the information-theoretic secrecy claim for the unrestricted `GF(2053)` Shamir layer, including the interaction with deterministic row, column, and GIC fields.
- **Linear consistency layer**: the minimum-distance argument (`d = 4`) and whether the row/column/GIC construction detects exactly the passive error classes claimed.
- **Reduced Mode**: the range-restriction leakage/bias bound, the usefulness of the QR/manual-transcription trade-off, and whether this mode should remain in the protocol.
- **Substitution detection model**: the separation between passive consistency checks, manifest audit hashes, mnemonic-bound BI, wallet-bound RVA, and the conditions under which each check fails.
- **Manifest metadata sensitivity**: whether the treatment of raw GIC maps, audit hashes, manifest separation, and verification-oracle risk is correct and clearly scoped.
- **Threat model and operational gaps**: assumptions about trusted devices/peripherals, assisted ceremonies, durable artifacts, inheritance scenarios, and manual fallback.
- **Test vectors**: clarity, completeness, and usefulness for independent reproduction of the whitepaper claims.

Secondary review targets:

- **Digital envelope specification**: Core Payload encoding, QR prefix/decode rules, and versioning/backwards-compatibility boundaries.
- **Workflow documentation**: non-normative v0.6.0 flow diagrams in [`software-flows/`](software-flows/) showing ceremony sequence, resume modes, printer-tier branching, and coefficient-generation paths.

Out of scope for the first review pass:

- Treating prototype implementations as conformant references.
- Operational deployment recommendations for real funds.
- UI/UX polish outside its impact on safety or recoverability.

## How to contribute feedback
- Open an issue in the spec repo:
  - **Spec review** (protocol/spec clarity/correctness)
  - **Security analysis** (threat model and security properties)
  - **Reduced Mode** (bias analysis and whether the mode should exist)
  - **Operational model** (custody workflows, recovery context, and artifact handling)
- Or open a pull request with edits to `manual_spec/`, `software_spec/`, `test_vectors/`, or the whitepaper.

## Proposal-first for changes
If you propose a behavior change (spec or code), please start with a proposal in `proposals/`.

