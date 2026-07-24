# Deprecated Range-Restricted Profile Analysis

This directory contains historical design-rationale material for an earlier range-restricted profile previously called Reduced Mode.

That design is **not part of Schiavinato Sharing v0.7.0**. The active Compact Output Profile uses unrestricted `GF(2053)` share values and reduces QR size by shrinking digital-envelope metadata, not by rejecting word-share values outside the BIP39 range.

The script in this directory is exploratory research support. It is useful for understanding why the range-restricted design was removed, but it is not a conformance test, not an active security claim, not a lightweight release check, and not required for v0.7.0 implementations.

## Usage

```bash
python3 reduced_mode_independent_eval.py
```

No third-party dependencies are required, but the full exploratory run can be long-running.
