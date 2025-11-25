### **Title:** Schiavinato Sharing: Human-Executable Secret Sharing for BIP39 Mnemonics
### **Subtitle:** A Pencil-and-Paper Arithmetic Scheme for Inheritance and Disaster Recovery

---

### **Abstract**

The Schiavinato BIP39 Mnemonic Sharing Scheme (or **Schiavinato Sharing** for short) is a threshold secret-sharing scheme for BIP39 mnemonics, designed explicitly for recovery with pencil and paper. It instantiates Shamir's Secret Sharing over the prime field $GF(2053)$, operating directly on BIP39 word indices rather than on the underlying binary entropy. Each word index is sharded independently by a random polynomial, and additional checksum secrets provide robust detection of human arithmetic errors during manual recovery. By pre-computing Lagrange coefficients for common threshold schemes, the scheme reduces recovery to a sequence of additions and multiplications modulo 2053. A reference implementation architecture by GRIFORTIS is outlined, based on an auditable, offline HTML tool and MIT-licensed libraries for Python and JavaScript, enabling independent verification and potential integration while preserving the security guarantees of standard Shamir secret sharing.

---

### **1. Introduction**

#### 1.1 The Inheritance Problem in a Digital Age

The widespread use of cryptocurrencies and other digital bearer assets has created a new inheritance problem. Long-term control over these assets is typically anchored to a single secret, such as a 24-word BIP39 mnemonic. If this secret is lost or destroyed, the assets are unrecoverable; if it is exposed, the assets can be stolen. Traditional backup strategies (for example, a single steel plate in a safe) concentrate risk and often fail to account for multi-generational time horizons.

Threshold cryptography and secret sharing offer a principled way to spread this risk. Instead of a single point of failure, a secret is divided into multiple shares, of which any $k$ out of $n$ are sufficient for recovery. However, most deployed schemes assume the presence of trusted electronics at the time of recovery. For true disaster resilience, it is desirable to have recovery paths that remain viable even when access to compatible hardware, software, or networks is temporarily or permanently unavailable, or compromised.

#### 1.2 Existing Solutions and Their Limitations

Several practical solutions exist today:

- **Hardware wallets and single backups** rely on secure devices and careful handling of a single mnemonic. They are simple to operate but remain vulnerable to single-point failure and to latent user errors in backup procedures.
- **Multisignature wallets** distribute signing authority, but require ongoing coordination of multiple keys, devices, and software stacks. They do not, by themselves, solve the problem of how each individual key is backed up or inherited.
- **Computational Shamir schemes**, such as SLIP39 and SSKR, apply Shamir's Secret Sharing at the level of binary entropy, typically over extension fields $GF(2^n)$. These schemes are well-studied and robust, but the field arithmetic—especially multiplication and inversion in $GF(2^n)$—is unsuitable for manual execution. In practice, users must depend on specific software or hardware implementations for both sharding and recovery.

In all these cases, the recovery procedure is ultimately a computational protocol. If an appropriate device is not available at the time of recovery, or if the software ecosystem has changed in incompatible ways, long-term access to the assets is jeopardized.

#### 1.3 A Non-Computational Approach

Schiavinato Sharing is designed to remove this dependency on trusted electronics at the point of recovery. The central design goals are:

- **Human executability**: All required operations for sharding and recovery can be performed with pencil, paper, and basic arithmetic skills.
- **Cryptographic soundness**: Security should reduce to that of standard Shamir secret sharing in a well-understood field.
- **BIP39 compatibility**: The scheme should accept and output standard BIP39 mnemonics, without requiring modified wordlists or custom checksum rules.
- **Auditability and simplicity**: The construction should be simple enough to be understood, audited, and reimplemented by third parties, and the reference implementations must be fully offline and open source.

To achieve these goals, Schiavinato Sharing transposes Shamir's Secret Sharing from extension fields $GF(2^n)$ to a small prime field $GF(2053)$ and operates directly on BIP39 word indices. It further introduces a two-layer arithmetic checksum mechanism to detect human calculation errors during manual recovery.

#### 1.4 Status and Responsible Use

This document presents Schiavinato Sharing as a **proposed construction** and reference design. While its security reduces to well-understood components (Shamir's Secret Sharing in a prime field and standard BIP39 assumptions), the scheme itself, its human workflows, and any concrete implementations **require independent review, testing, and peer scrutiny**.

At the time of writing, Schiavinato Sharing and any GRIFORTIS reference tools that implement it should be regarded as **experimental and unaudited**. They are appropriate for education, testing, and community review, but **are not yet recommended for securing significant real-world holdings** without additional independent analysis or professional review.

In particular:

- The mathematics is conventional, but subtle implementation bugs, user-interface flaws, or misunderstandings of the procedures can still cause **permanent loss of funds**.
- No whitepaper or reference implementation, including this one, should be treated as a substitute for careful threat modeling, operational planning, and, where appropriate, professional advice.

Early adopters are encouraged to:

- Start with **modest amounts** and well-documented drills before entrusting a large fraction of long-term savings to any new scheme.
- Treat the GRIFORTIS tools as **reference implementations**, not as the only or final word on how the scheme should be realized in software.
- Report issues, ambiguities, or suspected vulnerabilities through the project's responsible disclosure channels so that the design and documentation can be improved over time.

Nothing in this paper constitutes financial, legal, or tax advice. Users remain responsible for their own operational and regulatory choices.

---

### **2. Background: The Mathematical Foundations**

Schiavinato Sharing is a concrete application of established cryptographic principles. It does not introduce a new primitive; instead, it adapts Shamir's Secret Sharing to a setting where every operation can, in principle, be performed by hand.

This section sketches the relevant mathematical background. Readers who require additional detail can consult the appendices and the referenced literature.

- **Shamir's Secret Sharing (SSS)**: A threshold secret-sharing scheme in which a secret value is interpreted as the constant term of a polynomial over a finite field. Shares are evaluations of this polynomial at non-zero points; any $k$ shares determine the polynomial uniquely, while fewer than $k$ yield no information about the secret (see **Appendix A**).
- **Modular arithmetic**: Arithmetic performed "modulo" a fixed number $p$, where values are always taken in the range $\{0, 1, ..., p-1\}$. Addition and multiplication are defined as usual, followed by reduction modulo $p$. When $p$ is prime, every non-zero value has a multiplicative inverse, which enables division (see **Appendix B**).
- **Lagrange interpolation**: A method to reconstruct a polynomial of degree at most $k-1$ from $k$ distinct points. For Shamir's scheme, we are primarily interested in the constant term (the secret). By pre-computing the relevant Lagrange coefficients for a given set of share indices, reconstruction reduces to a weighted sum of the share values (see **Appendix C**).

By working over a prime field $GF(p)$ with a carefully chosen prime $p$, Schiavinato Sharing ensures that all of the above can be instantiated with straightforward integer arithmetic.

---

### **3. Schiavinato Sharing: An Arithmetic Approach to Secret Sharing**

> **Note:** While the examples in this paper assume a 24-word BIP39 mnemonic, the same construction applies, mutatis mutandis, to 12, 15, 18, and 21-word phrases.

#### 3.1 The Challenge of Non-Computational Recovery

Standard implementations of Shamir's Secret Sharing for wallet backups, such as SLIP39 and SSKR, operate on the binary entropy underlying the mnemonic. They typically work in extension fields of the form $GF(2^n)$, such as $GF(2^8)$. Arithmetic in these fields is expressed in terms of polynomials over $GF(2)$ reduced modulo an irreducible polynomial. While efficient for microprocessors, this representation makes multiplication and inversion opaque and laborious for humans.

Moreover, entropy-based schemes require explicit conversion between the binary entropy and the mnemonic words, including verification of the BIP39 checksum bits. Reversing this process by hand—mapping words to indices, expanding to a bitstring, separating entropy from checksum, and possibly re-encoding is beyond what can reasonably be expected in a manual recovery scenario.

In contrast, Schiavinato Sharing operates directly on BIP39 word indices in a small prime field. Recovery never requires manipulating bits or recomputing the BIP39 checksum by hand. All visible operations are integer additions and multiplications modulo a fixed prime.

#### 3.2 Methodology: Independent Polynomials in a Prime Field

The core innovation of Schiavinato Sharing is to instantiate Shamir's Secret Sharing over the prime field $GF(p)$ with

$$
p = 2053,
$$

the smallest prime greater than the BIP39 wordlist size of 2048.

The rationale for this choice is threefold:

- **Coverage of all word indices**: Every BIP39 word index (0–2047) is representable as an element of $GF(2053)$ without any encoding overhead.
- **Simplicity of operations**: Working in a prime field eliminates the need for polynomial representations and enables straightforward integer arithmetic with reduction modulo $p$.
- **Security properties**: $GF(2053)$ is a standard finite field with no evident structure that would weaken Shamir's guarantees. Each sharing instance has a search space of size $p$, slightly larger than the 2048-word mnemonic space.

A 24-word BIP39 mnemonic is treated as a vector of 24 integers $(w_1, ..., w_{24})$, each in $\{0, ..., 2047\}$. While these indices are not 24 fully independent 11-bit variables—because of the BIP39 checksum and the way entropy is mapped to words—they collectively encode a 256-bit entropy value plus checksum bits. For the purposes of the security analysis, it is sufficient to note that the effective keyspace remains on the order of $2^{256}$.

For a $k$-of-$n$ scheme, Schiavinato Sharing defines, for each secret, an independent polynomial of degree at most $k-1$:

$$
f(x) = a_0 + a_1 x + ... + a_{k-1} x^{k-1} \quad (\text{mod } 2053)
$$

where:

- $a_0$ is the secret value (a word index or a checksum value),
- $(a_1, ..., a_{k-2})$ are independently sampled, cryptographically secure random coefficients in $\{0, ..., 2052\}$, and
- $a_{k-1}$ is an independently sampled, cryptographically secure random coefficient from the non-zero values $\{1, ..., 2052\}$ to ensure the polynomial has degree exactly $k-1$. For the case $k=1$, there are no random coefficients.

This process is repeated independently for every secret used by the scheme:

- the 24 word indices $(w_1, ..., w_{24})$,
- 8 additional row-checksum secrets, one per row of three words (see Section 3.5), and
- 1 **master verification number** (a global checksum over all 24 words), defined as

  $$
  M = \sum_{i=1}^{24} w_i \quad (\text{mod } 2053)
  $$

  which we refer to throughout as the **master verification number**.

In total, a 24-word mnemonic uses 33 independent Shamir instances, each with its own polynomial and randomness. The master verification number $M$ is treated exactly like the other secrets: it is shared by an independent polynomial over $GF(2053)$, and only its per-share evaluations appear on individual worksheets. The underlying value $M$ is recovered via Lagrange interpolation during the final verification step of recovery (Section 3.5).

#### 3.3 Manual Share Generation

Shares can be generated by software or entirely by hand. The reference GRIFORTIS tools automate this process, but the construction remains fully transparent.

For each secret $s \in \{0, ..., 2052\}$:

1. **Define the secret**: Set $a_0 = s$ in $GF(2053)$.
2. **Sample random coefficients**: For a $k$-of-$n$ scheme, sample $(a_1, ..., a_{k-2})$ as cryptographically secure random integers from $\{0, ..., 2052\}$ and sample $a_{k-1}$ from $\{1, ..., 2052\}$ to ensure the polynomial has degree exactly $k-1$. For the special case of $k=1$, there are no random coefficients. The source of randomness may be an offline computer, a hardware entropy source, or a carefully designed physical procedure (e.g., dice). The paper assumes the availability of cryptographically secure randomness but does not prescribe a specific mechanism; in the reference implementations this randomness is obtained from the host platform's CSPRNG (for example, `window.crypto.getRandomValues` in the HTML tool and `os.urandom` in the Python library), while fully manual workflows are expected to follow a published dice-based procedure (see **Appendix G**) that maps unbiased rolls to integers in $\{0, ..., 2052\}$.
3. **Evaluate the polynomial**: For each share index $x \in \{1, 2, ..., n\}$, compute

   $$
   y = f(x) = a_0 + a_1 x + ... + a_{k-1} x^{k-1} \quad (\text{mod } 2053)
   $$

   The resulting pair $(x, y)$ is the share for that secret at index $x$.

In the 24-word case, the collection of secrets $s$ to which this procedure is applied consists of the 24 word indices, the 8 row-checksum values, and the master verification number $M$, for a total of 33 independent polynomials.

This procedure is applied to each of the 33 secrets. For any fixed share index $x$ (for example, $x = 3$), the 33 resulting values (24 word shares, 8 row-checksum shares, and 1 master verification share) together constitute **one** cryptographic share of the wallet. The 32 row-related values are printed together as a worksheet table for that share index (Section 3.6), and the master verification share is included alongside the header or footer metadata. Each other share index $x' \neq x$ gives rise to its own, separate worksheet. To preserve the threshold property, these physical share documents are intended to be stored and distributed separately; only by bringing together any $k$ distinct worksheets can the original mnemonic be reconstructed.

Although polynomial evaluation is repetitive, the arithmetic itself is straightforward. Users willing to generate shares entirely by hand can do so using tables and checklists, at the cost of time. In practice, the reference tools are intended for generation, with manual procedures reserved as a verifiable fallback.

#### 3.4 The Manual Recovery Process

Recovery in Schiavinato Sharing relies on Lagrange interpolation in $GF(2053)$. Given any $k$ distinct shares $(x_j, y_j)$ for a single secret, the constant term $a_0$ of the underlying polynomial can be expressed as

$$
a_0 = f(0) = \sum_{j=1}^{k} \gamma_j y_j \quad (\text{mod } 2053)
$$

where the Lagrange coefficients $\gamma_j$ depend only on the share indices $x_1, ..., x_k$:

$$
\gamma_j = \prod_{\substack{i=1 \\ i \neq j}}^{k} \frac{x_i}{x_i - x_j} \quad (\text{mod } 2053)
$$

In principle, a user could compute these coefficients by hand using modular inverses. In practice, Schiavinato Sharing treats them as **non-secret metadata**:

- For common $k$-of-$n$ schemes (e.g., 2-of-3, 2-of-4, 3-of-5), the reference documentation includes pre-computed Lagrange coefficients for all subsets of indices (Section 3.8).
- For other schemes, the coefficients can be computed on demand using a simple script or calculator. Since they contain no secret information, this can be done on any convenient device.

The manual recovery workflow for a single secret is therefore:

1. Determine which $k$ share indices $x_1, ..., x_k$ you possess.
2. Look up or compute the corresponding Lagrange coefficients $\gamma_1, ..., \gamma_k$ for $GF(2053)$.
3. For each share $j$, multiply the share value $y_j$ by $\gamma_j$ modulo 2053.
4. Sum the products and reduce modulo 2053 to obtain the recovered secret $a_0$.

In typical workflows, once all 24 word indices have been recovered and checked, users also validate the resulting BIP39 mnemonic in a standard wallet; in strictly no-electronics scenarios, the row-level and master checks are intended to stand in for an explicit BIP39 checksum computation.

For a 24-word mnemonic with checksums, the user repeats this procedure for each of the 33 secrets, but in practice the worksheet structure (Section 3.6) allows recovery to proceed row by row, with immediate consistency checks, followed by a final master verification step.

#### 3.5 Integrity and Error Detection: The Two-Layer Checksum

Performing dozens of modular multiplications and additions by hand creates ample opportunity for arithmetic mistakes. Because independent word-level sharing destroys the original BIP39 checksum relationship between words, an additional integrity mechanism is required to detect such errors.

Schiavinato Sharing uses a purely arithmetic, two-layer checksum system:

1. **Row-level checksums (Shamir-shared)**: The 24 words are arranged into 8 rows of 3 words each. For row $r$ with word indices $(w_{r,1}, w_{r,2}, w_{r,3})$, define a checksum secret

   $$
   c_r = (w_{r,1} + w_{r,2} + w_{r,3}) \quad (\text{mod } 2053)
   $$

   Each $c_r$ is then treated as an additional secret and shared with its own independent Shamir polynomial over $GF(2053)$, exactly as for the word indices. Thus, for each share index $x$, the printed worksheet row contains four values: three word shares and one checksum share.

   During recovery, for each row the user:

   - uses Lagrange interpolation to recover $(w_{r,1}, w_{r,2}, w_{r,3})$, and $c_r$ from their $k$ shares;
   - computes $\tilde{c}_r = (w_{r,1} + w_{r,2} + w_{r,3}) \quad (\text{mod } 2053)$ by hand; and
   - verifies that $\tilde{c}_r = c_r$.

   If this equality fails, there is an arithmetic error affecting at least one of the four recovered values in that row. Rows are independent, so errors are localized to specific rows.

2. **Master verification number (Shamir-shared)**: In addition to the row-level checks, the scheme defines a master verification number

   $$
   M = \sum_{i=1}^{24} w_i \quad (\text{mod } 2053)
   $$

   computed once from the original 24 words before sharding. This value is treated as a separate secret and shared by its own independent Shamir polynomial over $GF(2053)$, producing one master verification share value on each worksheet.

   After all 24 word indices have been recovered, the user performs two calculations:

   - uses Lagrange interpolation on the master verification shares from their $k$ worksheets to recover $M$, and
   - separately computes the recomputed master verification number $\tilde{M} = \sum_{i=1}^{24} w_i \quad (\text{mod } 2053)$ from the recovered words.

   If $\tilde{M} \neq M$, then at least one row contains undetected errors and must be rechecked.

   Under a simple model in which an incorrect set of recovered values behaves like a random element of $GF(2053)$, the chance that a wrong triple $(w_{r,1}, w_{r,2}, w_{r,3})$ together with a wrong $c_r$ still satisfies the row equation is at most $1/2053$, and the chance that such errors also preserve the master verification number is at most another factor of $1/2053$. Under an additional independence assumption across rows, this suggests an overall error-escape probability on the order of $(1/2053)^{9}$ for eight rows plus the master check; even without relying on that assumption, the per-row-plus-master failure probability of at most $1/2053^2$ is already negligible for any practical purpose.

   From the user's perspective, this behavior justifies the informal statement that "there is no realistic way for arithmetic errors to pass through all row and master checks unnoticed," while still providing a quantitative bound suitable for formal analysis.

#### 3.6 The Share Format and Recovery Worksheet

Schiavinato Sharing is not merely a mathematical construction but also a specification for the layout of human-usable share documents.

Each individual share document (corresponding to a fixed index $x \in \{1, ..., n\}$) contains:

- **Header metadata**:
  - **Wallet Identifier**: an optional user-defined name or label.
  - **Creation Date**: optional, to assist with lifecycle management.
  - **Scheme**: the threshold $k$-of-$n$ (e.g., "3-of-5"), mandatory.
  - **Share Number**: the index $x$ of this share (e.g., "Share #1"), mandatory.
  - **Master verification share**: the numeric value corresponding to the evaluation of the master verification polynomial at $x$, used only during the final verification step.

- **Body table**: typically formatted as 8 rows and 4 columns:
  - **Columns 1–3**: for each row $r$, the three share values corresponding to $(w_{r,1}, w_{r,2}, w_{r,3})$. Each numeric value in $\{0, ..., 2052\}$ is accompanied by its BIP39 mnemonic word if it is in the range 0–2047. For values 2048–2052 (which do not correspond to BIP39 words), the mnemonic column prints the numeric value verbatim rather than any word, and these values are never used directly in a final mnemonic; they are strictly intermediate artifacts of the arithmetic in $GF(2053)$.
  - **Column 4 ("Group Checksum")**: the checksum share value for $c_r$, displayed in the same numeric-plus-mnemonic format.

This consistent layout allows the user to treat each row as a self-contained unit during recovery: recover three words and one checksum, verify them immediately, and then proceed to the next row. By the time the final row is completed and the master verification number has been checked, the user has a high degree of assurance that all arithmetic has been performed correctly.

Because each share document displays multiple BIP39 words, there is a risk that an uninformed or overconfident user (or heir) might mistake a **single worksheet** for a complete wallet backup and attempt to type its word column directly into a wallet application. To reduce this confusion, the reference layout includes explicit visual cues:

- A prominent header warning on every worksheet, such as:  
  > **This is 1 of N shares for a wallet. Alone, it cannot recover funds. Do not enter this list into a wallet.**
- Clear labeling of the threshold and share index (e.g., "3-of-5 scheme, Share #2 of 5") in the header.
- A tabular structure with a dedicated checksum column, which visually distinguishes the document from a simple mnemonic list.
- Numeric-only entries for any values in 2048–2052, which signal that the worksheet is an intermediate arithmetic artifact rather than a standard wallet phrase.

The reference implementation MAY further bias coefficient selection so that each physical worksheet is likely to contain at least one visible numeric-only entry, without altering the underlying security properties of Shamir's scheme. This mild aesthetic constraint on randomness is purely a usability measure: it makes each share look less like a valid standalone BIP39 mnemonic while preserving information-theoretic secrecy and interoperability of the final recovered phrase.

#### 3.7 The Role of Lagrange Coefficients

A key enabler of manual recovery is the use of pre-computed Lagrange coefficients. For fixed share indices $(x_1, ..., x_k)$, each coefficient $\gamma_j$ is defined as

$$
\gamma_j = \prod_{\substack{i=1 \\ i \neq j}}^{k} \frac{x_i}{x_i - x_j} \quad (\text{mod } 2053)
$$

These coefficients depend only on the chosen subset of share indices, not on the secret values or the random coefficients. Once computed for a given subset, they can be used for every secret associated with those indices.

Schiavinato Sharing leverages this property as follows:

- For commonly used threshold schemes (e.g., 2-of-3, 2-of-4, 3-of-5), the documentation provides tables of $\gamma_j$ values for each possible subset of share indices.
- The GRIFORTIS tools include a "Lagrange calculator" that, given a modulus $p$, a threshold $k$, and a set of indices, computes the corresponding coefficients. Because this calculation involves modular division, it is delegated to a device, but it can safely be performed on a non-air-gapped computer: the coefficients contain no information about the secrets.

During manual recovery, the user simply looks up the appropriate $\gamma_j$ values and applies them as multipliers in $GF(2053)$. No modular inverses are needed in the recovery phase.

#### 3.8 Pre-Computed Coefficients for Common Schemes

For completeness, the following table lists pre-computed Lagrange coefficients $\gamma$ for selected small schemes in $GF(2053)$. Share indices are assumed to be consecutive integers starting from 1.

| Scheme | Shares Used | Coefficients ($\gamma$) |
| :--- | :--- | :--- |
| **2-of-3** | {1, 2} | (2, 2052) |
|  | {1, 3} | (1028, 1026) |
|  | {2, 3} | (3, 2051) |
| **2-of-4** | {1, 2} | (2, 2052) |
|  | {1, 3} | (1028, 1026) |
|  | {1, 4} | (1370, 684) |
|  | {2, 3} | (3, 2051) |
|  | {2, 4} | (2, 2052) |
|  | {3, 4} | (4, 2050) |
| **3-of-5** | {1, 2, 3} | (3, 2050, 1) |
|  | {1, 2, 4} | (687, 2051, 1369) |
|  | {1, 2, 5} | (1029, 1367, 1711) |
|  | {1, 3, 4} | (2, 2051, 1) |
|  | {1, 3, 5} | (1285, 512, 257) |
|  | {1, 4, 5} | (686, 1367, 1) |
|  | {2, 3, 4} | (6, 2045, 3) |
|  | {2, 3, 5} | (5, 2048, 1) |
|  | {2, 4, 5} | (1372, 2048, 687) |
|  | {3, 4, 5} | (10, 2038, 6) |

These values were computed in $GF(2053)$ using the definition of $\gamma_j$ in Section 3.4 and are automatically verified in the reference implementation.

The number of possible index subsets grows combinatorially with $n$. For larger schemes, comprehensive tables become impractical, and users are expected to compute or obtain the relevant coefficients as needed.

#### 3.9 BIP39 Compatibility

Schiavinato Sharing operates on standard BIP39 word indices and does not alter the wordlist. The only deviation arises when a share value lies in the range 2048–2052, which cannot be mapped to a BIP39 word. In this rare case, the recovery instructions direct the user to write down the numeric value itself. The reference tools treat such values as non-mnemonic placeholders in intermediate calculations and only construct final mnemonics from values in 0–2047.

As a result, any recovered mnemonic that consists solely of indices in 0–2047 is a standard BIP39 phrase and is accepted by existing wallets without modification. The underlying entropy and checksum semantics of BIP39 are preserved.

The BIP39 specification also defines an **optional passphrase** (sometimes informally called the "25th word") that is combined with the mnemonic in a key-stretching step to derive the wallet seed. This passphrase is *not* part of the mnemonic phrase itself: two users with the same 12/24-word phrase but different passphrases derive unrelated seeds. Schiavinato Sharing deliberately treats the passphrase as an independent layer and does not attempt to shard or encode it.

From the perspective of this scheme:

- **Scope separation**: Because the passphrase is external to the mnemonic word sequence, including it in the arithmetic sharing of word indices would blur a clean boundary in the BIP39 model and complicate interoperability with existing wallets.
- **Passphrase strength and independence**: A BIP39 passphrase is most effective when it behaves as a separate, high-entropy secret. Folding it into the 24-word structure—so that "one set of shares reconstructs both phrase and passphrase"—would weaken this separation and diminish the security value of a strong passphrase.
- **Plausible deniability**: Many users rely on a passphrase to implement plausible deniability (for example, a decoy wallet with no passphrase and a hidden wallet with a strong passphrase). Hard-wiring the passphrase into the same shared structure as the mnemonic would make such policies harder to reason about and less flexible.

Consequently, Schiavinato Sharing leaves passphrase policy to wallet software and to the user's operational model. For long-term backup and inheritance planning, practitioners should carefully assess whether a BIP39 passphrase is necessary, and, if so, how its secret value will be communicated or escrowed to heirs (if at all). A rigorous treatment of passphrase design, plausible deniability, and inheritance workflows is beyond the scope of this paper and is best handled as a dedicated topic building on, but distinct from, the arithmetic scheme described here.

---

### **4. Security Analysis**

#### 4.0 Threat Model and Scope

Schiavinato Sharing is intended to protect the secrecy and recoverability of a BIP39 mnemonic under the following assumptions:

- An adversary may obtain, copy, or inspect **fewer than \(k\)** distinct shares for a given wallet, but not \(k\) or more shares.  
- Legitimate participants can coordinate to obtain **at least \(k\)** valid shares when recovery is required.  
- Share documents, once created, are not silently modified in a way that systematically alters multiple values while preserving all arithmetic checksums.

Within this model, the goals of the scheme are:

- **Confidentiality**: Any set of fewer than \(k\) shares should reveal no information about the underlying BIP39 mnemonic beyond what is already implied by its domain (approximately \(2^{256}\) possibilities).  
- **Integrity of recovery**: Given at least \(k\) honest shares, the combination of row-level checks and the master verification number should detect accidental arithmetic or transcription errors with overwhelmingly high probability.

The following aspects are **explicitly out of scope** for this paper:

- Side-channel attacks on software implementations (timing, cache behavior, hardware faults, etc.).  
- Attacks in which an adversary compromises **\(k\) or more** distinct shares or tampers with the physical custody of shares (for example, coercion of heirs, theft of multiple safe-deposit boxes, or long-term insider threats).  
- Social-engineering attacks against users, executors, or advisors, including attempts to trick them into revealing mnemonics, passphrases, or multiple shares.  
- Attacks on the underlying BIP39 ecosystem, including weaknesses in wallet RNGs, key-derivation functions, or downstream cryptographic protocols.

Under these assumptions, the analysis below focuses on the cryptographic properties inherited from Shamir's scheme and on the additional human-factor defenses introduced by Schiavinato Sharing.

#### 4.1 Security Properties and Information-Theoretic Guarantees

At its core, Schiavinato Sharing is a collection of independent Shamir secret-sharing instances over $GF(2053)$. Each word index, each row checksum, and the master verification number are shared by their own polynomials of degree at most $k-1$ with independently sampled random coefficients.

The security claims therefore reduce to the standard properties of Shamir's scheme:

- **Threshold property**: Any set of at least $k$ consistent shares for a given secret uniquely determines that secret. Any set of fewer than $k$ shares yields no information about the secret beyond what is already implied by its domain.
- **Information-theoretic secrecy**: For any two candidate secret values $s_0, s_1 \in GF(2053)$, the distribution of any $t < k$ shares generated from $s_0$ is identical to the distribution of $t$ shares generated from $s_1$, assuming coefficients are sampled uniformly and independently (with $a_{k-1}$ uniform over non-zero elements); in this sense the scheme provides perfect, information-theoretic (unconditional) secrecy for each shared value.

Because each of the 33 secrets is shared independently, knowledge of shares or even full recovery of one secret does not aid in recovering any other secret without the requisite number of shares for that secret. In particular, the checksum secrets do not leak information about individual word indices beyond the arithmetic relationships deliberately encoded (e.g., sums modulo 2053): with fewer than $k$ shares, even conditioning on equations such as $c_r = \sum w_{r,i} \pmod{2053}$ or $M = \sum w_i \pmod{2053}$ does not reveal additional information about any single $w_{r,i}$ beyond its domain.

The effective keyspace of a 24-word BIP39 mnemonic is approximately $2^{256}$. Representing the mnemonic as 24 indices in $GF(2053)$ does not compress this space; it merely maps it into a larger ambient field. Consequently, while each shared secret enjoys information-theoretic secrecy up to the threshold, the overall brute-force complexity for guessing a valid mnemonic remains the conventional $2^{256}$ associated with BIP39.

#### 4.2 Human-Factor Vulnerabilities and Mitigations

The primary new risk introduced by a human-executable scheme is not a weakness in the underlying cryptography but the possibility of **manual arithmetic errors** during recovery. These can occur during modular multiplication, addition, or transcription of intermediate results.

The two-layer checksum mechanism described in Section 3.5 is designed to mitigate this risk:

- Row-level checksums localize errors to specific rows, enabling users to detect and correct mistakes before propagating them.
- The master verification number adds a global consistency check over all 24 recovered words, ensuring that no residual errors remain undetected.

Under the same random-error model discussed in Section 3.5, the probability that an incorrect row passes its checksum test is at most $1/2053$, and the probability that such errors also preserve the (recomputed) master verification number is at most another factor of $1/2053$. With an additional independence assumption across rows this yields an overall error-escape probability on the order of $(1/2053)^9$; even without that assumption, the per-row-plus-master bound of $1/2053^2$ is already so small as to be negligible in practice.

From a usability perspective, the design offers a favorable trade-off: users perform only familiar operations (addition, multiplication, reduction) and receive immediate feedback at the row level, significantly reducing the cognitive load and the risk of silent failure.

A distinct human-factor concern is the temptation to treat a single share as if it were a complete BIP39 mnemonic. Because individual worksheets may display only indices in 0–2047, a naive user could, in principle, enter the word column of a single share into a wallet. Cryptographically, this does not weaken the scheme: any one share remains information-theoretically useless for recovering the true wallet, and if accepted at all, such input would at best open an unrelated empty wallet. However, this behavior could mislead heirs or operators about the existence of additional shares. Schiavinato Sharing addresses this by (i) emphasizing, in documentation and on the worksheets themselves, that no single share is a valid wallet backup, and (ii) using layout and numeric-only markers to make each share look deliberately unlike a canonical mnemonic. In adversarial settings, this behavior can even support plausible deniability: an attacker holding only one share learns no more than that they possess a random-looking set of BIP39-compatible words and numbers, not a deterministically loaded wallet.

#### 4.3 Physical Security Assumptions

As with any secret-sharing scheme, the overall security of Schiavinato Sharing depends on the physical handling of shares. The analysis assumes that:

- No adversary can reliably obtain $k$ or more distinct shares for the same wallet.
- Legitimate participants can access at least $k$ valid shares when recovery is required.
- Shares are protected against tampering, loss, and unauthorized duplication according to the user's threat model.

The scheme does not prescribe a particular strategy for distributing or storing shares (for example, geographically or socially), as such strategies are context-dependent. It simply provides a mathematically sound mechanism for ensuring that fewer than $k$ shares reveal nothing about the BIP39 secret.

---

### **5. The GRIFORTIS Reference Implementation**

To facilitate adoption and independent auditing, this section sketches a set of open-source reference tools that implement Schiavinato Sharing. GRIFORTIS intends to develop these tools so that they embody the same principles of simplicity, transparency, and offline operation that motivate the scheme itself.

#### 5.1 The `schiavinato-sharing.html` Tool

The primary reference implementation is a single self-contained HTML/JavaScript file, intended to be executed on an air-gapped computer. Its design adheres to the following constraints:

- **Offline by construction**: The file embeds all required assets (JavaScript, CSS, and fonts) and does not load any external resources. It makes no network requests, performs no telemetry, and implements no automatic update mechanism.
- **Verifiable distribution**: Each released version is accompanied by a published SHA-256 checksum. Users are expected to verify the checksum before running the tool, especially on air-gapped systems.
- **Explicit threat model**: The documentation instructs users to download the file from a trusted source, verify its checksum, and transfer it to an air-gapped machine (for example, via a write-once medium) before use. The security of the workflow depends on these operational practices.

Within these constraints, the tool offers four main workflows:

1. **Automated Sharding**: A guided wizard that:
   - prompts the user to enter an existing BIP39 mnemonic,
   - validates the BIP39 checksum,
   - asks for a desired $k$-of-$n$ scheme and optional metadata,
   - generates the 33 underlying secrets and their shares in $GF(2053)$,
   - presents each share on the screen for manual transcription or as a printable worksheet with the structure described in Section 3.6, and
   - may, in a future implementation, additionally encode the same share data as a QR code printed alongside the worksheet, to offer an optional, machine-readable path for heirs while preserving the canonical pencil-and-paper recovery path.

2. **Automated Recovery**: A wizard that:
   - accepts at least $k$ share worksheets (entered manually or via QR code),
   - reconstructs the 33 secrets by performing Lagrange interpolation in $GF(2053)$,
   - applies the row-level checks and the master verification check, as well as the BIP39 checksum, and
   - outputs the recovered BIP39 mnemonic only if all checks pass.

3. **Manual Sharding Helper**: A utility that:
   - allows users who wish to perform polynomial evaluations by hand to obtain cryptographically secure random coefficients for each secret,
   - presents the resulting polynomials in a human-readable form (for example, $f(x) = [\text{Secret}] + 1234x + 567x^2$).

4. **Manual Recovery Helper (Lagrange Calculator)**: A utility that:
   - computes Lagrange coefficients for arbitrary combinations of share indices in $GF(2053)$,
   - outputs them as small integers suitable for manual multiplication.

Although the tool is designed for convenience, its logic and arithmetic are intentionally straightforward so that independent auditors can validate the implementation against the specification.

#### 5.2 The `schiavinato_sharing` Libraries

For developers and auditors, we outline the design of reference libraries in both Python and JavaScript (with TypeScript type declarations). These libraries are intended to expose the core cryptographic and combinatorial operations of Schiavinato Sharing.

At a high level, the API is organized around the following concepts:

- **Share representation**: A `MnemonicShare` object encapsulates:
  - global metadata: wallet identifier, creation date, threshold parameters $k$ and $n$, share index $x$;
  - the 8×4 table of integer values in $\{0, ..., 2052\}$ corresponding to the 24 word shares and 8 row-checksum shares;
  - a separate integer in $\{0, ..., 2052\}$ representing the master verification share for index $x$;
  - optionally, the corresponding BIP39 mnemonic words for values in 0–2047.

- **High-level functions**:
  - `split_bip39(mnemonic, k, n, rng=None) -> List[MnemonicShare]`:
    - validates the input mnemonic as BIP39,
    - converts it to word indices,
    - constructs the 33 secrets (24 words, 8 row checksums, and 1 master verification number),
    - samples random polynomials and evaluates them at indices $\{1, ..., n\}$,
    - returns a list of `MnemonicShare` objects suitable for display or printing.
  - `recover_bip39(shares: Sequence[MnemonicShare]) -> str`:
    - verifies that the provided shares are consistent (same wallet metadata and threshold),
    - for each of the 33 secrets, selects any $k$ distinct share indices and performs Lagrange interpolation in $GF(2053)$,
    - applies row-level checksum verification and the master verification number,
    - reconstructs and returns the BIP39 mnemonic if all checks succeed, or raises an error otherwise.

- **Lower-level helpers**:
  - functions for modular arithmetic in $GF(2053)$,
  - a function to compute Lagrange coefficients for given indices and modulus,
  - routines to map between integer indices and BIP39 words.

The JavaScript library mirrors this structure with idiomatic naming (`splitBip39`, `recoverBip39`, etc.) and includes TypeScript declaration files for static type checking.

All reference implementations are released under the **MIT License**, allowing integration into third-party systems and enabling independent reimplementations in additional languages.

#### 5.3 Scope Clarification

The GRIFORTIS tools are deliberately narrow in scope:

- They **do not generate new BIP39 master seeds**. Users are expected to generate mnemonics through their preferred wallets or hardware devices.
- They focus exclusively on **splitting and recovering existing BIP39 mnemonics** using Schiavinato Sharing.
- They do not perform any signing operations, key derivation, or transaction management.

This separation of concerns simplifies auditing and reduces the attack surface: the tools handle only the arithmetic and bookkeeping associated with secret sharing and recovery.

---

### **6. Future Work and Applications**

Several directions for future work and further applications are natural extensions of Schiavinato Sharing and its reference implementation:

- **Integration with existing wallets**:  
  Tools and plug-ins that integrate Schiavinato Sharing with popular wallets could streamline recovery workflows while keeping core signing and derivation logic unchanged. For example, an offline device could recover a mnemonic from shares and then hand it directly to a wallet application without exposing it to networked systems.

- **Standardized share encoding formats**:  
  A formal, implementation-independent specification for encoding `MnemonicShare` objects (e.g., in JSON or CBOR) would facilitate interoperability. This encoding could be mapped to visual formats such as QR codes or UR-style strings, enabling hybrid workflows where shares are both printable and scannable, while preserving the option of purely paper-based operation.

- **Formal specification and verification**:  
  A precise, machine-readable specification of the arithmetic routines (including polynomial evaluation and Lagrange interpolation in $GF(2053)$) would enable formal verification efforts. Techniques such as property-based testing, model checking, or proof assistants could be applied to ensure that implementations conform exactly to the mathematical model.

- **Extended coefficient tables and tooling**:  
  For more complex threshold schemes, automated generation and publication of Lagrange coefficient tables, together with user-friendly calculators, would further reduce friction for advanced users.

Community contributions—such as ports of the reference library to additional languages (e.g., Rust, Go, or C) or independently developed tooling built on the specification—are explicitly encouraged.

---

### **7. Conclusion**

Schiavinato Sharing presents a human-centric adaptation of Shamir's Secret Sharing for BIP39 mnemonics. By operating directly on word indices in a small prime field and layering in robust arithmetic checksums, it enables manual recovery with only pencil and paper while preserving the information-theoretic security of the underlying scheme.

The GRIFORTIS reference implementation demonstrates that such a scheme can be realized in a single auditable HTML file and small, MIT-licensed libraries suitable for integration and scrutiny. Taken together, the design offers a practical path toward more resilient, verifiable, and long-lived storage of digital bearer assets.

---

### **8. References**

- A. Shamir, "How to Share a Secret," *Communications of the ACM*, vol. 22, no. 11, pp. 612–613, 1979.
- "BIP-0039: Mnemonic code for generating deterministic keys," Bitcoin Improvement Proposals.
- "SLIP-0039: Shamir's Secret-Sharing for Mnemonic Codes," SatoshiLabs.
- "Sharded Secret Key Reconstruction (SSKR)," Blockchain Commons.
- Standard cryptography and secret-sharing texts and surveys discussing Shamir's scheme and its applications.

---

### **Appendix A: A Primer on Shamir's Secret Sharing**

Shamir's Secret Sharing is a threshold scheme that allows a secret value to be split into $n$ shares such that any $k$ shares suffice to reconstruct the secret, while any $t < k$ shares provide no information about it.

At a high level:

1. **Finite field**: Choose a finite field $GF(q)$, typically with $q$ a prime or a prime power. In this paper, $q = 2053$.
2. **Polynomial encoding**: To share a secret $s \in GF(q)$, select a random polynomial

   $$
   f(x) = a_0 + a_1 x + ... + a_{k-1} x^{k-1}
   $$

   with $a_0 = s$ and $(a_1, ..., a_{k-1})$ chosen uniformly at random from $GF(q)$. To ensure the polynomial always has degree exactly $k-1$, implementations (including Schiavinato Sharing) typically require that the leading coefficient $a_{k-1}$ be non-zero.

3. **Share generation**: For each participant index $x \in \{1, ..., n\}$, compute the share $y = f(x)$. The pair $(x, y)$ is given to that participant.

4. **Reconstruction**: Any group of $k$ participants can reconstruct the secret by interpolating the unique degree-$(k-1)$ polynomial that passes through their $k$ points and evaluating it at $x = 0$.

The security intuition is that specifying a polynomial of degree at most $k-1$ requires $k$ points. With fewer than $k$ points, there are many possible polynomials consistent with the observed values, each corresponding to a different secret $a_0$. Because the coefficients $(a_1, ..., a_{k-1})$ are sampled uniformly and independently, every candidate secret is equally likely given fewer than $k$ shares.

Formally, for any set of $t < k$ observed shares and any two candidate secrets $s_0, s_1 \in GF(q)$, there exists a one-to-one mapping between polynomials consistent with $s_0$ and those consistent with $s_1$, implying that the distributions of shares are identical. This yields perfect, information-theoretic secrecy.

---

### **Appendix B: A Gentle Introduction to Modular Arithmetic**

Modular arithmetic is the system of arithmetic that makes Schiavinato Sharing executable by hand. It behaves like "clock arithmetic": values wrap around after reaching a fixed modulus.

#### B.1 The Modulus and Basic Operations

In standard arithmetic, integers extend indefinitely in both directions. In modular arithmetic with modulus $p$, we identify integers that differ by a multiple of $p$. Every value is represented by one of the residues

$$
0, 1, 2, ..., p-1
$$

For example, with modulus 12 (a clock with 12 hours):

- $8 + 5 = 13$, but $13 \bmod 12 = 1$.
- $20 \bmod 12 = 8$.
- $-1 \bmod 12 = 11$.

Addition and multiplication follow the usual rules, followed by reduction modulo $p$. In Schiavinato Sharing, the modulus is the prime

$$
p = 2053
$$

so all intermediate and final results are reduced to the range 0–2052.

#### B.2 Examples in $GF(2053)$

Consider the following examples:

- $2000 + 100 = 2100$. Reducing modulo 2053 gives $2100 - 2053 = 47$, so $2100 \bmod 2053 = 47$.
- $1000 \times 3 = 3000$. Reducing modulo 2053 gives $3000 - 2053 = 947$, so $3000 \bmod 2053 = 947$.

Subtraction is handled similarly:

- $50 - 100 = -50$. To reduce $-50$ modulo 2053, we can add 2053: $-50 + 2053 = 2003$. Thus, $-50 \bmod 2053 = 2003$.

These operations are sufficient for evaluating polynomials and performing the weighted sums required for Lagrange interpolation.

#### B.3 Prime Fields and Division

When the modulus $p$ is prime, the set $\{0, 1, ..., p-1\}$ with addition and multiplication modulo $p$ forms a **finite field** $GF(p)$. In a field, every non-zero element has a multiplicative inverse:

$$
a \cdot a^{-1} \equiv 1 \quad (\text{mod } p)
$$

Division by a non-zero element $a$ is defined as multiplication by its inverse $a^{-1}$. Finding inverses in practice can be done using the extended Euclidean algorithm, but this process is more involved than simple addition or multiplication.

One of the reasons Schiavinato Sharing pre-computes Lagrange coefficients is precisely to avoid asking users to compute modular inverses by hand. All required division is encapsulated in those coefficients. Users performing recovery only need to multiply and add integers modulo 2053.

---

### **Appendix C: Demystifying Lagrange Interpolation**

Lagrange interpolation provides a formula for reconstructing a polynomial from its values at a finite set of points. In the context of Shamir's Secret Sharing, it is the tool that allows us to recover the secret from a threshold of shares.

#### C.1 Intuitive Picture

Consider first the simple case of lines in the plane. A straight line can be determined uniquely by two distinct points. Given two points $(x_1, y_1)$ and $(x_2, y_2)$, there is exactly one line that passes through both. If we know the equation of that line, we can evaluate it at any other $x$ to obtain the corresponding $y$.

Polynomials of higher degree behave similarly:

- A polynomial of degree at most 1 (a line) is determined by 2 points.
- A polynomial of degree at most 2 (a parabola) is determined by 3 points.
- In general, a polynomial of degree at most $k-1$ is determined by $k$ points with distinct $x$-coordinates.

Lagrange interpolation provides explicit formulas for constructing that polynomial from the points. In Shamir's scheme, we are interested in the value at $x = 0$, which encodes the secret.

#### C.2 The Lagrange Basis Polynomials

Let $(x_1, ..., x_k)$ be distinct elements of $GF(2053)$, and let $y_j = f(x_j)$ be the corresponding share values for some unknown polynomial $f(x)$ of degree at most $k-1$.

The Lagrange basis polynomials are defined as:

$$
\ell_j(x) = \prod_{\substack{i=1 \\ i \neq j}}^{k} \frac{x - x_i}{x_j - x_i} \quad (\text{mod } 2053)
$$

Each $\ell_j(x)$ has the property that:

- $\ell_j(x_j) = 1$,
- $\ell_j(x_i) = 0$ for all $i \neq j$.

The interpolating polynomial is then

$$
f(x) = \sum_{j=1}^{k} y_j \ell_j(x)
$$

It is straightforward to verify that $f(x_i) = y_i$ for each $i$, since all other basis terms vanish at $x = x_i$.

#### C.3 Recovering the Secret at $x = 0$

In Shamir's scheme, the secret is $a_0 = f(0)$. Evaluating the expression above at $x = 0$ yields:

$$
f(0) = \sum_{j=1}^{k} y_j \ell_j(0)
$$

Define the Lagrange coefficients

$$
\gamma_j = \ell_j(0) = \prod_{\substack{i=1 \\ i \neq j}}^{k} \frac{0 - x_i}{x_j - x_i} = \prod_{\substack{i=1 \\ i \neq j}}^{k} \frac{-x_i}{x_j - x_i} \quad (\text{mod } 2053)
$$

Then

$$
a_0 = f(0) = \sum_{j=1}^{k} \gamma_j y_j \quad (\text{mod } 2053)
$$

This is precisely the formula used by Schiavinato Sharing. Once the $\gamma_j$ corresponding to a particular subset of share indices have been computed, recovery of the secret reduces to a weighted sum.

#### C.4 Practical Considerations

Computing the $\gamma_j$ from the defining formula requires modular inverses of the denominators $x_j - x_i$. While this is straightforward for software, it is undesirable for manual computation. Instead, Schiavinato Sharing:

- treats $\gamma_j$ as non-secret and safe to compute on any device, and
- provides pre-computed $\gamma_j$ tables for common schemes, so manual users only ever perform multiplications and additions.

This separation keeps manual recovery within the reach of users comfortable with basic arithmetic, while leaving the more intricate field operations to tools that can be audited once and used many times.

---

### **Appendix D: Worked Example of Manual Sharing and Recovery**

To illustrate the mechanics of Schiavinato Sharing in a compact setting, this appendix presents a toy example using a small prime modulus. The real scheme uses $p = 2053$; here we use $p = 13$ for simplicity. The structure of the calculations is the same, but the numbers are smaller.

#### D.1 Setup

Suppose we have a toy wordlist of 8 words, indexed 0–7. We select a 3-word "mnemonic":

- Word A: index 3
- Word B: index 5
- Word C: index 7

We arrange these as a single row of three words and define a checksum secret

$$
c = (3 + 5 + 7) \bmod 13 = 15 \bmod 13 = 2
$$

We choose a 2-of-3 scheme: any 2 of 3 shares suffice for recovery. For each of the four secrets (A, B, C, and $c$), we define an independent polynomial of degree at most 1:

$$
\begin{aligned}
f_A(x) &= 3 + a_1 x \\
f_B(x) &= 5 + b_1 x \\
f_C(x) &= 7 + c_1 x \\
f_c(x) &= 2 + d_1 x
\end{aligned}
$$

with coefficients chosen uniformly at random from $\{0, ..., 12\}$. For illustration, suppose we draw:

$$
a_1 = 4,\quad b_1 = 6,\quad c_1 = 1,\quad d_1 = 9
$$

#### D.2 Generating Shares

We evaluate each polynomial at $x = 1, 2, 3$:

- For $x = 1$:
  - $A_1 = f_A(1) = 3 + 4 \cdot 1 = 7 \bmod 13$,
  - $B_1 = f_B(1) = 5 + 6 \cdot 1 = 11 \bmod 13$,
  - $C_1 = f_C(1) = 7 + 1 \cdot 1 = 8 \bmod 13$,
  - $c_1 = f_c(1) = 2 + 9 \cdot 1 = 11 \bmod 13$.

- For $x = 2$:
  - $A_2 = f_A(2) = 3 + 4 \cdot 2 = 11 \bmod 13$,
  - $B_2 = f_B(2) = 5 + 6 \cdot 2 = 17 \bmod 13 = 4$,
  - $C_2 = f_C(2) = 7 + 1 \cdot 2 = 9 \bmod 13$,
  - $c_2 = f_c(2) = 2 + 9 \cdot 2 = 20 \bmod 13 = 7$.

- For $x = 3$:
  - $A_3 = f_A(3) = 3 + 4 \cdot 3 = 15 \bmod 13 = 2$,
  - $B_3 = f_B(3) = 5 + 6 \cdot 3 = 23 \bmod 13 = 10$,
  - $C_3 = f_C(3) = 7 + 1 \cdot 3 = 10 \bmod 13$,
  - $c_3 = f_c(3) = 2 + 9 \cdot 3 = 29 \bmod 13 = 3$.

Each share $x \in \{1,2,3\}$ receives the row $(A_x, B_x, C_x, c_x)$.

#### D.3 Pre-Computed Lagrange Coefficients for 2-of-3

For a 2-of-3 scheme with share indices 1, 2, and 3, the Lagrange coefficients in $GF(13)$ for reconstructing $f(0)$ from two shares are:

- Using shares $\{1, 2\}$: $(\gamma_1, \gamma_2) = (2, 12)$,
- Using shares $\{1, 3\}$: $(\gamma_1, \gamma_3) = (8, 6)$,
- Using shares $\{2, 3\}$: $(\gamma_2, \gamma_3) = (3, 11)$.

These values can be verified by applying the general formula for $\gamma_j$ with modulus 13.

#### D.4 Recovering from Two Shares

Suppose we hold shares 1 and 3. To recover the four secrets, we apply the coefficients $(\gamma_1, \gamma_3) = (8, 6)$ in $GF(13)$.

- **Secret A**:
  - $A_1 = 7$, $A_3 = 2$,
  - $a_0 = 8 \cdot A_1 + 6 \cdot A_3 = 8 \cdot 7 + 6 \cdot 2 = 56 + 12 = 68 \bmod 13$.
  - Since $13 \cdot 5 = 65$, $68 \bmod 13 = 3$, which matches the original index of Word A.

- **Secret B**:
  - $B_1 = 11$, $B_3 = 10$,
  - $b_0 = 8 \cdot B_1 + 6 \cdot B_3 = 8 \cdot 11 + 6 \cdot 10 = 88 + 60 = 148 \bmod 13$.
  - Since $13 \cdot 11 = 143$, $148 \bmod 13 = 5$, which matches the original index of Word B.

- **Secret C**:
  - $C_1 = 8$, $C_3 = 10$,
  - $c_0 = 8 \cdot C_1 + 6 \cdot C_3 = 8 \cdot 8 + 6 \cdot 10 = 64 + 60 = 124 \bmod 13$.
  - Since $13 \cdot 9 = 117$, $124 \bmod 13 = 7$, which matches the original index of Word C.

- **Checksum secret**:
  - $c_1 = 11$, $c_3 = 3$,
  - $c^\star = 8 \cdot c_1 + 6 \cdot c_3 = 8 \cdot 11 + 6 \cdot 3 = 88 + 18 = 106 \bmod 13$.
  - Since $13 \cdot 8 = 104$, $106 \bmod 13 = 2$, which matches the original checksum value $c = 2$.

Finally, we verify the row checksum directly:

$$
(a_0 + b_0 + c_0) \bmod 13 = (3 + 5 + 7) \bmod 13 = 15 \bmod 13 = 2 = c^\star
$$

This confirms that the recovered secrets and the checksum are internally consistent.

In the actual Schiavinato Sharing scheme, all arithmetic is performed in $GF(2053)$ and Lagrange coefficients are derived once from a precise specification, but the pattern of computation is exactly the same as in this toy example. Users performing manual recovery follow this pattern row by row, using pre-computed coefficients appropriate to their chosen threshold scheme.

---

### **Appendix E: Heir Instructions and Practical Recovery Guide**

This appendix is written for heirs and non-specialist executors who may encounter Schiavinato Sharing documents during an inheritance or disaster recovery process. It summarizes the essential facts in plain language.

#### E.1 What These Papers Are

- The documents labeled as **Schiavinato Sharing** are **shares** of a Bitcoin (or other cryptocurrency) wallet backup.
- Each sheet is **only one part** of the backup. By design, a single sheet **cannot** reveal or spend the funds.
- The original wallet was protected by a **BIP39 recovery phrase** (a list of 12 or 24 words). Schiavinato Sharing breaks that phrase into multiple shares so that only a group of them together can reconstruct it.

If you have been given these documents as part of an estate, you should assume that the owner intended at least some of them to be combined to restore access to funds.

#### E.2 What You Need to Recover the Wallet

- The owner chose numbers **k** and **n**:
  - **n** = total number of shares that exist.
  - **k** = minimum number of different shares required to recover the wallet.
- This is usually written as a **"k-of-n" scheme** (for example, "3-of-5").

To have a realistic chance of recovery, you must:

- Collect at least **k different shares** for the same wallet (same wallet name, creation date, and k-of-n scheme).
- Ensure the shares are genuine and have not obviously been tampered with.

If you only have **one share**, you do **not** have enough information to reconstruct the wallet, no matter how you manipulate that one sheet.

#### E.3 What Not to Do

- **Do not** type the words from a single share into a wallet app as if they were a complete recovery phrase.
  - At best, you will see an unrelated empty wallet.
  - At worst, you may be misled into thinking there were never any funds protected by these shares.
- **Do not** assume that a sheet that "looks like" a 24-word list is safe to use directly; in Schiavinato Sharing, each sheet is an **incomplete fragment** of a larger secret.
- **Do not** discard other shares after testing a single one and seeing no balance. Recovery requires **combining** multiple shares.

If you are unsure, stop and consult a qualified professional before interacting with any wallet software or moving funds.

#### E.4 How Recovery Typically Works

The exact steps depend on the tools available, but the general pattern is:

1. **Gather the necessary shares**:  
   Collect at least **k** distinct share documents with matching wallet name, creation date (if present), and k-of-n scheme.
2. **Choose a recovery method**:  
   - If a trusted **offline recovery tool** (such as the GRIFORTIS reference HTML tool) is available, follow its on-screen instructions.
   - If you are working with a security professional, they should **guide you** through the reconstruction process while you retain physical control of all shares and perform any typing or arithmetic yourself.
3. **Reconstruct the mnemonic**:  
   The tool or expert will:
   - Combine the numbers on the worksheets using a defined set of arithmetic rules.
   - Use built-in checksums to verify that no mistakes occurred.
   - Produce a standard **BIP39 recovery phrase** (for example, 24 English words).
4. **Use the recovered mnemonic carefully**:  
   - The recovered phrase is extremely sensitive. Anyone who sees it can, in principle, move the funds.
   - It should only be entered into a wallet in a controlled, preferably offline or hardware-secured, environment.

You should keep all original share documents safe until you are certain that the estate's intentions have been fully carried out.

#### E.5 About Passphrases ("25th Word")

The original wallet may or may not have used an extra **BIP39 passphrase**, sometimes called the "25th word." This passphrase:

- Is **not written on the Schiavinato Sharing worksheets**.
- Is a separate secret that changes the wallet derived from the same 12/24-word phrase.

If a strong passphrase was used and is not known or documented anywhere, it may be impossible to recover the exact wallet, even with all the shares. Estate planning around passphrases is outside the scope of this appendix; executors should treat any mention of an additional passphrase in other documents with great care.

#### E.6 When to Seek Help

If any of the following are true, professional assistance is strongly recommended:

- You do not clearly understand the difference between **shares** and a complete **recovery phrase**.
- You have **fewer than k shares** and are unsure whether more exist.
- You suspect that shares may have been lost, destroyed, or tampered with.
- The value protected by the wallet is significant relative to your risk tolerance.

In such cases, consult a professional who is familiar with BIP39, threshold secret sharing, and inheritance procedures. Their role should be advisory: they explain the process, help you avoid mistakes, and may verify your arithmetic, but **you** keep custody of the shares and perform all sensitive actions (such as entering recovery phrases into devices or printing new shares). As a rule of thumb, aim for a process where the specialist could walk away after the session knowing **how** you recovered the wallet but not possessing any secrets that would allow them to do it themselves later.

---

### **Appendix F: Deployment Patterns and Real-World Scenarios**

This appendix sketches example ways to deploy Schiavinato Sharing in practice. These patterns are not prescriptions; they are starting points for discussion with clients and advisors.

#### F.1 Single User with Geographic Redundancy (2-of-3)

- **Profile**: technically comfortable individual, moderate holdings, no complex heirs.  
- **Scheme**: 2-of-3.  
- **Distribution**:
  - Share #1 in a home safe.  
  - Share #2 in a bank safe-deposit box (or equivalent secure facility).  
  - Share #3 with a trusted relative or stored in a second location.

**Rationale**:

- Any single location loss (fire, theft, flood, bank issue) does not destroy the wallet.  
- An attacker must compromise at least **two** independent locations.  
- The owner alone can recover using any two shares without involving third parties.

**Operational notes**:

- Avoid keeping two shares side by side in the same container.  
- Document locations and access instructions clearly in non-secret estate paperwork.

#### F.2 Couple Without Heirs, 2-of-4 with Personal Redundancy

- **Profile**: couple with no planned heirs (or heirs not expected to manage this wallet), focused on resilience during their lifetimes and optional joint recovery in severe events.  
- **Scheme**: 2-of-4.  
- **Distribution (one example)**:
  - Share #1 with Partner A, stored in a **home safe**.  
  - Share #2 with Partner A, stored in a **work or office safe** (separate building).  
  - Share #3 with Partner B, stored in a **home safe** (which may or may not be the same as Partner A's).  
  - Share #4 with Partner B, stored in a **work or office safe** (separate building).

**Rationale**:

- Each partner alone can typically recover in a crisis by accessing **two locations** they control (for example, home + office).  
- A single physical disaster (house fire, office burglary) is unlikely to destroy all four shares at once.  
- No third party (lawyer, bank, consultant) ever needs to see a share; the entire scheme is contained within the couple's own environments.

**Operational notes**:

- Treat home and office as genuinely separate security domains (different keys, alarms, access policies).  
- Avoid casually copying shares into digital form (photos, cloud scans); the strength of this pattern depends on keeping the paper trail small, well controlled, and clearly labelled.  
- If the couple later decides to involve heirs or charities, they can retire this 2-of-4 arrangement and establish a new scheme (for example, a 3-of-5 pattern as in the next subsection) by **reconstructing the mnemonic and re-sharing it**. The mathematical construction remains the same, but the physical shares, locations, and participants are deliberately redesigned.

#### F.3 Couple with Heirs and Executor (3-of-5)

- **Profile**: couple planning for multi-decade inheritance, moderate-to-high holdings.  
- **Scheme**: 3-of-5.  
- **Distribution (one example)**:
  - Share #1 with Partner A (home safe).  
  - Share #2 with Partner B (home safe or separate safe).  
  - Share #3 with a trusted executor or attorney.  
  - Share #4 in a bank safe-deposit box.  
  - Share #5 in a geographically distant secure location or with a second trusted family member.

**Rationale**:

- During life, either partner can typically assemble 3 shares without granting any outsider independent control.  
- After death or incapacity, heirs and executor can collaborate to bring together 3 of 5 without any single person holding unilateral power.  
- Loss of one or even two shares is tolerable without immediate emergency.

**Operational notes**:

- Carefully document who is expected to participate in recovery (partners, executor, specific heirs).  
- Make expectations clear that no single professional (e.g., funeral home, lawyer, consultant) should ever hold 3 shares at once.

#### F.4 Social Recovery with Friends or Colleagues (k-of-n ≥ 2-of-3)

- **Profile**: privacy-conscious individual with trusted social circle but no desire to rely on institutions.  
- **Scheme**: 2-of-3, 3-of-5, or similar.  
- **Distribution**:
  - One or two shares kept by the owner.  
  - Remaining shares held by carefully chosen friends or colleagues.

**Rationale**:

- Reduces dependency on formal institutions.  
- Encourages explicit, documented trust relationships and recovery plans.

**Risks and mitigations**:

- Social relationships can change; review share assignments over time.  
- For contentious families or business partners, consider involving a neutral professional who participates **advisory-only** (no custody of shares).

#### F.5 When Not to Use Very Large $n$

- Large $n$ (for example, 2-of-10 or 3-of-12) can seem attractive, but in practice:
  - Tracking many physical documents increases the chance of loss, theft, or confusion.  
  - Heirs may struggle to locate enough valid shares decades later.

As a rule of thumb:

- Keep $n$ small enough that all share locations can be **named and documented** clearly.  
- Use additional layers (for example, a separate BIP39 passphrase, or independent wallets) rather than extremely large $n$ to express complex policies.

#### F.6 Alignment with the "We Instruct, You Execute" Model

Across all patterns above, a central operational principle is:

- **Advisors design; clients execute.**

In practice, this means:

- Advisors help choose $k$, $n$, locations, and processes.  
- Clients (or trusted family members) **enter the mnemonic**, run the tools, and print or transcribe shares.  
- Professionals are present for planning and verification, but do not walk away with enough information to reconstruct the wallet on their own.

This division of roles aligns Schiavinato Sharing with an ethos of user empowerment and minimized custodial trust.

---

### **Appendix G: Dice-Based Randomness Procedure for $GF(2053)$**

This appendix specifies one concrete way to generate uniformly random integers in $\{0, ..., 2052\}$ using only fair six-sided dice. Other entropy sources are acceptable as long as they provide at least as much unpredictability.

#### G.1 Overview

- We use **five** fair six-sided dice per attempt.  
- Each attempt produces an integer $N \in \{0, ..., 7775\}$ by interpreting the dice as a base-6 number.  
- If $N$ is in an accepted range, we reduce it modulo 2053 (for coefficients $a_1, ..., a_{k-2}$) or modulo 2052 and add 1 (for the leading coefficient $a_{k-1}$) to obtain a valid coefficient; otherwise we discard the attempt and roll again.

Because $3 \cdot 2053 = 6159 \le 7776 < 4 \cdot 2053$, the first 6159 base-6 outcomes can be partitioned into three equal-sized blocks, each of size 2053. Restricting to this accepted region and then taking $N \bmod 2053$ yields a uniform distribution on $\{0, ..., 2052\}$. A similar process is used for the non-zero leading coefficient.

#### G.2 Step-by-Step Procedure

For each random coefficient you need:

1. **Determine the required range**:
   - For coefficients $a_1, ..., a_{k-2}$, the target range is $\{0, ..., 2052\}$.
   - For the leading coefficient $a_{k-1}$, the target range is $\{1, ..., 2052\}$.

2. **Roll 5 dice**  
   - Label the dice in reading order (for example, left to right) as $d_1, d_2, d_3, d_4, d_5$.  
   - Each $d_i$ is in $\{1,2,3,4,5,6\}$.

3. **Convert to a base-6 integer $N$**  
   - First convert each die to a digit $r_i = d_i - 1 \in \{0, ..., 5\}$.  
   - Compute
     $$
     N = ((((r_1 \cdot 6 + r_2) \cdot 6 + r_3) \cdot 6 + r_4) \cdot 6 + r_5),
     $$
     which yields $N \in \{0, ..., 7775\}$.  
   - This calculation only requires repeated multiplication by 6 and addition.

4. **Apply an acceptance test and reduce**
   - **For coefficients $a_1, ..., a_{k-2}$ (range 0-2052):**
     - If $N \ge 6159$, **reject** this attempt and go back to step 2.
     - If $N \le 6158$, **accept** and compute $s = N \bmod 2053$.
   - **For the leading coefficient $a_{k-1}$ (range 1-2052):**
     - We need a uniform value in a range of size 2052. We can use rejection sampling. The largest multiple of 2052 less than 7776 is $3 \cdot 2052 = 6156$.
     - If $N \ge 6156$, **reject** this attempt and go back to step 2.
     - If $N \le 6155$, **accept** and compute $s = (N \bmod 2052) + 1$.

5. **Use $s$ as the coefficient**  
   - The final value $s$ is your random coefficient.
   - Record it as an integer in the appropriate range.

Because the acceptance probability is high in both cases (approx. 79%), this procedure is practical for manual use. All arithmetic operations are limited to addition, subtraction, and multiplication by 6 and by small integers, keeping the procedure within the reach of careful pencil-and-paper workflows.
