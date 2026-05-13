# Schiavinato Sharing — Manual Specification (`manual_spec`)

[Jump to Manual recovery](#manual-recovery)

> ## ⚠️ WARNING: EXPERIMENTAL SOFTWARE ⚠️
> 
>DO NOT USE IT FOR REAL FUNDS!
>
> Schiavinato Sharing specification and implementations have NOT been audited. Use for testing, learning, and experimentation only. See [SECURITY](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md) for details.
>
>We invite **cryptographers** and **developers** to review the spec and software. See [CONTRIBUTING](https://github.com/GRIFORTIS/.github/blob/main/CONTRIBUTING.md) to know more.

This document defines the manual execution protocol for Schiavinato Sharing (v0.5.0).

Normative keywords **MUST**, **MUST NOT**, **SHOULD**, **MAY** are used as requirements.

For ease of reference in time-critical scenarios, the recovery procedure appears first.

## Scope
This spec defines:
- Field math requirements and representations
- Paper share semantics (rows, row checksums, column checksums, Global Integrity Check (GIC), and required header fields)
- Manual share generation and manual recovery procedures
- Validation + failure semantics (**STOP / WARN / INFO**) to prevent silent mistakes

Everything related to digital envelopes (QR / payload encoding / metadata bytes) is specified in `software_spec/`.

## Non-negotiable constraints
- **1-based BIP39 word indexing** MUST be used throughout: `abandon = 1`, `zoo = 2048`.
- The input and final recovered mnemonic indices MUST be in \(\{1,\dots,2048\}\).
- The scheme operates in the prime field **\(GF(2053)\)** (modulus \(p = 2053\), the smallest prime exceeding 2048).
- Threshold \((k, n)\) with \(2 \leq k \leq n \leq 2052\); share indices MUST be distinct nonzero elements of \(GF(2053)\). See [Nesting](#nesting) for \(k = 1\).
- The **BIP39 passphrase** ("25th word") is **NOT** stored or recovered. It MUST be backed up separately and re-entered at wallet restore, if necessary.
- Share payload values are computed in \(GF(2053)\), so intermediate/share values MAY be in \(\{0,2049,2050,2051,2052\}\). These MUST be represented as indices (not mapped to BIP39 words).
- Supported BIP39 word counts are \(\ell \in \{12,15,18,21,24\}\).
- Nested sharing is possible; arithmetic is identical per layer. See [Nesting](#nesting).

## Conventions (human-readable encoding)
### Indices-first rule
- The canonical value representation is its **index** (a decimal integer).
- A word label MAY be appended as an annotation (for usability), in any language.

Examples:
- In-range: `699-firm` (recommended), `699` (allowed)
- Out-of-range: `0000-0000`, `2049-2049`, `2050-2050`, `2051-2051`, `2052-2052` (strongly recommended); bare index (e.g., `2052`) is allowed

### Padding, spacing, and hyphen normalization
Implementations and operators MAY use padding and spacing without changing meaning (e.g., `699-firm`, `0699 - firm`, or mixed styles).

Normative parsing rule:
- When a value is written as text, the **leading decimal integer** is the value in \(GF(2053)\). Any suffix is an annotation.

### Paper share layout
- A share is a single page.
- The share table has 4 columns and \(r + 1\) rows, where \(r = \ell / 3\):
  - **Rows 1 through \(r\)**: three word values followed by the row checksum for that row.
  - **Footer row**: three column checksums (\(C_1, C_2, C_3\)) followed by the printed GIC.

## Paper header (shares)

### Required fields
- Protocol name and version: MUST clearly identify the protocol and version.
- Threshold \(k\): MUST be present.
- Share number: share index \(x\) MUST be present. The "\(x\) of \(n\)" form is recommended; \(n\) MAY be omitted.

### Recommended fields (non-secret)
- Seed name (label)
- Creation date
- Derivation hint (e.g., `BIP84`, `HW-Def`)
- Recovery Verification Address (RVA) — truncated (e.g., `bc1qar0s...zzwf5mdq`). See [RVA](#recovery-verification-address-rva).
- Passphrase indicator/hint: MAY indicate whether a passphrase is required and where to find it; MUST NOT include the passphrase itself

## Recovery Verification Address (RVA)

The RVA is a user-supplied truncated verification address derived from the intended target wallet, written as the first 8 and last 8 characters of the address (e.g., `bc1qar0s...zzwf5mdq`). It is external metadata, not part of the sharing arithmetic.

Recommended default: the first receive address of the intended wallet. Advanced users MAY intentionally choose a different address that better matches their operational setup (e.g., a known canary address).

The RVA is derived from the mnemonic together with the intended wallet context (derivation settings, wallet profile, and BIP39 passphrase if applicable). The corresponding derivation hint MUST therefore be recorded separately.

After recovery, recomputing the same target-wallet address and comparing to the recorded RVA detects share substitution and wallet-context errors. For bech32/bech32m addresses, the truncated form yields approximately \(2^{60}\) matching power.

The RVA requires a one-time computational derivation during setup. In fully electronics-free ceremonies, this field MAY be omitted, accepting reduced post-recovery substitution detection.

## Optional share manifest (non-secret, sensitive)
A manifest is optional. Its purpose is operational: track where shares are stored and reduce recovery uncertainty.

### Required fields (if present)
- Protocol name and version (clear identification)
- Scheme \(k\)-of-\(n\)

### Recommended fields (if present)
Same non-secret context fields as shares (seed name, date, derivation hint, RVA, passphrase hint), plus an optional share list (e.g., mapping share number to printed GIC and a custodian/location note).

### Co-storage prohibition
If a manifest exists, it MUST NOT be stored with any share.

## Data model and notation

### Field and layout
- Field operations are modulo \(p=2053\).
- Mnemonic word indices: \(w_1,\ldots,w_\ell \in \{1,\ldots,2048\}\).
- Row count: \(r=\ell/3\).
- Words are arranged as \(r\) rows × 3 columns. Word \(w_i\) is in row \(\lceil i/3 \rceil\) and column \(((i-1) \bmod 3) + 1\).

### Notation
To avoid ambiguity between share-state and recovered values, this spec uses:
- \(\alpha[x]\): value \(\alpha\) as written on the share with index \(x\)
- \(\alpha\): recovered value at \(x=0\)

### Domain separators (tags and totals)
- **Row tags**: \(\tau^R_j = j\) for \(j = 1, \ldots, r\).
- **Column tags**: \(\tau^C_1 = 10\), \(\tau^C_2 = 20\), \(\tau^C_3 = 30\).
- **Row total**: \(T_R = \sum_{j=1}^{r} j = r(r+1)/2\).
- **Column total**: \(T_C = 10 + 20 + 30 = 60\) (invariant across configurations).

Column tags are chosen from \(\{10, 20, 30\}\) to be disjoint from row indices \(\{1, \ldots, r\}\) for all supported mnemonic lengths (\(r \leq 8\)), enabling unambiguous error attribution.

| \(\ell\) | \(r\) | \(T_R\) | \(T_C\) |
|---:|---:|---:|---:|
| 12 | 4 | 10 | 60 |
| 15 | 5 | 15 | 60 |
| 18 | 6 | 21 | 60 |
| 21 | 7 | 28 | 60 |
| 24 | 8 | 36 | 60 |

### Row checksum
Share-state row checksum consistency (per share \(x\)):

\[
R_j[x] = (w_{3j-2}[x] + w_{3j-1}[x] + w_{3j}[x] + j) \bmod 2053
\]

The row tag \(+j\) provides positional binding: row-swap errors are detected.

### Column checksum
Share-state column checksum consistency (per share \(x\)):

\[
C_c[x] = \left(\sum_{i \in \text{col } c} w_i[x] + \tau^C_c\right) \bmod 2053
\]

where \(\tau^C_1 = 10\), \(\tau^C_2 = 20\), \(\tau^C_3 = 30\).

### Global Integrity Check (GIC)
Each share stores one GIC value. The GIC includes the share index binding and the row/column totals.

Per share \(x\), the GIC MUST satisfy all three equivalent checks:

\[
GIC[x] = \left(\sum_{i=1}^{\ell} w_i[x] + T_R + T_C + x\right)\bmod 2053
\]

\[
GIC[x] = \left(\sum_{j=1}^{r} R_j[x] + T_C + x\right)\bmod 2053
\]

\[
GIC[x] = \left(\sum_{c=1}^{3} C_c[x] + T_R + x\right)\bmod 2053
\]

## Failure semantics (STOP / WARN / INFO)
- **STOP**: Must not proceed. Correct inputs and redo the step.
- **WARN**: Strong warning; proceed only with explicit acknowledgement.
- **INFO**: Informational.

Minimum **STOP** conditions for manual execution:
- Any per-share row checksum mismatch.
- Any per-share column checksum mismatch.
- Any per-share GIC mismatch (any of the three equivalent checks).
- Duplicate share indices \(x\) in the recovery set, or any \(x=0\).
- Lagrange coefficient sanity check failure.
- Any recovered mnemonic index outside \(\{1,\ldots,2048\}\).

## Manual recovery
### Inputs
- Any \(k\) shares from the same scheme
- BIP39 word list (1-based indexing)
- Lagrange coefficients for the chosen share indices \(x\) (from the table below, or computed on any device — Lagrange coefficients contain no secret information)
- Row total \(T_R\) and column total \(T_C = 60\) for the word count

#### Pre-computed Lagrange coefficients in \(GF(2053)\)

| Scheme | Shares | Coefficients \((\gamma)\) |
|--------|--------|---------------------------|
| **2-of-3** | \(\{1, 2\}\) | \((2, 2052)\) |
| | \(\{1, 3\}\) | \((1028, 1026)\) |
| | \(\{2, 3\}\) | \((3, 2051)\) |
| **2-of-4** | \(\{1, 2\}\) | \((2, 2052)\) |
| | \(\{1, 3\}\) | \((1028, 1026)\) |
| | \(\{1, 4\}\) | \((1370, 684)\) |
| | \(\{2, 3\}\) | \((3, 2051)\) |
| | \(\{2, 4\}\) | \((2, 2052)\) |
| | \(\{3, 4\}\) | \((4, 2050)\) |
| **3-of-5** | \(\{1, 2, 3\}\) | \((3, 2050, 1)\) |
| | \(\{1, 2, 4\}\) | \((687, 2051, 1369)\) |
| | \(\{1, 2, 5\}\) | \((1029, 1367, 1711)\) |
| | \(\{1, 3, 4\}\) | \((2, 2051, 1)\) |
| | \(\{1, 3, 5\}\) | \((1285, 512, 257)\) |
| | \(\{1, 4, 5\}\) | \((686, 1367, 1)\) |
| | \(\{2, 3, 4\}\) | \((6, 2045, 3)\) |
| | \(\{2, 3, 5\}\) | \((5, 2048, 1)\) |
| | \(\{2, 4, 5\}\) | \((1372, 2048, 687)\) |
| | \(\{3, 4, 5\}\) | \((10, 2038, 6)\) |

### Step 1: Validate each share (STOP on failure)
For each share used in recovery:
- Read the share index \(x\) from the header.
- Validate every row checksum on that share:
  - For each row \(j\): \((w_{3j-2}[x] + w_{3j-1}[x] + w_{3j}[x] + j) \bmod 2053 \stackrel{?}{=} R_j[x]\)
- Validate every column checksum on that share:
  - For each column \(c\): \(\left(\sum_{i \in \text{col } c} w_i[x] + \tau^C_c\right) \bmod 2053 \stackrel{?}{=} C_c[x]\)
- Validate the GIC using any of the three equivalent checks:
  - \(\left(\sum_{i=1}^{\ell} w_i[x] + T_R + T_C + x\right)\bmod 2053 \stackrel{?}{=} GIC[x]\)
  - \(\left(\sum_{j=1}^{r} R_j[x] + T_C + x\right)\bmod 2053 \stackrel{?}{=} GIC[x]\)
  - \(\left(\sum_{c=1}^{3} C_c[x] + T_R + x\right)\bmod 2053 \stackrel{?}{=} GIC[x]\)

### Step 2: Validate the Lagrange coefficients (sanity check, STOP on failure)
For share indices \(x_1,\dots,x_k\) and corresponding coefficients \(\gamma_1,\dots,\gamma_k\), check:

\[
(\gamma_1 x_1 + \gamma_2 x_2 + \dots + \gamma_k x_k) \bmod 2053 = 0
\]

If not, the coefficients or arithmetic are wrong. STOP and fix before proceeding.

### Step 3: Recover values by row-by-row interpolation (STOP on row mismatch)
For any value position \(\alpha\), recover at \(x=0\):

\[
\alpha = (\gamma_1 \alpha[x_1] + \gamma_2 \alpha[x_2] + \dots + \gamma_k \alpha[x_k])\bmod 2053
\]

Recover row-by-row:
- Recover \(w_{3j-2}, w_{3j-1}, w_{3j}\) and \(R_j\).
- Validate the recovered row checksum immediately:
  - \((w_{3j-2} + w_{3j-1} + w_{3j} + j)\bmod 2053 \stackrel{?}{=} R_j\) — **STOP** if not. Recompute this row before proceeding.

### Step 4: Global validation (STOP on mismatch)
After all rows pass:
- Recover the three column checksums \(C_1, C_2, C_3\) by interpolation.
- Validate each:
  - \(\left(\sum_{i \in \text{col } c} w_i + \tau^C_c\right) \bmod 2053 \stackrel{?}{=} C_c\)
- Recover the GIC by interpolation. The \(+x\) terms cancel automatically (since \(\sum \gamma_i x_i = 0\)). The row tags and column tags do **not** cancel (they are in the constant terms).
- Validate the recovered GIC using any equivalent path:
  - \(\left(\sum_{i=1}^{\ell} w_i + T_R + T_C\right)\bmod 2053 \stackrel{?}{=} GIC\)
  - \(\left(\sum_{j=1}^{r} R_j + T_C\right)\bmod 2053 \stackrel{?}{=} GIC\)
  - \(\left(\sum_{c=1}^{3} C_c + T_R\right)\bmod 2053 \stackrel{?}{=} GIC\)

### Step 5: Convert indices to BIP39 words and restore
- Convert recovered indices \(w_i\) using the 1-based BIP39 word list.
- Restore in the target wallet.
  - If restoring into a **BIP39** wallet and it rejects the mnemonic, **STOP**: redo recovery arithmetic/transcription and verify passphrase/derivation details.
  - If restoring into a wallet that uses a **non-BIP39 mnemonic standard**, BIP39 checksum validation is **not applicable** (out of scope for this manual spec); validate using that wallet's rules.

### Step 6: Verify RVA (recommended, if recorded)
If a truncated RVA was recorded on the shares or manifest:
- Derive the first receive address at the recorded derivation path using the recovered mnemonic (and passphrase, if applicable).
- Compare the first 8 and last 8 characters against the recorded RVA.
- Match confirms the recovered mnemonic, passphrase, and derivation path are correct.
- Mismatch is a **WARN**: possible share substitution, wrong passphrase, or wrong derivation path.

### Cross-share polynomial consistency check (optional, requires more than \(k\) shares)
If more than \(k\) shares are available, the extra shares satisfy public linear consistency relations (a standard Shamir/Reed-Solomon property, not Schiavinato-specific). This provides an additional substitution detection path within the existing \(GF(2053)\) arithmetic, at the operational cost of requiring physical access to extra shares.

For consecutive share indices, the simplest checks are (applied to any fixed value position — word, row checksum, column checksum, or printed GIC — across shares):

- **2-of-3** (degree 1, 3 shares available):
  `share1 - 2×share2 + share3 ≡ 0 (mod 2053)`

- **2-of-4** (degree 1, 3+ shares available):
  `share1 - 2×share2 + share3 ≡ 0 (mod 2053)`, and/or
  `share2 - 2×share3 + share4 ≡ 0 (mod 2053)`

- **3-of-5** (degree 2, 4+ shares available):
  `share1 - 3×share2 + 3×share3 - share4 ≡ 0 (mod 2053)`, and/or
  `share2 - 3×share3 + 3×share4 - share5 ≡ 0 (mod 2053)`

If any relation fails, suspect cross-session mixing, tampering, or transcription error. If all pass, proceed with normal recovery; this does **not** replace row/column/GIC validation or post-recovery checks.

## Manual share generation
### Inputs
- A valid BIP39 mnemonic (12/15/18/21/24 words)
- Threshold scheme \(k\)-of-\(n\) with \(2 \leq k \leq n \leq 2052\) (if \(k=1\), the share values are copies of the secret)
- A method to generate uniform randomness for polynomial coefficients

### Step 1: Per-word polynomials
For each word index \(w_i\), construct a Shamir polynomial over \(GF(2053)\):

\[
f_{w_i}(x) = w_i + a_1 x + \dots + a_{k-1} x^{k-1} \bmod 2053
\]

- \(a_{k-1}\) MUST be uniform in \(\{1,\dots,2052\}\) (non-zero to preserve polynomial degree).
- All other coefficients MUST be uniform in \(\{0,\dots,2052\}\).

For share indices \(x \in \{1,\ldots,n\}\), compute:
- \(w_i[x] = f_{w_i}(x)\bmod 2053\)

### Step 2: Row checksums (linear derivation + incremental validation)
For each row \(j\), the row checksum polynomial is:

\[
f_{R_j}(x) = \bigl(f_{w_{3j-2}}(x) + f_{w_{3j-1}}(x) + f_{w_{3j}}(x)\bigr) + j \bmod 2053
\]

The row tag \(+j\) is added to the constant term only. Compute:
- \(R_j[x] = f_{R_j}(x)\bmod 2053\)

Per share \(x\), validate immediately (**STOP** on mismatch):
- \((w_{3j-2}[x] + w_{3j-1}[x] + w_{3j}[x] + j) \bmod 2053 \stackrel{?}{=} R_j[x]\)

### Step 3: Column checksums (linear derivation + validation)
For each column \(c \in \{1, 2, 3\}\), the column checksum polynomial is:

\[
f_{C_c}(x) = \sum_{i \in \text{col } c} f_{w_i}(x) + \tau^C_c \bmod 2053
\]

where \(\tau^C_1 = 10\), \(\tau^C_2 = 20\), \(\tau^C_3 = 30\). Compute:
- \(C_c[x] = f_{C_c}(x)\bmod 2053\)

Per share \(x\), validate (**STOP** on mismatch):
- \(\left(\sum_{i \in \text{col } c} w_i[x] + \tau^C_c\right) \bmod 2053 \stackrel{?}{=} C_c[x]\)

### Step 4: GIC construction and validation
For each share \(x\), compute:

\[
GIC[x] = \left(\sum_{i=1}^{\ell} w_i[x] + T_R + T_C + x\right)\bmod 2053
\]

Then validate (**STOP** on mismatch) using all three equivalent checks:
- \(\left(\sum_{i=1}^{\ell} w_i[x] + T_R + T_C + x\right)\bmod 2053 \stackrel{?}{=} GIC[x]\)
- \(\left(\sum_{j=1}^{r} R_j[x] + T_C + x\right)\bmod 2053 \stackrel{?}{=} GIC[x]\)
- \(\left(\sum_{c=1}^{3} C_c[x] + T_R + x\right)\bmod 2053 \stackrel{?}{=} GIC[x]\)

### Step 5: Share assembly and transcription
Each share at index \(x\) contains \(\ell + r + 3 + 1\) field elements:
- \(\ell\) word values
- \(r\) row checksums
- 3 column checksums
- 1 printed GIC

The share table has 4 columns and \(r + 1\) rows:
- **Rows 1–\(r\)**: \(w_{3j-2}[x]\), \(w_{3j-1}[x]\), \(w_{3j}[x]\), \(R_j[x]\)
- **Footer row**: \(C_1[x]\), \(C_2[x]\), \(C_3[x]\), \(GIC[x]\)

### Transcription validation (MUST)
After transcribing a share, the following checks MUST pass (**STOP** on mismatch):
- Every row checksum: \((w_{3j-2}[x] + w_{3j-1}[x] + w_{3j}[x] + j) \bmod 2053 \stackrel{?}{=} R_j[x]\)
- Every column checksum: \(\left(\sum_{i \in \text{col } c} w_i[x] + \tau^C_c\right) \bmod 2053 \stackrel{?}{=} C_c[x]\)
- The printed GIC via any equivalent path (recommended: use all three)

## Nesting

The construction supports recursive composition: a completed share from layer \(L\) becomes the protected object of layer \(L+1\). Each layer uses the same \(GF(2053)\) arithmetic with independently computed row checksums, column checksums, and GIC.

At layer \(L > 0\), the "word" values being shared are \(GF(2053)\) elements from the parent share, not BIP39 word indices. Values \(\{0, 2049, 2050, 2051, 2052\}\) are valid inputs. BIP39 validity is checked only at the final layer-0 recovery.

When \(k = 1\), the polynomial is constant and all shares are identical copies. This provides replication for access-control grouping without threshold protection at that layer.

## Conformance
Canonical vectors are in `test_vectors/`. Implementations MUST validate against them.
