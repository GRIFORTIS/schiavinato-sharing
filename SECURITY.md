# Schiavinato Sharing - Security Model

**Version:** 1.0  
**Last Updated:** December 2024  
**Status:** Specification

---

## Overview

This document defines the security model for Schiavinato Sharing's digital envelope format (QR codes). It specifies what attacks are protected against, what properties are guaranteed, and what limitations exist.

**Key principle:** Schiavinato Sharing prioritizes **offline backup security** with **human-first usability**. The threat model reflects physical backup scenarios, not online/networked systems.

---

## 1. Threat Model

### 1.1 In-Scope Threats (Protected)

**Accidental Corruption:**
- ✅ QR code damage (scratches, fading, printing errors)
- ✅ Scanning errors or device malfunctions
- ✅ Bit flips during storage or transmission
- **Protection:** Transport hash (SHA-256) detects any corruption with 2^128 collision resistance

**Accidental Share Mixing:**
- ✅ Shares from different sessions accidentally combined
- ✅ Shares from different wallets accidentally combined
- ✅ Share indices accidentally swapped
- **Protection:** Session Batch ID prevents cross-session mixing; Blinded Identity prevents cross-wallet mixing; Share Index in header prevents swap

**Intentional Share Substitution (Detected):**
- ✅ Attacker replaces individual shares with forged shares
- ✅ Attacker attempts to redirect recovery to different wallet
- **Protection:** Blinded Identity acts as cryptographic commitment; forgery requires knowledge of mnemonic

**Physical Tampering (Detected at Recovery):**
- ✅ Modified share data
- ✅ Modified checksums
- ✅ Modified QR codes
- **Detection:** Multi-layer validation (Transport + Arithmetic + Identity) catches tampering during recovery

### 1.2 Out-of-Scope Threats (Not Protected)

**Atomic Replacement:**
- ❌ Attacker replaces ALL shares simultaneously with valid shares for different wallet
- **Why:** Physical backup scenario—if attacker has access to all shares at once, they can steal the original mnemonic directly
- **Mitigation:** Physical security of backup locations; diversity of storage locations

**Side-Channel Attacks:**
- ❌ Timing attacks during HMAC computation
- ❌ Power analysis of recovery device
- ❌ Electromagnetic emanations
- **Why:** Requires physical proximity to recovery device; air-gapped usage reduces exposure
- **Mitigation:** Constant-time implementations recommended but not required for spec compliance

**Compromised Recovery Device:**
- ❌ Malware on QR scanner
- ❌ Compromised recovery software
- ❌ Backdoored hardware wallet
- **Why:** Beyond scope of cryptographic protocol
- **Mitigation:** User responsibility—use trusted, offline devices

**Social Engineering:**
- ❌ User tricked into scanning fake shares
- ❌ User tricked into revealing mnemonic
- ❌ User tricked into using attacker's recovery tool
- **Why:** Human factor, not protocol flaw
- **Mitigation:** User education, clear documentation

**Quantum Computing:**
- ❌ Grover's algorithm reduces hash security (2^128 → 2^64)
- ❌ Shor's algorithm breaks secp256k1 (BIP32 fingerprint derivation)
- **Why:** Not imminent threat; offline backup has time to migrate
- **Mitigation:** Post-quantum migration path if needed in future

---

## 2. Security Properties

### 2.1 Integrity (Strong)

**Guarantee:** Any bit-level corruption is detected with overwhelming probability.

**Mechanism:** 
- Transport hash = SHA-256(header || batch_id || blinded_identity || share_data)[0:16]
- 128-bit collision resistance = 2^64 security level
- Sufficient for offline scenarios (would require 10^19 hash operations to find collision)

**Validation:**
```
1. Decode QR to 62-byte payload
2. Extract fields 1-7 (bytes 0-45)
3. Compute SHA-256 over fields 1-7
4. Compare first 16 bytes with transport hash field (bytes 46-61)
5. If mismatch: ABORT, corruption detected
```

### 2.2 Consistency (Strong)

**Guarantee:** Shares from different sessions or wallets cannot be mixed.

**Mechanisms:**
- **Session Batch ID:** Random 8-byte value per sharing session
  - All shares from same session have identical batch ID
  - Prevents accidental mixing during recovery
  
- **Blinded Identity:** HMAC-SHA256(key=fingerprint, msg=batch_id)
  - Binds shares to specific wallet
  - Different wallets produce different blinded identities even with same batch ID

**Validation:**
```
1. Scan all shares
2. Verify all batch IDs are identical
3. Verify all blinded identities are identical
4. If any mismatch: ABORT, shares are from different sessions/wallets
```

### 2.3 Authenticity (Moderate)

**Guarantee:** Shares cannot be forged without knowledge of the mnemonic.

**Mechanism:**
```python
blinded_identity = HMAC-SHA256(key=fingerprint, msg=batch_id)
```

Where:
- `fingerprint` = BIP32 master key fingerprint (4 bytes)
- Derivable ONLY from the mnemonic via:
  1. mnemonic → seed (BIP39)
  2. seed → master_key (BIP32 HMAC-SHA512)
  3. master_key → public_key (secp256k1)
  4. public_key → fingerprint (HASH160[0:4])

**Why fingerprint as key:**
- Fingerprint is SECRET (only derivable from mnemonic)
- Batch ID is PUBLIC (visible in QR code)
- HMAC(secret, public) prevents forgery
- Attacker cannot compute valid HMAC without fingerprint

**Why NOT batch_id as key:**
- Would allow attacker to forge: `HMAC(batch_id_public, evil_fingerprint)`
- Attacker could create valid shares for different wallet
- Detection only at recovery (too late)

**Validation:**
```
1. Recover mnemonic from shares (Lagrange interpolation)
2. Derive fingerprint from recovered mnemonic (BIP32)
3. Recompute expected = HMAC(fingerprint, batch_id)
4. Compare expected with blinded_identity from shares
5. If mismatch: ABORT, shares are for wrong wallet
```

### 2.4 Arithmetic Correctness (Strong)

**Guarantee:** Share data is mathematically valid for secret sharing.

**Mechanisms:**
- Row checksums: Each row's checksum = sum of 3 words (mod 2053)
- GIC (Global Integrity Check): Sum of all checksums + share index (mod 2053)
- Both embedded in share data, validated during recovery

**Validation:**
```
1. Unpack 17 values from share data (12 words + 4 row checksums + 1 GIC)
2. For each row: verify checksum = sum(words) mod 2053
3. Verify GIC = (sum(row_checksums) + share_index) mod 2053
4. If any mismatch: ABORT, mathematical inconsistency
```

---

## 3. Attack Scenarios

### 3.1 Scenario: Accidental Corruption

**Attack:** QR code partially damaged (water, scratches, fading).

**Detection:**
1. QR scanner attempts error correction (up to 15% with Level M)
2. If within tolerance: Decodes successfully
3. Transport hash computed over decoded bytes
4. Hash mismatch detected: "QR code corrupted"

**Outcome:** ✅ Detected immediately at scan time, before any cryptographic operations.

---

### 3.2 Scenario: Share Substitution (Single Share)

**Attack:** Attacker replaces one share with forged share for different wallet.

**Detection:**
1. User scans Share 1 (legitimate): Blinded Identity = `0x9FE7C492EA1F3FF4`
2. User scans Share 2 (forged): Blinded Identity = `0xAAAABBBBCCCCDDDD`
3. Software compares blinded identities: MISMATCH
4. Alert: "Shares are from different wallets"

**Outcome:** ✅ Detected during scanning, before recovery attempt.

---

### 3.3 Scenario: Share Substitution (All Shares)

**Attack:** Attacker replaces ALL shares atomically with valid shares for different wallet (empty wallet).

**Detection:**
1. Transport hashes validate ✓ (attacker computed them correctly)
2. Blinded identities match ✓ (all forged shares use same evil fingerprint)
3. Arithmetic checksums validate ✓ (valid shares for evil wallet)
4. User recovers mnemonic successfully
5. User derives fingerprint from recovered mnemonic
6. Software computes expected_blinded = HMAC(fingerprint, batch_id)
7. Compares with blinded_identity from shares
8. MISMATCH detected: "Shares do not match expected wallet"

**Outcome:** ✅ Detected at recovery completion, before accepting recovered mnemonic.

**Limitation:** User must have recorded expected blinded identity OR expected fingerprint separately. If not, attacker succeeds (wallet recovered but empty).

**Recommendation:** User should verify first few words of recovered mnemonic match known wallet, or record expected blinded identity alongside shares.

---

### 3.4 Scenario: Malicious QR Modification

**Attack:** Attacker modifies share data in QR code (changes word indices).

**Detection:**
1. Transport hash fails validation: "QR corrupted or tampered"
2. OR (if attacker also updates transport hash): Arithmetic checksums fail
3. OR (if attacker fixes checksums): Blinded identity fails at final validation

**Outcome:** ✅ Multiple layers ensure detection.

---

### 3.5 Scenario: Session Mixing

**Attack:** User accidentally combines Share 1 from Session A with Share 2 from Session B.

**Detection:**
1. Session Batch IDs don't match
2. Software: "These shares are from different sharing sessions"

**Outcome:** ✅ Detected immediately, prevents recovery attempt.

---

## 4. Cryptographic Choices

### 4.1 HMAC-SHA256 for Blinded Identity

**Choice:** `HMAC-SHA256(key=fingerprint, msg=batch_id)`

**Rationale:**
- HMAC is standard for keyed hashing (FIPS 198-1)
- SHA-256 widely available, well-analyzed
- 256-bit output truncated to 64 bits (8 bytes) for space efficiency
- 64-bit truncation still provides 2^32 collision resistance (sufficient for binding)
- Fingerprint as key ensures only mnemonic holder can forge

**Alternatives considered:**
- ❌ `SHA-256(fingerprint || batch_id)`: Not keyed, vulnerable to length-extension
- ❌ `HMAC(batch_id, fingerprint)`: Backwards, allows forgery (public as key)
- ❌ Full 32-byte HMAC: Wastes QR space for minimal security gain

### 4.2 SHA-256 Truncation for Transport Hash

**Choice:** First 16 bytes (128 bits) of SHA-256

**Rationale:**
- 128-bit collision resistance = 2^64 operations (birthday bound)
- Offline backup scenario: No practical attack vector
- Smaller QR code enables manual replication (human-first design)
- QR Version 5 (37×37) is practical limit for hand-painting

**Math:**
- To find collision: ~10^19 hash computations
- At 1 billion hashes/second: 300+ years
- Attacker with all shares can steal mnemonic directly (no need for collision attack)

**Alternatives considered:**
- ❌ Full 32-byte SHA-256: Requires QR Version 6 (41×41), too dense for manual replication
- ❌ 64-bit hash: Marginal (2^32 security), possibly brute-forceable
- ✅ 128-bit: Sweet spot for security vs. usability

### 4.3 BIP32 Fingerprint as Wallet Identifier

**Choice:** First 4 bytes of HASH160(master_public_key)

**Rationale:**
- Standard BIP32 identifier
- Uniquely identifies wallet with 2^32 space (collision risk ~1 in 4 billion)
- Compact (4 bytes)
- Derivable from mnemonic via standard path

**Properties:**
- Not secret, but only derivable from mnemonic
- Perfect for wallet binding without revealing keys
- Compatible with existing BIP32 tooling

---

## 5. Implementation Guidelines

### 5.1 Required Validations

Implementations MUST perform these checks:

**At Share Generation:**
1. Generate cryptographically secure Session Batch ID (8 bytes, CSPRNG)
2. Derive BIP32 fingerprint from mnemonic
3. Compute blinded identity = HMAC(fingerprint, batch_id)
4. Pack share data (12-bit values)
5. Compute transport hash = SHA-256(header || batch || identity || data)[0:16]
6. Assemble 62-byte payload
7. Encode to Base64URL, prepend "sch:" prefix

**At Share Scanning:**
1. Decode Base64URL, verify 62-byte length
2. Extract and verify transport hash
3. Extract session batch ID and blinded identity
4. Compare with previously scanned shares (must match)
5. Store for recovery

**At Recovery:**
1. Verify all shares have matching batch IDs and blinded identities
2. Unpack share data (17 values × 12 bits)
3. Verify arithmetic checksums (row and GIC)
4. Perform Lagrange interpolation to recover secrets
5. Derive fingerprint from recovered mnemonic
6. Recompute expected blinded identity
7. Verify matches actual blinded identity from shares

### 5.2 Recommended Practices

**Constant-Time Comparisons:**
- Use constant-time comparison for all hash/HMAC verifications
- Prevents timing side-channel leaks
- Not required for spec compliance, but strongly recommended

**Memory Cleanup:**
- Wipe sensitive data (fingerprint, mnemonic, keys) after use
- Prevents memory dump attacks
- Use explicit zeroing (not just deallocation)

**Error Messages:**
- Generic errors: "Validation failed" (don't leak specifics)
- Detailed errors: For debugging only, not production
- Prevents information leakage to attackers

**Session Batch ID Generation:**
- MUST use cryptographically secure random number generator (CSPRNG)
- `/dev/urandom`, `CryptGenRandom`, `crypto.getRandomValues`, etc.
- NEVER use weak PRNGs (Math.random, rand(), etc.)

### 5.3 Optional Enhancements

**User Warnings:**
- Warn if blinded identities don't match across shares
- Suggest verifying first few words after recovery
- Recommend recording expected fingerprint separately

**Extended Validation:**
- Check BIP39 checksum on recovered mnemonic
- Derive first address, compare with known wallet
- Verify balance before declaring recovery successful

---

## 6. Known Limitations

### 6.1 No Protection Against Atomic Replacement

If attacker gains access to ALL shares simultaneously, they can:
1. Steal original mnemonic (best outcome for attacker)
2. OR replace all shares with valid shares for empty wallet

**Mitigation:** Physical security, geographic distribution of shares.

### 6.2 No Authentication of QR Scanner

Malicious QR scanner can:
- Steal mnemonic during recovery
- Present fake recovery results
- Exfiltrate data over network

**Mitigation:** Use trusted, offline devices for recovery.

### 6.3 Blinded Identity Truncation

8-byte blinded identity provides 2^32 collision resistance:
- Chance of accidental collision: ~1 in 4 billion
- Acceptable for personal backup scenario
- Intentional collision still requires mnemonic (full HMAC security)

### 6.4 Transport Hash is Not Authenticated

Transport hash provides:
- ✅ Integrity (detects corruption)
- ❌ Authenticity (doesn't prevent forgery)

Attacker can create valid transport hash for forged shares. This is intentional:
- Blinded identity provides authenticity
- Transport hash is for corruption detection only
- Keeps design simple and QR code compact

---

## 7. Comparison with Alternatives

### 7.1 vs. Authenticated Encryption (e.g., AES-GCM)

**Why not use AE:**
- Requires shared secret key (where to store it?)
- Adds ciphertext expansion (larger QR)
- Overkill for offline backup
- Schiavinato Sharing already provides authenticity via blinded identity

**Trade-offs:**
- Schiavinato: Authenticity via mnemonic-derived fingerprint (no separate key)
- AE: Authenticity via symmetric key (requires secure key storage)

### 7.2 vs. Digital Signatures (e.g., ECDSA)

**Why not use signatures:**
- Requires public key management
- Larger signatures (64+ bytes for ECDSA)
- QR becomes Version 6+ (impractical for manual replication)
- Public key reveals wallet identity (privacy loss)

**Trade-offs:**
- Schiavinato: Blinded identity hides wallet (8 bytes)
- ECDSA: Public signature exposes signer (64+ bytes)

### 7.3 vs. Full 256-bit Hashes

**Why truncate to 128 bits:**
- Human-first design: Keeps QR at Version 5 (practical limit for hand-painting)
- Security: 2^64 collision resistance is overkill for offline backup
- 43% QR spare capacity allows maximum error correction tolerance

**Trade-offs:**
- 128-bit: Practical human replication, 300+ years to break
- 256-bit: Theoretical perfection, impossible to replicate manually

---

## 8. Future Considerations

### 8.1 Post-Quantum Migration

If quantum computers threaten:
1. SHA-256 reduced to 2^64 security (Grover's algorithm) - still acceptable
2. BIP32 fingerprint derivation breaks (Shor's algorithm on secp256k1)

**Migration path:**
- Replace BIP32 fingerprint with post-quantum wallet identifier
- Keep HMAC structure intact
- Update Blinded Identity derivation only

### 8.2 Version 2 Protocol

Potential improvements:
- Full 32-byte HMAC (sacrifices human replication)
- Additional metadata (creation timestamp, recovery hints)
- Multi-signature schemes
- Backwards compatibility mandatory

---

## 9. References

**Standards:**
- BIP32: Hierarchical Deterministic Wallets
- BIP39: Mnemonic Code for Generating Deterministic Keys
- FIPS 180-4: Secure Hash Standard (SHA-256)
- FIPS 198-1: The Keyed-Hash Message Authentication Code (HMAC)
- RFC 4648: Base64URL Encoding

**Schiavinato Sharing:**
- RFC.md: Protocol specification
- TEST_VECTORS.md: Implementation test vectors
- WHITEPAPER.tex: Mathematical foundations

---

## 10. Contact

**Security Issues:**
- Report to: [security contact from main repo]
- PGP key: [if available]
- Response time: 48 hours

**Questions:**
- GitHub Discussions: [link]
- Technical clarifications welcome

---

**Document Status:** Living document, updated with protocol versions.

**License:** Same as Schiavinato Sharing specification (check repository LICENSE file).
