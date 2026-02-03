# Security Policy

## Reporting Security Vulnerabilities

**DO NOT** open a public GitHub issue for security vulnerabilities.

Email: **security@grifortis.com**

Include: Description, steps to reproduce, potential impact, suggested fix (if any)

Response time: Within 48 hours

---

## Scope

This repository contains the **canonical specification** for Schiavinato Sharing. Security issues may relate to:

- Mathematical/cryptographic flaws in the specification
- Security validation experiment issues
- Documentation that could mislead implementers

For implementation vulnerabilities:
- **JavaScript/TypeScript**: [schiavinato-sharing-js security](https://github.com/GRIFORTIS/schiavinato-sharing-js/security)
- **Python**: [schiavinato-sharing-py security](https://github.com/GRIFORTIS/schiavinato-sharing-py/security)
- **HTML**: [schiavinato-sharing-html security](https://github.com/GRIFORTIS/schiavinato-sharing-html/security)

---

## Security Status

**⚠️ EXPERIMENTAL - NOT AUDITED**

This specification and reference implementation have **NOT** been professionally audited.

**DO NOT USE FOR REAL FUNDS** until:
- Professional security audit completed
- Extensive peer review conducted
- Extensive testing in controlled environments
- v1.0 release

For now, use this for **learning, experimentation, and contribution only**.

---

## Verifying Release Authenticity

**All official release artifacts intended for users SHOULD be cryptographically signed with GPG** (or include verifiable provenance where available).

Before using any release artifacts, you **MUST** verify their authenticity to ensure they haven't been tampered with.

**Public key (ASCII-armored):** [`GRIFORTIS-PGP-PUBLIC-KEY.asc`](../GRIFORTIS-PGP-PUBLIC-KEY.asc)

**Quick verification:**
```bash
# Import public key (one-time)
curl -fsSL https://raw.githubusercontent.com/GRIFORTIS/schiavinato-sharing/main/GRIFORTIS-PGP-PUBLIC-KEY.asc | gpg --import

# Verify signature
gpg --verify <artifact>.asc <artifact>
```

**Expected fingerprint:** `7921 FD56 9450 8DA4 020E  671F 4CFE 6248 C57F 15DF`

⚠️ **Never skip verification** when using the tool with real crypto seeds.

---

## Known Security Considerations

### 1. Checksum Integrity (Not Authenticity)

The scheme includes error detection checksums but **NOT cryptographic authentication**.

**Implication**: Checksums detect accidental errors but cannot prevent intentional tampering by adversaries with access to shares.

See the Whitepaper (Section 6.4) for detailed discussion:
- PDF: https://github.com/GRIFORTIS/schiavinato-sharing/releases/latest/download/WHITEPAPER.pdf
- LaTeX source: https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/whitepaper/WHITEPAPER.tex

### 2. Share Distribution Security

Security depends on:
- Keeping shares physically separate
- Protecting shares from unauthorized access
- Trusting share custodians

The scheme cannot protect against:
- Collusion of k or more shareholders
- Compromise of k or more share storage locations

### 3. Manual Computation Risks

Pencil-and-paper mode is vulnerable to:
- Arithmetic errors (detected by checksums)
- Observation by adversaries (use private space)
- Physical document security

### 4. Reference Implementation Limitations

All current implementations are experimental and may have environment-specific behaviors. Verify artifacts and validate conformance (test vectors) before use.

---

## Validation Experiments

This repository includes security validation experiments in `research/security-validation/`:

**Completed:**
- Experiment 1: Entropy Conservation
- Experiment 2: Adversarial Constraint Solving

These are research experiments, not formal security proofs. See `research/security-validation/README.md` for details.

---

## Secure Usage Guidelines

### For Testing

1. **Never use real mnemonics** for testing
2. Generate test mnemonics specifically for experiments
3. Verify test vector results match expected outputs

### For Future Real-World Use (Post-Audit)

1. **Air-gapped environments** for sensitive operations
2. **Verify checksums** for all downloads
3. **Test recovery** before real use
4. **Store shares separately** in different locations
5. **Document locations** securely
6. **Review security updates** regularly

---

## RFC Feedback Period

**Through January 31, 2026**

We actively seek security analysis and feedback:

- Mathematical analysis and proofs
- Cryptographic security review
- Attack scenarios and threat modeling
- Implementation security considerations
- Formal verification efforts

Please report findings via:
- **Critical vulnerabilities**: security@grifortis.com (private)
- **Academic feedback**: GitHub Issues (public, use "Security Analysis" label)
- **General discussion**: GitHub Discussions

---

## Security Disclosure Timeline

For privately reported vulnerabilities:

1. **Day 0**: Initial report received
2. **Day 1-2**: Acknowledgment sent, initial assessment
3. **Day 3-7**: Detailed analysis, develop fix if needed
4. **Day 7-14**: Coordinate disclosure with reporter
5. **Day 14+**: Public disclosure with credit to reporter

Critical issues affecting implementations will be disclosed immediately after fixes are available.

---

## Supported Versions

| Version | Status | Security Updates |
|---------|--------|------------------|
| 0.4.x   | ✅ RFC Active | Yes |
| 0.3.x   | ⚠️ Superseded | Critical only |
| 0.2.x   | ⚠️ Superseded | Critical only |
| 0.1.x   | ⚠️ Superseded | Critical only |
| < 0.1.0 | ❌ Pre-release | No |

---

## Security Audit Status

- **Status**: Awaiting professional audit
- **Estimated Timeline**: After RFC period (Q2 2026)
- **Scope**: Full specification and reference implementation

We welcome:
- Academic security analysis
- Independent implementation reviews
- Formal verification efforts
- Recommendations for audit firms

---

## Best Practices for Contributors

1. **Never commit secrets** or private keys
2. **Review security implications** of changes
3. **Document security considerations** in PRs
4. **Report issues privately** first
5. **Follow constant-time practices** when relevant
6. **Keep dependencies updated**
7. **Test error handling** thoroughly

---

## Related Security Policies

- **JS implementation**: [schiavinato-sharing-js/.github/SECURITY.md](https://github.com/GRIFORTIS/schiavinato-sharing-js/blob/main/.github/SECURITY.md)
- **Python implementation**: [schiavinato-sharing-py/.github/SECURITY.md](https://github.com/GRIFORTIS/schiavinato-sharing-py/blob/main/.github/SECURITY.md)
- **HTML implementation**: [schiavinato-sharing-html/.github/SECURITY.md](https://github.com/GRIFORTIS/schiavinato-sharing-html/blob/main/.github/SECURITY.md)
- **Code of Conduct**: [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
- **Contributing Guidelines**: [`CONTRIBUTING.md`](./CONTRIBUTING.md)

---

## References

- **Whitepaper**: [PDF](https://github.com/GRIFORTIS/schiavinato-sharing/releases/latest/download/WHITEPAPER.pdf) ([LaTeX](../whitepaper/WHITEPAPER.tex)) - Full security analysis
- **Review entry point**: [`docs/review.md`](../docs/review.md)
- **Validation study**: [`docs/validation-study.md`](../docs/validation-study.md)
- **Test vectors**: [`test_vectors/`](../test_vectors/)

---

## Contact

- **Security Issues**: security@grifortis.com
- **Response Time**: Within 48 hours
- **PGP Key**: Available upon request

---

**Last Updated**: December 2025  
**Maintained by**: [GRIFORTIS](https://github.com/GRIFORTIS)
