# Schiavinato Sharing — Software Specification (`software_spec`)

> ## ⚠️ WARNING: EXPERIMENTAL SOFTWARE ⚠️
> 
>DO NOT USE IT FOR REAL FUNDS!
>
> Schiavinato Sharing specification and implementations have NOT been audited. Use for testing, learning, and experimentation only. See [SECURITY](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md) for details.
>
>We invite **cryptographers** and **developers** to review the spec and software. See [CONTRIBUTING](https://github.com/GRIFORTIS/.github/blob/main/CONTRIBUTING.md) to know more.

This document defines the **digital envelope** for Schiavinato Sharing (v0.6.0): wire formats that encode a single share for computational transport, plus decode and validation rules.

Normative keywords **MUST**, **MUST NOT**, **SHOULD**, **MAY** are used as requirements.

## Scope
This spec covers:
- Two payload profiles: **Full Mode** and **Reduced Mode**
- Core payload wire formats (fields, sizes, and encodings) for each mode
- QR byte-mode transport with self-identifying prefixes
- Transport integrity checks (Transport Hash, Full Mode only)
- Session and identity binding metadata (Session Batch ID + Blinded Identity)
- Master Key Identifier (MKI) derivation and Blinded Identity computation
- Software-assisted ceremony trust boundaries, resume modes, and coefficient sourcing
- Share manifest QR payloads (Header QR and per-share Audit QR)
- Artifact rendering, transcription validation, printer-tier rules, and cleanup
- Decode and validation pipeline
- Versioning and backwards decode rules

All \(GF(2053)\) math and arithmetic validation semantics (rows, row checksums, column checksums, GIC, and STOP/WARN/INFO) are canonical in `manual_spec/`.

Non-normative v0.6.0 implementation flow diagrams are available in [`../docs/software-flows/`](../docs/software-flows/). They illustrate the ceremony sequence and operational constraints, but this specification remains authoritative if there is any conflict.

## Terminology
- **Core Payload**: the protocol-defined bytes for one share (no QR prefix).
- **QR bytes**: raw byte-mode QR payload bytes (self-identifying prefix + core payload).
- **Printed GIC**: the share-bound Global Integrity Check as defined in `manual_spec/`. This is the only arithmetic value serialized in the digital envelope; row and column checksums are computed from the share data for human-readable display but are **not** serialized.
- **Resume artifact**: temporary ceremony-continuity material used only to resume interrupted share generation. It is not a recovery input and MUST be destroyed or separately secured after successful share creation and validation.
- **Share Manifest**: long-term audit/inventory material. It contains no plaintext shares, but it is operationally sensitive and MUST be stored separately from all shares.

## Artifact classes and metadata placement

Implementations SHOULD distinguish three artifact classes:

1. **Arithmetic share content**: the word-share values and Printed GIC carried by the share, with row/column checksums derived for display or validation as needed.
2. **Share-local recovery metadata**: human-readable recovery hints such as derivation hint, passphrase indicator/hint, and RVA. These are outside the Core Payload, except that the flags byte may carry a coarse wallet-class hint. If RVA-based verification is relied upon, sufficient wallet-context hint SHOULD be rendered/exported with each share artifact or otherwise be recoverable from any valid threshold set.
3. **Manifest-only or manifest-aggregated metadata**: cross-share/session artifacts such as manifest header data, per-share Audit Hashes, optional share-number-to-GIC lists, and custody/location notes. This metadata is operationally useful but SHOULD remain separate from all shares. If a manifest aggregates at least \(k\) distinct Printed GIC values from one session, it reveals one linear relation of the mnemonic over \(GF(2053)\). This is one \(GF(2053)\)-valued quantity, so the leakage is upper-bounded by \(\log_2(2053) \approx 11.0035\) bits.

## Software-assisted ceremony boundary

Software-assisted sharing is split across two application roles:

- **Air-Gapped App**: runs on the air-gapped ceremony device. It holds the mnemonic, generates or decrypts coefficient material, evaluates shares, and produces all secret-bearing output. It MUST NOT touch a network or any untrusted peripheral.
- **Companion App**: runs on a separate non-air-gapped device. It MAY handle only ciphertext resume artifacts and non-secret but operationally sensitive print payloads such as manifest metadata, Audit QRs, and blank templates. It MUST NOT see the mnemonic, plaintext coefficients, plaintext shares, the Encryption Passphrase, or decrypted resume material.

Encrypted resume artifacts are not plaintext shares and are not sufficient by themselves to recover the mnemonic. However, after shares exist, decrypted coefficient material or decrypted Single-Entropy material combined with a corresponding share can reconstruct protected word values. Implementations MUST treat resume artifacts as high-value sensitive material during the ceremony and MUST delete application-managed copies after successful share creation and validation.

### Setup inputs

Before mnemonic entry, implementations collect non-secret setup context:

- Backup label/date and original seed length \(\ell \in \{12,15,18,21,24\}\).
- Wallet type / derivation hint, mapped to the flags-byte wallet-class code when applicable. This is only a coarse hint; full wallet context remains share-local or manifest metadata.
- BIP39 passphrase presence and optional hint/reference. The BIP39 passphrase itself MUST NOT enter Schiavinato share math or payload encoding.
- Optional Recovery Verification Address (RVA), recorded as the first 8 and last 8 characters of the intended target-wallet address. If the wallet uses a BIP39 passphrase, the RVA MAY be derived after entering that passphrase so that it verifies the final wallet context.
- Threshold topology, payload profile (Full or Reduced), printer tier, and resume mode.

## Resume modes and coefficient sourcing

Resume mode selection is filtered by payload profile:

- **Full Mode**: Digital Resume, Hand Transcribed Table, or No Resume.
- **Reduced Mode**: Digital Resume, Hand Transcribed QR, or No Resume.

Resume is mid-ceremony continuity only. Recovery reconstructs the mnemonic from shares and MUST NOT consume resume artifacts.

### Encryption passphrase

Digital Resume and Hand Transcribed QR require an **Encryption Passphrase** immediately before encrypting the resume artifact. This passphrase is distinct from any BIP39 passphrase:

- The BIP39 passphrase is external wallet-recovery metadata and MUST NOT enter the device's secret-handling code.
- The Encryption Passphrase exists only for the ceremony lifecycle and is destroyed with the working materials.
- Reusing a BIP39 passphrase as the Encryption Passphrase is strongly discouraged.

User-facing guidance SHOULD ask for a temporary ceremony passphrase, preferably a memorable phrase of 5-7 unrelated words, entered twice. Strength indicators SHOULD reward length and unpredictability rather than symbol-composition rules.

### Resume encryption envelope

Encrypted resume artifacts SHOULD use:

- Passphrase-to-key: Argon2id with a random salt. If Argon2id is unavailable on a target platform, scrypt is an acceptable fallback.
- Encryption: XChaCha20-Poly1305. If XChaCha20-Poly1305 is unavailable, AES-256-GCM is an acceptable fallback.
- Artifact contents: version number, algorithm identifiers, KDF parameters, random salt, random nonce, ciphertext, and authentication tag.
- Authenticated data SHOULD bind non-secret context: protocol version, resume artifact type, word count, scheme, sharing mode, and resume mode.

Failed decryption or authentication is a **STOP** condition. Implementations MUST show a wrong-passphrase-or-corrupted-artifact error and MUST NOT reveal partial decrypted data.

### Resume mode branches

- **Digital Resume**: generate a system-CSPRNG True Random coefficient pool before mnemonic entry. The pool SHOULD be sized with enough spare coefficient sets to make Reduced Mode pool exhaustion practically impossible; the source-of-truth profile uses about 50 spare sets for a 24-word, 3-of-5 configuration, yielding exhaustion probability below \(10^{-9}\). Coefficients are sampled from the full field range `0..2052`. Encrypt the pool with the Encryption Passphrase and offer QR plus plain-text export.
- **Hand Transcribed Table** (Full Mode only): generate True Random coefficients with CSPRNG and display one 4-column coefficient table per coefficient slot, including row checksums, column checksums, and a coefficient-table GIC. The user transcribes the plaintext paper table and re-enters it for verification. No Encryption Passphrase is used.
- **Hand Transcribed QR** (Reduced Mode only): generate a 256-bit Single-Entropy value with CSPRNG. Encrypt it with the Encryption Passphrase and display it as a compact QR, alongside human-readable Extra Data such as scheme/layers/k/n. The user paints/transcribes the QR and verifies by re-scanning plus Extra Data re-entry.
- **No Resume**: generate True Random coefficients in RAM only. No artifact is produced and no Encryption Passphrase is requested.

Single-Entropy is used only in Hand Transcribed QR. Every other resume mode uses True Random coefficients.

### Share evaluation and Reduced Mode rejection

For each protected word value \(w_i\), the Air-Gapped App builds:

\[
f_{w_i}(X) = w_i + a_{i,1}X + \cdots + a_{i,k-1}X^{k-1} \pmod{2053}
\]

using coefficients sourced from the selected resume mode, then evaluates at all selected share indices.

- **True Random path** (Digital Resume / Hand Transcribed Table / No Resume): if Reduced Mode is selected and any evaluated word share is in `2048..2052`, the implementation discards that word polynomial and selects the next coefficient set. Digital Resume consumes the pre-generated pool in a fixed left-to-right order so replay with the same decrypted pool and mnemonic yields identical shares. No Resume re-rolls fresh CSPRNG values. Hand Transcribed Table is Full Mode only.
- **Single-Entropy path** (Hand Transcribed QR only): coefficients are derived deterministically as `HMAC-SHA256(key = Single-Entropy, msg = scheme || word_i || coefficient_index_j || Position) mod 2053`, with `Position = 0` initially. If Reduced Mode rejection occurs, increment `Position` and re-derive the entire word polynomial.
- **Full Mode**: no range rejection is needed; all \(GF(2053)\) values in `0..2052` are valid.

For nested use, the same process applies layer by layer, with a completed share or canonical parent payload from one layer becoming the protected object of the next.

## Payload profiles

Two profiles balance security, payload size, and manual transcribability:

| Property | Full Mode | Reduced Mode |
|----------|-----------|--------------|
| Word-share range | \(\{0, \ldots, 2052\}\) (12-bit) | \(\{0, \ldots, 2047\}\) (11-bit)\* |
| QR grid | 37×37 (V5) | 29×29 (V3) |
| Verification layers | Linear consistency + Transport + BI/RVA | Linear consistency + BI/RVA |
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
- Version `0x01` corresponds to the v0.6.0 wire format specified here.

### Flags byte
Reference layout:
- Bits 0–2: word count code (0=12, 1=15, 2=18, 3=21, 4=24)
- Bits 3–4: nesting layers
  - Full Mode: 0=standard, 1=2 layers, 2=3 layers, 3=4 layers
  - Reduced Mode: bit 3 only (0=standard, 1=2 layers); bit 4 MUST be zero
- Bits 5–7: wallet type / derivation hint
  - 000: Generic / Custom (see share-local recovery note or manifest)
  - 001: Bitcoin Native SegWit (BIP84)
  - 010: Bitcoin Taproot (BIP86)
  - 011: Bitcoin Nested SegWit (BIP49)
  - 100: Bitcoin Legacy (BIP44)
  - 101: Ethereum / EVM (BIP44)
  - 110: Hardware wallet multi (Ledger/Trezor default)
  - 111: Reserved (MUST be zero)

These 3 bits are a coarse wallet-class hint only. They do not replace the fuller wallet-context hint needed for RVA verification.

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

## Verification architecture

**Full Mode:**
1. **Linear consistency layer**: row checksums, column checksums, and GIC detect passive arithmetic, transcription, and share-number errors. The digital envelope serializes the printed GIC only; software recomputes row and column checks from the share data.
2. **Transport Hash**: the 16-byte hash validates physical integrity of the digital envelope before recovery processing.
3. **Post-recovery verification**: Blinded Identity and RVA checks detect wrong mnemonic or wallet-context substitution when their metadata is available.

**Reduced Mode:**
1. **Linear consistency layer**: same arithmetic checks as Full Mode. Transport integrity relies on QR error correction plus GIC validation (\(1 - 1/2053 \approx 99.95\%\)).
2. **Post-recovery verification**: Blinded Identity and RVA checks provide the same categories of substitution detection, with an 8-byte Blinded Identity tag in Reduced Mode.

## Artifact rendering and transcription validation

Each share artifact SHOULD render:

- Backup name/label and creation date, if provided.
- Session Batch ID.
- Original seed length.
- Required threshold \(k\).
- Share number \(x\)-of-\(n\).
- Nested parent-layer metadata, if applicable: one block per ancestor layer, ordered from immediate parent toward layer zero, containing parent threshold and parent share number.
- Optional recovery hints: BIP39 passphrase presence/hint, wallet type or derivation hint, and RVA.
- Human-readable table: word-share values and row checksums, plus a footer row containing the three column checksums and the printed GIC.
- Share payload QR, and optional implementation-specific text export if supported.

The protocol has a canonical binary form (Core Payload bytes), a primary visual transport (QR bytes), and a human-readable share table for full manual recovery. QR and optional text export are not recovery requirements. A share remains recoverable from the human-readable table alone, but skipping the digital envelope removes pre-recovery software checks such as Transport Hash, manifest Audit Hash, and QR-based GIC binding validation.

If secret-bearing fields are hand-transcribed, implementations MUST require one of the following final validations before the ceremony is considered complete:

- **Software-assisted validation (recommended)**: clear the original display and require re-entry, QR re-scan, or import of the optional text export to verify the transcribed artifact matches the generated session.
- **Manual arithmetic validation**: validate every row checksum, every column checksum, and the printed GIC using the equations in `manual_spec/`.

## Share manifest QR payloads (software-generated sessions)

The manifest carries two types of QR codes. Neither contains plaintext secret shares, but both remain operationally sensitive. Conservative deployments SHOULD prefer trusted peripherals when practical, and any printed manifest artifacts MUST be stored separately from all shares.

The manifest is intended for cross-share/session tracking, not as the sole carrier of share-local recovery hints. If implementations print or export manifest artifacts, they SHOULD keep them separate from the shares themselves. If RVA-based verification is expected, the manifest SHOULD NOT be the only place where wallet context is recorded.

Manifest human-readable content SHOULD include:

- Session metadata such as backup name/date, Session Batch ID, and Blinded Identity.
- Wallet and derivation context: BIP39 passphrase presence/hint, wallet type, derivation path, and RVA.
- Scheme metadata, including nested threshold summary when applicable.
- Per-share list mapping share number to printed GIC, plus blank custodian/storage fields.

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

Purpose: per-share integrity commitment. Enables pre-recovery verification that a share's digital envelope is unchanged since the original session.

- Prefix: ASCII `SA` (0x53 0x41)
- Content:
  - Protocol Version: 1 byte (0x01)
  - Threshold \(k\): 2 bytes (Full) / 1 byte (Reduced) — same layer-dependent packing as share payload
  - Share Index \(x\): 2 bytes (Full) / 1 byte (Reduced)
  - Audit Hash: full SHA-256(Core Payload) = 32 bytes (Full) / first 16 bytes of SHA-256(Core Payload) = 16 bytes (Reduced)
- Total payload:
  - Full Mode: 2 + 1 + 2 + 2 + 32 = 39 bytes → QR V3 (29×29), Error Level M
  - Reduced Mode: 2 + 1 + 1 + 1 + 16 = 21 bytes → QR V2 (25×25), Error Level M

The Printed GIC is NOT included in the Audit QR — the hash already covers the entire Core Payload (which includes the GIC).

### Per-share audit drill

The audit drill verifies one share without combining shares or recovering secrets:

1. Scan the Manifest Header QR to identify the session.
2. Scan the share payload QR. The device validates Transport Hash in Full Mode, GIC binding, and arithmetic checks, then displays the share data.
3. Visually compare the on-screen data against the paper share.
4. Compute SHA-256(Core Payload) from the scanned share.
5. Scan the corresponding Audit QR from the separate manifest and compare the hash plus \(k\)/\(x\) fields.
6. A match confirms the share matches the original session artifact. Any mismatch is **STOP** and should trigger investigation, a full recovery drill, or fresh re-sharing.

Implementations SHOULD support periodic audit drills. The source-of-truth operational recommendation is at least once per year per share. Nested schemes use separate manifests and Audit QRs per layer.

### Manifest security notes

The manifest contains no plaintext secret shares, but it is operationally sensitive:

- A map containing at least \(k\) printed GIC values from one session reveals one \(GF(2053)\)-valued linear relation of the mnemonic, upper-bounded by about 11 bits.
- Audit Hashes are one-way commitments to Core Payload bytes. They do not enable per-word testing, but they are verification oracles for full candidate payloads.
- Session Batch ID, Blinded Identity, \(k\), \(x\), printed GIC maps, and Audit Hashes can assist targeting, share harvesting, or recovery sabotage if aggregated.

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

### RVA warning resolution

If the RVA does not match at the recorded/default wallet context, software SHOULD offer an offline scan across common wallet profiles before surfacing a final hard warning. Recommended default sweep:

- BIP44 Legacy, BIP49 Nested SegWit, BIP84 Native SegWit, and BIP86 Taproot.
- Account 0.
- Receive and change chains.
- First 50 indices on each chain.

If a match is found, software SHOULD display the matching wallet context and ask the user to confirm it, rather than silently overriding the recorded settings. This scan is a user-experience convenience only and does not replace recording derivation hints, passphrase references, and the intended RVA during setup.

### Draft-session edit model

Implementations SHOULD treat sharing and recovery flows as draft sessions until the user explicitly exports, prints, or confirms completion:

- Allow edit/remove of a single share without restarting the whole session.
- After edits, recompute from the last validated checkpoint: transport validation, per-share arithmetic validation, set-level metadata validation, then interpolation.
- Provide a reset-session action that clears all sensitive data and requires explicit confirmation.

## Runtime integrity assertion (MUST)

Implementations MUST run a double-check after all share data is generated and before any print/export/transcription step:
- **Path A**: recompute row checksums, column checksums, and GIC from the original polynomial coefficients in memory.
- **Path B**: recompute the same values from the generated share values using direct summation.
- If Path A and Path B disagree for any share: **STOP** — abort the session and refuse to output shares. This detects rendering bugs, bit flips, or memory corruption.

## Printer tiers and output rules

Printer choice changes only how a software-generated session leaves the air-gapped device. It does not change the share math or payload bytes.

### Tier definitions

- **Tier 1 — Offline non-network printer**: USB-only or otherwise non-networked printer directly attached to the air-gapped device. This is the only tier where secret-bearing material may be printed. Full Mode is recommended.
- **Tier 2 — Personal network-capable printer**: user-controlled printer with Wi-Fi, Ethernet, cloud print, stored jobs, or similar capabilities. Secret-bearing data MUST NOT be printed. Manifest metadata MAY be printed, accepting operational sensitivity. Reduced Mode is recommended when the secret-bearing QR must be hand-transcribed.
- **Tier 3 — Untrusted printer**: workplace, library, print shop, shared, or otherwise uncontrolled printer. Only blank structure may be printed. No Session Batch ID, Blinded Identity, printed GIC, Audit QR, or secret-bearing data should be sent to this tier.
- **Tier 4 — No printer**: all output is hand-transcribed from the air-gapped device display.

### What each tier may print

- **Tier 1**: complete share sheets, share payload QRs or optional text exports, all share header fields, and full manifest with Header QR and Audit QRs.
- **Tier 2**: share templates with non-secret fields and blank structure; manifest metadata including Session Batch ID, Blinded Identity, scheme metadata, per-share printed GIC rows, Header QR, Audit QRs, and blank custody fields. Secret-bearing share values, row checksums, column checksums, printed GIC on share sheets, and share payload QR/text export MUST be hand-transcribed.
- **Tier 3**: blank table grids, headers, row placeholders, recovery-hint labels, checkboxes, empty lines, optional blank QR overlays, and blank manifest structure only.
- **Tier 4**: nothing is printed.

### Required hand transcription

- **Tier 1**: no mandatory hand transcription beyond optional signatures or custodian notes.
- **Tier 2**: secret-bearing share content and private recovery metadata such as backup name, BIP39 passphrase hint/ref, wallet derivation note, RVA, share payload QR/text export, and signatures/marks.
- **Tier 3**: everything in Tier 2 plus all share-template metadata fields and all manifest metadata fields.
- **Tier 4**: everything.

## Cleanup and memory handling

Implementations MUST delete application-managed resume artifacts after successful share creation and transcription verification. They MUST require explicit user confirmation that externally held resume artifacts, such as paper coefficient tables, copied ciphertext, saved files, or Companion-held ciphertext, have been destroyed or scheduled for destruction.

Software SHOULD clear sensitive data from memory on session closure whenever the platform allows it. On browser, JavaScript, and general-purpose OS environments, this is best-effort only: garbage collection, memory copies, swap, crash dumps, printer/scanner buffers, and device firmware may retain data outside the application's control. Stronger memory guarantees require purpose-built native or hardware implementations and are part of the trusted-device assumption.

## Versioning rules
- Implementations MUST refuse unknown version bytes by default (**STOP**) unless explicitly documented as supported.
- New versions MUST remain backwards-decodable where possible, and MUST document migration.

## Conformance
Implementations MUST validate against canonical vectors in `test_vectors/`.
