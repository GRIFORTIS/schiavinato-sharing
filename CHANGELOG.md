# Changelog

All notable changes to the Schiavinato Sharing specification and reference implementation will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2026-01-27

### Added
- **Whitepaper publication**: Complete technical specification (LaTeX source and PDF)
- **Preliminary validation study**: Manual recovery feasibility results (4 participants, 2 trials)
- **Security validation experiments**: Entropy conservation and adversarial constraint solving
- Dual-path checksum validation (Path A direct sums, Path B polynomial-based) in reference HTML split/recover flows to detect hardware faults and bit flips
- New checksum polynomial helpers: `sumPolynomials`, `computeRowCheckPolynomials`, `computeGlobalIntegrityCheckPolynomial`
- Error reporting now surfaces path mismatches (`rowPathMismatch`, `globalPathMismatch`)
- **GIC Binding**: Global Integrity Check is now bound to share number `x` (printed GIC = sum + x mod 2053)

### Changed
- Split now constructs checksum polynomials and requires agreement between Path A and Path B for every share
- Recovery keeps backward-compatible error reporting while flagging path disagreement explicitly
- UI messaging highlights path mismatches separately from standard checksum failures
- **Terminology standardization**: "Global Checksum" renamed to "Global Integrity Check (GIC)" across all code, tests, and documentation

### Compatibility
- No share-format changes; existing shares remain recoverable
- New error fields are additive

## [0.3.0] - 2025-12-05

### Changed
- Checksum shares are now computed deterministically as the sum of word shares (mod 2053) rather than using independent random polynomials
- This change enables share integrity validation during the splitting process
- Recovery algorithm unchanged - all existing shares remain recoverable
- Maintains all LSSS security properties

### Benefits
- Users can verify share integrity during manual splitting
- Row checksum share = sum of 3 word shares in that row (mod 2053)
- Global Integrity Check (GIC) share = sum of all word shares (mod 2053)
- Catches arithmetic errors before share distribution
- Zero impact on recovery time or process

### Security Note
- No information leakage (checksums are deterministic functions of words)
- Threshold property preserved (still requires k shares for recovery)
- Entropy source unchanged (word polynomials remain random)

## [0.2.0] - 2025-11-30

### Added
- Comprehensive test suite for reference implementation (Playwright)
- CI/CD workflows for automated testing
- SHA256 checksum generation for releases
- Verification scripts for Linux/macOS and Windows
- Complete documentation structure

## [0.1.0] - 2025-11-27

### Added
- Initial whitepaper (RFC status)
- Reference implementation (HTML/JavaScript)
- Test vectors for validation
- RFC document
- Contributing guidelines
- Security policy
- Issue templates

### Status
- **RFC Period**: Through January 31, 2026
- **Security**: Experimental - not audited
- **Recommendation**: For testing and review only

---

## RFC Status

This specification is currently in **Request for Comments (RFC)** status through January 31, 2026.

### What This Means
- The specification is open for community review and feedback
- Breaking changes may occur based on feedback
- Not recommended for production use with real funds

### How to Contribute
- Review the [whitepaper](WHITEPAPER.md)
- Test the [reference implementation](reference-implementation/)
- Validate against [test vectors](TEST_VECTORS.md)
- Provide feedback via [GitHub Issues](https://github.com/GRIFORTIS/schiavinato-sharing-spec/issues)

---

## Version History Notes

### Versioning Strategy

**Specification versions** (WHITEPAPER.md, RFC.md):
- Follow semantic versioning for the mathematical specification
- Major version changes indicate breaking changes to the scheme
- Minor version changes indicate clarifications or additions
- Patch version changes indicate typos or formatting fixes

**Reference Implementation versions** (reference-implementation/):
- Independent versioning from specification
- Tracks implementation improvements and bug fixes
- Must always comply with current specification version

### Release Process

For detailed release procedures, see the internal documentation (maintainers only).

---

## Links

- **Repository**: https://github.com/GRIFORTIS/schiavinato-sharing-spec
- **JavaScript Library**: https://github.com/GRIFORTIS/schiavinato-sharing-js
- **Python Library**: https://github.com/GRIFORTIS/schiavinato-sharing-py
- **Organization**: https://github.com/GRIFORTIS

---

[Unreleased]: https://github.com/GRIFORTIS/schiavinato-sharing-spec/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/GRIFORTIS/schiavinato-sharing-spec/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/GRIFORTIS/schiavinato-sharing-spec/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/GRIFORTIS/schiavinato-sharing-spec/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/tag/v0.1.0

