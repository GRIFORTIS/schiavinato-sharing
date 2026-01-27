## Schiavinato Sharing – GF(2053) Test Vector (2-of-3, 12 Words)

This file provides comprehensive test vectors for implementers of Schiavinato Sharing, demonstrating both manual and computational recovery capabilities.

**Test Vector Parameters:**
- Prime field: $p = 2053$  
- Threshold scheme: $k = 2$, $n = 3$ (2-of-3)  
- Share indices: $x \in \{1, 2, 3\}$  
- Number of words: 12 (arranged as 4 rows of 3 words)

---

## 1. How to Use This Test Vector

This document walks through Schiavinato Sharing from first principles, demonstrating both manual recovery (Sections 3-9) and computational recovery via QR codes (Section 10). Use it to validate your implementation or understand how the dual-mode scheme works.

### Quick Navigation

**For Implementers:**
- **Section 2:** Introduction (BIP39 compatibility, Dual-Mode principle, Triple-Lock security)
- **Section 3:** Base secrets (word indices, row checksums, GIC)
- **Section 4:** Polynomial construction (word and checksum polynomials)
- **Section 5:** Share generation (evaluate polynomials at x = 1, 2, 3)
- **Section 6:** Share verification via direct summation
- **Section 7:** Lagrange coefficients for interpolation
- **Section 8:** Complete recovery example with all validations
- **Section 9:** Security implementation notes
- **Section 10:** QR code test vectors (digital envelope format)
  - **10.1:** Binary payload specification
  - **10.2:** Share 1 construction (detailed walkthrough)
  - **10.3-10.4:** Shares 2 and 3 (complete payloads)
  - **10.5:** Share 1 parsing and verification
  - **10.6:** Share 2 parsing and verification
  - **10.7:** Blinded Identity validation (requires K shares)

**For Learners:**
- Read sections sequentially for the full pedagogical journey
- **Section 2:** Introduction to Dual-Mode capability and Triple-Lock security
- **Sections 3.2-3.3:** Raw checksum calculation (simple arithmetic)
- **Sections 4.2-4.3:** Deterministic checksum polynomials (v0.3.0 innovation)
- **Section 6:** Share validation during splitting (self-consistency check)
- **Section 8.4:** Complete row recovery cycle (detailed walkthrough)
- **Section 10.2:** QR envelope construction (from shares to Base64URL)
- **Section 10.7:** Triple-Lock validation (complete security demonstration)

**For Manual Recovery Testing:**
- Use Sections 3-8 exclusively (no digital components required)
- **Section 5:** Get your share values (paper format)
- **Section 7:** Look up Lagrange coefficients for your share combination
- **Section 8:** Follow step-by-step recovery with checksum validation

**For Computational Recovery Testing:**
- Use Section 10 for QR code encoding/decoding
- **Section 10.2-10.4:** Encode shares to QR codes (Base64URL strings provided)
- **Section 10.5-10.6:** Parse and verify individual shares (Transport + Arithmetic Locks)
- **Section 10.7:** Validate Blinded Identity after recovery (Identity Lock, requires K shares)

### Validation Methods

**Method 1: Polynomial Approach (Sections 3-5)**
1. Get base secrets and random coefficients (Section 3)
2. Build word polynomials (Section 4.1)
3. Build checksum polynomials by summing coefficients (Sections 4.2-4.3)
4. Evaluate all polynomials at x = 1, 2, 3 and verify against share arrays (Section 5)

**Method 2: Direct Summation (Section 6)**
1. Generate word shares from polynomials
2. Calculate checksum shares by direct addition: sum word shares (mod 2053)
3. Calculate GIC shares: (sum of row checksums + share number) (mod 2053)
4. Proves equivalence with polynomial method

**Manual Recovery Verification (Sections 7-8)**
1. Get Lagrange coefficients for your share combination (Section 7)
2. Interpolate to recover all 17 secrets (Section 8.3-8.4)
3. Validate row checksums against recovered words (Section 8.4-8.5)
4. Validate Global Integrity Check (Section 8.6)
5. Validate BIP39 checksum on recovered mnemonic (Section 8.7)

**Computational Recovery - Triple-Lock Validation (Section 10)**
- See Section 2.3 for Triple-Lock system overview
- **Section 10.5-10.6:** Single-share validation (Transport + Arithmetic Locks)
- **Section 10.7:** Post-recovery validation (Identity Lock, requires K shares)

---

## 2. Introduction

### 2.1 BIP39 Compatibility

The "word indices" below are BIP39-style 1-based indices, meaning they are in the range $\{1,\dots,2048\}$. For this test vector we work directly with indices; mapping to actual BIP39 words is optional and left to the implementer.

**Important:** Schiavinato Sharing is 100% BIP39-compatible at input (original mnemonic) and output (recovered mnemonic) stages. However, because shares are computed in $GF(2053)$, intermediate share values occasionally fall outside the BIP39 1-based range $\{1,\dots,2048\}$. This occurs in approximately **0.24%** of share values (5 out of 2053 possible values).

All BIP39-compatible words in shares are presented with their index to enable easier manual recovery (e.g., `0001-abandon` or `2048-zoo`). Out-of-range indices $\{0, 2049, 2050, 2051, 2052\}$ use the format `0000-0000`, `2049-2049`, `2050-2050`, `2051-2051`, and `2052-2052` respectively. This test vector includes examples of indices 0 and 2052 to demonstrate edge-case handling.

**Binary Encoding Note:** In the QR code digital envelope (Section 10), all indices are encoded as 12-bit values (0x000 to 0xFFF), which naturally accommodates the full $GF(2053)$ range without special handling. For example, index 0 = `0x000` and index 2052 = `0x804` both fit within 12 bits.

### 2.2 The Dual-Mode Principle

Schiavinato Sharing is the **only threshold secret sharing scheme** that supports both **fully manual** and **computational** sharing and recovery modes without compromise:

**Manual Mode (Sections 3-9):**
- Humans can split and recover using only paper, pen, and basic modular arithmetic
- BIP39 word lookup enables offline, zero-technology recovery
- Checksums provide mathematical validation during manual computation
- Designed for disaster scenarios where electronic devices are unavailable or compromised

**Computational Mode (Section 10):**
- QR codes enable instant air-gapped recovery via scanning devices
- Binary encoding optimizes for space efficiency (62-byte payload for a 12 words seed)
- Triple-Lock security system protects digital envelope integrity
- Full backwards compatibility with manual recovery (shares remain human-readable)

This dual-mode capability is a **core design principle**, not an afterthought. Both modes use identical mathematical foundations, ensuring users can choose their preferred recovery method based on circumstances without sacrificing security or functionality.

### 2.3 Triple-Lock Security System

For computational recovery (Section 10), the digital envelope implements a three-layer validation system:

**1. Transport Lock (Integrity)**
- **What:** SHA-256 hash (truncated to 16 bytes)
- **Detects:** QR corruption, scanning errors, bit flips, physical damage
- **When:** Validated immediately at scan time, before any cryptographic operations

**2. Arithmetic Lock (Correctness)**
- **What:** Row checksums + Global Integrity Check (GIC)
- **Detects:** Invalid shares, mathematical inconsistencies, computation errors
- **When:** Validated during recovery, ensures share data is mathematically valid

**3. Identity Lock (Authenticity)**
- **What:** HMAC-based Blinded Identity (fingerprint-derived)
- **Detects:** Share substitution attacks, wallet mixing, session mixing
- **When:** Validated after recovery with K shares, confirms shares belong to correct wallet

**Combined Effect:** These three locks provide **Integrity + Correctness + Authenticity**, protecting against both accidental corruption and intentional tampering. See Section 10.7 for complete validation demonstration.

---

## 3. Base Secrets

### 2.1 Word indices

We start from the following 12 word indices, chosen so that they form a **valid 12-word BIP39 checksum** when interpreted according to the standard:

- $w_1 = 1680$ → `spin`  
- $w_2 = 1471$ → `result`  
- $w_3 = 217$ → `brand`  
- $w_4 = 42$ → `ahead`  
- $w_5 = 1338$ → `poet`  
- $w_6 = 279$ → `carpet`  
- $w_7 = 1907$ → `unusual`  
- $w_8 = 324$ → `chronic`  
- $w_9 = 468$ → `denial`  
- $w_{10} = 682$ → `festival`  
- $w_{11} = 1844$ → `toy`  
- $w_{12} = 126$ → `autumn`

Equivalently, the BIP39 English mnemonic is:

```text
spin result brand ahead poet carpet unusual chronic denial festival toy autumn
```

And the list of numbers is:

```text
1680, 1471, 217, 42, 1338, 279, 1907, 324, 468, 682, 1844, 126
```

These are grouped into 4 rows of 3:

- Row 1: $(w_1, w_2, w_3)$  
- Row 2: $(w_4, w_5, w_6)$  
- Row 3: $(w_7, w_8, w_9)$  
- Row 4: $(w_{10}, w_{11}, w_{12})$

### 2.2 Row checksums

Row checksums validate that the 3 words in each row are mathematically consistent across all shares. They enable early error detection during both the splitting process and recovery.

**Calculation:** For each row, sum the 3 word indices modulo 2053:

```text
c_r = (w_{r,1} + w_{r,2} + w_{r,3}) mod 2053
```

**Row 1:** $(w_1, w_2, w_3)$
```text
c_1 = (1680 + 1471 + 217) mod 2053
c_1 = 3368 mod 2053 = 1315
```

**Row 2:** $(w_4, w_5, w_6)$
```text
c_2 = (42 + 1338 + 279) mod 2053
c_2 = 1659
```

**Row 3:** $(w_7, w_8, w_9)$
```text
c_3 = (1907 + 324 + 468) mod 2053
c_3 = 2699 mod 2053 = 646
```

**Row 4:** $(w_{10}, w_{11}, w_{12})$
```text
c_4 = (682 + 1844 + 126) mod 2053
c_4 = 2652 mod 2053 = 599
```

**Row checksum values:**

```text
1315, 1659, 646, 599
```

### 2.3 Global Integrity Check

The Global Integrity Check (GIC) validates the entire share, including the share number. This provides comprehensive integrity verification during recovery.

**Calculation:** Sum all 4 row checksums modulo 2053:

```text
GIC_base = (c_1 + c_2 + c_3 + c_4) mod 2053
GIC_base = (1315 + 1659 + 646 + 599) mod 2053
GIC_base = 4219 mod 2053 = 113
```

**Alternative calculation** (equivalent): Sum all 12 words modulo 2053:

```text
GIC_base = (w_1 + w_2 + ... + w_{12}) mod 2053 = 113
```

**Global Integrity Check base value:**

```text
113
```

**Share validation:** On each share, the GIC share value includes the share number:

```text
GIC.SX = (c_1.sX + c_2.sX + c_3.sX + c_4.sX + X) mod 2053
```

Where X is the share number (1, 2, or 3). This ensures shares are correctly labeled and not accidentally switched.

### 2.4 Random coefficients

For Shamir's Secret Sharing, each word polynomial requires random coefficients. The critical requirement is that the **highest-degree coefficient must be non-zero** to prevent the polynomial from degenerating to a lower degree, which would compromise security.

For our 2-of-3 scheme using degree-1 polynomials $f(x) = a_0 + a_1 \cdot x$:
- $a_0$ = secret (word index)
- $a_1 \in \{1, 2, \dots, 2052\}$ (must be non-zero)

For higher-degree schemes (e.g., 3-of-5 uses degree-2 polynomials $f(x) = a_0 + a_1 \cdot x + a_2 \cdot x^2$):
- Highest coefficient $a_2 \in \{1, 2, \dots, 2052\}$ (must be non-zero)
- Lower coefficients $a_1 \in \{0, 1, \dots, 2052\}$ (can be zero)

Most of these 12 random values were generated using Python's random module, with few exceptions to demonstrate edge cases:

```python
import random
random.seed(42)
a_1 = [random.randrange(1, 2053) for _ in range(12)]
```

**SECURITY WARNING:** These coefficients use `random.seed(42)` for REPRODUCIBILITY ONLY. Production implementations MUST use cryptographically secure random sources (secrets. SystemRandom, os.urandom, etc.). See SECURITY.md Section 5.2.


The 12 random coefficients ($a_1$ values) are:

```text
1, 2052, 1126, 2012, 710, 571, 146, 1728, 2000, 130, 122, 383
```

**Total secrets:** We now have 17 secret values that will be shared:

- 12 word indices $w_1, \dots, w_{12}$  
- 4 row checksums $c_1, \dots, c_4$  
- 1 global integrity check $GIC_{base}$

---

## 4. Polynomial Construction in $GF(2053)$

Schiavinato Sharing uses Shamir's Secret Sharing to distribute secrets. For a 2-of-3 scheme, each secret is shared using a degree-1 polynomial:

```text
f(x) = a_0 + a_1·x (mod 2053)
```

where:
- $a_0 = s$ (the secret itself)
- $a_1$ is chosen uniformly at random (see above)


### 3.1 Word Polynomials

Each word is shared using a degree-1 polynomial. The secret value ($a_0$) comes from Section 3.1, and the random coefficient ($a_1$) comes from Section 3.4.

For each word $w_i$:
```text
f_wi(x) = w_i + a_1·x (mod 2053)
```

The 12 word polynomials have coefficients $(a_0, a_1)$:

- $f_{w_1}(x) = 1680 + 1x$  
- $f_{w_2}(x) = 1471 + 2052x$  
- $f_{w_3}(x) = 217 + 1126x$  
- $f_{w_4}(x) = 42 + 2012x$  
- $f_{w_5}(x) = 1338 + 710x$  
- $f_{w_6}(x) = 279 + 571x$  
- $f_{w_7}(x) = 1907 + 146x$  
- $f_{w_8}(x) = 324 + 1728x$  
- $f_{w_9}(x) = 468 + 2000x$  
- $f_{w_{10}}(x) = 682 + 130x$  
- $f_{w_{11}}(x) = 1844 + 122x$  
- $f_{w_{12}}(x) = 126 + 383x$


### 3.2 Row Checksum Polynomials

**Key Innovation:** Starting with v0.3.0, checksum polynomials are constructed **deterministically** by summing the word polynomial coefficients (mod 2053). This is a core property of Linear Secret Sharing Schemes (LSSS).

For each checksum, we add the corresponding word polynomials to create the checksum polynomial.

#### Row 1 Checksum ($c_1$)

Row 1 contains words $w_1, w_2, w_3$. The checksum polynomial is their sum modulo 2053:

```text
f_c1(x) = f_w1(x) + f_w2(x) + f_w3(x)
f_c1(x) = (1680 + 1x) + (1471 + 2052x) + (217 + 1126x)
f_c1(x) = (1680 + 1471 + 217) + (1 + 2052 + 1126)x
f_c1(x) = 3368 + 3179x  (mod 2053)
f_c1(x) = 1315 + 1126x
```

**Coefficients:** $a_0 = 1315$, $a_1 = 1126$

#### Row 2 Checksum ($c_2$)

Row 2 contains words $w_4, w_5, w_6$:

```text
f_c2(x) = f_w4(x) + f_w5(x) + f_w6(x)
f_c2(x) = (42 + 2012x) + (1338 + 710x) + (279 + 571x)
f_c2(x) = (42 + 1338 + 279) + (2012 + 710 + 571)x
f_c2(x) = 1659 + 3293x  (mod 2053)
f_c2(x) = 1659 + 1240x
```

**Coefficients:** $a_0 = 1659$, $a_1 = 1240$

#### Row 3 Checksum ($c_3$)

Row 3 contains words $w_7, w_8, w_9$:

```text
f_c3(x) = f_w7(x) + f_w8(x) + f_w9(x)
f_c3(x) = (1907 + 146x) + (324 + 1728x) + (468 + 2000x)
f_c3(x) = (1907 + 324 + 468) + (146 + 1728 + 2000)x
f_c3(x) = 2699 + 3874x  (mod 2053)
f_c3(x) = 646 + 1821x
```

**Coefficients:** $a_0 = 646$, $a_1 = 1821$

#### Row 4 Checksum ($c_4$)

Row 4 contains words $w_{10}, w_{11}, w_{12}$:

```text
f_c4(x) = f_w10(x) + f_w11(x) + f_w12(x)
f_c4(x) = (682 + 130x) + (1844 + 122x) + (126 + 383x)
f_c4(x) = (682 + 1844 + 126) + (130 + 122 + 383)x
f_c4(x) = 2652 + 635x  (mod 2053)
f_c4(x) = 599 + 635x
```

**Coefficients:** $a_0 = 599$, $a_1 = 635$

### 3.3 Global Integrity Check Polynomial

The Global Integrity Check polynomial is constructed by summing the 4 row checksum polynomials:

```text
f_GIC_base(x) = f_c1(x) + f_c2(x) + f_c3(x) + f_c4(x)
f_GIC_base(x) = (1315 + 1126x) + (1659 + 1240x) + (646 + 1821x) + (599 + 635x)
f_GIC_base(x) = (1315 + 1659 + 646 + 599) + (1126 + 1240 + 1821 + 635)x
f_GIC_base(x) = 4219 + 4822x  (mod 2053)
f_GIC_base(x) = 113 + 716x
```

**Coefficients:** $a_0 = 113$, $a_1 = 716$

**Note:** This is mathematically equivalent to summing all 12 word polynomials directly, since $c_1 + c_2 + c_3 + c_4 = w_1 + w_2 + \dots + w_{12}$. Both approaches yield the same polynomial.

**Share value calculation** requires two steps:

1. **Evaluate the polynomial** at share index X:
   ```text
   temp = f_GIC_base(X) = (113 + 716·X) mod 2053
   ```

2. **Add the share number** to include share validation:
   ```text
   GIC.SX = (temp + X) mod 2053
   ```

**Examples:**

- **Share 1:** 
  - Step 1: $f_{GIC\_base}(1) = 113 + 716 = 829$
  - Step 2: $GIC.S1 = 829 + 1 \pmod{2053} = 830$

- **Share 2:** 
  - Step 1: $f_{GIC\_base}(2) = 113 + 1432 \pmod{2053} = 1545$
  - Step 2: $GIC.S2 = 1545 + 2 = 1547$

- **Share 3:** 
  - Step 1: $f_{GIC\_base}(3) = 113 + 2148 \pmod{2053} = 208$
  - Step 2: $GIC.S3 = 208 + 3 = 211$

**Validation:** During recovery, verify that:
```text
GIC.SX = (c1.sX + c2.sX + c3.sX + c4.sX + X) mod 2053
```

This ensures shares are correctly labeled and not switched.

---

**Summary of Checksum Polynomial Coefficients:**

| Checksum | $a_0$ | $a_1$ | Polynomial |
|----------|-------|-------|------------|
| $c_1$ | 1315 | 1126 | $1315 + 1126x$ |
| $c_2$ | 1659 | 1240 | $1659 + 1240x$ |
| $c_3$ | 646 | 1821 | $646 + 1821x$ |
| $c_4$ | 599 | 635 | $599 + 635x$ |
| $GIC$ | 113 | 716 | $113 + 716x$ |

**Why this works:** In LSSS, the sum of polynomials creates a new polynomial whose evaluation at any point equals the sum of the individual evaluations. This means checksum shares automatically equal the sum of word shares, enabling validation during the sharing process.

**Why adding the share number (X) to the Global Integrity Check (GIC) doesn't break recovery:** The `+X` operation effectively adds the polynomial $y=x$ to the GIC. Since secret recovery works by evaluating the polynomial at **$x=0$** (the Y-intercept), and the line $y=x$ passes through zero at the origin, this added value naturally vanishes from the recovered secret.

---

## 5. Share Values for x in {1, 2, 3}

For each secret with coefficients $(a_0, a_1)$, the share at index $x$ is:
```text
y = f(x) = (a_0 + a_1 x) mod 2053
```

The following arrays list the share values in the same order as the secrets above:

Order of secrets:

1. $w_1$  
2. $w_2$  
3. $w_3$  
4. $w_4$  
5. $w_5$  
6. $w_6$  
7. $w_7$  
8. $w_8$  
9. $w_9$  
10. $w_{10}$  
11. $w_{11}$  
12. $w_{12}$  
13. $c_1$  
14. $c_2$  
15. $c_3$  
16. $c_4$  
17. $GIC_{base}$

### 4.1 Shares for x = 1

Share index $x = 1$, values (indices in GF(2053)):

```text
[1681, 1470, 1343, 1, 2048, 850, 0, 2052, 415, 812, 1966, 509, 388, 846, 414, 1234, 830]
```

Mapping to BIP39 English words (index → word), in the same order as the secrets:

- $w_1 = 1681$ → `spirit`
- $w_2 = 1470$ → `response`
- $w_3 = 1343$ → `pond`
- $w_4 = 1$ → `abandon`
- $w_5 = 2048$ → `zoo`  
- $w_6 = 850$ → `health`  
- $w_7 = 0$ → `0000`  
- $w_8 = 2052$ → `2052`  
- $w_9 = 415$ → `critic`  
- $w_{10} = 812$ → `grace`  
- $w_{11} = 1966$ → `volcano`  
- $w_{12} = 509$ → `display`  
- $c_1 = 388$ → `corn`
- $c_2 = 846$ → `have`
- $c_3 = 414$ → `crisp`
- $c_4 = 1234$ → `olive`
- $GIC.S1 = 830$ → `guilt`

### 4.2 Shares for x = 2

Share index $x = 2$, values (indices in GF(2053)):

```text
[1682, 1469, 416, 2013, 705, 1421, 146, 1727, 362, 942, 35, 892, 1514, 33, 182, 1869, 1547]
```

Mapping to BIP39 English words (index → word), in the same order as the secrets:

- $w_1 = 1682$ → `split`  
- $w_2 = 1469$ → `resource`  
- $w_3 = 416$ → `crop`  
- $w_4 = 2013$ → `wine`  
- $w_5 = 705$ → `fix`  
- $w_6 = 1421$ → `ranch`  
- $w_7 = 146$ → `banana`  
- $w_8 = 1727$ → `style`  
- $w_9 = 362$ → `coffee`  
- $w_{10} = 942$ → `interest`  
- $w_{11} = 35$ → `affair`  
- $w_{12} = 892$ → `hunt`  
- $c_1 = 1514$ → `rule`
- $c_2 = 33$ → `advice`
- $c_3 = 182$ → `birth`
- $c_4 = 1869$ → `trumpet`
- $GIC.S2 = 1547$ → `scout`

### 4.3 Shares for x = 3

Share index $x = 3$, values (indices in GF(2053)):

```text
[1683, 1468, 1542, 1972, 1415, 1992, 292, 1402, 309, 1072, 157, 1275, 587, 1273, 2003, 451, 211]
```

Mapping to BIP39 English words (index → word), in the same order as the secrets:

- $w_1 = 1683$ → `spoil`  
- $w_2 = 1468$ → `resist`  
- $w_3 = 1542$ → `scheme`  
- $w_4 = 1972$ → `wait`  
- $w_5 = 1415$ → `radio`  
- $w_6 = 1992$ → `wedding`  
- $w_7 = 292$ → `caught`  
- $w_8 = 1402$ → `quality`  
- $w_9 = 309$ → `charge`  
- $w_{10} = 1072$ → `magnet`  
- $w_{11} = 157$ → `bean`  
- $w_{12} = 1275$ → `palm`  
- $c_1 = 587$ → `enable`
- $c_2 = 1273$ → `pair`
- $c_3 = 2003$ → `where`
- $c_4 = 451$ → `debate`
- $GIC.S3 = 211$ → `bottom`

---

## 6. Verifying Shares via Direct Summation

This section demonstrates that checksum shares can be verified **during the splitting process** by summing word shares directly. This proves the equivalence of the polynomial method (Section 4.2) and validates share integrity before distribution.

### 5.1 Share 1 (x=1) Verification

Word shares from Share 1: `[1681, 1470, 1343, 1, 2048, 850, 0, 2052, 415, 812, 1966, 509]`

**Row 1 Checksum:**
```text
c_1(1) = w_1(1) + w_2(1) + w_3(1)  (mod 2053)
c_1(1) = 1681 + 1470 + 1343
c_1(1) = 4494  (mod 2053)
c_1(1) = 388 ✓
```

**Row 2 Checksum:**
```text
c_2(1) = w_4(1) + w_5(1) + w_6(1)  (mod 2053)
c_2(1) = 1 + 2048 + 850
c_2(1) = 2899  (mod 2053)
c_2(1) = 846 ✓
```

**Row 3 Checksum:**
```text
c_3(1) = w_7(1) + w_8(1) + w_9(1)  (mod 2053)
c_3(1) = 0 + 2052 + 415
c_3(1) = 2467  (mod 2053)
c_3(1) = 414 ✓
```

**Row 4 Checksum:**
```text
c_4(1) = w_10(1) + w_11(1) + w_12(1)  (mod 2053)
c_4(1) = 812 + 1966 + 509
c_4(1) = 3287  (mod 2053)
c_4(1) = 1234 ✓
```

**Global Integrity Check:**
```text
gic.s1 = (c_1.s1 + c_2.s1 + c_3.s1 + c_4.s1 + 1)  (mod 2053)
gic.s1 = (388 + 846 + 414 + 1234 + 1)
gic.s1 = 2883  (mod 2053)
gic.s1 = 830 ✓
```

Equivalently, sum all 12 word shares plus share number:
```text
gic.s1 = (1681 + 1470 + 1343 + 1 + 2048 + 850 + 0 + 2052 + 415 + 812 + 1966 + 509 + 1)
gic.s1 = 13148  (mod 2053) = 830 ✓
```

**Result:** All checksum shares for Share 1 match the array values: `[388, 846, 414, 1234, 830]` ✓

### 5.2 Share 2 (x=2) Verification

Word shares from Share 2: `[1682, 1469, 416, 2013, 705, 1421, 146, 1727, 362, 942, 35, 892]`

**Row 1 Checksum:**
```text
c_1(2) = 1682 + 1469 + 416 = 3567  (mod 2053) = 1514 ✓
```

**Row 2 Checksum:**
```text
c_2(2) = 2013 + 705 + 1421 = 4139  (mod 2053) = 33 ✓
```

**Row 3 Checksum:**
```text
c_3(2) = 146 + 1727 + 362 = 2235  (mod 2053) = 182 ✓
```

**Row 4 Checksum:**
```text
c_4(2) = 942 + 35 + 892 = 1869 ✓
```

**Global Integrity Check:**
```text
gic.s2 = (c_1.s2 + c_2.s2 + c_3.s2 + c_4.s2 + 2)  (mod 2053)
gic.s2 = (1514 + 33 + 182 + 1869 + 2)
gic.s2 = 3598  (mod 2053)
gic.s2 = 1547 ✓
```

Equivalently, sum all 12 word shares plus share number:
```text
gic.s2 = (1682 + 1469 + 416 + 2013 + 705 + 1421 + 146 + 1727 + 362 + 942 + 35 + 892 + 2)
gic.s2 = 11812  (mod 2053) = 1547 ✓
```

**Result:** All checksum shares for Share 2 match: `[1514, 33, 182, 1869, 1547]` ✓

### 5.3 Share 3 (x=3) Verification

Word shares from Share 3: `[1683, 1468, 1542, 1972, 1415, 1992, 292, 1402, 309, 1072, 157, 1275]`

**Row 1 Checksum:**
```text
c_1(3) = 1683 + 1468 + 1542 = 4693  (mod 2053) = 587 ✓
```

**Row 2 Checksum:**
```text
c_2(3) = 1972 + 1415 + 1992 = 5379  (mod 2053) = 1273 ✓
```

**Row 3 Checksum:**
```text
c_3(3) = 292 + 1402 + 309 = 2003 ✓
```

**Row 4 Checksum:**
```text
c_4(3) = 1072 + 157 + 1275 = 2504  (mod 2053) = 451 ✓
```

**Global Integrity Check:**
```text
gic.s3 = (c_1.s3 + c_2.s3 + c_3.s3 + c_4.s3 + 3)  (mod 2053)
gic.s3 = (587 + 1273 + 2003 + 451 + 3)
gic.s3 = 4317  (mod 2053)
gic.s3 = 211 ✓
```

Equivalently, sum all 12 word shares plus share number:
```text
gic.s3 = (1683 + 1468 + 1542 + 1972 + 1415 + 1992 + 292 + 1402 + 309 + 1072 + 157 + 1275 + 3)
gic.s3 = 14582  (mod 2053) = 211 ✓
```

**Result:** All checksum shares for Share 3 match: `[587, 1273, 2003, 451, 211]` ✓

---

**Significance:** This verification demonstrates that:

1. **Shares are self-validating**: Users can verify checksum shares during splitting by simple addition
2. **Polynomial equivalence**: Direct summation produces identical results to polynomial evaluation
3. **Error detection**: Arithmetic mistakes in manual sharing are caught immediately
4. **LSSS property**: The linear structure ensures $f_c(x) = f_{w_1}(x) + f_{w_2}(x) + f_{w_3}(x)$ at all points

---

## 7. Lagrange Coefficients for Recovery

Before we can recover secrets from shares, we need **Lagrange coefficients** - these are the multipliers used in the interpolation formula. These coefficients are **not secret** and can be pre-computed for any threshold scheme.

### What are Lagrange Coefficients?

For a 2-of-3 scheme, to recover a secret from any 2 shares, we use:

```text
secret = γ₁·y₁ + γ₂·y₂  (mod 2053)
```

Where:
- $y_1, y_2$ are the share values
- $\gamma_1, \gamma_2$ are the Lagrange coefficients (depend only on which shares we're using)

The coefficients are derived from the share indices and are the same for **all secrets** in the scheme.

### Pre-Computed Coefficients for 2-of-3

For our test vector with share indices $\{1, 2, 3\}$ in $GF(2053)$:

| Shares Used | Coefficients $(\gamma_1, \gamma_2)$ | Description |
|-------------|-------------------------------------|-------------|
| {1, 2} | (2, 2052) | Using shares at $x=1$ and $x=2$ |
| {1, 3} | (1028, 1026) | Using shares at $x=1$ and $x=3$ |
| {2, 3} | (3, 2051) | Using shares at $x=2$ and $x=3$ |

**Note:** These coefficients are computed using the Lagrange interpolation formula at $x=0$:

$$\gamma_j = \prod_{\substack{i \in S \\ i \neq j}} \frac{x_i}{x_i - x_j} \pmod{2053}$$

where $S$ is the set of share indices being used.

**For our recovery example below**, we'll use shares {1, 2} with coefficients $\gamma_1 = 2$ and $\gamma_2 = 2052$.

---

## 8. Recovery Example: Reconstructing from Shares 1 and 2

This section demonstrates the complete recovery process using Shares 1 and 2, applying the Lagrange coefficients from Section 7.

### 7.1 Share Number Validation

Before beginning recovery, verify that each share's index matches its content. The share number can be extracted directly from the share's values without needing other shares.

**Formula:**
$$ \text{Share Number} = GIC - (\sum \text{Row Checksums} \pmod{2053}) $$
*(If the result is negative, add 2053)*

**Verification for Share 1:**
- Share values: $GIC.S1 = 830$, $c_1=388, c_2=846, c_3=414, c_4=1234$

```text
Sum = 388 + 846 + 414 + 1234 = 2882
Sum_mod = 2882 mod 2053 = 829

Share Number = 830 - 829 = 1 ✓ (Matches Share 1)
```

**Verification for Share 2:**
- Share values: $GIC.S2 = 1547$, $c_1=1514, c_2=33, c_3=182, c_4=1869$

```text
Sum = 1514 + 33 + 182 + 1869 = 3598
Sum_mod = 3598 mod 2053 = 1545

Share Number = 1547 - 1545 = 2 ✓ (Matches Share 2)
```

### 7.2 Verification of Coefficients

Before starting recovery, a simple check ensures that the Lagrange coefficients are assigned to the correct share numbers. By summing the product of each **Share Number** and its **Coefficient**, the result must be **0** modulo 2053.

**Formula:**
$$ \sum (\text{ShareIndex}_i \cdot \gamma_i) \equiv 0 \pmod{2053} $$

**Calculation for Shares {1, 2}:**
- Share 1 ($\gamma_1 = 2$)
- Share 2 ($\gamma_2 = 2052$)

```text
(1 · 2) + (2 · 2052)
= 2 + 4104
= 4106
4106 mod 2053 = 0 ✓
```

This confirms the coefficients are correctly paired with their share indices.

### 7.3 Recovery Formula

Using the coefficients $\gamma_1 = 2$ and $\gamma_2 = 2052$ from Section 6:

```text
secret = 2·y₁ + 2052·y₂  (mod 2053)
```

Where $y_1$ is the value from Share 1 and $y_2$ is the value from Share 2.

### 7.4 Row 1 Complete Example (Detailed)

This example shows the full recovery and validation cycle for one row: recover words, recover checksum, validate.

**Step 1: Recover the 3 words**

**Word 1 (spin):**
- Share 1: $y_1 = 1681$, Share 2: $y_2 = 1682$

```text
w₁ = 2·1681 + 2052·1682
w₁ = 3362 + 3451464
w₁ = 3454826  (mod 2053)
w₁ = 1680 ✓  → spin
```

**Word 2 (result):**
- Share 1: $y_1 = 1470$, Share 2: $y_2 = 1469$

```text
w₂ = 2·1470 + 2052·1469
w₂ = 2940 + 3014388
w₂ = 3017328  (mod 2053)
w₂ = 1471 ✓  → result
```

**Word 3 (brand):**
- Share 1: $y_1 = 1343$, Share 2: $y_2 = 416$

```text
w₃ = 2·1343 + 2052·416
w₃ = 2686 + 853632
w₃ = 856318  (mod 2053)
w₃ = 217 ✓  → brand
```

**Step 2: Recover the row checksum**

**Row 1 Checksum ($c_1$):**
- Share 1: $y_1 = 388$, Share 2: $y_2 = 1514$

```text
c₁ = 2·388 + 2052·1514
c₁ = 776 + 3106728
c₁ = 3107504  (mod 2053)
c₁ = 1315 ✓
```

**Step 3: Validate the checksum**

Recompute $c_1$ from the recovered words:

```text
c₁ (recomputed) = w₁ + w₂ + w₃  (mod 2053)
c₁ (recomputed) = 1680 + 1471 + 217
c₁ (recomputed) = 3368  (mod 2053)
c₁ (recomputed) = 1315

c₁ (recovered)  = 1315

Match: ✓  Row 1 is valid!
```

---

**Row 1 Complete:** We recovered 3 words (spin, result, brand) and validated them against the checksum. This same process repeats for the remaining 3 rows.

### 7.5 Remaining Rows (Summary)

Using the same interpolation and validation process for the remaining rows:

**Row 2 (words 4-6):**
- $w_4$ = 42 (ahead), $w_5$ = 1338 (poet), $w_6$ = 279 (carpet)
- $c_2$ recovered = 1659
- $c_2$ recomputed = (42 + 1338 + 279) mod 2053 = 1659 ✓

**Row 3 (words 7-9):**
- $w_7$ = 1907 (unusual), $w_8$ = 324 (chronic), $w_9$ = 468 (denial)
- $c_3$ recovered = 646
- $c_3$ recomputed = (1907 + 324 + 468) mod 2053 = 646 ✓

**Row 4 (words 10-12):**
- $w_{10}$ = 682 (festival), $w_{11}$ = 1844 (toy), $w_{12}$ = 126 (autumn)
- $c_4$ recovered = 599
- $c_4$ recomputed = (682 + 1844 + 126) mod 2053 = 599 ✓


### 7.6 Global Integrity Check

**Step 1: Recover the GIC base value**

- Share 1: $GIC.S1 = 830$, Share 2: $GIC.S2 = 1547$

```text
GIC_base = 2·830 + 2052·1547
GIC_base = 1660 + 3174444
GIC_base = 3176104  (mod 2053)
GIC_base = 113 ✓ 
```

**Step 2: Validate the GIC**

- Recompute $GIC_{base}$ from the recovered words:

```text
GIC_base (recomputed) = c_1 + c_2 + c_3 + c_4 (mod 2053)
GIC_base (recomputed) = 1315 + 1659 + 646 + 599
GIC_base (recomputed) = 4219  (mod 2053)
GIC_base (recomputed) = 113

GIC_base (recovered)  = 113

Match: ✓  The recovery is valid!
```

**Complete Summary Table:**

| Secret | Share 1 | Share 2 | Recovered | Word | Validation |
|--------|---------|---------|-----------|------|------------|
| $w_1$ | 1681 | 1682 | 1680 | spin | ✓ |
| $w_2$ | 1470 | 1469 | 1471 | result | ✓ |
| $w_3$ | 1343 | 416 | 217 | brand | ✓ |
| $c_1$ | 388 | 1514 | 1315 | — | ✓ Row 1 valid |
| $w_4$ | 1 | 2013 | 42 | ahead | ✓ |
| $w_5$ | 2048 | 705 | 1338 | poet | ✓ |
| $w_6$ | 850 | 1421 | 279 | carpet | ✓ |
| $c_2$ | 846 | 33 | 1659 | — | ✓ Row 2 valid |
| $w_7$ | 0 | 146 | 1907 | unusual | ✓ |
| $w_8$ | 2052 | 1727 | 324 | chronic | ✓ |
| $w_9$ | 415 | 362 | 468 | denial | ✓ |
| $c_3$ | 414 | 182 | 646 | — | ✓ Row 3 valid |
| $w_{10}$ | 812 | 942 | 682 | festival | ✓ |
| $w_{11}$ | 1966 | 35 | 1844 | toy | ✓ |
| $w_{12}$ | 509 | 892 | 126 | autumn | ✓ |
| $c_4$ | 1234 | 1869 | 599 | — | ✓ Row 4 valid |
| $GIC_{base}$ | 830 | 1547 | 113 | — | ✓ Global valid |

**Recovered mnemonic:**
```text
spin result brand ahead poet carpet unusual chronic denial festival toy autumn
```
### Optional: QR Code Envelope

For computational recovery, share values can be encoded into static QR codes using the Schiavinato Digital Envelope format. See **Section 9** for complete QR code test vectors, including binary payload construction, Base64URL encoding, and parsing verification examples.

### 7.7 Final Validation: BIP39 Checksum

The recovered mnemonic is a valid 12-word BIP39 mnemonic with correct checksum ✓

---

**Recovery Complete!** All checksums validated successfully. The mnemonic was fully recovered from just 2 of the 3 shares, demonstrating the 2-of-3 threshold property.

---

## 9. Security Implementation Note

Implementations of Schiavinato Sharing include security hardening features that are **transparent to test vectors**:

- **Constant-time comparisons**: All checksum validations use constant-time equality checks to prevent timing side-channel attacks
- **Memory cleanup**: Sensitive data (word indices, polynomials, recovered secrets) is explicitly wiped from memory after use

These security features do not affect:
- Share generation outputs (shares remain identical)
- Recovery results (recovered mnemonics remain identical)  
- Test vector compatibility (all test vectors pass unchanged)

The features work automatically without configuration and enhance security against advanced attack vectors (timing analysis, memory dumps) while maintaining full compatibility with the mathematical specification.

For security implementation details, see [SECURITY.md](./SECURITY.md).

---

## 10. QR Code Test Vectors

This section provides complete test vectors for the **Schiavinato Digital Envelope** format, which encodes shares as QR codes for computational recovery. The digital envelope enables instant air-gapped recovery using scanning devices while maintaining full compatibility with manual recovery methods.

The envelope implements the **Triple-Lock security system** (see Section 2.3) with Transport, Arithmetic, and Identity locks working together to provide integrity, correctness, and authenticity validation.

### 10.1 Binary Payload Specification

For 12-word shares, the payload structure is:

| Field | Offset | Size | Description |
|-------|--------|------|-------------|
| Protocol Version | 0 | 1 byte | Protocol version number (0x01 for v1) |
| Flags | 1 | 1 byte | Configuration flags (bits 0-2: word count) |
| Threshold (k) | 2 | 1 byte | Minimum shares required for recovery |
| Share Index | 3 | 1 byte | This share's index (1-based) |
| Session Batch ID | 4 | 8 bytes | Random session identifier (salt) |
| Blinded Identity | 12 | 8 bytes | HMAC-SHA256(fingerprint, session_batch_id) |
| Share Data | 20 | 26 bytes | Packed 12-bit values (17 × 12 bits + 4-bit padding) |
| Transport Hash | 46 | 16 bytes | SHA-256(fields 0-45)[0:16] |
| **Total** | | **62 bytes** | For 12-word shares |

**Flags Field (byte 1):**
- Bits 0-2: Word count (000 = 12 words, 001 = 15 words, ..., 100 = 24 words)
- Bits 3-7: Reserved (must be zero)

**Share Data Encoding (26 bytes for 12 words):**
- 17 values: 12 words + 4 row checksums + 1 GIC
- Each value encoded as 12 bits (range 0-4095, accommodates GF(2053))
- Total: 17 × 12 = 204 bits
- Padding: 4 zero bits to align to byte boundary
- Result: 208 bits = 26 bytes

**QR Code Specifications:**
- Version: 5 (37×37 modules)
- Error Correction: M (15% fault tolerance, up to 15% damage recovery)
- Encoding Mode: Byte (8-bit, supports case-sensitive Base64URL)
- Capacity: 154 characters
- Payload size: ~87 characters (62 bytes → ~83 chars Base64URL + "sch:" prefix)
- Spare margin: ~43% (67 unused characters for future extensions or higher error correction)

**Test Vector Constants:**
- Session Batch ID: `0xA1B2C3D4E5F60708` (fixed for reproducibility)
- Wallet Fingerprint: `0x35E300A8` (BIP32 master key fingerprint from test mnemonic)
- Blinded Identity: `0x9FE7C492EA1F3FF4` (HMAC-SHA256 with fingerprint as key, batch ID as message)

### 10.2 Share 1: Complete Construction (Detailed Walkthrough)

This section demonstrates the complete payload construction process for Share 1, showing all intermediate steps.

**Step 1: Header Fields (4 bytes)**

```text
Protocol Version: 0x01
Flags:            0x00 (binary: 00000000)
                  └─ Bits 0-2 = 000 (12 words)
                  └─ Bits 3-7 = 00000 (reserved)
Threshold:        0x02 (2-of-3 scheme)
Share Index:      0x01 (Share #1)

Header bytes: 01 00 02 01
```

**Step 2: Session Batch ID (8 bytes)**

```text
Fixed value (for test vector): A1 B2 C3 D4 E5 F6 07 08
```

**Step 3: Blinded Identity (8 bytes)**

```text
Wallet Fingerprint: 35 E3 00 A8
                   (BIP32 master key fingerprint)

BIP32 Fingerprint Derivation:
  1. Master private key from seed (via HMAC-SHA512 with key "Bitcoin seed")
  2. Master public key via secp256k1 point multiplication: G × private_key
  3. Compressed public key: 03756015a68ec12ecc4e4b43659fb92d6a3559d561b742aab701824830f32504ad
  4. HASH160(pubkey) = RIPEMD160(SHA256(compressed_pubkey))
  5. Fingerprint = first 4 bytes of HASH160 = 35E300A8

HMAC-SHA256 Calculation (Blinded Identity):
  Key:     Wallet Fingerprint = 35E300A8 (secret, only derivable from mnemonic)
  Message: Session Batch ID = A1B2C3D4E5F60708 (public, visible in QR)
  
  Full HMAC: 9FE7C492EA1F3FF4F0432769C3D47F9539BB8DA8F5D0769853B99D40014262B7
  Result:    9FE7C492EA1F3FF4 (truncated to 8 bytes)

Blinded Identity: 9F E7 C4 92 EA 1F 3F F4

Note: Fingerprint as HMAC key ensures only someone with the mnemonic can forge
valid blinded identity. This prevents share substitution attacks.
```

**Step 4: Share Data Bit Packing (26 bytes)**

Share 1 values from Section 5.1: `[1681, 1470, 1343, 1, 2048, 850, 0, 2052, 415, 812, 1966, 509, 388, 846, 414, 1234, 830]`

Each value encoded as 12-bit binary:

```text
Value   Hex    Binary (12-bit)
─────────────────────────────────
w₁   =  1681 = 0x691 = 011010010001
w₂   =  1470 = 0x5BE = 010110111110
w₃   =  1343 = 0x53F = 010100111111
w₄   =     1 = 0x001 = 000000000001
w₅   =  2048 = 0x800 = 100000000000
w₆   =   850 = 0x352 = 001101010010
w₇   =     0 = 0x000 = 000000000000  ← Edge case: naturally fits in 12 bits
w₈   =  2052 = 0x804 = 100000000100  ← Edge case: naturally fits in 12 bits
w₉   =   415 = 0x19F = 000110011111
w₁₀  =   812 = 0x32C = 001100101100
w₁₁  =  1966 = 0x7AE = 011110101110
w₁₂  =   509 = 0x1FD = 000111111101
c₁   =   388 = 0x184 = 000110000100
c₂   =   846 = 0x34E = 001101001110
c₃   =   414 = 0x19E = 000110011110
c₄   =  1234 = 0x4D2 = 010011010010
GIC  =   830 = 0x33E = 001100111110
```

**Concatenation (204 bits):**

```text
011010010001 010110111110 010100111111 000000000001 100000000000 001101010010
000000000000 100000000100 000110011111 001100101100 011110101110 000111111101
000110000100 001101001110 000110011110 010011010010 001100111110
```

**Add 4-bit padding:**

```text
...001100111110 0000
                 └──┘ 4 zero bits for byte alignment
```

**Convert to hexadecimal (26 bytes):**

```text
Share Data: 69 15 BE 53 F0 01 80 03 52 00 08 04 19 F3 2C 7A E1 FD 18 43 4E 19 E4 D2 33 E0
```

**Step 5: Transport Hash (16 bytes)**

Concatenate fields 1-7 (46 bytes):

```text
Input for SHA-256:
01 00 02 01 A1 B2 C3 D4 E5 F6 07 08 9F E7 C4 92 EA 1F 3F F4
69 15 BE 53 F0 01 80 03 52 00 08 04 19 F3 2C 7A E1 FD 18 43
4E 19 E4 D2 33 E0
```

Calculate SHA-256 and truncate to first 16 bytes:

```text
SHA-256 (full 32 bytes):
0DE4ECB96E7EF36434193E43B53C090A8A5F2D1E9C7B3E4F5D8A2C1B6E9F0D2C

Transport Hash (first 16 bytes):
0D E4 EC B9 6E 7E F3 64 34 19 3E 43 B5 3C 09 0A
```

**Step 6: Final Assembly (62 bytes)**

```text
Complete Payload (hexadecimal):
01 00 02 01 A1 B2 C3 D4 E5 F6 07 08 9F E7 C4 92
EA 1F 3F F4 69 15 BE 53 F0 01 80 03 52 00 08 04
19 F3 2C 7A E1 FD 18 43 4E 19 E4 D2 33 E0 0D E4
EC B9 6E 7E F3 64 34 19 3E 43 B5 3C 09 0A
```

Field boundaries:

```text
Bytes  0-3  : 01000201              (Header)
Bytes  4-11 : A1B2C3D4E5F60708      (Session Batch ID)
Bytes 12-19 : 9FE7C492EA1F3FF4      (Blinded Identity)
Bytes 20-45 : 6915BE53F0...33E0     (Share Data - 26 bytes)
Bytes 46-61 : 0DE4ECB9...3C090A     (Transport Hash)
```

**Step 7: Base64URL Encoding**

Encode 62 bytes to Base64URL (remove padding `=` characters):

```text
Base64URL (83 characters):
AQACAaGyw9Tl9gcIn-fEkuofP_RpFb5T8AGAA1IACAQZ8yx64f0YQ04Z5NIz4A3k7LlufvNkNBk-Q7U8CQo
```

Add URI scheme prefix:

```text
Final QR String (87 characters):
sch:AQACAaGyw9Tl9gcIn-fEkuofP_RpFb5T8AGAA1IACAQZ8yx64f0YQ04Z5NIz4A3k7LlufvNkNBk-Q7U8CQo
```

**QR Code Generation:**
- Encode the string above into QR Version 5-M
- Results in 37×37 module QR code
- 67 characters spare capacity (43% margin)

### 10.3 Share 2: Complete Payload

**Header:** `01 00 02 02` (Share #2)
**Session Batch ID:** `A1 B2 C3 D4 E5 F6 07 08`
**Blinded Identity:** `9F E7 C4 92 EA 1F 3F F4` (same as Share 1)

**Share Data (26 bytes):**

Share 2 values: `[1682, 1469, 416, 2013, 705, 1421, 146, 1727, 362, 942, 35, 892, 1514, 33, 182, 1869, 1547]`

```text
69 25 BD 1A 07 DD 2C 15 8D 09 26 BF 16 A3 AE 02 33 7C 5E A0 21 0B 67 4D 60 B0
```

**Transport Hash:** `63 DE 4D EF 0F FF DC 0B 63 0C 1B 31 7D 05 89 65`

**Complete Payload (62 bytes):**

```text
01 00 02 02 A1 B2 C3 D4 E5 F6 07 08 9F E7 C4 92
EA 1F 3F F4 69 25 BD 1A 07 DD 2C 15 8D 09 26 BF
16 A3 AE 02 33 7C 5E A0 21 0B 67 4D 60 B0 63 DE
4D EF 0F FF DC 0B 63 0C 1B 31 7D 05 89 65
```

**Base64URL:** `AQACAqGyw9Tl9gcIn-fEkuofP_RpJb0aB90sFY0JJr8Wo64CM3xeoCELZ01gsGPeTe8P_9wLYwwbMX0FiWU`

**QR String:** `sch:AQACAqGyw9Tl9gcIn-fEkuofP_RpJb0aB90sFY0JJr8Wo64CM3xeoCELZ01gsGPeTe8P_9wLYwwbMX0FiWU`

### 10.4 Share 3: Complete Payload

**Header:** `01 00 02 03` (Share #3)
**Session Batch ID:** `A1 B2 C3 D4 E5 F6 07 08`
**Blinded Identity:** `9F E7 C4 92 EA 1F 3F F4` (same as Shares 1-2)

**Share Data (26 bytes):**

Share 3 values: `[1683, 1468, 1542, 1972, 1415, 1992, 292, 1402, 309, 1072, 157, 1275, 587, 1273, 2003, 451, 211]`

```text
69 35 BC 60 67 B4 58 77 C8 12 45 7A 13 54 30 09 D4 FB 24 B4 F9 7D 31 C3 0D 30
```

**Transport Hash:** `D6 83 8A 17 A1 78 F3 D5 77 E3 D6 52 23 EA 20 66`

**Complete Payload (62 bytes):**

```text
01 00 02 03 A1 B2 C3 D4 E5 F6 07 08 9F E7 C4 92
EA 1F 3F F4 69 35 BC 60 67 B4 58 77 C8 12 45 7A
13 54 30 09 D4 FB 24 B4 F9 7D 31 C3 0D 30 D6 83
8A 17 A1 78 F3 D5 77 E3 D6 52 23 EA 20 66
```

**Base64URL:** `AQACA6Gyw9Tl9gcIn-fEkuofP_RpNbxgZ7RYd8gSRXoTVDAJ1PsktPl9McMNMNaDihehePPVd-PWUiPqIGY`

**QR String:** `sch:AQACA6Gyw9Tl9gcIn-fEkuofP_RpNbxgZ7RYd8gSRXoTVDAJ1PsktPl9McMNMNaDihehePPVd-PWUiPqIGY`

### 10.5 Parsing and Verification of Share 1

This section demonstrates how to parse and verify a QR code payload. The verification steps that can be performed with a single share include Transport Hash validation, Share Data unpacking, and arithmetic checksums. Note that Blinded Identity validation requires K shares and is demonstrated in Section 10.7.

**Step 1: Remove Prefix and Decode Base64URL**

```text
Input QR String:
sch:AQACAaGyw9Tl9gcIn-fEkuofP_RpFb5T8AGAA1IACAQZ8yx64f0YQ04Z5NIz4A3k7LlufvNkNBk-Q7U8CQo

Remove prefix "sch:":
AQACAaGyw9Tl9gcIn-fEkuofP_RpFb5T8AGAA1IACAQZ8yx64f0YQ04Z5NIz4A3k7LlufvNkNBk-Q7U8CQo

Base64URL decode to 62 bytes:
01 00 02 01 A1 B2 C3 D4 E5 F6 07 08 9F E7 C4 92 EA 1F 3F F4 69 15 BE 53 F0 01
80 03 52 00 08 04 19 F3 2C 7A E1 FD 18 43 4E 19 E4 D2 33 E0 0D E4 EC B9 6E 7E
F3 64 34 19 3E 43 B5 3C 09 0A
```

**Step 2: Extract Fields by Byte Offset**

```text
Bytes  0-3  : 01 00 02 01
              ↓  ↓  ↓  ↓
              Version=1, Flags=0x00 (12 words), Threshold=2, Share Index=1 ✓

Bytes  4-11 : A1 B2 C3 D4 E5 F6 07 08
              Session Batch ID ✓

Bytes 12-19 : 9F E7 C4 92 EA 1F 3F F4
              Blinded Identity ✓

Bytes 20-45 : 69 15 BE 53 ... 33 E0 (26 bytes)
              Share Data (to be unpacked)

Bytes 46-61 : 0D E4 EC B9 ... 09 0A (16 bytes)
              Transport Hash (to be verified)
```

**Step 3: Verify Transport Hash**

```text
Recompute SHA-256 over bytes 0-45:
SHA-256(01 00 02 01 A1 B2 ... E4 D2 33 E0) = 0DE4ECB96E7EF364...

Extract first 16 bytes:
0D E4 EC B9 6E 7E F3 64 34 19 3E 43 B5 3C 09 0A

Compare with bytes 46-61:
0D E4 EC B9 6E 7E F3 64 34 19 3E 43 B5 3C 09 0A ✓ Match!

Transport Hash validates successfully ✓
```

**Step 4: Unpack 12-bit Values from Share Data**

```text
Share Data (26 bytes): 69 15 BE 53 F0 01 80 03 52 00 08 04 19 F3 2C 7A
                       E1 FD 18 43 4E 19 E4 D2 33 E0

Convert to binary (208 bits):
01101001 00010101 10111110 01010011 11110000 00000001 10000000 00000011
01010010 00000000 00001000 00000100 00011001 11110011 00101100 01111010
11100001 11111101 00011000 01000011 01001110 00011001 11100100 11010010
00110011 11100000

Group into 12-bit values (17 values + 4-bit padding):
011010010001 = 1681 = w₁   ✓
010110111110 = 1470 = w₂   ✓
010100111111 = 1343 = w₃   ✓
000000000001 =    1 = w₄   ✓
100000000000 = 2048 = w₅   ✓
001101010010 =  850 = w₆   ✓
000000000000 =    0 = w₇   ✓ (edge case handled naturally)
100000000100 = 2052 = w₈   ✓ (edge case handled naturally)
000110011111 =  415 = w₉   ✓
001100101100 =  812 = w₁₀  ✓
011110101110 = 1966 = w₁₁  ✓
000111111101 =  509 = w₁₂  ✓
000110000100 =  388 = c₁   ✓
001101001110 =  846 = c₂   ✓
000110011110 =  414 = c₃   ✓
010011010010 = 1234 = c₄   ✓
001100111110 =  830 = GIC  ✓
0000                        (4-bit padding, ignored)
```

**Step 5: Verify Against Section 5.1 Share Values**

```text
Unpacked values:
[1681, 1470, 1343, 1, 2048, 850, 0, 2052, 415, 812, 1966, 509, 388, 846, 414, 1234, 830]

Expected from Section 5.1:
[1681, 1470, 1343, 1, 2048, 850, 0, 2052, 415, 812, 1966, 509, 388, 846, 414, 1234, 830]

Match: ✓ All 17 values match exactly!
```

**Step 6: Additional Validation (Optional)**

```text
Arithmetic validation (from Section 6.1):
- Row 1 checksum: (1681 + 1470 + 1343) mod 2053 = 388 ✓
- Row 2 checksum: (1 + 2048 + 850) mod 2053 = 846 ✓
- Row 3 checksum: (0 + 2052 + 415) mod 2053 = 414 ✓
- Row 4 checksum: (812 + 1966 + 509) mod 2053 = 1234 ✓
- GIC: (388 + 846 + 414 + 1234 + 1) mod 2053 = 830 ✓

Session consistency validation:
- Session Batch ID matches across all shares (prevents mixing shares from different sessions)

Note: Blinded Identity validation requires K shares to recover the seed and derive
the wallet fingerprint. See Section 10.7 for complete Blinded Identity verification.
```

**Verification Checklist:**

- ✓ Transport Hash validates (prevents corruption and QR reading errors)
- ✓ Share Data unpacks to exactly match Section 5.1 values
- ✓ Arithmetic checksums validate (from Section 6)
- ✓ Edge cases (0, 2052) handled naturally in 12-bit encoding
- ✓ Session Batch ID consistent (when compared with other shares)
- ⚠ Blinded Identity validation requires K shares (see Section 10.7)

**Result:** Share 1 QR payload passes all single-share verification checks and can be used for recovery!

---

### 10.6 Parsing and Verification of Share 2

This section demonstrates the same verification process for Share 2, using a more concise format.

**QR String:** `sch:AQACAqGyw9Tl9gcIn-fEkuofP_RpJb0aB90sFY0JJr8Wo64CM3xeoCELZ01gsGPeTe8P_9wLYwwbMX0FiWU`

**Step 1: Decode and Extract Fields**

```text
Base64URL decode to 62 bytes:
01 00 02 02 A1 B2 C3 D4 E5 F6 07 08 9F E7 C4 92 EA 1F 3F F4 69 25 BD 1A 07 DD
2C 15 8D 09 26 BF 16 A3 AE 02 33 7C 5E A0 21 0B 67 4D 60 B0 63 DE 4D EF 0F FF
DC 0B 63 0C 1B 31 7D 05 89 65

Field breakdown:
- Header (bytes 0-3):  01 00 02 02 → Version=1, Flags=0x00 (12 words), Threshold=2, Share Index=2 ✓
- Session Batch ID:    A1 B2 C3 D4 E5 F6 07 08 (matches Share 1) ✓
- Blinded Identity:    9F E7 C4 92 EA 1F 3F F4 (matches Share 1) ✓
- Share Data:          69 25 BD 1A ... 60 B0 (26 bytes)
- Transport Hash:      63 DE 4D EF ... 89 65 (16 bytes)
```

**Step 2: Verify Transport Hash**

```text
SHA-256 over bytes 0-45, truncated to 16 bytes:
63 DE 4D EF 0F FF DC 0B 63 0C 1B 31 7D 05 89 65 ✓ Match!
```

**Step 3: Unpack Share Data**

```text
Convert 26 bytes to 12-bit values (17 values + 4-bit padding):
[1682, 1469, 416, 2013, 705, 1421, 146, 1727, 362, 942, 35, 892, 1514, 33, 182, 1869, 1547]

Verify against Section 5.2 Share 2 values: ✓ All 17 values match!
```

**Step 4: Arithmetic Validation**

```text
Row checksums:
- (1682 + 1469 + 416) mod 2053 = 3567 mod 2053 = 1514 = c₁ ✓
- (2013 + 705 + 1421) mod 2053 = 4139 mod 2053 = 33 = c₂ ✓
- (146 + 1727 + 362) mod 2053 = 2235 mod 2053 = 182 = c₃ ✓
- (942 + 35 + 892) mod 2053 = 1869 = c₄ ✓

GIC: (1514 + 33 + 182 + 1869 + 2) mod 2053 = 3600 mod 2053 = 1547 ✓
```

**Verification Summary:**

- ✓ Transport Hash validates
- ✓ Share Data matches Section 5.2 values
- ✓ All arithmetic checksums validate
- ✓ Session Batch ID matches Share 1 (prevents share mixing)
- ✓ Blinded Identity matches Share 1 (same wallet)
- ⚠ Blinded Identity correctness requires K shares (see Section 10.7)

**Result:** Share 2 QR payload is valid!

---

### 10.7 Blinded Identity Validation

The Blinded Identity can only be validated after successful recovery with K shares. This section demonstrates the complete validation process using Shares 1 and 2 to recover the seed, derive the wallet fingerprint, and verify the Blinded Identity.

**Why K Shares are Required:**

The Blinded Identity is computed as:
```
Blinded_Identity = HMAC-SHA256(key=Wallet_Fingerprint, message=Session_Batch_ID)
```

The Wallet Fingerprint is derived from the BIP32 master key, which requires the original seed. Since the seed can only be recovered with K shares via Lagrange interpolation, Blinded Identity validation is cryptographically impossible with fewer than K shares.

**Step 1: Recover the Seed from Shares 1 and 2**

Using the recovery process from Section 7, we recover the 12-word mnemonic:

```text
spin result brand ahead poet carpet unusual chronic denial festival toy autumn
```

**Step 2: Convert Mnemonic to Seed**

Using BIP39 specification with empty passphrase:

```text
Mnemonic: "spin result brand ahead poet carpet unusual chronic denial festival toy autumn"
Passphrase: "" (empty)

PBKDF2-HMAC-SHA512:
  Password: UTF-8 encoded mnemonic
  Salt:     "mnemonic" (UTF-8 encoded)
  Iterations: 2048
  Output length: 64 bytes

Seed (512 bits):
6E 4E 78 8C AC 76 60 E4 5F 00 69 47 0A 9D 30 FC
3B 97 F5 D1 96 66 DF C7 D9 CC 38 C2 DE B3 7A 0C
E7 01 00 E6 9D 84 31 AB C2 46 F3 B1 51 B3 65 C3
7F 60 D9 B4 06 AF 84 E0 DD 78 C8 6D 84 E0 67 C5
```

**Step 3: Derive BIP32 Master Key and Fingerprint**

```text
HMAC-SHA512 with key "Bitcoin seed":
  Input: 64-byte seed from Step 2
  Output: 64 bytes
    - First 32 bytes  = Master private key
    - Last 32 bytes   = Chain code

Master Private Key:
1C 37 49 A8 8F 20 F8 8D 8C B7 18 F2 F7 78 47 4C
84 28 2D EC 56 67 5C E6 C0 22 0F 96 80 83 A4 1C

Chain Code:
6A 8C 82 C8 65 B4 0E 2C 6B 0D 2B 6B 5D 61 E1 1B
E2 7E 55 88 5B 4F 42 36 A7 82 B3 6F 45 F0 DC 7A

Master Public Key (secp256k1 point multiplication: G × private_key):
Uncompressed: 04 75 60 15 a6 8e c1 2e cc 4e 4b 43 65 9f b9 2d ...
Compressed:   03 75 60 15 a6 8e c1 2e cc 4e 4b 43 65 9f b9 2d
              6a 35 59 d5 61 b7 42 aa b7 01 82 48 30 f3 25 04 ad

HASH160 = RIPEMD160(SHA256(compressed_pubkey)):
35 E3 00 A8 CB 4F 45 2C 29 97 CA F4 98 B1 F5 93 86 72 9B 22

Wallet Fingerprint (first 4 bytes):
35 E3 00 A8
```

**Step 4: Compute HMAC-SHA256 for Blinded Identity**

```text
HMAC-SHA256:
  Key:     35 E3 00 A8 (Wallet Fingerprint from Step 3)
  Message: A1 B2 C3 D4 E5 F6 07 08 (Session Batch ID from shares)

Full HMAC output (32 bytes):
9F E7 C4 92 EA 1F 3F F4 F0 43 27 69 C3 D4 7F 95
39 BB 8D A8 F5 D0 76 98 53 B9 9D 40 01 42 62 B7

Blinded Identity (first 8 bytes):
9F E7 C4 92 EA 1F 3F F4
```

**Step 5: Compare with Share Blinded Identity**

```text
Computed Blinded Identity:  9F E7 C4 92 EA 1F 3F F4
Share 1 Blinded Identity:   9F E7 C4 92 EA 1F 3F F4 ✓
Share 2 Blinded Identity:   9F E7 C4 92 EA 1F 3F F4 ✓

Result: MATCH! ✓
```

**Validation Complete:**

The Blinded Identity from both shares matches the computed value, confirming:
- ✓ Shares belong to the correct wallet (fingerprint 35E300A8)
- ✓ Shares were not substituted or tampered with
- ✓ Session Batch ID A1B2C3D4E5F60708 is authentic for this wallet
- ✓ The complete "Triple-Lock" security system validates successfully

**Security Note:** This validation detects share substitution attacks. An attacker cannot create fake shares with a matching Blinded Identity without knowing the wallet fingerprint, which requires access to the original seed or private keys.

---


