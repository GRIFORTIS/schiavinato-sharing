# RFC: The "Analog Fallback" for BIP39 Wallets
**Status:** Experimental / Request for Comments  
**Target Audience:** Cryptographers, Wallet Architects, Resilience Engineers

---

## ⚡ The Elevator Pitch
We have instantiated Shamir's Secret Sharing over the prime field **$GF(2053)$** to enable **verified, air-gapped recovery of BIP39 mnemonics using only pencil and paper**.

This specification addresses the "Digital Gap": the risk that occurs when trusted hardware or software is unavailable, compromised, or incompatible decades into the future. It provides a mathematically sound, human-executable path to recover digital bearer assets without touching a computer.

## 🔑 Core Innovations

### 1. Triple-Lock Security Architecture
To ensure integrity across both manual and computational modes, we implement a three-layer defense:

*   **Arithmetic Lock (Correctness):** A novel two-layer checksum (Row-Level + Global-Level) embedded in the polynomial structure. It detects calculation errors during manual or automated execution with a probability of undetected error $< 1/2053^2$.
*   **Transport Lock (Integrity):** A SHA-256 hash (truncated) embedded in the digital envelope (QR/Bech32m) to validate physical media integrity before processing.
*   **Identity Lock (Authenticity):** A Blinded Identity Tag (HMAC-SHA256) that binds shares to a specific wallet fingerprint, preventing substitution or "denial of inheritance" attacks.

### 2. The Field Choice: $GF(2053)$
Existing schemes (SLIP-39, SSKR) utilize $GF(2^n)$, requiring binary field arithmetic opaque to humans.
* **Our Approach:** We use the smallest prime $p=2053$ greater than the BIP39 wordlist size (2048).
* **Result:** Every operation is standard integer arithmetic. BIP39 word indices map directly to field elements.
* **Trade-off:** Minimal bias in randomness generation (handled via rejection sampling) for a massive gain in usability.

### 3. Auditable "Zero-Dependency" Artifact
We provide a single-file (~1,500 LOC) HTML reference implementation designed for air-gapped execution.
* **Constant-Time:** Implements `constantTimeEqual` for BIP39 checksum verification to mitigate timing attacks.
* **Memory Hygiene:** Aggressive zeroing (`secureWipeArray`) of sensitive buffers immediately after calculation.
* **Stateless Gadget:** Includes a "Lagrange Calculator" that computes $\lambda$ coefficients without ever seeing user secrets, preserving the "air gap" for the sensitive multiplication step.

---

## ❓ Specific Questions for Reviewers

We are seeking critique on the following architectural decisions, as detailed in the Whitepaper (Section 6.2):

1.  **Integrity under Substitution Attacks (Major):** Can an attacker forge a set of shares that satisfies all 9 linear checksums *and* recovers to a valid BIP39 mnemonic (satisfying the SHA-256 checksum), but is *not* the user's original seed? This addresses the difficulty of "mathematical forgery" attacks.
2.  **Adversarial Error Patterns (Medium):** Linear checksums are vulnerable to cancellation errors (e.g., +1/-1). Can a sophisticated adversary exploit this to craft targeted corruptions that bypass the Arithmetic Lock? We seek formal bounds on detection rates for adversarial (non-random) errors.
3.  **Field Size & Metadata Leakage (Lower Priority):**
    *   **Field Size:** Does increasing the field size (e.g., to $GF(4099)$) provide a meaningful increase in adversarial search complexity for an attacker holding $k-1$ shares?
    *   **Metadata:** Does the specific implementation of Shamir over $GF(2053)$ leave statistical artifacts (e.g., from rejection sampling) that distinguish recovered mnemonics from standard wallet-generated ones?

> **Note on Security Impact:** These questions address **integrity** and **availability** (preventing "denial of inheritance" or sabotage), not **confidentiality**. Even if the answers to these questions are unfavorable, the core information-theoretic security of Shamir's Secret Sharing remains intact: an adversary with fewer than $k$ shares **cannot** learn the secret or steal funds. The risk is limited to the user being tricked into recovering a wrong (but valid-looking) wallet, potentially believing funds are lost.

---

## 📄 Resources

* **Whitepaper**: [PDF](https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/latest/download/WHITEPAPER.pdf) ([LaTeX source](WHITEPAPER.tex))
* **[Reference Implementation (HTML)](reference-implementation/schiavinato_sharing.html)**: The auditable tool.
* **[Test Vectors](TEST_VECTORS.md)**: Standardized vectors for independent reimplementation.

**Contact:** open an Issue in this repo.
