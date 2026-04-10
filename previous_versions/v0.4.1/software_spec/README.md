# Schiavinato Sharing — Software Specification v0.4.1 (Frozen)

> **This is a frozen archive of the v0.4.1 software specification.** It is preserved for reference only and MUST NOT be edited. The current live software spec is in [`../../../software_spec/README.md`](../../../software_spec/README.md).

> ## ⚠️ WARNING: EXPERIMENTAL SOFTWARE ⚠️
> 
>DO NOT USE IT FOR REAL FUNDS!
>
> Schiavinato Sharing specification and implementations have NOT been audited. Use for testing, learning, and experimentation only. See [SECURITY](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md) for details.
>
>We invite **cryptographers** and **developers** to review the spec and software. See [CONTRIBUTING](https://github.com/GRIFORTIS/.github/blob/main/CONTRIBUTING.md) to know more.

This document defines the **digital envelope** for Schiavinato Sharing: a wire format that encodes a single share for computational transport (QR bytes and Bech32m), plus decode and validation rules.

Normative keywords **MUST**, **MUST NOT**, **SHOULD**, **MAY** are used as requirements.

## Scope
This spec covers:
- Core payload wire format (fields, sizes, and encodings)
- QR bytes and Bech32m transport representations
- Transport integrity checks (Transport Hash)
- Session/identity binding metadata (Batch ID + Blinded Identity)
- Versioning and backwards decode rules

All \(GF(2053)\) math and arithmetic validation semantics (rows, row checksums, GIC, and STOP/WARN/INFO) are canonical in `manual_spec/`.

## Terminology
- **Core payload**: the protocol-defined bytes for one share (no QR prefix, not Bech32m).
- **QR bytes**: raw byte-mode QR payload bytes (may include a self-identifying prefix).
- **Bech32m string**: human-transcribable string encoding of the core payload bytes (BIP-350).

## Core payload (v0.4.1 baseline)
This baseline is intended to remain backwards-decodable and is aligned with the whitepaper reference encoding.

### Encoding overview
- **QR bytes**: byte-mode QR encoding of raw bytes.
- **Bech32m string**: Bech32m encoding of the same core payload bytes (BIP-350).
  - HRP: `schiavinato`

### Version byte
- Version `0x01` corresponds to the v0.4.x core payload wire format specified here.

### Flags byte
Reference layout:
- Bits 0–2: word count code (0=12, 1=15, 2=18, 3=21, 4=24)
- Bits 3–4: nesting layers (0=standard, 1=2 layers, 2=3 layers, 3=4 layers)
- Bits 5–7: wallet type / derivation hint
  - 000: Generic / Custom (see share manifest or out-of-band note)
  - 001: Bitcoin Native SegWit (BIP84)
  - 010: Bitcoin Taproot (BIP86)
  - 011: Bitcoin Nested SegWit (BIP49)
  - 100: Bitcoin Legacy (BIP44)
  - 101: Ethereum / EVM (BIP44)
  - 110: Hardware wallet multi (Ledger/Trezor default)
  - 111: Reserved

### QR prefix rule
If QR bytes begin with ASCII `SCHI` (`0x53 0x43 0x48 0x49`), implementations MUST strip the 4-byte prefix and treat the remainder as the core payload.

Decoders MUST accept both forms.

### Consistency rule (when both QR and Bech32m are provided)
If both representations are present in the same session, implementations MUST decode both into core payload bytes and MUST enforce:
- `core_qr == core_str` → proceed
- otherwise **STOP**

## Core payload layout (bytes)
The core payload is the concatenation:

\[
\text{CorePayload} = \text{HeaderBytes} \parallel B \parallel I \parallel \text{ShareDataBytes} \parallel H
\]

### Fields
- **HeaderBytes** (6 bytes):
  - Protocol version: 1 byte (`0x01`)
  - Flags: 1 byte
  - Threshold \(k\): 2 bytes, interpreted per nesting depth (from Flags bits 3–4)
  - Share index \(x\): 2 bytes, interpreted per nesting depth (from Flags bits 3–4)
- **Batch ID** \(B\): 8 bytes (random session identifier)
- **Blinded Identity** \(I\): 8 bytes
- **ShareDataBytes**: 12-bit packed share values (see below)
- **Transport Hash** \(H\): 16 bytes

#### Threshold \(k\) and share index \(x\) encoding (2 bytes each)
These 2-byte fields are **NOT** a big-endian integer. They are a byte/bitfield encoding that supports nested sharing.

Let `depth = (flags >> 3) & 0b11` (0..3).

- If `depth = 0` (standard, 1 layer):
  - \(k\): byte at offset 2 is `layer0_k` (1..255), byte at offset 3 MUST be 0
  - \(x\): byte at offset 4 is `layer0_x` (1..255), byte at offset 5 MUST be 0
- If `depth = 1` (2 layers):
  - \(k\): byte[2]=`layer0_k` (1..255), byte[3]=`layer1_k` (1..255)
  - \(x\): byte[4]=`layer0_x` (1..255), byte[5]=`layer1_x` (1..255)
- If `depth = 2` (3 layers, nibble-packed):
  - \(k\):
    - byte[2] low nibble = `layer0_k` (1..16), high nibble = `layer1_k` (1..16)
    - byte[3] low nibble = `layer2_k` (1..16), high nibble MUST be 0
  - \(x\): same packing and constraints as \(k\), using `layer*_x`
- If `depth = 3` (4 layers, nibble-packed):
  - \(k\):
    - byte[2] low nibble = `layer0_k` (1..16), high nibble = `layer1_k` (1..16)
    - byte[3] low nibble = `layer2_k` (1..16), high nibble = `layer3_k` (1..16)
  - \(x\): same packing and constraints as \(k\), using `layer*_x`

General constraints:
- All \(x\) values MUST be non-zero.
- Per layer, share indices used for recovery MUST be distinct.

### Offsets and sizes
Let `share_data_len` be the length of `ShareDataBytes` (see table below). Then:

| Field | Offset | Size |
|---|---:|---:|
| Protocol Version | 0 | 1 |
| Flags | 1 | 1 |
| Threshold (k) | 2 | 2 |
| Share Index (x) | 4 | 2 |
| Session Batch ID | 6 | 8 |
| Blinded Identity | 14 | 8 |
| Share Data | 22 | `share_data_len` |
| Transport Hash | `22 + share_data_len` | 16 |

Total core payload length is `38 + share_data_len` bytes.

### ShareDataBytes (12-bit packing)
ShareDataBytes encodes the share’s field elements (words, row checksums, and the per-share GIC) as 12-bit unsigned integers.

#### Contents and ordering
The elements MUST appear in this order:
1) word values \(w_1[x],\dots,w_\ell[x]\)
2) row checksum values \(c_1[x],\dots,c_r[x]\), where \(r=\ell/3\)
3) \(GIC[x]\)

The number of packed elements is \(\ell + r + 1\), for \(\ell \in \{12,15,18,21,24\}\).

#### Bit packing rule
- Each value is encoded as a 12-bit unsigned integer, MSB-first.
- All 12-bit values are concatenated in order.
- The concatenated bitstring MUST be padded with zero bits to the next full byte.

#### Lengths by word count
| Word count (\(\ell\)) | Row count (\(r\)) | Elements (\(\ell+r+1\)) | Bits | Pad bits | `share_data_len` |
|---:|---:|---:|---:|---:|---:|
| 12 | 4 | 17 | 204 | 4 | 26 |
| 15 | 5 | 21 | 252 | 4 | 32 |
| 18 | 6 | 25 | 300 | 4 | 38 |
| 21 | 7 | 29 | 348 | 4 | 44 |
| 24 | 8 | 33 | 396 | 4 | 50 |

## Session Batch ID
- MUST be generated using a cryptographically secure RNG.
- MUST be identical across all shares in the same sharing session.
- Purpose: prevents accidental mixing of shares from different sessions.

## Blinded Identity
Purpose: binds the shares to a wallet identity to detect substitution/mixing.

Baseline definition:
- Compute a wallet fingerprint from the mnemonic using standard BIP39/BIP32 derivation.
  - Fingerprint definition (byte-exact): **BIP32 master key fingerprint** (4 bytes) as defined by BIP32:
    - derive the BIP39 seed from (mnemonic, passphrase) per BIP39 (passphrase may be empty)
    - derive the BIP32 master key and its **compressed** master public key
    - compute `HASH160(compressed_master_public_key) = RIPEMD160(SHA256(pubkey_bytes))`
    - `fingerprint = HASH160(pubkey_bytes)[0:4]` (first 4 bytes)
  - The fingerprint is **not** included in the payload and **must not** be printed on shares.
- Compute:

\[
blinded\_identity = Trunc64(HMAC\_SHA256(key=fingerprint\_bytes, msg=batch\_id))
\]

Where `Trunc64` takes the first 8 bytes.
`fingerprint_bytes` is the 4 raw bytes above (not a hex string).

Validation:
- After recovery, implementations MUST derive the fingerprint from the recovered mnemonic and recompute the expected blinded identity.
- If it does not match the payload’s blinded identity: **WARN** (strong warning; implementations MAY block export by default and require explicit override).

## Transport Hash
Purpose: detect accidental corruption of the digital payload.

Baseline definition:
- `transport_hash = Trunc128(SHA256(HeaderBytes || BatchID || BlindedIdentity || ShareDataBytes))`
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
   - Word count and threshold MUST match across the \(k\) shares used.
   - Any mismatch is **STOP**.
5) **Arithmetic validation**: validate row checksums and GIC consistency (including share-index binding, as defined in `manual_spec/`). Any failure is **STOP**.
6) **Recover** by interpolation (see `manual_spec/`).
7) **Identity binding validation** (WARN on mismatch).
8) **Final mnemonic validation**: implementations MAY validate the standard BIP39 checksum and SHOULD treat failure as **WARN** (often indicates a transcription/recovery error, but may be inapplicable for non-BIP39 mnemonics that resemble BIP39).

## Versioning rules
- Implementations MUST refuse unknown versions by default (**STOP**) unless explicitly documented as supported.
- New versions MUST remain backwards-decodable where possible, and must document migration.

## Conformance
Implementations MUST validate against canonical vectors in `test_vectors/`.


