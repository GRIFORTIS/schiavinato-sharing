## Schiavinato Sharing – GF(2053) Test Vector (2-of-3, 12 Words)

This file provides a reproducible test vector for implementers of Schiavinato Sharing. It uses:

- Prime field: $p = 2053$  
- Threshold scheme: $k = 2$, $n = 3$ (2-of-3)  
- Share indices: $x \in \{1, 2, 3\}$  
- Number of words: 12 (arranged as 4 rows of 3 words)

The “word indices” below are BIP39-style indices in the range $\{0,\dots,2047\}$. For this test vector we work directly with indices; mapping to actual BIP39 words is optional and left to the implementer.

---

## 1. Base Secrets

### 1.1 Word indices

We start from the following 12 word indices, chosen so that they form a **valid 12-word BIP39 checksum** when interpreted according to the standard:

- $w_1 = 1679$ → `spin`  
- $w_2 = 1470$ → `result`  
- $w_3 = 216$ → `brand`  
- $w_4 = 41$ → `ahead`  
- $w_5 = 1337$ → `poet`  
- $w_6 = 278$ → `carpet`  
- $w_7 = 1906$ → `unusual`  
- $w_8 = 323$ → `chronic`  
- $w_9 = 467$ → `denial`  
- $w_{10} = 681$ → `festival`  
- $w_{11} = 1843$ → `toy`  
- $w_{12} = 125$ → `autumn`

Equivalently, the BIP39 English mnemonic is:

```text
spin result brand ahead poet carpet unusual chronic denial festival toy autumn
```

And the list of numbers is:

```text
1679, 1470, 216, 41, 1337, 278, 1906, 323, 467, 681, 1843, 125
```

These are grouped into 4 rows of 3:

- Row 1: $(w_1, w_2, w_3)$  
- Row 2: $(w_4, w_5, w_6)$  
- Row 3: $(w_7, w_8, w_9)$  
- Row 4: $(w_{10}, w_{11}, w_{12})$

### 1.2 Row checksums

Row checksums are defined as:
```text
c_r = (w_{r,1} + w_{r,2} + w_{r,3}) mod 2053
```

This yields:

- $c_1 = (1679 + 1470 + 216) \bmod 2053 = 1312$  
- $c_2 = (41 + 1337 + 278) \bmod 2053 = 1656$  
- $c_3 = (1906 + 323 + 467) \bmod 2053 = 643$  
- $c_4 = (681 + 1843 + 125) \bmod 2053 = 596$

The list of numbers for all row checksums is:

```text
1312, 1656, 643, 596
```

### 1.3 Master verification number

The master verification number is:
```text
M = (w_1 + ... + w_{12}) mod 2053
```

Summing the values above and reducing modulo 2053 gives:

- $M = 101$

In total we have 17 secrets:

- 12 word indices $w_1, \dots, w_{12}$  
- 4 row checksums $c_1, \dots, c_4$  
- 1 master verification number $M$

---

## 2. Shamir Polynomials in $GF(2053)$

For a 2-of-3 scheme, each secret $s$ is shared using a degree-1 polynomial:
```text
f(x) = a_0 + a_1 x (mod 2053)
```
with:

- $a_0 = s$ (the secret itself),  
- $a_1$ chosen uniformly at random from $\{0,\dots,2052\}$.

For reproducibility, the coefficients below were generated with Python using:

- `random.seed(42)`  
- `a1 = random.randrange(0, 2053)` for each secret

The resulting coefficients $(a_0, a_1)$ are:

- $w_1$: $a_0 = 1679$, $a_1 = 456$  
- $w_2$: $a_0 = 1470$, $a_1 = 102$  
- $w_3$: $a_0 = 216$, $a_1 = 1126$  
- $w_4$: $a_0 = 41$, $a_1 = 1003$  
- $w_5$: $a_0 = 1337$, $a_1 = 914$  
- $w_6$: $a_0 = 278$, $a_1 = 571$  
- $w_7$: $a_0 = 1906$, $a_1 = 419$  
- $w_8$: $a_0 = 323$, $a_1 = 356$  
- $w_9$: $a_0 = 467$, $a_1 = 1728$  
- $w_{10}$: $a_0 = 681$, $a_1 = 130$  
- $w_{11}$: $a_0 = 1843$, $a_1 = 122$  
- $w_{12}$: $a_0 = 125$, $a_1 = 383$  
- $c_1$: $a_0 = 1312$, $a_1 = 895$  
- $c_2$: $a_0 = 1656$, $a_1 = 952$  
- $c_3$: $a_0 = 643$, $a_1 = 108$  
- $c_4$: $a_0 = 596$, $a_1 = 814$  
- $M$: $a_0 = 101$, $a_1 = 1718$

List of all random coefficients:
```text
456, 102, 1126, 1003, 914, 571, 419, 356, 1728, 130, 122, 383, 895, 952, 108, 814, 1718
```

An implementation can regenerate these polynomials and verify that:

- $f(0) = a_0$ for each secret, and  
- Evaluations at $x = 1, 2, 3$ match the share values below.

---

## 3. Share Values for x in {1, 2, 3}

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
17. $M$

### 3.1 Shares for x = 1

Share index $x = 1$, values (indices in GF(2053)):

```text
[82, 1572, 1342, 1044, 198, 849, 272, 679, 142, 811, 1965, 508, 154, 555, 751, 1410, 1819]
```

Mapping to BIP39 English words (index → word), in the same order as the secrets:

- $w_1 = 82$ → `apart`  
- $w_2 = 1572$ → `setup`  
- $w_3 = 1342$ → `pond`  
- $w_4 = 1044$ → `little`  
- $w_5 = 198$ → `boat`  
- $w_6 = 849$ → `health`  
- $w_7 = 272$ → `capital`  
- $w_8 = 679$ → `female`  
- $w_9 = 142$ → `balcony`  
- $w_{10} = 811$ → `grace`  
- $w_{11} = 1965$ → `volcano`  
- $w_{12} = 508$ → `display`  
- $c_1 = 154$ → `battle`  
- $c_2 = 555$ → `earth`  
- $c_3 = 751$ → `fuel`  
- $c_4 = 1410$ → `raccoon`  
- $M = 1819$ → `toddler`

### 3.2 Shares for x = 2

Share index $x = 2$, values (indices in GF(2053)):

```text
[538, 1674, 415, 2047, 1112, 1420, 691, 1035, 1870, 941, 34, 891, 1049, 1507, 859, 171, 1484]
```

Mapping to BIP39 English words (index → word), in the same order as the secrets:

- $w_1 = 538$ → `drive`  
- $w_2 = 1674$ → `spend`  
- $w_3 = 415$ → `crop`  
- $w_4 = 2047$ → `zoo`  
- $w_5 = 1112$ → `mention`  
- $w_6 = 1420$ → `ranch`  
- $w_7 = 691$ → `filter`  
- $w_8 = 1035$ → `lift`  
- $w_9 = 1870$ → `truth`  
- $w_{10} = 941$ → `interest`  
- $w_{11} = 34$ → `affair`  
- $w_{12} = 891$ → `hunt`  
- $c_1 = 1049$ → `lobster`  
- $c_2 = 1507$ → `round`  
- $c_3 = 859$ → `hidden`  
- $c_4 = 171$ → `betray`  
- $M = 1484$ → `ridge`

### 3.3 Shares for x = 3

Share index $x = 3$, values (indices in GF(2053)):

```text
[994, 1776, 1541, 997, 2026, 1991, 1110, 1391, 1545, 1071, 156, 1274, 1944, 406, 967, 985, 1149]
```

Mapping to BIP39 English words (index → word), in the same order as the secrets:

- $w_1 = 994$ → `labor`  
- $w_2 = 1776$ → `task`  
- $w_3 = 1541$ → `scheme`  
- $w_4 = 997$ → `lake`  
- $w_5 = 2026$ → `wool`  
- $w_6 = 1991$ → `wedding`  
- $w_7 = 1110$ → `member`  
- $w_8 = 1391$ → `pupil`  
- $w_9 = 1545$ → `scorpion`  
- $w_{10} = 1071$ → `magnet`  
- $w_{11} = 156$ → `bean`  
- $w_{12} = 1274$ → `palm`  
- $c_1 = 1944$ → `vessel`  
- $c_2 = 406$ → `crazy`  
- $c_3 = 967$ → `jump`  
- $c_4 = 985$ → `kite`  
- $M = 1149$ → `moral`

---

## 4. How to Use This Test Vector

An independent implementation can use this test vector to validate both **sharing** and **recovery**:

1. **Regenerate the polynomials**  
   - For each secret, construct `f(x) = a_0 + a_1 x mod 2053` using the coefficients above.

2. **Verify share generation**  
   - Evaluate each `f(x)` at `x = 1, 2, 3`; confirm that the results match the arrays in Section 3.

3. **Verify reconstruction (2-of-3)**  
   - For any pair of share indices (e.g., `{1,2}`, `{1,3}`, or `{2,3}`), compute the Lagrange coefficients for reconstruction at `x = 0` in `GF(2053)`.  
   - Apply them to the corresponding share values for each secret to recover `a_0`.  
   - Confirm that the recovered `a_0` matches the original secrets `{w_i}, {c_r}, M`.

4. **Check row and master verification values**  
   - Using the recovered word indices, recompute the row checksums and the master verification number in `GF(2053)` and verify that they equal `{c_r}` and `M` respectively.

---

## 5. Lagrange Coefficients for the 2-of-3 Scheme

For completeness, this section records the Lagrange coefficients $\gamma$ used to reconstruct a secret from **2 of 3** shares in $GF(2053)$ when evaluating at $x = 0$. These values match the 2-of-3 entries in the main whitepaper.

- **Scheme**: 2-of-3  
- **Share indices available**: subsets of $\{1, 2, 3\}$  
- **Reconstruction formula**:

  ```text
  a_0 = f(0) = γ_1 * y_1 + γ_2 * y_2  (mod 2053)
  ```

  where $(x_1, y_1)$ and $(x_2, y_2)$ are the two shares used, and $(γ_1, γ_2)$ is the coefficient pair for that subset.

The pre-computed coefficients in $GF(2053)$ are:

| Shares used | Coefficients $(\gamma)$ |
| :--- | :--- |
| {1, 2} | (2, 2052) |
| {1, 3} | (1028, 1026) |
| {2, 3} | (3, 2051) |

An implementation that wishes to verify reconstruction for this test vector can:

- Choose any of these subsets (for example, `{1, 2}`),  
- Take the corresponding two share values for each secret from Section 3,  
- Apply the coefficients above to recover `a_0`, and  
- Confirm that `a_0` matches the original secrets listed in Sections 1.1–1.3.

This test vector exercises the same arithmetic and structure used in the full 24-word scheme but in a smaller, easier-to-audit setting.

---

## Security Implementation Note

Implementations of Schiavinato Sharing include security hardening features that are **transparent to test vectors**:

- **Constant-time comparisons**: All checksum validations use constant-time equality checks to prevent timing side-channel attacks
- **Memory cleanup**: Sensitive data (word indices, polynomials, recovered secrets) is explicitly wiped from memory after use

These security features do not affect:
- Share generation outputs (shares remain identical)
- Recovery results (recovered mnemonics remain identical)  
- Test vector compatibility (all test vectors pass unchanged)

The features work automatically without configuration and enhance security against advanced attack vectors (timing analysis, memory dumps) while maintaining full compatibility with the mathematical specification.

For security implementation details, see [SECURITY.md](./SECURITY.md).


