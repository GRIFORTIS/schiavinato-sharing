# Schiavinato Sharing Security Model

This document is a non-normative security overview for reviewers and implementers. The authoritative security analysis is the whitepaper, the arithmetic rules are in [`../manual_spec/README.md`](../manual_spec/README.md), and the software-facing digital envelope and workflow requirements are in [`../software_spec/README.md`](../software_spec/README.md).

## Scope

Schiavinato Sharing protects BIP39 mnemonic word indices with Shamir sharing over \(GF(2053)\), then adds a linear consistency layer for passive error detection. Computational deployments add a digital envelope, session metadata, manifest audit records, and post-recovery verification checks.

The protocol is designed for long-horizon cold-storage backup and disaster recovery. It is not a transaction authorization system, online authentication system, or replacement for physical custody controls.

## Threat Model

### In Scope

- Passive transcription, arithmetic, share-number, scanning, and media-corruption errors.
- Accidental mixing of shares from different sessions when computational metadata is available.
- Pre-recovery share substitution when an uncompromised manifest with Audit Hashes is available.
- Post-recovery wrong-mnemonic or wallet-context detection through Blinded Identity and RVA checks.
- Manual fallback when software is unavailable or untrusted, with weaker substitution detection unless RVA or a separately protected manifest is available.

### Out Of Scope

- Compromise of \(k\) or more valid shares.
- Compromised devices or peripherals that observe secret-bearing material.
- Physical coercion, social engineering, or loss of all recovery context.
- Compromise of the underlying BIP39 or wallet ecosystem.
- A compromised manifest: manifest-dependent pre-recovery checks fail if the manifest is also altered.

## Security Properties

### Information-Theoretic Confidentiality

The unrestricted arithmetic share layer provides standard Shamir/LSSS confidentiality for any \(t < k\) shares. Row checksums, column checksums, and GIC are deterministic linear functions of the word shares and public offsets, so they add no information beyond the shares themselves.

Reduced Mode intentionally departs from exact perfect secrecy because it rejects word polynomials whose evaluated word-share values exceed `2047`. The whitepaper gives the current conservative bias bound. Full Mode and manual operation use the unrestricted arithmetic layer.

### Passive Error Detection

The linear consistency layer includes:

- Position-bound row checksums.
- Column checksums with public column tags.
- Share-bound GIC with row total, column total, and share index binding.

The whitepaper proves minimum detection distance \(d = 4\): every one-, two-, and three-cell passive error is detected. This is error detection, not authentication; an active adversary with physical access to a share can recompute consistent checks.

### Digital Envelope Integrity

Full Mode includes a 16-byte truncated SHA-256 Transport Hash over the encoded share Core Payload fields before the hash. This detects media corruption, scanning errors, or bit flips before recovery processing. Reduced Mode omits the Transport Hash; transport integrity relies on QR error correction plus GIC validation.

The canonical digital object is the Core Payload bytes. QR bytes prepend `SCHI` for Full Mode or `SC` for Reduced Mode. Optional text export is intentionally unspecified; if an implementation offers one, it must round-trip to the same Core Payload bytes.

### Mnemonic And Wallet Verification

Computational shares carry:

- Session Batch ID.
- Blinded Identity, computed with HMAC-SHA256 keyed by the full 20-byte HASH160 of the compressed BIP32 master public key.

After recovery, software recomputes the Blinded Identity from the recovered mnemonic. A mismatch is a strong warning for share mixing, corruption, or substitution. Full Mode uses a 12-byte tag; Reduced Mode uses an 8-byte tag.

The RVA is a separate wallet-context check. It verifies the intended wallet context, including derivation settings and optional BIP39 passphrase when applicable. For the Bitcoin bech32/bech32m truncation analyzed in the whitepaper, the first-8 plus last-8 character form gives about \(2^{60}\) matching strength. Other address formats require format-specific analysis.

### Manifest-Based Audit

The manifest can store session metadata and per-share Audit Hashes without containing plaintext shares. When stored separately from the shares, it enables a per-share audit drill:

1. Scan/import a share.
2. Validate available local checks.
3. Recompute the Core Payload hash.
4. Compare against the manifest Audit QR/hash record.

This detects active share substitution when the manifest remains uncompromised. Optional raw GIC maps help inventory and accidental mixup detection, but if a manifest carries at least \(k\) GIC values from one session it reveals one \(GF(2053)\)-valued linear relation of the mnemonic, upper-bounded by about 11 bits.

## Required Validation Flow

The current required validation pipeline is specified in `software_spec/` and `manual_spec/`. At a high level:

- Parse the digital envelope or manually entered share table.
- Reject unknown version bytes and malformed field lengths.
- Validate Full Mode Transport Hash when present.
- Compare manifest Audit Hashes when a manifest is available.
- Enforce matching word count, threshold, and session metadata across selected computational shares.
- Validate GIC and any available row/column checks.
- Interpolate the mnemonic with Lagrange coefficients.
- Validate BIP39 checksum when applicable.
- Recompute Blinded Identity and RVA checks when metadata is available.

Generation workflows must also run the runtime consistency assertion before print/export/transcription: recompute row checksums, column checksums, and GIC from original coefficients and independently from generated share values, then compare. Any mismatch is a STOP condition.

## Operational Notes

- Any device or peripheral that handles secret-bearing material is inside the trusted boundary.
- Tier 1 offline non-network printers may receive secret-bearing output.
- Tier 2 printers may receive manifest metadata and blank templates, but not plaintext share content.
- Tier 3 printers receive blank structure only.
- Tier 4 is fully hand-transcribed.
- Resume artifacts are temporary sharing-continuity material only. They are not recovery inputs and should be destroyed or separately secured after successful share creation and validation.

## References

- [`../whitepaper/WHITEPAPER.tex`](../whitepaper/WHITEPAPER.tex)
- [`../manual_spec/README.md`](../manual_spec/README.md)
- [`../software_spec/README.md`](../software_spec/README.md)
- [`../test_vectors/README.md`](../test_vectors/README.md)
