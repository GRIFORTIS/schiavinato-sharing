# RFC: The "Analog Fallback" for BIP39 Wallets
**Status:** Experimental / Request for Comments  
**Target Audience:** Cryptographers, Wallet Architects, Resilience Engineers

---

## ⚡ The Elevator Pitch
We have instantiated Shamir's Secret Sharing over the prime field **$GF(2053)$** to enable **verified, air-gapped recovery of BIP39 mnemonics using only pencil and paper**.

This specification addresses the "Digital Gap": the risk that occurs when trusted hardware or software is unavailable, compromised, or incompatible decades into the future. It provides a mathematically sound, human-executable path to recover digital bearer assets without touching a computer.

## 🔑 Core Innovations

### 1. The Field Choice: $GF(2053)$
Existing schemes (SLIP-39, SSKR) utilize $GF(2^n)$, requiring binary field arithmetic opaque to humans.
* **Our Approach:** We use the smallest prime $p=2053$ greater than the BIP39 wordlist size (2048).
* **Result:** Every operation is standard integer arithmetic. BIP39 word indices map directly to field elements.
* **Trade-off:** Minimal bias in randomness generation (handled via rejection sampling) for a massive gain in usability.

### 2. The "Human-Factor" Checksum
Manual arithmetic is error-prone. We introduce a novel **Two-Layer Arithmetic Checksum** to detect calculation errors before they propagate:
* **Row-Level:** Every 3 words are summed modulo 2053. This sum is shared as a distinct secret.
* **Global-Level:** All 24 words are summed modulo 2053.
* **Detection Rate:** The probability of a random arithmetic error satisfying the row check and global check simultaneously is $< 1/2053^2$.

### 3. Auditable "Zero-Dependency" Artifact
We provide a single-file (~1,500 LOC) HTML reference implementation designed for air-gapped execution.
* **Constant-Time:** Implements `constantTimeEqual` for BIP39 checksum verification to mitigate timing attacks.
* **Memory Hygiene:** Aggressive zeroing (`secureWipeArray`) of sensitive buffers immediately after calculation.
* **Stateless Gadget:** Includes a "Lagrange Calculator" that computes $\lambda$ coefficients without ever seeing user secrets, preserving the "air gap" for the sensitive multiplication step.

---

## ❓ Specific Questions for Reviewers

We are seeking critique on the following architectural decisions:

1.  **The Checksum Oracle:** Does exposing the shared row-sum (checksum) introduce any practical reduction in entropy for a standard 2-of-3 or 3-of-5 setup, given the $2^{256}$ search space?
2.  **Field Biasing:** Is the rejection sampling method described in [Appendix G of the Whitepaper](WHITEPAPER.md#appendix-g-dice-based-randomness-procedure-for-gf2053) sufficient to mitigate modulo bias in manual setup?
3.  **Adversarial Worksheet:** Does the layout of the physical worksheet (displaying indices 0-2047) present a significant "evil maid" risk compared to standard mnemonic storage?

---

## 📄 Resources

* **[Full Whitepaper](WHITEPAPER.md)**: Deep dive into the math and security proofs.
* **[Reference Implementation (HTML)](reference-implementation/schiavinato_sharing.html)**: The auditable tool.
* **[Test Vectors](TEST_VECTORS.md)**: Standardized vectors for independent reimplementation.

**Contact:** open an Issue in this repo.
