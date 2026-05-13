# manual_spec changelog

All notable changes to `manual_spec` will be documented here.

## [Unreleased]

## [0.5.0] - 2026-04-09

### Added
- **Column checksums** with position-bound column tags (\(\tau^C_1 = 10\), \(\tau^C_2 = 20\), \(\tau^C_3 = 30\)).
- **Row tags** (\(\tau^R_j = j\)) added to row checksum formulas for positional binding.
- **Row total** \(T_R = r(r+1)/2\) and **column total** \(T_C = 60\) added to GIC formula.
- **Three equivalent GIC validation paths** (words, rows, columns).
- **Recovery Verification Address (RVA)** as recommended share header field.
- Explicit \(n \leq 2052\) constraint.
- Redundant-share consistency check observation (\(k+1\) shares).
- Nesting section.
- Domain separators table (\(T_R\), \(T_C\) by word count).

### Changed
- Row checksum formula: \(R_j[x] = (w_{3j-2}[x] + w_{3j-1}[x] + w_{3j}[x] + j) \bmod 2053\) (was without \(+j\)).
- GIC formula: now includes \(T_R + T_C\) in addition to word sum and share index.
- Share table layout: footer row now contains 3 column checksums + printed GIC (was GIC only).
- Share assembly: \(\ell + r + 3 + 1\) elements per share (was \(\ell + r + 1\)).
- STOP conditions: column checksum mismatch added.
- Recovery Step 4: column checksum interpolation and validation added.
- Share generation: column checksum computation added as Step 3.

### Breaking
- Row checksum values differ from v0.4.x due to row tag addition.
- GIC values differ from v0.4.x due to \(T_R + T_C\) addition.
- Share table format changes (column checksums in footer row).
- Existing v0.4.x shares are **not** compatible with v0.5.0 recovery.

## [0.4.1] - 2026-02-03
- Initial published draft (row checksums, GIC with share-index binding, no column checksums, no row/column tags).
