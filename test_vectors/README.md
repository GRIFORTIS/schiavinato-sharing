# Test vectors

This directory contains the canonical test vectors for Schiavinato Sharing.

## Goals
- Enable cross-implementation conformance testing (HTML / JS / Py).
- Provide a stable reference for the protocol semantics.

## Layout
- `schema.json`: JSON schema for the machine-readable vectors format.
- `vX.Y.Z/` folders contain version-scoped vectors:
  - `vectors.json`: machine-readable vectors
  - `vectors.md`: optional human-readable companion

## Notes
- Vectors MUST be version-scoped and immutable once released.
- Implementations MUST declare which spec versions they support and MUST validate against these vectors before release.

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

For any implementation (HTML / JS / Py) to claim compatibility with a given version-scoped vectors set `vX.Y.Z/`, it MUST:

- **Declare support**: document which `manual_spec` and `software_spec` versions are supported, and which vectors version `vX.Y.Z` is used for conformance.
- **Validate in CI**: run vector-based conformance tests in CI (or equivalent automation) before publishing a release.
- **Stay immutable**: treat released vectors as immutable; if behavior must change, add a new vectors version folder rather than editing an existing one.

