# software_spec changelog

All notable changes to `software_spec` will be documented here.

## [Unreleased]

## [0.5.0] - 2026-04-09

### Added
- **Reduced Mode** payload profile: 11-bit word packing, 4-byte Batch ID, 8-byte BI, no Transport Hash, QR V3 with `SC` prefix, up to 2 nesting layers.
- **Full Mode / Reduced Mode** distinction throughout. Full Mode is the primary profile for long-term custody; Reduced Mode is an accessible alternative.
- **Manifest QR payloads**: Manifest Header QR (`SM` prefix) and per-share Audit QR (`SA` prefix) with SHA-256 integrity commitment.
- **Runtime integrity assertion** (Path A vs Path B double-check) as a SHOULD-level recommendation.
- **Optional text export** noted as intentionally unspecified.
- Integrity architecture summary (Triple-Lock / Dual-Lock).
- RVA verification step in the decode pipeline.

### Changed
- **Master Key Identifier**: now uses the full 20-byte HASH160 of the compressed master public key (was 4-byte BIP32 fingerprint). The 20-byte key ensures the HMAC key space is not the security bottleneck.
- **Full Mode Blinded Identity**: 12 bytes / 96 bits (was 8 bytes / 64 bits).
- **Full Mode payload offsets**: BI at offset 14 is now 12 bytes, shifting Share Data to offset 26 (was offset 22). Total core payload is 42 + share_data_len (was 38 + share_data_len).
- **Share data contents**: now serializes word values + printed GIC only. Row and column checksums are **not** serialized in the digital payload (they are computed from share data for human-readable display). Element count is \(\ell + 1\) (was \(\ell + r + 1\)).
- **QR prefix decode rule**: now distinguishes `SCHI` (Full Mode) from `SC` (Reduced Mode).
- **Decode pipeline**: expanded to 10 steps including manifest audit, RVA verification, and mode-aware transport validation.

### Breaking
- Full Mode payload layout is incompatible with v0.4.x due to changed BI size, changed share data contents, and changed offsets.
- MKI derivation uses 20-byte HASH160 instead of 4-byte fingerprint; Blinded Identity values will differ even for the same mnemonic.
- Existing v0.4.x payloads are **not** decodable as v0.5.0.

## [0.4.1] - 2026-02-03
- Initial published draft (single mode, 4-byte fingerprint, 8-byte BI, words + row checksums + GIC in share data).
