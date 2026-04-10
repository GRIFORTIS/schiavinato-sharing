# Schiavinato Sharing - GF(2053) Test Vector (v0.5.0, 2-of-3, 12 Words, Full Mode)

This is the live root-level test vector set for the current protocol. The machine-readable companion lives in `test_vectors/vectors.json`.

This vector keeps the public test mnemonic and the per-word random coefficients from the archived `v0.4.1` vector, then upgrades the arithmetic and digital envelope to the `v0.5.0` rules from the protocol source of truth.

## Status

- Current protocol target: `v0.5.0`
- Threshold scheme: `2-of-3`
- Word count: `12`
- Digital mode covered here: `Full Mode`
- Reduced Mode is intentionally omitted for this seed because the unchanged word-share values already include `2048` and `2052`, which violate the `v0.5.0` Reduced Mode 11-bit word-share constraint.

## 1. Base mnemonic

Mnemonic:

```text
spin result brand ahead poet carpet unusual chronic denial festival toy autumn
```

BIP39 indices:

```text
1680, 1471, 217, 42, 1338, 279, 1907, 324, 468, 682, 1844, 126
```

Grouped into 4 rows of 3:

- Row 1: `1680-spin`, `1471-result`, `0217-brand`
- Row 2: `0042-ahead`, `1338-poet`, `0279-carpet`
- Row 3: `1907-unusual`, `0324-chronic`, `0468-denial`
- Row 4: `0682-festival`, `1844-toy`, `0126-autumn`

## 2. Random coefficients

The per-word degree-1 coefficients are unchanged from the archived `v0.4.1` vector:

```text
1, 2052, 1126, 2012, 710, 571, 146, 1728, 2000, 130, 122, 383
```

Word polynomials:

- `w1(x)  = 1680 + 1x`
- `w2(x)  = 1471 + 2052x`
- `w3(x)  = 217 + 1126x`
- `w4(x)  = 42 + 2012x`
- `w5(x)  = 1338 + 710x`
- `w6(x)  = 279 + 571x`
- `w7(x)  = 1907 + 146x`
- `w8(x)  = 324 + 1728x`
- `w9(x)  = 468 + 2000x`
- `w10(x) = 682 + 130x`
- `w11(x) = 1844 + 122x`
- `w12(x) = 126 + 383x`

## 3. v0.5.0 arithmetic base values

### 3.1 Position-bound row checksums

In `v0.5.0`, each row checksum adds its row number `r` to the constant term.

```text
r1 = (w1 + w2 + w3 + 1) mod 2053 = 1316
r2 = (w4 + w5 + w6 + 2) mod 2053 = 1661
r3 = (w7 + w8 + w9 + 3) mod 2053 = 649
r4 = (w10 + w11 + w12 + 4) mod 2053 = 603
```

Base row checksum labels:

- `1316-piece`
- `1661-sort`
- `0649-extra`
- `0603-ensure`

Row checksum polynomials:

- `r1(x) = 1316 + 1126x`
- `r2(x) = 1661 + 1240x`
- `r3(x) = 649 + 1821x`
- `r4(x) = 603 + 635x`

### 3.2 Column checksums

In `v0.5.0`, each column checksum adds its public tag to the constant term:

- Column 1 tag = `10`
- Column 2 tag = `20`
- Column 3 tag = `30`

```text
c1 = (w1 + w4 + w7 + w10 + 10) mod 2053 = 215
c2 = (w2 + w5 + w8 + w11 + 20) mod 2053 = 891
c3 = (w3 + w6 + w9 + w12 + 30) mod 2053 = 1120
```

Base column checksum labels:

- `0215-bracket`
- `0891-hungry`
- `1120-message`

Column checksum polynomials:

- `c1(x) = 215 + 236x`
- `c2(x) = 891 + 506x`
- `c3(x) = 1120 + 2027x`

### 3.3 Unbound GIC and printed GIC

For 12 words, the row total is:

```text
1 + 2 + 3 + 4 = 10
```

The fixed column total is:

```text
10 + 20 + 30 = 60
```

The unbound GIC adds both totals to the constant term:

```text
gic_unbound = (w1 + ... + w12 + 10 + 60) mod 2053
gic_unbound = (113 + 70) mod 2053 = 183
```

Base unbound GIC label:

- `0183-bitter`

Unbound GIC polynomial:

- `gic_unbound(x) = 183 + 716x`

Printed GIC rule:

```text
printed_gic(x) = (gic_unbound(x) + x) mod 2053
```

## 4. Share tables

The `v0.5.0` human-readable share table is 4 rows of words plus row checksums, followed by a footer row carrying the 3 column checksums and the printed GIC.

### 4.1 Share 1 (`x = 1`)

| Column 1 | Column 2 | Column 3 | Check |
|----------|----------|----------|-------|
| `1681-spirit` | `1470-response` | `1343-pond` | `0389-correct` |
| `0001-abandon` | `2048-zoo` | `0850-health` | `0848-hazard` |
| `0000-0000` | `2052-2052` | `0415-critic` | `0417-cross` |
| `0812-grace` | `1966-volcano` | `0509-display` | `1238-one` |
| `0451-debate` | `1397-purse` | `1094-master` | `0900-idea` |

Validation:

```text
Row checks:
(1681 + 1470 + 1343 + 1) mod 2053 = 389
(1 + 2048 + 850 + 2) mod 2053 = 848
(0 + 2052 + 415 + 3) mod 2053 = 417
(812 + 1966 + 509 + 4) mod 2053 = 1238

Column checks:
(1681 + 1 + 0 + 812 + 10) mod 2053 = 451
(1470 + 2048 + 2052 + 1966 + 20) mod 2053 = 1397
(1343 + 850 + 415 + 509 + 30) mod 2053 = 1094

Unbound GIC:
(all 12 words + 10 + 60) mod 2053 = 899

Printed GIC:
(899 + 1) mod 2053 = 900
```

### 4.2 Share 2 (`x = 2`)

| Column 1 | Column 2 | Column 3 | Check |
|----------|----------|----------|-------|
| `1682-split` | `1469-resource` | `0416-crop` | `1515-run` |
| `2013-wine` | `0705-fix` | `1421-ranch` | `0035-affair` |
| `0146-banana` | `1727-style` | `0362-coffee` | `0185-blade` |
| `0942-interest` | `0035-affair` | `0892-hunt` | `1873-tube` |
| `0687-fiction` | `1903-universe` | `1068-lyrics` | `1617-skate` |

Validation:

```text
Row checks:
(1682 + 1469 + 416 + 1) mod 2053 = 1515
(2013 + 705 + 1421 + 2) mod 2053 = 35
(146 + 1727 + 362 + 3) mod 2053 = 185
(942 + 35 + 892 + 4) mod 2053 = 1873

Column checks:
(1682 + 2013 + 146 + 942 + 10) mod 2053 = 687
(1469 + 705 + 1727 + 35 + 20) mod 2053 = 1903
(416 + 1421 + 362 + 892 + 30) mod 2053 = 1068

Unbound GIC:
(all 12 words + 10 + 60) mod 2053 = 1615

Printed GIC:
(1615 + 2) mod 2053 = 1617
```

### 4.3 Share 3 (`x = 3`)

| Column 1 | Column 2 | Column 3 | Check |
|----------|----------|----------|-------|
| `1683-spoil` | `1468-resist` | `1542-scheme` | `0588-enact` |
| `1972-wait` | `1415-radio` | `1992-wedding` | `1275-palm` |
| `0292-caught` | `1402-quality` | `0309-charge` | `2006-wide` |
| `1072-magnet` | `0157-bean` | `1275-palm` | `0455-decide` |
| `0923-infant` | `0356-cluster` | `1042-lion` | `0281-cart` |

Validation:

```text
Row checks:
(1683 + 1468 + 1542 + 1) mod 2053 = 588
(1972 + 1415 + 1992 + 2) mod 2053 = 1275
(292 + 1402 + 309 + 3) mod 2053 = 2006
(1072 + 157 + 1275 + 4) mod 2053 = 455

Column checks:
(1683 + 1972 + 292 + 1072 + 10) mod 2053 = 923
(1468 + 1415 + 1402 + 157 + 20) mod 2053 = 356
(1542 + 1992 + 309 + 1275 + 30) mod 2053 = 1042

Unbound GIC:
(all 12 words + 10 + 60) mod 2053 = 278

Printed GIC:
(278 + 3) mod 2053 = 281
```

## 5. Recovery reference

### 5.1 Lagrange coefficients

For share indices `{1, 2, 3}` in `GF(2053)`:

| Shares used | Coefficients |
|-------------|--------------|
| `{1, 2}` | `(2, 2052)` |
| `{1, 3}` | `(1028, 1026)` |
| `{2, 3}` | `(3, 2051)` |

For the `{1, 2}` recovery example:

```text
secret = 2*y1 + 2052*y2 mod 2053
```

Coefficient sanity check:

```text
(1 * 2) + (2 * 2052) = 4106 mod 2053 = 0
```

### 5.2 Recovered values from shares 1 and 2

Recovered mnemonic indices:

```text
1680, 1471, 217, 42, 1338, 279, 1907, 324, 468, 682, 1844, 126
```

Recovered row checksums:

```text
1316, 1661, 649, 603
```

Recovered column checksums:

```text
215, 891, 1120
```

Recovered unbound GIC from printed GIC shares:

```text
2*900 + 2052*1617 mod 2053 = 183
```

This works because the printed GIC adds the public `+x` term, and the same Lagrange interpolation used at `x=0` cancels that term automatically.

Recovered mnemonic:

```text
spin result brand ahead poet carpet unusual chronic denial festival toy autumn
```

Final check:

- The recovered mnemonic is a valid 12-word BIP39 mnemonic.

## 6. Full Mode digital payload vectors

### 6.1 Shared constants

- Protocol Version: `0x01`
- Flags: `0x00`
- Threshold bytes: `02 00`
- QR prefix: ASCII `SCHI`
- Session Batch ID: `A1 B2 C3 D4 E5 F6 07 08`
- MKI (full HASH160): `35 E3 00 A8 CB 4F 45 2C 29 97 CA F4 98 B1 F5 93 86 72 9B 22`
- Blinded Identity (first 12 bytes of HMAC-SHA256): `17 58 0E D6 04 F7 AF 42 72 65 72 62`

Share Data packing:

- Contents: `w1..w12, printed_gic`
- Width: `13` values of `12` bits each, MSB-first
- Total bits: `156`
- Padding: `4` zero bits
- Share Data length: `20` bytes
- Core Payload length: `62` bytes
- QR byte payload length with `SCHI` prefix: `66` bytes

### 6.2 Share 1 digital vector

```text
Header:         010002000100
Share Data:     6915BE53F00180035200080419F32C7AE1FD3840
Transport Hash: 2DE3EA6C3E903BF04C953B3E0FF6FB5F
Core Payload:   010002000100A1B2C3D4E5F6070817580ED604F7AF42726572626915BE53F00180035200080419F32C7AE1FD38402DE3EA6C3E903BF04C953B3E0FF6FB5F
QR Bytes:       53434849010002000100A1B2C3D4E5F6070817580ED604F7AF42726572626915BE53F00180035200080419F32C7AE1FD38402DE3EA6C3E903BF04C953B3E0FF6FB5F
Audit Hash:     7828A895271A1E33BE142D29A2BB01285AF00683F7D38A477F85D68798A9F875
Audit QR:       5341020001007828A895271A1E33BE142D29A2BB01285AF00683F7D38A477F85D68798A9F875
```

### 6.3 Share 2 digital vector

```text
Header:         010002000200
Share Data:     6925BD1A07DD2C158D0926BF16A3AE02337C6510
Transport Hash: D68A69BFC1B41D81E4A2469EE219A780
Core Payload:   010002000200A1B2C3D4E5F6070817580ED604F7AF42726572626925BD1A07DD2C158D0926BF16A3AE02337C6510D68A69BFC1B41D81E4A2469EE219A780
QR Bytes:       53434849010002000200A1B2C3D4E5F6070817580ED604F7AF42726572626925BD1A07DD2C158D0926BF16A3AE02337C6510D68A69BFC1B41D81E4A2469EE219A780
Audit Hash:     0149AFD52D9689E1BF5C9CD8EC245E2FAFFCCA02B17113538CF37002D5DB776A
Audit QR:       5341020002000149AFD52D9689E1BF5C9CD8EC245E2FAFFCCA02B17113538CF37002D5DB776A
```

### 6.4 Share 3 digital vector

```text
Header:         010002000300
Share Data:     6935BC6067B45877C812457A13543009D4FB1190
Transport Hash: AE561995EE9400FA8759879C4F58F00B
Core Payload:   010002000300A1B2C3D4E5F6070817580ED604F7AF42726572626935BC6067B45877C812457A13543009D4FB1190AE561995EE9400FA8759879C4F58F00B
QR Bytes:       53434849010002000300A1B2C3D4E5F6070817580ED604F7AF42726572626935BC6067B45877C812457A13543009D4FB1190AE561995EE9400FA8759879C4F58F00B
Audit Hash:     C7B42089773BC61C2E8E27FF2CE533E17EF0AB018F6444B8FB603F2845B21660
Audit QR:       534102000300C7B42089773BC61C2E8E27FF2CE533E17EF0AB018F6444B8FB603F2845B21660
```

### 6.5 Manifest Header QR

```text
SM0100A1B2C3D4E5F6070817580ED604F7AF4272657262
```

Hex bytes:

```text
534D0100A1B2C3D4E5F6070817580ED604F7AF4272657262
```

### 6.6 Notes

- `v0.5.0` Full Mode serializes `word shares + printed GIC` only. Row and column checksums remain human-readable arithmetic data and are not serialized into the core payload.
- Optional text export is intentionally unspecified in `v0.5.0`, so no Bech32m or Base64URL representation is part of this vector set.
- The fixed Session Batch ID is for reproducible public test vectors only. Production implementations MUST generate a fresh CSPRNG value for every sharing session.
