# Security Policy

## Supported Versions

| Version | Status | Supported |
|---------|--------|-----------|
| < 1.0   | Experimental | ⚠️ For testing only |
| 1.0+    | Not yet released | - |

## ⚠️ Security Status: EXPERIMENTAL

**This specification and reference implementation have NOT been professionally audited.**

While the Schiavinato Sharing scheme is based on well-established cryptographic principles (Shamir's Secret Sharing), this specific implementation is **experimental research software**.

### DO NOT USE FOR REAL FUNDS

This software is provided for:
- ✅ Educational purposes
- ✅ Research and analysis
- ✅ Testing and experimentation
- ✅ Contributing to development

**NOT** for:
- ❌ Securing real cryptocurrency wallets
- ❌ Production use with valuable assets
- ❌ Critical inheritance planning (until audited)

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please help us by reporting it responsibly.

### What to Report

**Critical Issues** (report privately):
- Cryptographic flaws in the scheme
- Potential for secret reconstruction with fewer than k shares
- Entropy weaknesses or bias in random number generation
- Checksum bypass that allows invalid shares
- Any issue that could lead to loss of funds

**Non-Critical Issues** (can be public):
- UI/UX bugs in reference implementation
- Documentation clarifications
- Performance improvements
- General feature requests

### How to Report

**For Critical Security Issues:**

1. **DO NOT** open a public GitHub issue
2. Send an email to: **security@grifortis.com** *(or create private security advisory on GitHub)*
   - Subject: `[SECURITY] Schiavinato Sharing - Brief Description`
   - Include:
     - Detailed description of the vulnerability
     - Steps to reproduce
     - Potential impact assessment
     - Suggested fix (if you have one)

3. We will acknowledge receipt within **48 hours**
4. We will provide a detailed response within **7 days**
5. We will work with you to understand and resolve the issue

**For Non-Critical Issues:**
- Open a regular GitHub issue using the appropriate template

### Disclosure Policy

- We follow **coordinated disclosure** principles
- We will work to fix critical issues before public disclosure
- We will credit researchers who report valid issues (unless they prefer to remain anonymous)
- Once a fix is available, we will:
  1. Release a patched version
  2. Publish a security advisory
  3. Credit the reporter (if agreed)

### Timeline

For critical security vulnerabilities:
- **48 hours**: Initial acknowledgment
- **7 days**: Detailed response and assessment
- **30 days**: Target for fix and coordinated disclosure
- **90 days**: Maximum disclosure timeline (even if not fully resolved)

## Security Best Practices for Users

If you're using this specification for any purpose:

1. **Verify test vectors** – Ensure your implementation matches `TEST_VECTORS.md`
2. **Use audited RNG** – Never use predictable random number generation
3. **Handle shares carefully** – Each share is sensitive; protect them
4. **Test recovery** – Always verify you can recover before relying on shares
5. **Check checksums** – Never skip checksum validation
6. **Use offline** – Perform sensitive operations on air-gapped machines

## Known Limitations

Current known limitations (not security vulnerabilities, but good to know):

- **No formal security proof**: While based on Shamir's scheme, this specific implementation lacks formal verification
- **Human error potential**: Manual arithmetic steps can introduce errors (checksums help but aren't foolproof)
- **Implementation variance**: Different implementations may have subtle differences
- **No entropy analysis**: Random number generation quality depends on implementation

## Security Roadmap

Before v1.0 release, we plan to:
- [ ] Independent cryptographic review
- [ ] Professional security audit
- [ ] Formal security model documentation
- [ ] Extensive fuzzing and edge case testing
- [ ] Peer review by established cryptographers

## Contact

- **Security issues**: security@grifortis.com *(or GitHub Security Advisory)*
- **General questions**: Open a GitHub Discussion
- **Project maintainer**: [@renatoslopes](https://github.com/renatoslopes)

## References

This specification builds on:
- Shamir, A. (1979). "How to Share a Secret"
- BIP39: Mnemonic code for generating deterministic keys
- Modern secret sharing research and best practices

---

**Remember**: When in doubt, report it. False positives are better than overlooked vulnerabilities.

*Last updated: November 25, 2025*

