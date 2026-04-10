# Test vectors

This directory contains the canonical test vectors for Schiavinato Sharing.

## Goals
- Enable cross-implementation conformance testing (HTML / JS / Py).
- Provide a stable reference for the protocol semantics.

## Layout
- `schema.json`: JSON schema for the machine-readable vectors format.
- Live current-protocol vectors live directly in `test_vectors/` at the repository root:
  - `test_vectors/vectors.json`: machine-readable live vectors for the current protocol
  - `test_vectors/vectors.md`: human-readable live companion for the current protocol
- Released historical vectors live under [`../previous_versions/`](../previous_versions/README.md), inside each archived version's `test_vectors/` subtree:
  - `vectors.json`: machine-readable vectors
  - `vectors.md`: optional human-readable companion

## Notes
- The live `test_vectors/` pair tracks the current protocol, and its internal `version` field identifies the targeted spec version.
- Once a version is released, its vectors MUST be copied into `previous_versions/vX.Y.Z/test_vectors/` and treated as immutable there.
- Implementations MUST declare which spec versions they support and MUST validate against these vectors before release.
- Archived releases currently available:
  - Partial vectors-only snapshot: [`../previous_versions/v0.4.0/`](../previous_versions/v0.4.0/README.md)
  - Full archived snapshot: [`../previous_versions/v0.4.1/`](../previous_versions/v0.4.1/README.md)
- Security policy (private disclosures): https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md
- Some human-readable companion docs inside version folders may reference `SECURITY.md`; treat that as a reference to the org-wide security policy link above.

## Quick test mnemonics (FOR TESTING ONLY)

⚠️ **FOR TESTING ONLY** — these are public example mnemonics for running tests and demos. **NEVER** use them for real funds.

### 12 words

```
spin result brand ahead poet carpet unusual chronic denial festival toy autumn
```

### 24 words

```
abandon zoo enhance young join maximum fancy call minimum code spider olive alcohol system also share birth profit horn bargain beauty media rapid tattoo
```

## Conformance requirements

For any implementation (HTML / JS / Py) to claim compatibility with the current protocol vectors, it MUST:

- **Declare support**: document which `manual_spec` and `software_spec` versions are supported, and which vectors `version` field is used for conformance.
- **Validate in CI**: run vector-based conformance tests in CI (or equivalent automation) before publishing a release.
- **Archive releases immutably**: once a vectors set is released, snapshot it under `previous_versions/vX.Y.Z/test_vectors/` rather than continuing to evolve that archived copy.

