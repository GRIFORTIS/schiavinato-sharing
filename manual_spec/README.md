# Schiavinato Sharing — Manual Specification (`manual_spec`)

This document defines the **stable, heirs-first** manual protocol for Schiavinato Sharing.

Normative keywords **MUST**, **MUST NOT**, **SHOULD**, **MAY** are used as requirements.

## Scope
This spec covers the parts that must remain boring and stable:
- Field math requirements and representations
- Share layout semantics (rows, checksums, Global Integrity Check)
- Manual split and manual recovery procedures
- Validation + failure semantics (**STOP / WARN / INFO**) to prevent silent mistakes

Everything related to digital envelopes (QR / Bech32m / metadata bytes) is specified in `software_spec/`.

## Non-negotiable constraints
- **1-based BIP39 indexing** MUST be used throughout: `abandon = 1`, `zoo = 2048`. No internal re-indexing.
- The scheme operates in the prime field **\(GF(2053)\)** (modulus \(p = 2053\)).
- The **BIP39 passphrase** (“25th word”) is **NOT** stored or recovered. It MUST be backed up separately and re-entered at wallet restore.
- Shares are computed in \(GF(2053)\), so intermediate share values MAY be in \(\{0,2049,2050,2051,2052\}\) (~0.24% of values). These MUST be represented explicitly (numeric placeholders) rather than mapped to BIP39 words.
- Per layer, share indices \(x\) MUST be non-zero and MUST be distinct within the set used for recovery.

## Data model (manual layer)
### Word indices
- A mnemonic is treated as a list of BIP39 word indices \(w_i \in \{1,\dots,2048\}\).

### Row structure
- Words are grouped in rows of 3.
- Each row has a **row checksum** \(c_r\) defined as:

\[
c_r = (w_{3r} + w_{3r+1} + w_{3r+2}) \bmod 2053
\]

### Global Integrity Check (GIC)
There are two related concepts:
- **Unbound GIC** \(g\): the global check value recovered by interpolation, used for global validation.
- **Printed GIC** \(g_{print}\): the value written on each share header, bound to the share index \(x\).

Let the set of row checksums be \(\{c_0, c_1, \dots, c_{R-1}\}\). Define:

\[
g = \left(\sum_{r=0}^{R-1} c_r\right) \bmod 2053
\]

The **Printed GIC** on a specific share with index \(x\) MUST be:

\[
g_{print} = (g + x) \bmod 2053
\]

This binding enables share-number validation during manual recovery.

## Failure semantics (STOP / WARN / INFO)
Manual processes MUST follow these severities:

- **STOP**: Must not proceed. Inputs must be corrected and the step re-done.
- **WARN**: Show a strong warning; proceed only after explicit user acknowledgement.
- **INFO**: Informational only.

### STOP conditions (manual)
At minimum, these conditions are **STOP**:
- Any **row checksum validation failure**.
- Any **Printed GIC binding failure** (see validation below).
- Any **Lagrange coefficient sanity check failure** (see recovery step).
- Any recovered mnemonic index outside \(\{1,\dots,2048\}\) (**final mnemonic MUST always be BIP39-range**).

### WARN conditions (manual)
At minimum, these conditions are **WARN**:
- A recovered mnemonic fails BIP39 checksum validation (usually indicates error, but see Electrum note below).

## Manual sharing (split) procedure
This section specifies the human-executable sharing process.

### Inputs
- A valid BIP39 mnemonic (12/15/18/21/24 words)
- Threshold scheme \(k\)-of-\(n\)
- A method to generate true randomness for polynomial coefficients

### High-level steps
1) Convert each BIP39 word to its **1-based** index.
2) For each word index, construct a Shamir polynomial over \(GF(2053)\):

\[
f(x) = a_0 + a_1 x + \dots + a_{k-1} x^{k-1} \bmod 2053
\]

- \(a_0\) is the secret (the word index).
- The highest coefficient \(a_{k-1}\) MUST be uniform in \(\{1,\dots,2052\}\) (non-zero to keep polynomial degree).
- Other coefficients MUST be uniform in \(\{0,\dots,2052\}\).

3) For each share index \(x\) (commonly \(1..n\)), evaluate every word polynomial to produce the share’s word values.
4) For each row of 3 words on each share, compute and write the row checksum, then validate it immediately:
- **Row validation**: \((w_1 + w_2 + w_3) \bmod 2053 = c_r\) (STOP if not).
5) Compute the **unbound GIC** \(g\) as the sum of row checksums mod 2053.
6) For each share, compute the **Printed GIC** \(g_{print} = (g + x) \bmod 2053\) and write it in the share header.
7) Final validation after transcription (recommended): on each share, confirm both paths match the Printed GIC:
- \(\left(\sum_{r} c_r + x\right)\bmod 2053 = g_{print}\)
- \(\left(\sum_{i} w_i + x\right)\bmod 2053 = g_{print}\)

## Manual recovery procedure
### Inputs
- Any \(k\) shares from the same layer
- BIP39 wordlist (1-based indexing)
- Lagrange coefficients for the chosen share indices (precomputed table or computed on any device)

### Step 1: Validate each share (STOP on failure)
For each share used in recovery:
- Read \(x\) (share index).
- Validate Printed GIC using **both** equivalent checks:
  - \(\left(\sum_{r} c_r + x\right)\bmod 2053 = g_{print}\)
  - \(\left(\sum_{i} w_i + x\right)\bmod 2053 = g_{print}\)

### Step 2: Validate the Lagrange coefficients (sanity check, STOP on failure)
For share indices \(x_1,\dots,x_k\) and corresponding coefficients \(\gamma_1,\dots,\gamma_k\), check:

\[
(\gamma_1 x_1 + \gamma_2 x_2 + \dots + \gamma_k x_k) \bmod 2053 = 0
\]

If not, the coefficients or arithmetic are wrong. STOP and fix before proceeding.

### Step 3: Recover values by interpolation
To recover any element (word, row checksum, or GIC), interpolate at \(x=0\):

\[
v = (\gamma_1 v_1 + \gamma_2 v_2 + \dots + \gamma_k v_k)\bmod 2053
\]

Recover and validate row-by-row:
- Recover the 3 words of a row and its checksum.
- Validate: \((w_1 + w_2 + w_3)\bmod 2053 = c_r\) (STOP if not).

### Step 4: Global validation
After all rows validate:
- Compute \(g = \left(\sum_r c_r\right)\bmod 2053\) and verify it matches the recovered global check value.

Note: the Printed GIC’s “\(+x\)” cancels during interpolation because \(\sum \gamma_i x_i = 0\).

### Step 5: Convert indices to BIP39 words + final checksum
- Convert recovered indices using the **1-based** BIP39 wordlist.
- Validate the standard BIP39 checksum.
  - If BIP39 checksum fails: **WARN** (usually indicates error).

#### Electrum note (WARN handling)
Some wallets use seed formats that resemble BIP39 (2048-word list, 12/24-word UX) but are **not BIP39** (e.g., Electrum-native seeds). In such cases BIP39 checksum validation is inapplicable. Implementations and manuals MAY treat BIP39 checksum failure as WARN (not STOP) when the user explicitly knows they are not using BIP39.

## Conformance
Canonical vectors are in `test_vectors/`. Implementations MUST validate against them.


