# Changelog

All notable changes to the Schiavinato Sharing specification and reference implementation will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- Bounty program announcement

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
- Bounty program active for vulnerability discovery and formal verification
- Not recommended for production use with real funds

### How to Contribute
- Review the [whitepaper](WHITEPAPER.md)
- Test the [reference implementation](reference-implementation/)
- Validate against [test vectors](TEST_VECTORS.md)
- Provide feedback via [GitHub Issues](https://github.com/GRIFORTIS/schiavinato-sharing-spec/issues)
- See [BOUNTY_PROGRAM.md](BOUNTY_PROGRAM.md) for rewards

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

See [HOW_TO_RELEASE.md](HOW_TO_RELEASE.md) for detailed release procedures.

---

## Links

- **Repository**: https://github.com/GRIFORTIS/schiavinato-sharing-spec
- **JavaScript Library**: https://github.com/GRIFORTIS/schiavinato-sharing-js
- **Python Library**: https://github.com/GRIFORTIS/schiavinato-sharing-py
- **Organization**: https://github.com/GRIFORTIS

---

[Unreleased]: https://github.com/GRIFORTIS/schiavinato-sharing-spec/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/tag/v0.1.0

