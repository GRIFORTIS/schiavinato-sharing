# Schiavinato Sharing — Software Specification (`software_spec`)

> ## ⚠️ WARNING: EXPERIMENTAL SOFTWARE ⚠️
> 
>DO NOT USE IT FOR REAL FUNDS!
>
> Schiavinato Sharing specification and implementations have NOT been audited. Use for testing, learning, and experimentation only. See [SECURITY](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md) for details.
>
>We invite **cryptographers** and **developers** to review the spec and software. See [CONTRIBUTING](https://github.com/GRIFORTIS/.github/blob/main/CONTRIBUTING.md) to know more.

This document defines the **digital envelope** for Schiavinato Sharing (v0.5.0): wire formats that encode a single share for computational transport, plus decode and validation rules.

Normative keywords **MUST**, **MUST NOT**, **SHOULD**, **MAY** are used as requirements.

## Scope
This spec covers:
- Two payload profiles: **Full Mode** and **Reduced Mode**
- Core payload wire formats (fields, sizes, and encodings) for each mode
- QR byte-mode transport with self-identifying prefixes
- Transport integrity checks (Transport Hash, Full Mode only)
- Session and identity binding metadata (Session Batch ID + Blinded Identity)
- Master Key Identifier (MKI) derivation and Blinded Identity computation
- Share manifest QR payloads (Header QR and per-share Audit QR)
- Decode and validation pipeline
- Versioning and backwards decode rules

All \(GF(2053)\) math and arithmetic validation semantics (rows, row checksums, column checksums, GIC, and STOP/WARN/INFO) are canonical in `manual_spec/`.

## Terminology
- **Core Payload**: the protocol-defined bytes for one share (no QR prefix).
- **QR bytes**: raw byte-mode QR payload bytes (self-identifying prefix + core payload).
- **Printed GIC**: the share-bound Global Integrity Check as defined in `manual_spec/`. This is the only arithmetic value serialized in the digital payload; row and column checksums are computed from the share data for human-readable display but are **not** serialized.

## Payload profiles

Two profiles balance security, payload size, and manual transcribability:

| Property | Full Mode | Reduced Mode |
|----------|-----------|--------------|
| Word-share range | \(\{0, \ldots, 2052\}\) (12-bit) | \(\{0, \ldots, 2047\}\) (11-bit)\* |
| QR grid | 37×37 (V5) | 29×29 (V3) |
| Integrity model | Triple-Lock | Dual-Lock |
| Transport Hash | 16 bytes (SHA-256) | Omitted\*\* |
| Blinded Identity | 12 bytes (\(\sim 2^{96}\)) | 8 bytes (\(\sim 2^{64}\)) |
| Session Batch ID | 8 bytes | 4 bytes |
| Nesting depth | Up to 4 layers | Up to 2 layers |
| QR prefix | ASCII `SCHI` (4 bytes) | ASCII `SC` (2 bytes) |

\* Share-bound GIC remains 12-bit (\(GF(2053)\)). Word polynomials producing any share value > 2047 are rejected and regenerated.

\*\* Transport integrity relies on QR error correction and GIC validation (\(1 - 1/2053 \approx 99.95\%\)). The saved bytes are reallocated to the Blinded Identity (8 bytes instead of the 4 that would result from a straight payload shrink).

Full Mode is recommended for long-term, high-value custody. Reduced Mode is intended as an accessible alternative for short-term or budget-constrained use where manual QR transcription is required.

## Shared elements

### Version byte
- Version `0x01` corresponds to the v0.5.0 wire format specified here.

### Flags byte
Reference layout:
- Bits 0–2: word count code (0=12, 1=15, 2=18, 3=21, 4=24)
- Bits 3–4: nesting layers
  - Full Mode: 0=standard, 1=2 layers, 2=3 layers, 3=4 layers
  - Reduced Mode: bit 3 only (0=standard, 1=2 layers); bit 4 MUST be zero
- Bits 5–7: wallet type / derivation hint
  - 000: Generic / Custom (see share manifest or out-of-band note)
  - 001: Bitcoin Native SegWit (BIP84)
  - 010: Bitcoin Taproot (BIP86)
  - 011: Bitcoin Nested SegWit (BIP49)
  - 100: Bitcoin Legacy (BIP44)
  - 101: Ethereum / EVM (BIP44)
  - 110: Hardware wallet multi (Ledger/Trezor default)
  - 111: Reserved (MUST be zero)

### Threshold \(k\) and share index \(x\) encoding

These fields support nested sharing via byte/bitfield packing. Let `depth` be the nesting value from the flags byte.

**Full Mode** (2 bytes each for \(k\) and \(x\)):

- `depth = 0` (1 layer): byte[0] = `layer0` (1..255), byte[1] MUST be 0
- `depth = 1` (2 layers): byte[0] = `layer0` (1..255), byte[1] = `layer1` (1..255)
- `depth = 2` (3 layers, nibble-packed): byte[0] low = `layer0` (1..16), byte[0] high = `layer1` (1..16), byte[1] low = `layer2` (1..16), byte[1] high MUST be 0
- `depth = 3` (4 layers, nibble-packed): byte[0] low = `layer0` (1..16), byte[0] high = `layer1` (1..16), byte[1] low = `layer2` (1..16), byte[1] high = `layer3` (1..16)

**Reduced Mode** (1 byte each for \(k\) and \(x\)):

- `depth = 0` (1 layer): byte = `layer0` (1..255)
- `depth = 1` (2 layers, nibble-packed): low nibble = `layer0` (1..16), high nibble = `layer1` (1..16)

General constraints:
- All \(x\) values MUST be non-zero.
- Per layer, share indices used for recovery MUST be distinct.

## Full Mode core payload

### Layout

\[
\text{CorePayload} = \text{Header} \parallel B \parallel I \parallel \text{ShareData} \parallel H
\]

| Field | Offset | Size |
|-------|-------:|-----:|
| Protocol Version | 0 | 1 |
| Flags | 1 | 1 |
| Threshold \(k\) | 2 | 2 |
| Share Index \(x\) | 4 | 2 |
| Session Batch ID \(B\) | 6 | 8 |
| Blinded Identity \(I\) | 14 | 12 |
| Share Data | 26 | `share_data_len` |
| Transport Hash \(H\) | `26 + share_data_len` | 16 |

Total core payload length: `42 + share_data_len` bytes.

### Share data (12-bit packing)

ShareData encodes word shares and the printed GIC as 12-bit unsigned integers, MSB-first. Row and column checksums are **not** serialized.

Contents in order:
1. Word values \(w_1[x], \ldots, w_\ell[x]\)
2. \(GIC[x]\)

The number of packed elements is \(\ell + 1\).

| \(\ell\) | Elements | Bits | Pad | `share_data_len` |
|---:|---:|---:|---:|---:|
| 12 | 13 | 156 | 4 | 20 |
| 15 | 16 | 192 | 0 | 24 |
| 18 | 19 | 228 | 4 | 29 |
| 21 | 22 | 264 | 0 | 33 |
| 24 | 25 | 300 | 4 | 38 |

### Total core payload sizes

| \(\ell\) | `share_data_len` | Core Payload | QR Payload (prefix + core) |
|---:|---:|---:|---:|
| 12 | 20 | 62 | 66 |
| 15 | 24 | 66 | 70 |
| 18 | 29 | 71 | 75 |
| 21 | 33 | 75 | 79 |
| 24 | 38 | 80 | 84 |

QR version: V5 (37×37), error correction level M (byte-mode capacity: 84 bytes).

### Transport Hash

- `transport_hash = Trunc128(SHA-256(Header || BatchID || BlindedIdentity || ShareData))`
- Stored as 16 bytes (first 16 bytes of SHA-256 digest).
- On decode, implementations MUST recompute and compare using constant-time comparison.
- Mismatch is **STOP**.

### QR encoding

- Mode: byte mode (QR encodes bytes directly).
- Content: ASCII `SCHI` (0x53 0x43 0x48 0x49) followed by the core payload bytes.

## Reduced Mode core payload

### Layout

\[
\text{CorePayload} = \text{Header} \parallel B \parallel I \parallel \text{ShareData}
\]

No Transport Hash. Transport integrity relies on QR error correction and GIC validation.

| Field | Offset | Size |
|-------|-------:|-----:|
| Protocol Version | 0 | 1 |
| Flags | 1 | 1 |
| Threshold \(k\) | 2 | 1 |
| Share Index \(x\) | 3 | 1 |
| Session Batch ID \(B\) | 4 | 4 |
| Blinded Identity \(I\) | 8 | 8 |
| Share Data | 16 | `share_data_len` |

Total core payload length: `16 + share_data_len` bytes.

### Share data (mixed-width packing)

Word shares are encoded as 11-bit unsigned integers; the printed GIC is encoded as 12-bit. All values MSB-first, concatenated and padded to the next full byte with zero bits.

Rejection rule: during sharing, any word polynomial whose evaluation at any share index produces a value > 2047 MUST be rejected and regenerated. The printed GIC is not subject to this restriction (it remains a full \(GF(2053)\) value).

Contents in order:
1. Word values \(w_1[x], \ldots, w_\ell[x]\) — 11 bits each
2. \(GIC[x]\) — 12 bits

| \(\ell\) | Word bits | GIC bits | Total bits | Pad | `share_data_len` |
|---:|---:|---:|---:|---:|---:|
| 12 | 132 | 12 | 144 | 0 | 18 |
| 15 | 165 | 12 | 177 | 7 | 23 |
| 18 | 198 | 12 | 210 | 6 | 27 |
| 21 | 231 | 12 | 243 | 5 | 31 |
| 24 | 264 | 12 | 276 | 4 | 35 |

### Total core payload sizes

| \(\ell\) | `share_data_len` | Core Payload | QR Payload (prefix + core) |
|---:|---:|---:|---:|
| 12 | 18 | 34 | 36 |
| 15 | 23 | 39 | 41 |
| 18 | 27 | 43 | 45 |
| 21 | 31 | 47 | 49 |
| 24 | 35 | 51 | 53 |

QR version: V3 (29×29). Error correction: Level M for 12/15 words (capacity 42 bytes); Level L for 18/21/24 words (capacity 53 bytes).

### QR encoding

- Mode: byte mode.
- Content: ASCII `SC` (0x53 0x43) followed by the core payload bytes.

## QR prefix decode rule

Decoders MUST inspect the leading bytes of QR input:
- If it starts with ASCII `SCHI` (0x53 0x43 0x48 0x49): strip the 4-byte prefix → Full Mode core payload.
- If it starts with ASCII `SC` (0x53 0x43) and does **not** continue with `HI`: strip the 2-byte prefix → Reduced Mode core payload.
- Otherwise: treat the raw bytes as the core payload directly and infer the mode from payload length/structure.

## Session Batch ID
- MUST be generated using a cryptographically secure RNG.
- MUST be identical across all shares in the same sharing session.
- Full Mode: 8 bytes. Reduced Mode: 4 bytes.
- Purpose: prevents accidental mixing of shares from different sessions.

## Master Key Identifier (MKI)

The MKI is the HMAC key used to compute the Blinded Identity. It is internal only and MUST NOT appear on shares or in any payload.

Derivation (byte-exact):
1. Derive the BIP39 seed from (mnemonic, empty passphrase) per BIP39.
2. Derive the BIP32 master key and its **compressed** master public key (33 bytes).
3. Compute `MKI = RIPEMD-160(SHA-256(compressed_master_public_key))` — 20 bytes.

This is the same intermediate value used to derive the standard 4-byte BIP32 master key fingerprint, but Schiavinato Sharing uses the full 20 bytes. Using the full 20 bytes ensures the HMAC key space (\(2^{160}\)) is not the security bottleneck; with a 4-byte key, an adversary could enumerate all \(2^{32}\) possible keys in seconds.

## Blinded Identity

Purpose: binds the shares to a mnemonic identity to detect substitution/mixing.

Computation:
\[
\text{BI} = \text{Trunc}_b\bigl(\text{HMAC-SHA256}(\text{key} = \text{MKI},\; \text{msg} = \text{SessionBatchID})\bigr)
\]

- Full Mode: \(b = 96\) bits (12 bytes, \(\sim 2^{96}\) brute-force cost).
- Reduced Mode: \(b = 64\) bits (8 bytes, \(\sim 2^{64}\) brute-force cost).

The MKI is derived with empty BIP39 passphrase. This binding is mnemonic-only and does not validate any external BIP39 passphrase.

Validation:
- After recovery, implementations MUST derive MKI from the recovered mnemonic and recompute the expected BI.
- If it does not match the payload's BI: **WARN** (strong warning; implementations MAY block export by default and require explicit override).

## Integrity architecture

**Full Mode — Triple-Lock:**
1. **Arithmetic Lock**: row checksums, column checksums, and GIC (human-readable; software recomputes from share data). Digital payload serializes GIC only.
2. **Transport Lock**: Transport Hash (16 bytes) validates physical integrity of the digital envelope.
3. **Identity Lock**: Blinded Identity (12 bytes) binds shares to a specific mnemonic identity.

**Reduced Mode — Dual-Lock:**
1. **Arithmetic Lock**: same as Full Mode. Transport integrity relies on QR error correction combined with GIC validation (\(1 - 1/2053 \approx 99.95\%\)).
2. **Identity Lock**: Blinded Identity (8 bytes) binds shares to the mnemonic identity.

## Share manifest QR payloads (software-generated sessions)

The manifest carries two types of QR codes. Neither contains secret material; both MAY be printed on an untrusted printer.

### Manifest Header QR (one per manifest)

Purpose: session identification. Enables software to match shares to their originating session.

- Prefix: ASCII `SM` (0x53 0x4D)
- Content:
  - Protocol Version: 1 byte (0x01)
  - Flags: 1 byte (same encoding as share payload)
  - Session Batch ID: 8 bytes (Full) / 4 bytes (Reduced)
  - Blinded Identity: 12 bytes (Full) / 8 bytes (Reduced)
- Total payload:
  - Full Mode: 2 + 1 + 1 + 8 + 12 = 24 bytes → QR V2 (25×25), Error Level M
  - Reduced Mode: 2 + 1 + 1 + 4 + 8 = 16 bytes → QR V1 (21×21), Error Level L

### Per-share Audit QR (one per share on the manifest)

Purpose: per-share integrity commitment. Enables pre-recovery verification that a share's digital payload is unchanged since the original session.

- Prefix: ASCII `SA` (0x53 0x41)
- Content:
  - Threshold \(k\): 2 bytes (Full) / 1 byte (Reduced) — same layer-dependent packing as share payload
  - Share Index \(x\): 2 bytes (Full) / 1 byte (Reduced)
  - Audit Hash: full SHA-256(Core Payload) = 32 bytes (Full) / first 16 bytes of SHA-256(Core Payload) = 16 bytes (Reduced)
- Total payload:
  - Full Mode: 2 + 2 + 2 + 32 = 38 bytes → QR V3 (29×29), Error Level M
  - Reduced Mode: 2 + 1 + 1 + 16 = 20 bytes → QR V2 (25×25), Error Level M

The Printed GIC is NOT included in the Audit QR — the hash already covers the entire Core Payload (which includes the GIC).

## Optional text export (intentionally unspecified)

- The canonical digital object is the **Core Payload** bytes.
- Implementations MAY offer an optional text export/import encoding of the Core Payload bytes.
- The standard text encoding is intentionally left unspecified.
- Manual recovery MUST NOT depend on any text export format.
- If an implementation offers both QR and a text export, both MUST round-trip to the exact same Core Payload bytes.

## Decode + validation pipeline

1. **Decode** QR (strip prefix per the QR prefix decode rule) or import text into core payload bytes.
2. **Parse** fields; validate version byte and field lengths for the detected mode.
3. **Transport validation** (Full Mode only; **STOP** on mismatch). Reduced Mode: skip.
4. **Manifest audit** (if a manifest is loaded): recompute SHA-256(Core Payload) and compare against the manifest's Audit Hash for that share. Mismatch is **STOP**.
5. **Set-level metadata validation**:
   - Batch ID MUST match across the \(k\) shares used.
   - Word count and threshold MUST match across the \(k\) shares used.
   - Any mismatch is **STOP**.
6. **Arithmetic validation**: validate GIC consistency (including share-index binding), and recompute row/column checksums from the word values as defined in `manual_spec/`. Any failure is **STOP**.
7. **Recover** by interpolation (see `manual_spec/`).
8. **Identity binding validation**: recompute Blinded Identity from recovered mnemonic. Mismatch is **WARN**.
9. **Final mnemonic validation**: implementations MAY validate the standard BIP39 checksum and SHOULD treat failure as **WARN**.
10. **RVA verification** (if recorded): derive the target-wallet address and compare to the recorded RVA. Mismatch is **WARN**.

## Runtime integrity assertion (SHOULD)

Implementations SHOULD run a double-check after all share data is generated and before any print/export/transcription step:
- **Path A**: recompute row checksums, column checksums, and GIC from the original polynomial coefficients in memory.
- **Path B**: recompute the same values from the generated share values using direct summation.
- If Path A and Path B disagree for any share: **STOP** — abort the session and refuse to output shares. This detects rendering bugs, bit flips, or memory corruption.

## Versioning rules
- Implementations MUST refuse unknown version bytes by default (**STOP**) unless explicitly documented as supported.
- New versions MUST remain backwards-decodable where possible, and MUST document migration.

## Conformance
Implementations MUST validate against canonical vectors in `test_vectors/`.
