# Schiavinato Sharing — Software Specification (`software_spec`)

This document defines the evolvable **digital envelope** for Schiavinato Sharing (QR / Bech32m transport, metadata, and backwards-compatible decoding rules).

Normative keywords **MUST**, **MUST NOT**, **SHOULD**, **MAY** are used as requirements.

## Scope
This spec covers:
- Binary payload format (fields, sizes, encodings)
- QR and Bech32m representation rules
- Transport integrity checks (Transport Hash)
- Session/identity binding metadata (Batch ID + Blinded Identity)
- Versioning and backwards decode rules

All \(GF(2053)\) math and validation semantics (rows, checksums, GIC, STOP/WARN/INFO) are canonical in `manual_spec/`.

## Terminology
- **Core payload**: the protocol-defined bytes (no QR prefix).
- **QR bytes**: raw byte-mode QR payload (may include a prefix).
- **Bech32m string**: human-transcribable string encoding of the core payload.

## Core payload (v0.4.0 baseline)
This baseline is derived from the internal technical reference and is intended to remain backwards-decodable.

### Encoding overview
- **QR**: byte-mode QR encoding of raw bytes.
- **Bech32m**: BIP-350 Bech32m encoding of core payload bytes.
  - HRP: `schiavinato`

### QR prefix rule
If QR bytes begin with ASCII `SCHI` (`0x53 0x43 0x48 0x49`), implementations MUST strip the 4-byte prefix and treat the remainder as the core payload.

If QR bytes do not start with `SCHI`, implementations MAY treat the entire QR byte string as a core payload (legacy/alternate encodings) if and only if the length and version parsing are valid.

### Consistency rule (when both QR and Bech32m are provided)
If both representations are present in the same session, implementations MUST decode both into core payload bytes and MUST enforce:
- `core_qr == core_str` → proceed
- otherwise **STOP**

## Fields (conceptual)
The core payload contains:
- **Version** (1 byte)
- **Flags** (1 byte), including mnemonic word count, nesting layers, and an optional derivation-hint code
- **Threshold (k)** (2 bytes, encoding depends on nesting mode)
- **Share index (x)** (2 bytes, encoding depends on nesting mode)
- **Session Batch ID** (8 bytes, random per sharing session)
- **Blinded Identity** (8 bytes)
- **Share data** (variable length, packed 12-bit values for words + row checksums + GIC)
- **Transport Hash** (16 bytes)

The precise packing rules for the share data (words, row checksums, GIC) are defined in `manual_spec/`.

## Session Batch ID
- MUST be generated using a cryptographically secure RNG.
- MUST be identical across all shares in the same sharing session.
- Purpose: prevents accidental mixing of shares from different sessions.

## Blinded Identity
Purpose: binds the shares to a wallet identity to detect substitution/mixing.

Baseline definition:
- Compute a wallet fingerprint from the mnemonic using standard BIP39/BIP32 derivation.
- Compute:

\[
blinded\_identity = Trunc64(HMAC\_SHA256(key=fingerprint, msg=batch\_id))
\]

Where `Trunc64` takes the first 8 bytes.

Validation:
- After recovery, implementations MUST derive the fingerprint from the recovered mnemonic and recompute the expected blinded identity.
- If it does not match the payload’s blinded identity: **WARN** (strong warning; implementations MAY block export by default and require explicit override).

## Transport Hash
Purpose: detect accidental corruption of the digital payload.

Baseline definition:
- `transport_hash = Trunc128(SHA256(core_payload_without_transport_hash))`
- Stored as 16 bytes (first 16 bytes of SHA-256 digest).

Validation:
- On QR/Bech32m input, implementations MUST recompute and compare using constant-time comparison.
- Mismatch is **STOP**.

## Decode + validation pipeline (recommended)
1) **Decode** QR or Bech32m into core payload bytes.
2) **Parse** fields; validate version and lengths.
3) **Transport validation** (STOP on mismatch).
4) **Set-level metadata validation**:
   - Batch ID MUST match across the \(k\) shares used.
   - Blinded Identity MUST match across the \(k\) shares used.
   - Word count and threshold MUST match across the \(k\) shares used.
   - Any mismatch is **STOP**.
5) **Arithmetic validation**: validate row checksums and Printed GIC binding (see `manual_spec/` for semantics). Any failure is **STOP**.
6) **Recover** by interpolation (see `manual_spec/`).
7) **Identity binding validation** (WARN on mismatch).
8) **Final mnemonic validation** (BIP39 checksum is WARN if failing; see `manual_spec/` Electrum note).

## Versioning rules
- Implementations MUST refuse unknown versions by default (**STOP**) unless explicitly documented as supported.
- New versions MUST remain backwards-decodable where possible, and must document migration.

## Conformance
Implementations MUST validate against canonical vectors in `test_vectors/`.


