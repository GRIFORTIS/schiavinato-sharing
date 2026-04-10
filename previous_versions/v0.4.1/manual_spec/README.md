# Schiavinato Sharing — Manual Specification v0.4.1 (Frozen)

> **This is a frozen archive of the v0.4.1 manual specification.** It is preserved for reference only and MUST NOT be edited. The current live manual spec is in [`../../../manual_spec/README.md`](../../../manual_spec/README.md).

[Jump to Manual recovery](#manual-recovery)

> ## ⚠️ WARNING: EXPERIMENTAL SOFTWARE ⚠️
> 
>DO NOT USE IT FOR REAL FUNDS!
>
> Schiavinato Sharing specification and implementations have NOT been audited. Use for testing, learning, and experimentation only. See [SECURITY](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md) for details.
>
>We invite **cryptographers** and **developers** to review the spec and software. See [CONTRIBUTING](https://github.com/GRIFORTIS/.github/blob/main/CONTRIBUTING.md) to know more.

This document defines the manual execution protocol for Schiavinato Sharing.

Normative keywords **MUST**, **MUST NOT**, **SHOULD**, **MAY** are used as requirements.

For ease of reference in time-critical scenarios, the recovery procedure appears first.

## Scope
This spec defines:
- Field math requirements and representations
- Paper share semantics (rows, row checksums, Global Integrity Check (GIC), and required header fields)
- Manual share generation and manual recovery procedures
- Validation + failure semantics (**STOP / WARN / INFO**) to prevent silent mistakes

Everything related to digital envelopes (QR / Bech32m / metadata bytes) is specified in `software_spec/`.

## Non-negotiable constraints
- **1-based BIP39 word indexing** MUST be used throughout: `abandon = 1`, `zoo = 2048`.
- The input and final recovered mnemonic indices MUST be in \(\{1,\dots,2048\}\).
- The scheme operates in the prime field **\(GF(2053)\)** (modulus \(p = 2053\)).
- The **BIP39 passphrase** (“25th word”) is **NOT** stored or recovered. It MUST be backed up separately and re-entered at wallet restore, if necessary.
- Share payload values are computed in \(GF(2053)\), so intermediate/share values MAY be in \(\{0,2049,2050,2051,2052\}\). These MUST be represented as indices (not mapped to BIP39 words).
- Share indices \(x\) used for recovery MUST be non-zero and MUST be distinct.
- Supported BIP39 word counts are \(\ell \in \{12,15,18,21,24\}\).
- Nested sharing is possible, but out of scope for this document.

## Conventions (human-readable encoding)
### Indices-first rule
- The canonical value representation is its **index** (a decimal integer).
- A word label MAY be appended as an annotation (for usability), in any language.

Examples:
- In-range: `699-firm` (recommended), `699` (allowed)
- Out-of-range: `2052-2052` (strongly recommended), `2052` (allowed)

### Padding, spacing, and hyphen normalization
Implementations and operators MAY use padding and spacing without changing meaning (e.g., `699-firm`, `0699 - firm`, or mixed styles).

Normative parsing rule:
- When a value is written as text, the **leading decimal integer** is the value in \(GF(2053)\). Any suffix is an annotation.

### Paper share layout
- A share is a single page.
- The share table values appear in a fixed implicit order:
  - word values, grouped as visual rows of 3 words
  - After each group of 3 words, one row checksum value
  - A 4 columns table layout is recomended

## Paper header (shares)

### Required fields
- Protocol name and version: MUST clearly identify the protocol and version.
- Threshold \(k\): MUST be present.
- Share number: share index \(x\) MUST be present. The “\(x\) of \(n\)” form is recommended; \(n\) MAY be omitted.
- GIC: MUST be present.

### Recommended fields (non-secret)
- Seed name (label)
- Creation date
- Wallet/device hint (e.g., Ledger)
- Address hint (e.g., `bc1q...`)
- Asset hint (e.g., BTC, ETH)
- Passphrase indicator/hint: MAY indicate whether a passphrase is required and where to find it; MUST NOT include the passphrase itself

## Optional share manifest (non-secret, sensitive)
A manifest is optional. Its purpose is operational: track where shares are stored and reduce recovery uncertainty.

### Required fields (if present)
- Protocol name and version (clear identification)
- Scheme \(k\)-of-\(n\)

### Recommended fields (if present)
Same non-secret context fields as shares (seed name, date, wallet/device, address, assets, passphrase hint), plus an optional share list (e.g., mapping share number to GIC and a custodian/location note).

### Co-storage prohibition
If a manifest exists, it MUST NOT be stored with any share.

## Data model and notation
- Field operations are modulo \(p=2053\).
- Mnemonic word indices: \(w_1,\ldots,w_\ell \in \{1,\ldots,2048\}\).
- Row count: \(r=\ell/3\).
- Row checksum (secret-level definition):

\[
c_j = (w_{3j-2} + w_{3j-1} + w_{3j}) \bmod 2053 \quad \text{for } j=1,\ldots,r
\]

To avoid ambiguity between share-state and recovered values, this spec uses:
- \(\alpha[x]\): value \(\alpha\) as written on the share with index \(x\)
- \(\alpha\): recovered value at \(x=0\)

Share-state row checksum consistency (per share \(x\)):

\[
c_j[x] = (w_{3j-2}[x] + w_{3j-1}[x] + w_{3j}[x]) \bmod 2053
\]

### Global Integrity Check (GIC)
Each share stores one GIC value. The GIC includes the share index binding.

Per share \(x\), the GIC MUST satisfy both equivalent checks:

\[
GIC[x] = \left(\sum_{j=1}^{r} c_j[x] + x\right)\bmod 2053
\]

\[
GIC[x] = \left(\sum_{i=1}^{\ell} w_i[x] + x\right)\bmod 2053
\]

## Failure semantics (STOP / WARN / INFO)
- **STOP**: Must not proceed. Correct inputs and redo the step.
- **WARN**: Strong warning; proceed only with explicit acknowledgement.
- **INFO**: Informational.

Minimum **STOP** conditions for manual execution:
- Any per-share row checksum mismatch.
- Any per-share GIC mismatch (either of the two equivalent GIC checks).
- Duplicate share indices \(x\) in the recovery set, or any \(x=0\).
- Lagrange coefficient sanity check failure.
- Any recovered mnemonic index outside \(\{1,\ldots,2048\}\).

## Manual recovery
### Inputs
- Any \(k\) shares from the same scheme
- BIP39 word list (1-based indexing)
- Lagrange coefficients for the chosen share indices \(x\) (precomputed table or computed on any device)

### Step 1: Validate each share (STOP on failure)
For each share used in recovery:
- Read the share index \(x\) from the header.
- Validate every row on that share:
  - For each row \(j\): \((w_{3j-2}[x] + w_{3j-1}[x] + w_{3j}[x]) \bmod 2053 \stackrel{?}{=} c_j[x]\)
- Validate the GIC using both equivalent checks:
  - \(\left(\sum_{j=1}^{r} c_j[x] + x\right)\bmod 2053 \stackrel{?}{=} GIC[x]\)
  - \(\left(\sum_{i=1}^{\ell} w_i[x] + x\right)\bmod 2053 \stackrel{?}{=} GIC[x]\)

### Step 2: Validate the Lagrange coefficients (sanity check, STOP on failure)
For share indices \(x_1,\dots,x_k\) and corresponding coefficients \(\gamma_1,\dots,\gamma_k\), check:

\[
(\gamma_1 x_1 + \gamma_2 x_2 + \dots + \gamma_k x_k) \bmod 2053 = 0
\]

If not, the coefficients or arithmetic are wrong. STOP and fix before proceeding.

### Step 3: Recover values by interpolation
For any value position \(\alpha\) (a word position or a row checksum position), recover at \(x=0\):

\[
\alpha = (\gamma_1 \alpha[x_1] + \gamma_2 \alpha[x_2] + \dots + \gamma_k \alpha[x_k])\bmod 2053
\]

Recover row-by-row:
- Recover \(w_{3j-2}, w_{3j-1}, w_{3j}\) and \(c_j\).
- Validate the recovered row checksum:
  - \((w_{3j-2} + w_{3j-1} + w_{3j})\bmod 2053 \stackrel{?}{=} c_j\) (STOP if not).

### Step 4: Global validation (recommended)
Recover the global sum from the stored GIC values:

\[
S = (\gamma_1 GIC[x_1] + \gamma_2 GIC[x_2] + \dots + \gamma_k GIC[x_k])\bmod 2053
\]

Then verify:
- \(S \stackrel{?}{=} \left(\sum_{j=1}^{r} c_j\right)\bmod 2053\) (equivalently, \(S \stackrel{?}{=} \left(\sum_{i=1}^{\ell} w_i\right)\bmod 2053\))

Note: the share-index binding (“\(+x\)”) cancels during interpolation due to the sanity-check identity \(\sum \gamma_i x_i = 0\).

### Step 5: Convert indices to BIP39 words and restore
- Convert recovered indices \(w_i\) using the 1-based BIP39 word list.
- Restore in the target wallet.
  - If restoring into a **BIP39** wallet and it rejects the mnemonic, **STOP**: redo recovery arithmetic/transcription and verify passphrase/derivation details.
  - If restoring into a wallet that uses a **non-BIP39 mnemonic standard**, BIP39 checksum validation is **not applicable** (out of scope for this manual spec); validate using that wallet’s rules.

## Manual share generation
### Inputs
- A valid BIP39 mnemonic (12/15/18/21/24 words)
- Threshold scheme \(k\)-of-\(n\) (if \(k=1\), the share values are copies of the secret)
- A method to generate uniform randomness for polynomial coefficients

### Per-word polynomials
For each word index \(w_i\), construct a Shamir polynomial over \(GF(2053)\):

\[
f_{w_i}(x) = a_0 + a_1 x + \dots + a_{k-1} x^{k-1} \bmod 2053
\]

- \(a_0 = w_i\)
- \(a_{k-1}\) MUST be uniform in \(\{1,\dots,2052\}\) (non-zero to keep polynomial degree).
- Other coefficients MUST be uniform in \(\{0,\dots,2052\}\).

For share indices \(x \in \{1,\ldots,n\}\), compute and write:
- \(w_i[x] = f_{w_i}(x)\bmod 2053\)

### Row checksums (linear derivation)
For each row \(j\), define the checksum polynomial by summing word polynomials:

\[
f_{c_j}(x) = (f_{w_{3j-2}}(x) + f_{w_{3j-1}}(x) + f_{w_{3j}}(x)) \bmod 2053
\]

Then compute:
- \(c_j[x] = f_{c_j}(x)\bmod 2053\)

Per share \(x\), validate immediately (STOP on mismatch):
- \((w_{3j-2}[x] + w_{3j-1}[x] + w_{3j}[x]) \bmod 2053 \stackrel{?}{=} c_j[x]\)

### GIC construction and validation
For each share \(x\), compute:

\[
GIC[x] = \left(\sum_{j=1}^{r} c_j[x] + x\right)\bmod 2053
\]

Then validate (STOP on mismatch), using both equivalent checks:
- \(\left(\sum_{j=1}^{r} c_j[x] + x\right)\bmod 2053 \stackrel{?}{=} GIC[x]\)
- \(\left(\sum_{i=1}^{\ell} w_i[x] + x\right)\bmod 2053 \stackrel{?}{=} GIC[x]\)

### Transcription validation (MUST)
After transcribing a share, the following checks MUST pass (STOP on mismatch):
- \(\left(\sum_{i=1}^{\ell} w_i[x] + x\right)\bmod 2053 \stackrel{?}{=} GIC[x]\)
- \(\left(\sum_{j=1}^{r} c_j[x] + x\right)\bmod 2053 \stackrel{?}{=} GIC[x]\)

## Conformance
Canonical vectors are in `test_vectors/`. Implementations MUST validate against them.
