# Schiavinato Sharing: Human-Executable Secret Sharing for BIP39 Mnemonics

**A Pencil-and-Paper Arithmetic Scheme for Multi-Chain Inheritance and Disaster Recovery**

**Author:** Renato Schiavinato Lopez  
**Organization:** GRIFORTIS  
**Website:** https://github.com/GRIFORTIS  
**Status:** Request for Comments (RFC) - v0.2.0  
**Comment Period:** Through January 31, 2026

> **Note:** This is a Markdown convenience copy. The canonical source is `WHITEPAPER.tex`.

---

## Abstract

The Schiavinato BIP39 Mnemonic Sharing Scheme (or **Schiavinato Sharing**) is a threshold secret-sharing scheme for BIP39 mnemonics, designed explicitly for recovery with pencil and paper. It provides universal protection for multi-chain cryptocurrency portfolios (Bitcoin, Ethereum, and all BIP39-compatible blockchains) using a single sharing instance. The scheme instantiates Shamir's Secret Sharing [1] over the prime field $GF(2053)$, operating directly on BIP39 word indices [9] rather than on the underlying binary entropy. Each word index is sharded independently by a random polynomial, and additional checksum secrets provide robust detection of human arithmetic errors during manual recovery. By pre-computing Lagrange coefficients for common threshold schemes, the scheme reduces recovery to a sequence of additions and multiplications modulo 2053. GRIFORTIS has developed and released reference implementations under the MIT License, including a functional JavaScript/TypeScript library (v0.2.0), an auditable offline HTML tool with comprehensive test coverage, and reproducible test vectors for independent verification, all enabling integration and scrutiny while preserving the security guarantees of standard Shamir secret sharing.

---

## 1. Introduction

### 1.1 The Inheritance Problem in a Digital Age

The widespread use of cryptocurrencies and other digital bearer assets has created a new inheritance problem. Long-term control over these assets is typically anchored to a single secret, such as a 24-word BIP39 mnemonic [9], which serves as the master seed for hierarchical deterministic (HD) wallets [8] across Bitcoin, Ethereum, and the vast majority of modern blockchain ecosystems. If this secret is lost or destroyed, the assets are unrecoverable; if it is exposed, the assets can be stolen. Traditional backup strategies (for example, a single steel plate in a safe) concentrate risk and often fail to account for multi-generational time horizons [4].

Threshold cryptography and secret sharing offer a principled way to spread this risk. Instead of a single point of failure, a secret is divided into multiple shares, of which any $k$ out of $n$ are sufficient for recovery. However, most deployed schemes assume the presence of trusted electronics at the time of recovery. For true disaster resilience, it is desirable to have recovery paths that remain viable even when access to compatible hardware, software, or networks is temporarily or permanently unavailable, or compromised.

### 1.2 Existing Solutions and Their Limitations

Several practical solutions exist today:

- **Hardware wallets and single backups** rely on secure devices and careful handling of a single mnemonic. They are simple to operate but remain vulnerable to single-point failure and to latent user errors in backup procedures.
- **Multisignature wallets** distribute signing authority but require ongoing coordination of multiple keys, devices, and software stacks. They do not, by themselves, solve the problem of how each individual key is backed up or inherited.
- **Computational Shamir schemes**, such as SLIP39 [10] and SSKR, apply Shamir's Secret Sharing [1] at the level of binary entropy, typically over extension fields $GF(2^n)$. These schemes are well-studied and robust, but the field arithmetic—especially multiplication and inversion in $GF(2^n)$—is unsuitable for manual execution. In practice, users must depend on specific software or hardware implementations for both sharding and recovery.

In all these cases, the recovery procedure is ultimately a computational protocol. If an appropriate device is not available at the time of recovery, or if the software ecosystem has changed in incompatible ways, long-term access to the assets is jeopardized.

### 1.3 Comparison with Existing Approaches

Table 1 summarizes the key differences between Schiavinato Sharing and existing backup and recovery schemes. Key observations:

- **Unique value proposition**: Schiavinato Sharing is the only scheme that combines threshold secret sharing with manual recoverability while maintaining full BIP39 compatibility, enabling protection of *all* BIP39-compatible assets (Bitcoin, Ethereum, Polkadot, Cosmos, Solana, etc.) with a single sharing instance.
- **Indistinguishability and future-proof design**: Recovered mnemonics are identical to standard BIP39 phrases—no special format, no metadata, no version identifiers. This ensures backward compatibility with all wallets since 2013, forward compatibility with all future BIP39 implementations, and zero vendor lock-in. As long as BIP39 exists, Schiavinato Sharing works.
- **Universal multi-chain support**: Unlike SLIP39 and SSKR (which require custom wallet implementations), Schiavinato produces standard BIP39 mnemonics that work immediately with *any* BIP39-compatible wallet across *any* supported blockchain—no special software needed.
- **Zero on-chain footprint**: Unlike multisig schemes that require on-chain setup and fund migration, Schiavinato operates purely on the BIP39 mnemonic. Users can retroactively protect existing wallets without moving funds, paying transaction fees, or exposing addresses and balances on the blockchain. Shares are generated offline from the mnemonic alone—no wallet interaction required.
- **Trade-off**: Manual recovery requires more user effort (arithmetic) compared to SLIP39's purely electronic process, but eliminates the dependency on specific hardware or software, and protects entire multi-chain portfolios.
- **Complementary, not competitive**: Schiavinato Sharing addresses a specific use case (long-term, electronics-optional, multi-chain inheritance) and can coexist with other schemes serving different needs.

**Table 1: Comparison of Backup and Recovery Schemes for Multi-Chain Cryptocurrency Wallets**

| Feature | Schiavinato | SLIP39 | SSKR | Multisig | Single |
|---------|-------------|--------|------|----------|--------|
| Manual recovery | **Yes** | No | No | No | N/A |
| Electronics required | Optional | Required | Required | Required | Optional |
| Threshold scheme | Yes | Yes | Yes | Yes | No |
| Field arithmetic | $GF(2053)$ | $GF(2^{10})$ | $GF(2^8)$ | N/A | N/A |
| Input format | BIP39 | Custom | Custom | BIP32 | BIP39 |
| Output format | BIP39 | Custom | Custom | N/A | BIP39 |
| BIP39 compatible | **Yes** | No | Partial | No | Yes |
| Multi-chain support | **Universal**† | Limited | Limited | Per-chain | Universal |
| Wallet support | All BIP39 | Limited | Limited | Widespread | All BIP39 |
| Best for | Long-term inheritance | Hardware wallets | Blockchain Commons | On-chain control | Simple backups |

†*Universal: Recovered mnemonics are indistinguishable from standard BIP39 phrases. A single recovered mnemonic secures Bitcoin, Ethereum, Cosmos, Polkadot, Solana, and all BIP39-compatible chains via standard derivation paths. Works with any BIP39 wallet (past, present, or future) without requiring software updates or special support.*

### 1.4 Comparison with Manual-First Recovery Schemes

Recent years have seen growing interest in manual-executable secret sharing schemes that eliminate dependency on trusted electronics during recovery. Two notable approaches in this space are Codex32 and SeedXOR, each making different design trade-offs.

#### 1.4.1 Codex32

Codex32 [11] is a pioneering implementation of manual Shamir Secret Sharing for Bitcoin seeds, formalized as BIP-0093. It represents a significant advancement in human-computable cryptography for cryptocurrency custody.

**Strengths:**

- **Strong error correction**: Employs BCH (Bose-Chaudhuri-Hocquenghem) codes to detect and correct errors during manual operations, providing mathematical guarantees against transcription mistakes.
- **Fully air-gapped**: All operations—generation, splitting, and recovery—can be performed without electronic devices using paper computation wheels (volvelles) and lookup tables.
- **Rigorous specification**: Formalized as a Bitcoin Improvement Proposal with detailed operational procedures.

**Weaknesses:**

- **High complexity**: Requires mastery of volvelles (paper computation wheels) and multi-step lookup procedures, presenting a steep learning curve.
- **Time investment**: Manual operations are significantly more time-consuming than arithmetic-based approaches.
- **Custom encoding**: Uses bech32-style strings rather than standard BIP39 word lists, requiring conversion steps and limiting direct wallet compatibility.

Codex32 is best suited for users willing to invest substantial time and effort in exchange for maximum error-correction guarantees and complete independence from electronics.

#### 1.4.2 SeedXOR

SeedXOR [12] takes a fundamentally different approach, using XOR operations to split BIP39 mnemonics into multiple parts.

**Strengths:**

- **Simplicity**: XOR operations are conceptually straightforward and can be performed with basic tools or simple software.
- **Plausible deniability**: Each share appears as a valid BIP39 mnemonic, allowing users to maintain decoy wallets.
- **Standard format**: Operates directly on BIP39 mnemonics without custom encoding.

**Weaknesses:**

- **Limited threshold flexibility**: Primarily an $n$-of-$n$ scheme where all shares are required for recovery. While a 2-of-3 Hamming backup variant exists [13], it is not widely adopted and adds significant complexity.
- **Weak error detection**: No robust checksums during manual XOR operations; a single bit error propagates silently through the entire recovery process, only becoming apparent when the final mnemonic fails validation.
- **No information-theoretic security**: Unlike Shamir-based schemes, XOR splitting does not provide threshold security—possession of $n-1$ shares still reveals no information, but the scheme offers no flexibility in threshold selection.

#### 1.4.3 Comparative Analysis

**Table 2: Comparison of Manual-First Recovery Schemes**

| Feature | Schiavinato | Codex32 | SeedXOR |
|---------|-------------|---------|---------|
| Threshold support | Full $k$-of-$n$ | Full $k$-of-$n$ | Primarily $n$-of-$n$ |
| Manual complexity | Modular arithmetic | Volvelles/tables | XOR operations |
| Error detection | Two-layer checksums | BCH codes | Weak/None |
| Output format | Standard BIP39 | Custom bech32 | Standard BIP39 |
| Learning curve | Moderate | Steep | Low |
| Computational tools | Available (optional) | Not provided | Not provided |

**Positioning Schiavinato Sharing:**

Schiavinato Sharing is designed with a **pencil-and-paper-first philosophy**, similar to Codex32, but makes different trade-offs in the design space. Where Codex32 optimizes for maximum error correction at the cost of operational complexity, Schiavinato prioritizes **arithmetic simplicity** (modular addition and multiplication) and **standard BIP39 compatibility**, ensuring recovered mnemonics work immediately with any existing wallet.

Critically, while maintaining full manual recoverability as the foundational design principle, Schiavinato intentionally provides **robust computational implementations**—including JavaScript/TypeScript libraries (v0.2.0), an offline HTML tool with UR QR code generation [16], and printable worksheets with embedded checksums. This dual approach serves users who want **convenience when electronics are trusted**, with manual recovery remaining available as a fallback option for disaster scenarios or when electronic tools are unavailable or untrusted.

For a broader comparison including electronic-only schemes (SLIP39, SSKR, Multisig), see Table 1 in Section 1.3.

### 1.5 A Non-Computational Approach

Schiavinato Sharing is designed to remove this dependency on trusted electronics at the point of recovery, following principles of human-computable cryptography [3] and social recovery [5]. The central design goals are:

1. **Human executability**: All required operations for sharding and recovery can be performed with pencil, paper, and basic arithmetic skills.
2. **Cryptographic soundness**: Security should reduce to that of standard Shamir secret sharing in a well-understood field.
3. **BIP39 compatibility**: The scheme should accept and output standard BIP39 mnemonics, without requiring modified wordlists or custom checksum rules.
4. **Auditability and simplicity**: The construction should be simple enough to be understood, audited, and reimplemented by third parties, and the reference implementations must be fully offline and open source.

To achieve these goals, Schiavinato Sharing transposes Shamir's Secret Sharing from extension fields $GF(2^n)$ to a small prime field $GF(2053)$ and operates directly on BIP39 word indices. It further introduces a two-layer arithmetic checksum mechanism to detect human calculation errors during manual recovery.

### 1.6 Status and Responsible Use

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

## 2. Background: The Mathematical Foundations

Schiavinato Sharing is a concrete application of established cryptographic principles. It does not introduce a new primitive; instead, it adapts Shamir's Secret Sharing [1] to a setting where every operation can, in principle, be performed by hand. Secret sharing was independently discovered by Shamir [1] and Blakley [2] in 1979, with Shamir's polynomial-based approach becoming the dominant construction due to its elegant mathematical properties and efficient threshold characteristics.

This section sketches the relevant mathematical background. Readers who require additional detail can consult the appendices and the referenced literature.

- **Shamir's Secret Sharing (SSS)** [1]: A threshold secret-sharing scheme in which a secret value is interpreted as the constant term of a polynomial over a finite field. Shares are evaluations of this polynomial at non-zero points; any $k$ shares determine the polynomial uniquely, while fewer than $k$ yield no information about the secret (see **Appendix A**).
- **Modular arithmetic**: Arithmetic performed "modulo" a fixed number $p$, where values are always taken in the range $\{0, 1, \ldots, p-1\}$. Addition and multiplication are defined as usual, followed by reduction modulo $p$. When $p$ is prime, every non-zero value has a multiplicative inverse, which enables division (see **Appendix B**).
- **Lagrange interpolation**: A method to reconstruct a polynomial of degree at most $k-1$ from $k$ distinct points. For Shamir's scheme, we are primarily interested in the constant term (the secret). By pre-computing the relevant Lagrange coefficients for a given set of share indices, reconstruction reduces to a weighted sum of the share values (see **Appendix C**).

By working over a prime field $GF(p)$ with a carefully chosen prime $p$, Schiavinato Sharing ensures that all of the above can be instantiated with straightforward integer arithmetic.

---

## 3. Schiavinato Sharing: An Arithmetic Approach

*Note: While the examples in this paper assume a 24-word BIP39 mnemonic, the same construction applies, mutatis mutandis, to 12, 15, 18, and 21-word phrases.*

### 3.1 The Challenge of Non-Computational Recovery

Standard implementations of Shamir's Secret Sharing for wallet backups, such as SLIP39 and SSKR, operate on the binary entropy underlying the mnemonic. They typically work in extension fields of the form $GF(2^n)$, such as $GF(2^8)$. Arithmetic in these fields is expressed in terms of polynomials over $GF(2)$ reduced modulo an irreducible polynomial. While efficient for microprocessors, this representation makes multiplication and inversion opaque and laborious for humans.

Moreover, entropy-based schemes require explicit conversion between the binary entropy and the mnemonic words, including verification of the BIP39 checksum bits. Reversing this process by hand—mapping words to indices, expanding to a bitstring, separating entropy from checksum, and possibly re-encoding is beyond what can reasonably be expected in a manual recovery scenario.

In contrast, Schiavinato Sharing operates directly on BIP39 word indices in a small prime field. Recovery never requires manipulating bits or recomputing the BIP39 checksum by hand. All visible operations are integer additions and multiplications modulo a fixed prime.

### 3.2 Methodology: Independent Polynomials in a Prime Field

The core innovation of Schiavinato Sharing is to instantiate Shamir's Secret Sharing [1] over the prime field $GF(p)$ with

$$p = 2053,$$

the smallest prime greater than the BIP39 [9] wordlist size of 2048.

The rationale for this choice is threefold:

1. **Coverage of all word indices**: Every BIP39 word index (0–2047) is representable as an element of $GF(2053)$ without any encoding overhead.
2. **Simplicity of operations**: Working in a prime field eliminates the need for polynomial representations and enables straightforward integer arithmetic with reduction modulo $p$.
3. **Security properties**: $GF(2053)$ is a standard finite field with no evident structure that would weaken Shamir's guarantees. Each sharing instance has a search space of size $p$, slightly larger than the 2048-word mnemonic space.

A 24-word BIP39 mnemonic is treated as a vector of 24 integers $(w_1, \ldots, w_{24})$, each in $\{0, \ldots, 2047\}$. While these indices are not 24 fully independent 11-bit variables—because of the BIP39 checksum and the way entropy is mapped to words—they collectively encode a 256-bit entropy value plus checksum bits. For the purposes of the security analysis, it is sufficient to note that the effective keyspace remains on the order of $2^{256}$.

For a $k$-of-$n$ scheme, Schiavinato Sharing defines, for each secret, an independent polynomial of degree at most $k-1$:

$$f(x) = a_0 + a_1 x + \ldots + a_{k-1} x^{k-1} \pmod{2053}$$

where:

- $a_0$ is the secret value (a word index or a checksum value),
- $(a_1, \ldots, a_{k-2})$ are independently sampled, cryptographically secure random coefficients in $\{0, \ldots, 2052\}$, and
- $a_{k-1}$ is an independently sampled, cryptographically secure random coefficient from the non-zero values $\{1, \ldots, 2052\}$ to ensure the polynomial has degree exactly $k-1$. For the case $k=1$, there are no random coefficients.

This process is repeated independently for every secret used by the scheme:

- the 24 word indices $(w_1, \ldots, w_{24})$,
- 8 additional row-checksum secrets, one per row of three words (see Section 3.5), and
- 1 **global checksum** over all 24 words, defined as

$$G = \sum_{i=1}^{24} w_i \pmod{2053}$$

In total, a 24-word mnemonic uses 33 independent Shamir instances, each with its own polynomial and randomness. The global checksum $G$ is treated exactly like the other secrets: it is shared by an independent polynomial over $GF(2053)$, and only its per-share evaluations appear on individual worksheets. The underlying value $G$ is recovered via Lagrange interpolation during the final verification step of recovery.

### 3.3 Manual Share Generation

Shares can be generated by software or entirely by hand. The reference GRIFORTIS tools automate this process, but the construction remains fully transparent.

For each secret $s \in \{0, \ldots, 2052\}$:

1. **Define the secret**: Set $a_0 = s$ in $GF(2053)$.
2. **Sample random coefficients**: For a $k$-of-$n$ scheme, sample $(a_1, \ldots, a_{k-2})$ as cryptographically secure random integers from $\{0, \ldots, 2052\}$ and sample $a_{k-1}$ from $\{1, \ldots, 2052\}$ to ensure the polynomial has degree exactly $k-1$.
3. **Evaluate the polynomial**: For each share index $x \in \{1, 2, \ldots, n\}$, compute

$$y = f(x) = a_0 + a_1 x + \ldots + a_{k-1} x^{k-1} \pmod{2053}$$

The resulting pair $(x, y)$ is the share for that secret at index $x$.

In the 24-word case, the collection of secrets $s$ to which this procedure is applied consists of the 24 word indices, the 8 row-checksum values, and the global checksum $G$, for a total of 33 independent polynomials.

This procedure is applied to each of the 33 secrets. For any fixed share index $x$ (for example, $x = 3$), the 33 resulting values (24 word shares, 8 row-checksum shares, and 1 global checksum share) together constitute **one** cryptographic share of the wallet.

### 3.4 The Manual Recovery Process

Recovery in Schiavinato Sharing relies on Lagrange interpolation in $GF(2053)$. Given any $k$ distinct shares $(x_j, y_j)$ for a single secret, the constant term $a_0$ of the underlying polynomial can be expressed as

$$a_0 = f(0) = \sum_{j=1}^{k} \gamma_j y_j \pmod{2053}$$

where the Lagrange coefficients $\gamma_j$ depend only on the share indices $x_1, \ldots, x_k$:

$$\gamma_j = \prod_{\substack{i=1 \\ i \neq j}}^{k} \frac{x_i}{x_i - x_j} \pmod{2053}$$

In principle, a user could compute these coefficients by hand using modular inverses. In practice, Schiavinato Sharing treats them as **non-secret metadata**:

- For common $k$-of-$n$ schemes (e.g., 2-of-3, 2-of-4, 3-of-5), the reference documentation includes pre-computed Lagrange coefficients for all subsets of indices (Section 3.8).
- For other schemes, the coefficients can be computed on demand using a simple script or calculator. Since they contain no secret information, this can be done on any convenient device.

The manual recovery workflow for a single secret is therefore:

1. Determine which $k$ share indices $x_1, \ldots, x_k$ you possess.
2. Look up or compute the corresponding Lagrange coefficients $\gamma_1, \ldots, \gamma_k$ for $GF(2053)$.
3. For each share $j$, multiply the share value $y_j$ by $\gamma_j$ modulo 2053.
4. Sum the products and reduce modulo 2053 to obtain the recovered secret $a_0$.

### 3.5 Integrity and Error Detection: The Two-Layer Checksum

Performing dozens of modular multiplications and additions by hand creates ample opportunity for arithmetic mistakes. Because independent word-level sharing destroys the original BIP39 checksum relationship between words, an additional integrity mechanism is required.

Schiavinato Sharing uses a purely arithmetic, two-layer checksum system:

**1. Row-level checksums (Shamir-shared):** The 24 words are arranged into 8 rows of 3 words each. For row $r$ with word indices $(w_{r,1}, w_{r,2}, w_{r,3})$, define a checksum secret

$$c_r = (w_{r,1} + w_{r,2} + w_{r,3}) \pmod{2053}$$

Each $c_r$ is then treated as an additional secret and shared with its own independent Shamir polynomial over $GF(2053)$, exactly as for the word indices. Thus, for each share index $x$, the printed worksheet row contains four values: three word shares and one checksum share.

During recovery, for each row the user:

- uses Lagrange interpolation to recover $(w_{r,1}, w_{r,2}, w_{r,3})$, and $c_r$ from their $k$ shares;
- computes $\tilde{c}_r = (w_{r,1} + w_{r,2} + w_{r,3}) \pmod{2053}$ by hand; and
- verifies that $\tilde{c}_r = c_r$.

If this equality fails, there is an arithmetic error affecting at least one of the four recovered values in that row.

**2. Global checksum (Shamir-shared):** In addition to the row-level checks, the scheme defines a global checksum

$$G = \sum_{i=1}^{24} w_i \pmod{2053}$$

computed once from the original 24 words before sharding. This value is treated as a separate secret and shared by its own independent Shamir polynomial over $GF(2053)$, producing one global checksum share value on each worksheet.

After all 24 word indices have been recovered, the user performs two calculations:

- uses Lagrange interpolation on the global checksum shares from their $k$ worksheets to recover $G$, and
- separately computes the recomputed global checksum $\tilde{G} = \sum_{i=1}^{24} w_i \pmod{2053}$ from the recovered words.

If $\tilde{G} \neq G$, then at least one row contains undetected errors and must be rechecked.

Under a simple model in which an incorrect set of recovered values behaves like a random element of $GF(2053)$, the chance that a wrong triple together with a wrong $c_r$ still satisfies the row equation is at most $1/2053$. With an additional independence assumption across rows, the overall error-escape probability is on the order of $(1/2053)^9$. Even without relying on that assumption, the per-row-plus-global bound of $1/2053^2$ is negligible for any practical purpose.

#### 3.5.1 Comparative Checksum Analysis: Schiavinato vs. BIP39

A critical question for inheritance planning is: which approach provides stronger protection against errors leading to false confidence in recovery? This section compares the error-detection capabilities of Schiavinato Sharing's two-layer checksum system against BIP39's single checksum.

**Motivating Use Case:**

To ground the mathematical analysis in practical terms, we examine two representative recovery scenarios that illustrate the operational differences between single-checksum and multi-layer validation.

**Recovery Scenarios:**

Consider two scenarios involving an authorized party attempting to recover cryptocurrency holdings:

**Scenario 1 (BIP39):** An authorized party obtains a document containing a 12- or 24-word sequence. Due to operational stress, document degradation, or confusion among multiple documents, they may enter an incorrect mnemonic sequence into a wallet application. The application validates the BIP39 checksum and displays a wallet with zero balance. *Question: Did they enter the wrong mnemonic that happened to pass checksum validation, or is there truly no inheritance?*

**Scenario 2 (Schiavinato):** An authorized party gathers $k$ share documents from distributed locations (family members, attorneys, safe deposit boxes). They perform 50–100 manual arithmetic operations (multiplications and additions modulo 2053) to recover the mnemonic, verifying row checksums at each step and finally the global checksum. All checks pass. They enter the recovered mnemonic into a wallet application, which displays zero balance. *Question: Did arithmetic errors escape detection, or is there truly no inheritance?*

**BIP39 Checksum Structure:**

BIP39 mnemonics encode entropy plus a checksum derived from the SHA-256 hash of the entropy:

- **12-word mnemonic**: 128 bits of entropy + 4 checksum bits = 132 bits total. The last word encodes the final 4 checksum bits plus 7 entropy bits.
- **24-word mnemonic**: 256 bits of entropy + 8 checksum bits = 264 bits total. The last word encodes the final 8 checksum bits plus 3 entropy bits.

The checksum detects transcription errors when entering a mnemonic into a wallet, but it provides no protection against *selecting the wrong mnemonic entirely*. If an authorized party enters an arbitrary sequence of BIP39 words, the probability it passes checksum validation is [14]:

$$P_{\text{fp}}^{\text{BIP}}(12) = 2^{-4} = \frac{1}{16} \approx 6.25\%$$

$$P_{\text{fp}}^{\text{BIP}}(24) = 2^{-8} = \frac{1}{256} \approx 0.39\%$$

In practical terms, roughly **1 in 16 wrong 12-word mnemonics** and **1 in 256 wrong 24-word mnemonics** will pass BIP39 validation and produce a valid (but incorrect) wallet with zero balance.

**Schiavinato Two-Layer Checksum Structure:**

Schiavinato Sharing employs checksums at two levels:

- **12-word mnemonic**: 4 rows of 3 words each, yielding 4 row checksums + 1 global checksum.
- **24-word mnemonic**: 8 rows of 3 words each, yielding 8 row checksums + 1 global checksum.

Each checksum is computed in $GF(2053)$ and is itself recovered via Lagrange interpolation. The row checksums are mathematically independent, while the global checksum $G = \sum_{i=1}^{n} w_i \pmod{2053}$ serves as a global consistency check that is algebraically dependent on the row checksums. However, the global checksum provides practical value by detecting systematic errors that affect all rows proportionally and transcription errors made after recovery is complete.

For an incorrect recovery to pass all row-level validation, each row checksum must coincidentally match its recomputed value. Under the random-error model, the probability of this occurring is:

$$P_{\text{fp}}^{\text{Sch}}(12) = \left(\frac{1}{2053}\right)^4 \approx 5.6 \times 10^{-14}$$

$$P_{\text{fp}}^{\text{Sch}}(24) = \left(\frac{1}{2053}\right)^8 \approx 1.1 \times 10^{-27}$$

These probabilities reflect the 4 and 8 mathematically independent row checksums, respectively. The global checksum adds an additional layer of protection against error patterns that might evade row-level detection, such as systematic coefficient errors or post-recovery transcription mistakes.

**Comparative Analysis:**

**Table 3: Checksum False Positive Rates: BIP39 vs. Schiavinato Sharing**

| Metric | BIP39 (12-word) | Schiavinato (12-word) | BIP39 (24-word) | Schiavinato (24-word) |
|--------|-----------------|----------------------|-----------------|----------------------|
| Checksum structure | 4 bits | 4 row checks + 1 global | 8 bits | 8 row checks + 1 global |
| False positive rate | 1/16 | $(1/2053)^4$ | 1/256 | $(1/2053)^8$ |
| Numeric probability | 6.25% | $5.6 \times 10^{-14}$ | 0.39% | $1.1 \times 10^{-27}$ |
| Advantage factor | ~$1.1 \times 10^{12}$ safer | | ~$4.3 \times 10^{24}$ safer | |
| Practical meaning | 1 in 16 wrong mnemonics validate | Virtually impossible | 1 in 256 wrong mnemonics validate | Astronomically impossible |

The advantage factors are computed as:

$$\text{Ratio}_{12} = \frac{1/16}{(1/2053)^4} = \frac{2053^4}{16} \approx 1.1 \times 10^{12}$$

$$\text{Ratio}_{24} = \frac{1/256}{(1/2053)^8} = \frac{2053^8}{256} \approx 4.3 \times 10^{24}$$

**Practical Implications for Inheritance:**

- **BIP39 confusion risk**: An authorized party who obtains a document with 12 words has a 6.25% chance (roughly 1 in 16) of entering the wrong mnemonic that still passes validation, leading to a zero-balance wallet and potential confusion about whether inheritance exists. For 24-word mnemonics, this risk drops to 0.39% (1 in 256), but remains non-negligible in high-stakes scenarios.
- **Schiavinato arithmetic confidence**: Even after performing 50+ manual arithmetic operations during recovery, the probability of errors passing all row checksums is less than $10^{-13}$ for 12-word recovery and $10^{-27}$ for 24-word recovery. The additional global checksum provides a final global consistency check that catches systematic errors and post-recovery transcription mistakes. This combination provides *mathematical certainty* that a validated result is correct.
- **Complementary strengths**: BIP39's checksum was designed to detect transcription errors when entering a known mnemonic. Schiavinato's multi-layer checksums are designed to detect arithmetic errors during a multi-step recovery process. The two serve different purposes and are not directly comparable in all contexts, but for inheritance scenarios involving manual recovery, Schiavinato provides vastly stronger error detection.

In summary, Schiavinato Sharing's two-layer checksum system provides approximately $10^{12}$ times stronger error detection for 12-word mnemonics and $10^{24}$ times stronger for 24-word mnemonics compared to BIP39's single checksum, making false positives during manual recovery effectively impossible.

### 3.6 The Share Format and Recovery Worksheet

Each individual share document (corresponding to a fixed index $x \in \{1, \ldots, n\}$) contains:

- **Header metadata**: Wallet Identifier, Creation Date, Scheme ($k$-of-$n$), Share Number $x$, and the global checksum share value.
- **Primary data table**: Formatted as 8 rows × 4 columns for 24-word mnemonics (4 rows × 4 columns for 12-word mnemonics). Each row contains three word shares and one row-checksum share, displayed in large, readable type as "Word - 1234" format when the value corresponds to a BIP39 word index.
- **Machine-readable encoding**: A CBOR-encoded array of share data, formatted as a Uniform Resource (UR) QR code [16] for optional electronic recovery and long-term digital preservation.

Values in the range 2048–2052 (which do not correspond to BIP39 words) are printed as numeric-only values. This layout prioritizes manual recoverability while providing electronic convenience when appropriate: users can perform arithmetic recovery from the printed table, or scan the UR QR code for instant electronic reconstruction.

### 3.7 Lagrange Coefficients and Manual Recovery

#### 3.7.1 The Role of Lagrange Coefficients

A key enabler of manual recovery is the use of pre-computed Lagrange coefficients. In standard polynomial interpolation, determining the polynomial $f(x)$ typically involves solving a system of linear equations or computing the full Lagrange basis. However, for recovering the secret $a_0 = f(0)$, we only need the evaluated value at the origin.

For a fixed set of share indices $S = \{x_1, \ldots, x_k\}$, the secret can be expressed as a linear combination of the share values $y_j$:

$$a_0 = \sum_{j=1}^{k} y_j \gamma_j \pmod{2053}$$

where the Lagrange coefficient $\gamma_j$ for share $x_j$ is defined as:

$$\gamma_j = \prod_{\substack{i \in S \\ i \neq j}} \frac{x_i}{x_i - x_j} \pmod{2053}$$

These coefficients depend *only* on the subset of share indices used for recovery, not on the secret itself. This separation allows $\gamma_j$ values to be pre-calculated or looked up, transforming the complex task of polynomial interpolation into a straightforward sequence of scalar multiplications and additions.

**Note: Lagrange interpolation recovers the complete polynomial.**

The Lagrange interpolation process recovers the entire polynomial $f(x)$, not merely the secret $f(0)$. As a consequence, any $k$ valid shares can be used to compute $f(j)$ for any other index $j$, effectively deriving additional shares. For instance, in a 2-of-3 scheme, shares 1 and 2 can be used with appropriately chosen Lagrange coefficients to compute the value at $x = 3$, which should match share 3 if all arithmetic was performed correctly.

This property serves two practical purposes:

1. **Self-consistency check**: During manual recovery, users can verify their arithmetic by computing a known share and confirming it matches the expected value.
2. **Share generation without secret exposure**: In principle, holders of $k$ shares can generate additional valid shares without explicitly computing the secret $f(0)$.

It is important to emphasize that this is a fundamental mathematical property of polynomial interpolation, not a vulnerability. The security model of Shamir's Secret Sharing already assumes that any party with $k$ or more shares has complete access to the secret.

#### 3.7.2 Impossibility of Universal Static Coefficients

A natural usability question arises: is it possible to select a specific set of share indices such that the Lagrange coefficient $\gamma_j$ for a given share remains constant, regardless of which other $k-1$ shares are used for recovery?

However, this is mathematically impossible for any threshold $k < n$.

**Proof:** Consider the simplest case: a 2-of-3 scheme with distinct indices $x_1, x_2, x_3$.

If we reconstruct using the subset $\{x_1, x_2\}$, the coefficient for share 1 is:

$$\gamma_{1,\{1,2\}} = \frac{x_2}{x_2 - x_1}$$

If we reconstruct using the subset $\{x_1, x_3\}$, the coefficient for share 1 is:

$$\gamma_{1,\{1,3\}} = \frac{x_3}{x_3 - x_1}$$

For these coefficients to be identical, cross-multiplying and simplifying yields $x_2 = x_3$, which contradicts the fundamental requirement that all share indices must be distinct.

Consequently, the user must determine the correct coefficients based on the specific set of shares available at recovery time.

#### 3.7.3 Workflow A: Recovery with a Basic Calculator

If a standard basic calculator is available, this workflow is generally faster and familiar to most users. The user looks up the integer values for the coefficients $\gamma_j$ and performs the operation $S = y_j \times \gamma_j \pmod{2053}$.

Since standard solar calculators typically lack a modulo operator, the recommended keystroke sequence for computing $A \times B \pmod{2053}$ is:

1. **Multiply**: Calculate the product $P = A \times B$.
2. **Divide**: Compute $Q = P \div 2053$.
3. **Truncate**: Identify the integer part of the quotient, $\lfloor Q \rfloor$.
4. **Subtract**: The modular result is $P - (\lfloor Q \rfloor \times 2053)$.

#### 3.7.4 Workflow B: The Modular Lookup Strip

For scenarios requiring strictly air-gapped recovery without electronic calculators, the scheme supports "Modular Lookup Strips" (analogous to Napier's Bones).

Based on the distributive property of modular arithmetic, any share value $Y$ can be decomposed by place value:

$$Y \cdot \gamma \equiv (d_3 \cdot 1000 \gamma) + (d_2 \cdot 100 \gamma) + (d_1 \cdot 10 \gamma) + (d_0 \gamma) \pmod{2053}$$

For a specific coefficient $\gamma$, a pre-computed strip provides the modular product for all digits $0\ldots9$ at each decimal position.

This method transforms the complexity of long multiplication and division into four table lookups and a single integer addition.

### 3.8 Pre-Computed Coefficients for Common Schemes

For completeness, the following table lists pre-computed Lagrange coefficients $\gamma$ for selected small schemes in $GF(2053)$. Share indices are assumed to be consecutive integers starting from 1.

| Scheme | Shares Used | Coefficients ($\gamma$) |
|--------|-------------|------------------------|
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

### 3.9 BIP39 Compatibility and Universal Multi-Chain Support

#### 3.9.1 Indistinguishability and Future-Proof Compatibility

A critical design property of Schiavinato Sharing is that **recovered mnemonics are indistinguishable from any other BIP39 mnemonic**. The output is a standard 12- or 24-word BIP39 phrase that:

- Contains no metadata, markers, or version identifiers
- Passes standard BIP39 checksum validation
- Cannot be detected as "Schiavinato-generated" by any wallet or software
- Is cryptographically and semantically identical to a mnemonic generated directly by any BIP39-compliant tool

This indistinguishability provides several crucial guarantees:

**Backward Compatibility:** Any BIP39 wallet ever created—from the earliest 2013 implementations to modern hardware wallets—accepts Schiavinato-recovered mnemonics without modification.

**Forward Compatibility:** As long as the BIP39 standard remains in use, Schiavinato Sharing will continue to work with all future wallets.

**No Vendor Lock-In:** Users are not dependent on GRIFORTIS, any specific software, or any ongoing maintenance.

**Inter-Generational Resilience:** Heirs recovering shares decades in the future will obtain a mnemonic that works with whatever BIP39-compatible wallet software exists at that time.

#### 3.9.2 Technical Implementation

Schiavinato Sharing operates on standard BIP39 word indices and does not alter the wordlist. The only deviation arises when a share value lies in the range 2048–2052, which cannot be mapped to a BIP39 word. In this rare case, the recovery instructions direct the user to write down the numeric value itself.

**Broad Ecosystem Compatibility:** Because BIP39 is the de facto standard across the cryptocurrency ecosystem, Schiavinato Sharing automatically provides secure backup for assets across multiple blockchains:

- **Bitcoin** (and derivatives: Litecoin, Dogecoin, etc.)
- **Ethereum** (and all EVM-compatible chains: Polygon, Binance Smart Chain, Avalanche, Arbitrum, Optimism, etc.)
- **Cosmos ecosystem** (ATOM, Osmosis, and IBC-connected chains)
- **Polkadot**, **Cardano**, **Solana**, and most modern smart contract platforms

The same recovered 24-word phrase can be imported into any BIP39-compatible wallet, with different blockchains accessed via distinct derivation paths.

#### 3.9.3 On BIP39 Passphrases

The BIP39 specification also defines an **optional passphrase** (sometimes informally called the "25th word") that is combined with the mnemonic in a key-stretching step to derive the wallet seed. Schiavinato Sharing deliberately treats the passphrase as an independent layer and does not attempt to shard or encode it.

From the perspective of this scheme:

- **Scope separation**: Because the passphrase is external to the mnemonic word sequence, including it in the arithmetic sharing would blur a clean boundary in the BIP39 model.
- **Passphrase strength and independence**: A BIP39 passphrase is most effective when it behaves as a separate, high-entropy secret.
- **Plausible deniability**: Many users rely on a passphrase to implement plausible deniability.

Consequently, Schiavinato Sharing leaves passphrase policy to wallet software and to the user's operational model.

---

## 4. Security Analysis

### 4.1 Threat Model and Scope

Schiavinato Sharing is intended to protect the secrecy and recoverability of a BIP39 mnemonic under the following assumptions:

- An adversary may obtain, copy, or inspect **fewer than $k$** distinct shares for a given wallet, but not $k$ or more shares.
- Legitimate participants can coordinate to obtain **at least $k$** valid shares when recovery is required.
- Share documents, once created, are not silently modified in a way that systematically alters multiple values while preserving all arithmetic checksums.

Within this model, the goals of the scheme are:

- **Confidentiality**: Any set of fewer than $k$ shares should reveal no information about the underlying BIP39 mnemonic beyond what is already implied by its domain (approximately $2^{256}$ possibilities).
- **Integrity of recovery**: Given at least $k$ honest shares, the combination of row-level checks and the global checksum should detect accidental arithmetic or transcription errors with overwhelmingly high probability.

The following aspects are **explicitly out of scope**:

- Side-channel attacks on software implementations
- Attacks in which an adversary compromises **$k$ or more** distinct shares
- Social-engineering attacks against users, executors, or advisors
- Attacks on the underlying BIP39 ecosystem

### 4.2 Security Properties and Information-Theoretic Guarantees

At its core, Schiavinato Sharing is a collection of independent Shamir secret-sharing instances [1] over $GF(2053)$. Each word index, each row checksum, and the global checksum are shared by their own polynomials of degree at most $k-1$ with independently sampled random coefficients.

The security claims therefore reduce to the standard properties of Shamir's scheme [1]:

- **Threshold property**: Any set of at least $k$ consistent shares for a given secret uniquely determines that secret. Any set of fewer than $k$ shares yields no information about the secret beyond what is already implied by its domain.
- **Information-theoretic secrecy**: For any two candidate secret values $s_0, s_1 \in GF(2053)$, the distribution of any $t < k$ shares generated from $s_0$ is identical to the distribution of $t$ shares generated from $s_1$; in this sense the scheme provides perfect, information-theoretic (unconditional) secrecy [1] for each shared value.

The effective keyspace of a 24-word BIP39 mnemonic is approximately $2^{256}$. Representing the mnemonic as 24 indices in $GF(2053)$ does not compress this space; it merely maps it into a larger ambient field.

### 4.3 Human-Factor Vulnerabilities and Mitigations

The primary new risk introduced by a human-executable scheme is the possibility of **manual arithmetic errors** during recovery. These can occur during modular multiplication, addition, or transcription of intermediate results.

The two-layer checksum mechanism is designed to mitigate this risk:

- Row-level checksums localize errors to specific rows, enabling users to detect and correct mistakes before propagating them.
- The global checksum adds a final consistency check over all 24 recovered words.

Under the random-error model, the probability that an incorrect row passes its checksum test is at most $1/2053$, and the probability that such errors also preserve the global checksum is at most another factor of $1/2053$.

### 4.4 Physical Security Assumptions

As with any secret-sharing scheme, the overall security of Schiavinato Sharing depends on the physical handling of shares. The analysis assumes that:

- No adversary can reliably obtain $k$ or more distinct shares for the same wallet.
- Legitimate participants can access at least $k$ valid shares when recovery is required.
- Shares are protected against tampering, loss, and unauthorized duplication.

### 4.5 Physical Operational Security

While side-channel attacks are typically associated with electronic devices, manual recovery introduces physical side channels that must be managed:

- **Impression Attacks**: Writing arithmetic calculations can leave legible indentations.
  - *Mitigation*: Perform calculations on a hard surface rather than directly on a paper pad.
- **Waste Management**: Calculation sheets contain intermediate values.
  - *Mitigation*: Destroy all scratch paper immediately after use (burning or cross-cut shredding).
- **Visual Surveillance**: Manual recovery takes time and requires spreading out documents.
  - *Mitigation*: Perform recovery in a private room with no security cameras having line of sight.

---

## 5. The GRIFORTIS Reference Implementation

### 5.1 Implementation Status and Availability

As of this writing, GRIFORTIS has developed three interconnected reference implementations, all available as open-source software under the MIT License:

#### 5.1.1 JavaScript/TypeScript Library

- **Package**: `@grifortis/schiavinato-sharing`
- **Version**: 0.1.0 (initial release)
- **Repository**: https://github.com/GRIFORTIS/schiavinato-sharing-js
- **Status**: **Functional and tested**
- **Features**:
  - Core field arithmetic in $GF(2053)$
  - Polynomial evaluation and Lagrange interpolation
  - BIP39 integration with full checksum validation
  - Split and recovery functions with row and global checksums
  - TypeScript type definitions
  - Comprehensive test suite
  - Browser and Node.js compatible builds
- **Test Coverage**: Includes tests for field operations, checksums, integration scenarios, security edge cases, and seed generation.

#### 5.1.2 Offline HTML Tool

- **File**: `schiavinato_sharing.html`
- **Repository**: https://github.com/GRIFORTIS/schiavinato-sharing-spec
- **Status**: **Functional with comprehensive automated testing**
- **Features**:
  - Self-contained single-file implementation
  - Offline-first design (no network requests)
  - Automated share generation workflow
  - Automated recovery with checksum verification
  - Lagrange coefficient calculator
  - Manual recovery helper tools
  - Tested with Playwright
- **Verification**: Users should verify the SHA-256 checksum before use on air-gapped systems.

#### 5.1.3 Python Library

- **Package**: `schiavinato-sharing`
- **Repository**: https://github.com/GRIFORTIS/schiavinato-sharing-py
- **Status**: **Early development**
- **Planned Features**: Mirror of JavaScript library functionality with Python-idiomatic API

#### 5.1.4 Test Vectors

- **File**: `TEST_VECTORS.md`
- **Repository**: https://github.com/GRIFORTIS/schiavinato-sharing-spec
- **Status**: **Complete and documented**
- **Contents**: Reproducible test cases for 2-of-3 and 3-of-5 schemes with complete polynomial coefficients, share values, and expected checksums.

### 5.2 The schiavinato-sharing.html Tool

The primary reference implementation is a single self-contained HTML/JavaScript file, intended to be executed on an air-gapped computer. Its design adheres to the following constraints:

- **Offline by construction**: The file embeds all required assets and makes no network requests.
- **Verifiable distribution**: Each released version is accompanied by a published SHA-256 checksum.
- **Explicit threat model**: Users verify the checksum and transfer the file to an air-gapped machine.

Within these constraints, the tool offers Automated Sharding, Automated Recovery, Manual Sharding Helper, and a Manual Recovery Helper (Lagrange Calculator).

### 5.3 The schiavinato_sharing Libraries

For developers and auditors, GRIFORTIS provides reference libraries in Python and JavaScript (with TypeScript declarations). These expose the core cryptographic operations.

At a high level, the API is organized around:

- **Share representation**: A `MnemonicShare` object encapsulating global metadata, 8×4 table of integer values, global checksum share, and optional BIP39 words.
- **High-level functions**:
  - `split_bip39(mnemonic, k, n, rng=None) -> List[MnemonicShare]`
  - `recover_bip39(shares: Sequence[MnemonicShare]) -> str`
- **Lower-level helpers**: functions for modular arithmetic in $GF(2053)$, Lagrange coefficient computation, and BIP39 word mapping.

All reference implementations are released under the **MIT License**.

### 5.4 Scope Clarification

The GRIFORTIS tools are deliberately narrow in scope:

- They **do not generate new BIP39 master seeds**. Users are expected to generate mnemonics through their preferred wallets or hardware devices.
- They focus exclusively on **splitting and recovering existing BIP39 mnemonics**.
- They do not perform any signing operations, key derivation, or transaction management.

---

## 6. Future Work and Applications

Several directions for future work and further applications are natural extensions:

- **Integration with existing wallets**: Tools and plug-ins that integrate Schiavinato Sharing with popular wallets could streamline recovery workflows.
- **UR QR Code Integration**: GRIFORTIS reference worksheets encode share data as CBOR arrays formatted according to the Blockchain Commons Uniform Resource (UR) specification [16].
- **Extended encoding format specifications**: Future standardization efforts could define formal specifications for encoding share objects.
- **Formal specification and verification**: A precise, machine-readable specification would enable formal verification efforts.
- **Verifiable Secret Sharing extensions**: Future work could explore adaptations of verifiable secret sharing protocols to the manual computation setting.
- **Extended coefficient tables and tooling**: For more complex threshold schemes, automated generation and publication of Lagrange coefficient tables.
- **Hybrid Schiavinato + SLIP39 + SSKR Implementation**: GRIFORTIS is exploring a future hybrid system for maximum interoperability.
- **Usability Studies**: Conducting controlled user studies to compare error rates and completion times.

Community contributions are explicitly encouraged.

---

## 7. How to Adopt Schiavinato Sharing

### 7.1 For Individual Users with Existing BIP39 Mnemonics

*Note: If your BIP39 mnemonic currently protects assets across multiple blockchains, Schiavinato Sharing protects them all with a single set of shares.*

1. **Assess your threat model**: Determine if electronics-optional recovery aligns with your needs.
2. **Choose a threshold scheme**: Select appropriate $k$ and $n$ values.
3. **Test with modest amounts first**: Practice the full cycle before entrusting significant holdings.
4. **Generate production shares**: Download the HTML tool, verify checksum, transfer to air-gapped computer, generate shares.
5. **Distribute shares**: Follow deployment patterns ensuring no single location contains $k$ or more shares.
6. **Document your scheme**: Leave clear instructions for heirs.

### 7.2 For Wallet Developers and Hardware Manufacturers

*Note: Whether you support Bitcoin-only, Ethereum-only, or multi-chain wallets, Schiavinato Sharing integrates identically.*

1. **Recognize BIP39 compatibility**: Schiavinato produces standard BIP39 mnemonics.
2. **Optional: Integrate share generation**: Add Schiavinato as an export option.
3. **Optional: Support UR QR code recovery**: Scanning share QR codes enables instant electronic recovery.
4. **Reference the open-source libraries**: Use `@grifortis/schiavinato-sharing` or implement based on TEST_VECTORS.md.

### 7.3 For Security Researchers and Auditors

1. **Review the mathematical specification**: This whitepaper provides complete details.
2. **Verify against test vectors**: TEST_VECTORS.md provides reproducible examples.
3. **Audit the reference implementations**: Available on GitHub.
4. **Report vulnerabilities responsibly**: Contact GRIFORTIS through the GitHub security advisory system.

### 7.4 For Academic Researchers

1. **This is a proposed construction**: While based on well-understood components, the complete system requires peer review.
2. **Open research questions**: See Section 8 for areas requiring further investigation.
3. **Formal verification welcome**: The scheme's simplicity makes it amenable to formal methods.
4. **Usability studies needed**: Comparative studies would strengthen the practical case.

### 7.5 Migration from Existing Backups

Users with existing single-mnemonic backups can adopt Schiavinato Sharing non-destructively:

- **Keep existing backup**: Original single-mnemonic backup remains valid
- **Generate shares**: Use `split_bip39()` to create Schiavinato shares
- **Test recovery**: Verify shares work before discarding original backup
- **Transition gradually**: Some users may prefer to maintain both systems

---

## 8. Open Questions and Future Research

While Schiavinato Sharing builds on well-established cryptographic primitives, several practical and theoretical questions remain open:

### 8.1 Long-Term Physical Durability

- What paper types, inks, and storage conditions best preserve worksheets over 50+ year timescales?
- How do environmental factors affect worksheet legibility?
- Comparative studies of paper vs. metal engraving vs. other archival media.

### 8.2 Optimal Threshold Parameters

- What $k$ and $n$ values best balance security, availability, and operational complexity?
- Optimal share placement strategies considering natural disasters and geopolitical risks.
- How do family structures and trust relationships influence ideal threshold choices?

### 8.3 Human Factors and Usability

- Controlled studies measuring arithmetic error frequency during manual recovery.
- Average time required for manual vs. electronic recovery.
- Comparison of cognitive load across age groups and educational backgrounds.
- Empirical evaluation of calculator-based vs. lookup-strip-based recovery methods.

### 8.4 Security Analysis

- Physical security of manual arithmetic operations.
- Empirical validation of checksum effectiveness.
- Detection probability when an adversary modifies share values.

### 8.5 Ecosystem Integration

- Feasibility of generating Schiavinato shares directly on hardware devices.
- Optimal designs for Schiavinato + SLIP39/SSKR interoperability.
- Best practices for multi-chain wallet integration.
- Adaptation to non-BIP39 systems.

### 8.6 Formal Verification

- Formal verification of arithmetic routines in Coq, Isabelle, or Lean.
- Machine-checked proofs of information-theoretic security properties.
- Verified compilation from specification to executable code.

### 8.7 Community Feedback Welcome

The GRIFORTIS team welcomes research contributions, empirical studies, and independent analyses. Results can be shared through GitHub discussions, academic publications, or direct communication.

---

## 9. Request for Comments: Open Challenges

This whitepaper is published as an **RFC (Request for Comments)** to solicit rigorous scrutiny from the cryptographic and Bitcoin development communities.

### 9.1 Why This Matters

Schiavinato Sharing makes a bold claim: *it is possible to combine threshold secret sharing, information-theoretic security, BIP39 compatibility, and manual human recoverability in a single scheme*. Each existing solution sacrifices at least one of these properties.

**The Indistinguishability Advantage:** Unlike SLIP39 or SSKR (which create custom mnemonic formats requiring ongoing wallet support), Schiavinato's recovered output is **indistinguishable from any standard BIP39 mnemonic**. This is a **fundamental guarantee of long-term viability**. The scheme cannot become obsolete through vendor discontinuation, software ecosystem changes, or hardware evolution.

### 9.2 Specific Technical Challenges

We invite the community to analyze the following aspects:

#### Challenge 1: Checksum Security Bounds

**The Claim**: Our two-layer checksum detects arithmetic errors with probability $\geq 1 - (1/2053)^2$ per row under a random-error model.

**Open Question**: Can an adversary construct a targeted corruption pattern that preserves checksums with non-negligible probability?

**Why It Matters**: If checksum effectiveness is lower than claimed, manual recovery becomes unreliable.

#### Challenge 2: Side-Channel Resistance of Manual Arithmetic

**The Claim**: Manual recovery using pencil and paper resists electronic side-channel attacks by design.

**Open Question**: What are the practical side channels during manual arithmetic?

**Why It Matters**: If manual recovery is observable, the "electronics-optional" advantage is compromised.

#### Challenge 3: Optimal Polynomial Coefficient Selection

**The Claim**: Random polynomial coefficients sampled uniformly from $GF(2053)$ provide information-theoretic security equivalent to Shamir's original scheme.

**Open Question**: Does the constraint that $a_{k-1} \in \{1, \ldots, 2052\}$ introduce any measurable bias?

**Why It Matters**: Non-uniform coefficient distributions could leak information.

#### Challenge 4: BIP39 Checksum Interaction

**The Claim**: Operating on BIP39 word indices does not interact adversely with our arithmetic checksums.

**Open Question**: Does the BIP39 checksum structure introduce any constraints or correlations in $GF(2053)$?

**Why It Matters**: Hidden correlations could weaken information-theoretic security claims.

#### Challenge 5: Long-Term Field Choice Validation

**The Claim**: $GF(2053)$ is optimal for this application.

**Open Question**: Would a larger prime provide meaningful security benefits?

**Why It Matters**: If a slightly larger field significantly improves security, the design should be revised.

#### Challenge 6: Indistinguishability as a Security Property

**The Claim**: Schiavinato-recovered mnemonics are computationally indistinguishable from natively-generated BIP39 mnemonics.

**Open Question**: Does the constraint that share values can lie in $\{0, \ldots, 2052\}$ leave any statistical fingerprint?

**Why It Matters**: If recovered mnemonics are distinguishable, it could enable targeted attacks or reduce plausible deniability.

### 9.3 Intellectual Bounty Program

To encourage rigorous analysis, GRIFORTIS announces the following recognition program, valid through **January 31, 2026**:

- **Critical vulnerability discovery**: First to identify a fundamental flaw → **Named acknowledgment + $5,000 USD bounty + co-authorship**
- **Formal verification**: First complete formal proof → **Named acknowledgment + $2,000 USD bounty**
- **Significant security improvement**: **Named acknowledgment + $250-1,000 honorarium**
- **Implementation in additional language**: **Named acknowledgment + prominent repository linking + discretionary stipend**

**Program Terms:**

- Total bounty pool cap: $10,000 USD maximum
- First submission only per category
- Valid through: January 31, 2026
- Payment via Bitcoin, Ethereum, Solana, or other mutually agreed method
- GRIFORTIS decisions on qualification are final
- AI disclosure required for all submissions

### 9.4 How to Engage

**For Cryptographers and Security Researchers:**

- Bitcoin-dev mailing list: Post with subject prefix "[Schiavinato RFC]"
- GitHub Security Advisories: Report privately
- GitHub Discussions: Public technical discussion

**For Bitcoin Core Developers:**

- Does this approach merit a BIP proposal?
- Are there Bitcoin Core descriptor wallet integration opportunities?
- Could this complement existing multisig or time-lock strategies?

**For Hardware Wallet Manufacturers:**

- What are the UX implications of generating shares on hardware?
- Would QR-based share scanning be valuable?
- What audit depth would you require before considering integration?

**For Academic Researchers:**

- Is this suitable for submission to Financial Cryptography, IEEE S&P, PETS, or similar venues?
- What additional formal analysis would strengthen the theoretical foundations?

### 9.5 RFC Timeline and Commitment

- **RFC Period**: Through January 31, 2026
- **Response Guarantee**: All substantive technical comments will receive a response within 7 days
- **Transparency**: All feedback (except private security disclosures) will be publicly visible
- **Iteration**: Meaningful suggestions will be incorporated in draft revisions
- **v1.0 Target**: February 2026, incorporating community feedback

### 9.6 What Would Change Our Mind

In the spirit of falsifiability, the following findings would necessitate significant revision or abandonment:

1. Checksum mechanism fails to detect errors with > 1% probability
2. Discovery of correlation leaking > 1 bit of entropy per share
3. Proof that manual recovery is impractical for > 90% of users
4. Fundamental incompatibility with existing BIP39 wallets
5. Evidence that $GF(2053)$ enables brute-force faster than $O(2^{11})$ per share

### 9.7 Acknowledgment of Limitations

We explicitly acknowledge:

- This construction is **not formally verified**
- This construction is **not independently audited**
- This construction is **not yet peer-reviewed for academic publication**
- Real-world usability data is **limited to internal testing**
- Long-term physical durability is **unproven at 50+ year timescales**

---

## 10. Conclusion

Schiavinato Sharing presents a human-centric adaptation of Shamir's Secret Sharing for BIP39 mnemonics, providing universal multi-chain custody solutions for the entire cryptocurrency ecosystem. By operating directly on word indices in a small prime field and layering in robust arithmetic checksums, it enables manual recovery with only pencil and paper while preserving the information-theoretic security of the underlying scheme.

Critically, Schiavinato produces **indistinguishable standard BIP39 output**, ensuring backward compatibility with all wallets since 2013, forward compatibility with all future implementations, and inter-generational resilience at 50+ year timescales. Unlike custom formats (SLIP39, SSKR) that depend on ongoing vendor support, Schiavinato's alignment with the BIP39 standard provides a fundamental guarantee: as long as BIP39 exists, the scheme remains viable.

The GRIFORTIS reference implementations—including a functional JavaScript/TypeScript library (v0.2.0), a comprehensive offline HTML tool, and complete test vectors—demonstrate that the scheme is practical, auditable, and ready for integration. All implementations are released as open-source software under the MIT License, enabling independent verification, community scrutiny, and adoption across Bitcoin, Ethereum, and the broader multi-chain cryptocurrency ecosystem.

---

## References

1. A. Shamir, "How to share a secret," *Communications of the ACM*, vol. 22, no. 11, pp. 612–613, Nov. 1979.
2. G. R. Blakley, "Safeguarding cryptographic keys," in *Proceedings of the National Computer Conference*, 1979, vol. 48, pp. 313–317.
3. J. Blocki, M. Blum, A. Datta, and S. Vempala, "Towards Human Computable Passwords," in *Innovations in Theoretical Computer Science (ITCS)*, 2014.
4. S. Eskandari, D. Barrera, E. Stobert, and J. Clark, "A First Look at the Usability of Bitcoin Key Management," in *Workshop on Usable Security (USEC)*, 2015.
5. V. Buterin, "Why we need wide adoption of social recovery wallets," *Vitalik.ca*, Jan. 2021. https://vitalik.ca/general/2021/01/11/recovery.html
6. P. Feldman, "A practical scheme for non-interactive verifiable secret sharing," in *Proceedings of the 28th Annual Symposium on Foundations of Computer Science*, 1987, pp. 427–437.
7. T. Rabin and M. Ben-Or, "Verifiable secret sharing and multiparty protocols with honest majority," in *Proceedings of the 21st Annual ACM Symposium on Theory of Computing (STOC)*, 1989, pp. 73–85.
8. P. Wuille, et al., "BIP-0032: Hierarchical Deterministic Wallets," *Bitcoin Improvement Proposals*, 2012.
9. M. Palatinus, et al., "BIP-0039: Mnemonic code for generating deterministic keys," *Bitcoin Improvement Proposals*, 2013.
10. SatoshiLabs, "SLIP-0039: Shamir's Secret-Sharing for Mnemonic Codes," *SatoshiLabs Improvement Proposals*, 2019.
11. A. Poelstra, L. O'Connor, and S. Corallo, "BIP-0093: Codex32: Checksummed SSSS-aware BIP32 seeds," *Bitcoin Improvement Proposals*, 2023. https://github.com/bitcoin/bips/blob/master/bip-0093.mediawiki
12. "SeedXOR: Split your BIP39 seed for better redundancy and security," https://seedxor.com/
13. A. P. Goucher, "Hamming backups: a 2-of-3 variant of SeedXOR," *Complex Projective 4-Space*, Sept. 2021. https://cp4space.hatsya.com/2021/09/10/hamming-backups-a-2-of-3-variant-of-seedxor/
14. J. Lopp, "How Many Bitcoin Seed Phrases Are Only One Repeated Word?," *blog.lopp.net*, 2023. https://blog.lopp.net/how-many-bitcoin-seed-phrases-are-only-one-repeated-word/
15. J. von Neumann, "Various techniques used in connection with random digits," in *Monte Carlo Method*, National Bureau of Standards Applied Mathematics Series, vol. 12, pp. 36–38, 1951.
16. Blockchain Commons, "BCR-2020-005: Uniform Resources (UR): Encoding Structured Binary Data for Transport in URIs and QR Codes," *Blockchain Commons Research*, 2020. https://github.com/BlockchainCommons/Research/blob/master/papers/bcr-2020-005-ur.md

---

## Appendix A: A Primer on Shamir's Secret Sharing

Shamir's Secret Sharing [1] is a threshold scheme that allows a secret value to be split into $n$ shares such that any $k$ shares suffice to reconstruct the secret, while any $t < k$ shares provide no information about it.

At a high level:

1. **Finite field**: Choose a finite field $GF(q)$. In this paper, $q = 2053$.
2. **Polynomial encoding**: To share a secret $s \in GF(q)$, select a random polynomial

$$f(x) = a_0 + a_1 x + \ldots + a_{k-1} x^{k-1}$$

with $a_0 = s$ and $(a_1, \ldots, a_{k-1})$ chosen uniformly at random from $GF(q)$.

3. **Share generation**: For each participant index $x \in \{1, \ldots, n\}$, compute the share $y = f(x)$.
4. **Reconstruction**: Any group of $k$ participants can reconstruct the secret by interpolating the unique degree-$(k-1)$ polynomial.

---

## Appendix B: A Gentle Introduction to Modular Arithmetic

Modular arithmetic is the system of arithmetic that makes Schiavinato Sharing executable by hand. It behaves like "clock arithmetic": values wrap around after reaching a fixed modulus.

### B.1 The Modulus and Basic Operations

In standard arithmetic, integers extend indefinitely. In modular arithmetic with modulus $p$, we identify integers that differ by a multiple of $p$. Every value is represented by one of the residues

$$0, 1, 2, \ldots, p-1$$

For example, with modulus 12 (a clock with 12 hours):

- $8 + 5 = 13$, but $13 \bmod 12 = 1$.
- $20 \bmod 12 = 8$.
- $-1 \bmod 12 = 11$.

In Schiavinato Sharing, the modulus is the prime $p = 2053$, so all intermediate and final results are reduced to the range 0–2052.

### B.2 Examples in $GF(2053)$

- $2000 + 100 = 2100$. Reducing modulo 2053 gives $2100 - 2053 = 47$, so $2100 \bmod 2053 = 47$.
- $1000 \times 3 = 3000$. Reducing modulo 2053 gives $3000 - 2053 = 947$, so $3000 \bmod 2053 = 947$.
- $50 - 100 = -50$. To reduce $-50$ modulo 2053, we add 2053: $-50 + 2053 = 2003$.

### B.3 Prime Fields and Division

When the modulus $p$ is prime, the set $\{0, 1, \ldots, p-1\}$ with addition and multiplication modulo $p$ forms a **finite field** $GF(p)$. In a field, every non-zero element has a multiplicative inverse:

$$a \cdot a^{-1} \equiv 1 \pmod{p}$$

One of the reasons Schiavinato Sharing pre-computes Lagrange coefficients is to avoid asking users to compute modular inverses by hand.

---

## Appendix C: Demystifying Lagrange Interpolation

Lagrange interpolation provides a formula for reconstructing a polynomial from its values at a finite set of points.

### C.1 Intuitive Picture

A straight line can be determined uniquely by two distinct points. Polynomials of higher degree behave similarly:

- A polynomial of degree at most 1 (a line) is determined by 2 points.
- A polynomial of degree at most 2 (a parabola) is determined by 3 points.
- In general, a polynomial of degree at most $k-1$ is determined by $k$ points with distinct $x$-coordinates.

### C.2 The Lagrange Basis Polynomials

Let $(x_1, \ldots, x_k)$ be distinct elements of $GF(2053)$, and let $y_j = f(x_j)$ be the corresponding share values.

The Lagrange basis polynomials are defined as:

$$\ell_j(x) = \prod_{\substack{i=1 \\ i \neq j}}^{k} \frac{x - x_i}{x_j - x_i} \pmod{2053}$$

Each $\ell_j(x)$ has the property that:

- $\ell_j(x_j) = 1$
- $\ell_j(x_i) = 0$ for all $i \neq j$

The interpolating polynomial is then

$$f(x) = \sum_{j=1}^{k} y_j \ell_j(x)$$

### C.3 Recovering the Secret at $x = 0$

In Shamir's scheme, the secret is $a_0 = f(0)$. Evaluating at $x = 0$ yields:

$$f(0) = \sum_{j=1}^{k} y_j \ell_j(0)$$

Define the Lagrange coefficients

$$\gamma_j = \ell_j(0) = \prod_{\substack{i=1 \\ i \neq j}}^{k} \frac{-x_i}{x_j - x_i} \pmod{2053}$$

Then

$$a_0 = f(0) = \sum_{j=1}^{k} \gamma_j y_j \pmod{2053}$$

### C.4 Practical Considerations

Computing the $\gamma_j$ requires modular inverses. Instead, Schiavinato Sharing:

- treats $\gamma_j$ as non-secret and safe to compute on any device, and
- provides pre-computed $\gamma_j$ tables for common schemes.

---

## Appendix D: Worked Example of Manual Sharing and Recovery

This appendix presents a toy example using a small prime modulus ($p = 13$ for simplicity). The structure is the same as the real scheme ($p = 2053$).

### D.1 Setup

Suppose we have a 3-word "mnemonic":

- Word A: index 3
- Word B: index 5
- Word C: index 7

We define a checksum secret:

$$c = (3 + 5 + 7) \bmod 13 = 15 \bmod 13 = 2$$

We choose a 2-of-3 scheme. For each secret, we define an independent polynomial:

$$
\begin{align}
f_A(x) &= 3 + 4x \\
f_B(x) &= 5 + 6x \\
f_C(x) &= 7 + 1x \\
f_c(x) &= 2 + 9x
\end{align}
$$

### D.2 Generating Shares

We evaluate each polynomial at $x = 1, 2, 3$ to get shares for each index.

### D.3 Pre-Computed Lagrange Coefficients for 2-of-3

In $GF(13)$:

- Using shares {1, 2}: $(\gamma_1, \gamma_2) = (2, 12)$
- Using shares {1, 3}: $(\gamma_1, \gamma_3) = (8, 6)$
- Using shares {2, 3}: $(\gamma_2, \gamma_3) = (3, 11)$

### D.4 Recovering from Two Shares

Using shares 1 and 3 with coefficients $(8, 6)$, we perform the weighted sum for each secret and verify the checksum.

---

## Appendix E: Heir Instructions and Practical Recovery Guide

### E.1 What These Papers Are

- The documents labeled as **Schiavinato Sharing** are **shares** of a cryptocurrency wallet backup.
- Each sheet is **only one part** of the backup. A single sheet **cannot** reveal or spend the funds.
- The original wallet was protected by a **BIP39 recovery phrase**. Schiavinato Sharing breaks that phrase into multiple shares.

### E.2 What You Need to Recover the Wallet

- The owner chose numbers **k** and **n**:
  - **n** = total number of shares that exist
  - **k** = minimum number of different shares required to recover the wallet
- This is usually written as a **"k-of-n" scheme** (e.g., "3-of-5").

To recover, you must:

- Collect at least **k different shares** for the same wallet
- Ensure the shares are genuine

If you only have **one share**, you do **not** have enough information.

### E.3 What Not to Do

- **Do not** type the words from a single share into a wallet app
- **Do not** assume a sheet that "looks like" a 24-word list is safe to use directly
- **Do not** discard other shares after testing a single one

### E.4 How Recovery Typically Works

1. **Gather the necessary shares**: Collect at least **k** distinct shares
2. **Choose a recovery method**: Use the GRIFORTIS HTML tool or work with a security professional
3. **Reconstruct the mnemonic**: Combine the numbers using arithmetic rules
4. **Use the recovered mnemonic carefully**: Enter it only in a controlled environment

### E.5 About Passphrases ("25th Word")

The original wallet may have used an extra **BIP39 passphrase**. This passphrase:

- Is **not written on the Schiavinato Sharing worksheets**
- Is a separate secret that changes the wallet

### E.6 When to Seek Help

Professional assistance is strongly recommended if:

- You don't understand the difference between **shares** and a complete **recovery phrase**
- You have **fewer than k shares**
- You suspect shares may have been lost or tampered with
- The value is significant

---

## Appendix F: Deployment Patterns and Real-World Scenarios

### F.1 Single User with Geographic Redundancy (2-of-3)

- Share #1 in a home safe
- Share #2 in a bank safe-deposit box
- Share #3 with a trusted relative

**Rationale:** Any single location loss doesn't destroy the wallet.

### F.2 Couple Without Heirs, 2-of-4 with Personal Redundancy

- Share #1 with Partner A (home safe)
- Share #2 with Partner A (work safe)
- Share #3 with Partner B (home safe)
- Share #4 with Partner B (work safe)

**Rationale:** Each partner can recover independently.

### F.3 Couple with Heirs and Executor (3-of-5)

- Share #1 with Partner A (home safe)
- Share #2 with Partner B (home safe)
- Share #3 with executor/attorney
- Share #4 in bank safe-deposit box
- Share #5 in geographically distant location

**Rationale:** Enables collaboration for recovery without granting unilateral control.

### F.4 Social Recovery with Friends or Colleagues

Distribute shares among trusted friends/colleagues while keeping some shares yourself.

**Rationale:** Reduces dependency on formal institutions.

### F.5 Replicating Individual Shares for Redundancy

Create **multiple copies of the same share** for protection against physical loss:

- Generate 2-of-3 scheme
- Print two copies of share 1 (home + bank vault)
- Print two copies of share 2 (second location + trusted relative)
- Keep share 3 as single copy

**Advantages:** Simpler mental model, localized redundancy.

**Security considerations:** Multiple copies increase attack surface but don't change threshold.

---

## Appendix G: Dice-Based Randomness Procedure for $GF(2053)$

This appendix specifies how to generate uniformly random integers in $\{0, \ldots, 2052\}$ using only fair six-sided dice, employing rejection sampling [15] to eliminate modulo bias.

### G.1 Overview

- Use **five** fair six-sided dice per attempt
- Each attempt produces an integer $N \in \{0, \ldots, 7775\}$
- If $N$ is in accepted range, reduce modulo 2053; otherwise re-roll

Because $3 \cdot 2053 = 6159 \le 7776$, rejection sampling ensures uniform distribution.

### G.2 Step-by-Step Procedure

For each random coefficient:

1. **Determine the required range**: $\{0, \ldots, 2052\}$ for most coefficients, $\{1, \ldots, 2052\}$ for leading coefficient
2. **Roll 5 dice**: Label as $d_1, d_2, d_3, d_4, d_5$
3. **Convert to base-6 integer**: $N = ((((r_1 \cdot 6 + r_2) \cdot 6 + r_3) \cdot 6 + r_4) \cdot 6 + r_5)$ where $r_i = d_i - 1$
4. **Apply acceptance test**:
   - For range 0-2052: If $N \ge 6159$, reject; else $s = N \bmod 2053$
   - For range 1-2052: If $N \ge 6156$, reject; else $s = (N \bmod 2052) + 1$
5. **Use $s$ as the coefficient**

Acceptance probability is approximately 79%, making this practical for manual use.

---

## Appendix H: Formal Operational Semantics

### H.1 Parameters

- **Field**: $GF(p)$ with $p = 2053$
- **Secret Domain**: $\mathcal{S} = \{0, \ldots, 2052\}$
- **Share Index Domain**: $\mathcal{X} = \{1, \ldots, n\} \subset GF(p)$

### H.2 Primitive: Share(s, k, n)

**Input**: Secret $s \in \mathcal{S}$, Threshold $k \ge 1$, Count $n \ge k$  
**Output**: Set of shares $\{(x, y_x) \mid x \in \{1, \ldots, n\}\}$

1. Set $a_0 = s$
2. Sample $a_1, \ldots, a_{k-2}$ uniformly from $\{0, \ldots, 2052\}$
3. Sample $a_{k-1}$ uniformly from $\{1, \ldots, 2052\}$
4. Define $P(z) = \sum_{j=0}^{k-1} a_j z^j \pmod{2053}$
5. For each $x \in \{1, \ldots, n\}$, compute $y_x = P(x) \pmod{2053}$
6. Return $\{(x, y_x)\}_{x=1}^n$

### H.3 Primitive: Recover(Shares, k)

**Input**: A set of $k$ distinct shares $S_{in} = \{(x_i, y_i)\}_{i=1}^k$  
**Output**: Secret $s \in \mathcal{S}$

1. For each $j \in \{1, \ldots, k\}$, compute:

$$\gamma_j = \prod_{\substack{m=1 \\ m \neq j}}^{k} x_m (x_m - x_j)^{-1} \pmod{2053}$$

2. Compute: $s = \sum_{j=1}^{k} y_j \gamma_j \pmod{2053}$
3. Return $s$

### H.4 Primitive: ValidateRow(Words, ChecksumShare)

**Input**: Recovered words $w_1, w_2, w_3 \in \mathcal{S}$, Recovered checksum $c \in \mathcal{S}$  
**Output**: Boolean (True if valid)

1. Compute: $c_{expected} = (w_1 + w_2 + w_3) \pmod{2053}$
2. Return $c == c_{expected}$

---

*End of Whitepaper*
