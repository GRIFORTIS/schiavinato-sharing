# Schiavinato Sharing: Specification & Reference Implementation

**Human-Executable Secret Sharing for BIP39 Mnemonics**

A pencil-and-paper arithmetic scheme for inheritance and disaster recovery

[![RFC Status](https://img.shields.io/badge/RFC-Active%20through%20Jan%202026-blue)](RFC.md)
[![Reference Tests](https://github.com/GRIFORTIS/schiavinato-sharing-spec/workflows/Reference%20Implementation%20Tests/badge.svg)](https://github.com/GRIFORTIS/schiavinato-sharing-spec/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Whitepaper: CC BY 4.0](https://img.shields.io/badge/Whitepaper-CC%20BY%204.0-green.svg)](LICENSE-WHITEPAPER.md)

---

## Overview

This repository contains the **complete specification** for the Schiavinato Sharing scheme, including:

- **[Whitepaper](WHITEPAPER.md)** - Full technical description of the scheme
- **[RFC Document](RFC.md)** - Request for Comments summary
- **[Test Vectors](TEST_VECTORS.md)** - Reproducible GF(2053) test vectors for validation
- **[Reference Implementation](reference-implementation/)** - Self-contained HTML/JavaScript tool
- **[Bounty Program](BOUNTY_PROGRAM.md)** - Active through January 31, 2026

---

## What is Schiavinato Sharing?

Schiavinato Sharing is a secret-sharing scheme specifically designed for **BIP39 mnemonic phrases** using **basic arithmetic in GF(2053)**. Unlike other schemes, it can be performed entirely **by hand** with pencil and paper, making it ideal for:

- Long-term inheritance planning
- Disaster recovery scenarios
- Situations where digital tools are unavailable or untrusted
- Family backup strategies

### Key Features

- **Human-executable**: Designed for pencil-and-paper computation
- **BIP39-native**: Works directly with standard Bitcoin mnemonics
- **Threshold schemes**: Support for k-of-n sharing (e.g., 2-of-3, 3-of-5)
- **Cryptographically sound**: Based on Shamir's Secret Sharing principles
- **Built-in checksums**: Detects errors in manual computation

---

## Repository Contents

### Core Specification
- **[WHITEPAPER.md](WHITEPAPER.md)** - Complete mathematical and conceptual description
- **[RFC.md](RFC.md)** - Request for Comments summary
- **[TEST_VECTORS.md](TEST_VECTORS.md)** - Reference test cases for validation
- **[BOUNTY_PROGRAM.md](BOUNTY_PROGRAM.md)** - Active bounty program details
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guidelines for contributors
- **[SECURITY.md](.github/SECURITY.md)** - Security policy and vulnerability reporting

### Reference Implementation
- **[reference-implementation/](reference-implementation/)** - Self-contained HTML tool
  - Fully functional split/recover interface
  - Comprehensive test suite (Playwright)
  - No external dependencies beyond HTML/JS

### Documentation
- **[CHANGELOG.md](CHANGELOG.md)** - Version history
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community standards

### Licenses
- **Code**: [MIT License](LICENSE)
- **Whitepaper**: [Creative Commons Attribution 4.0 (CC BY 4.0)](LICENSE-WHITEPAPER.md)

---

## Production Implementations

This repository provides the **specification and reference implementation**. For production use, see our language-specific libraries:

### JavaScript/TypeScript

**[@grifortis/schiavinato-sharing](https://github.com/GRIFORTIS/schiavinato-sharing-js)**

Production-ready npm package for Node.js and browser environments.

```bash
npm install @grifortis/schiavinato-sharing
```

### Python

**[schiavinato-sharing](https://github.com/GRIFORTIS/schiavinato-sharing-py)**

PyPI package for Python applications. (Coming soon)

```bash
pip install schiavinato-sharing
```

---

## Using the Reference Implementation

The HTML reference implementation is a **single, self-contained file** that runs entirely in your browser:

1. [Download schiavinato_sharing.html](reference-implementation/schiavinato_sharing.html)
2. Open it in any modern web browser (Chrome, Firefox, Safari, Edge)
3. Follow the on-screen instructions to split or recover mnemonics

**No installation, no dependencies, no network connection required.**

### Running Tests

The reference implementation includes a comprehensive test suite:

```bash
cd reference-implementation
npm install
npm test
```

See [reference-implementation/README.md](reference-implementation/README.md) for details.

---

## Getting Started

### For Users
1. Read the [Whitepaper](WHITEPAPER.md) to understand the scheme
2. Try the [Reference Implementation](reference-implementation/) to experiment
3. Use a [Production Library](#production-implementations) for real applications

### For Developers
1. Review [Test Vectors](TEST_VECTORS.md) to validate your implementation
2. Check [Contributing Guidelines](CONTRIBUTING.md) to help improve the spec
3. Report issues via GitHub Issues

### For Researchers
1. Analyze the [Whitepaper](WHITEPAPER.md) for cryptographic properties
2. Provide feedback via GitHub Issues (use the "Whitepaper Feedback" template)
3. Review the [Bounty Program](BOUNTY_PROGRAM.md) for rewards
4. Help improve clarity, correctness, and examples

---

## RFC Status

**Request for Comments Period**: Through January 31, 2026

This specification is currently in RFC status, seeking community review and feedback. We welcome:

- Mathematical analysis and critique
- Security review and vulnerability discovery
- Formal verification efforts
- Implementation feedback
- Documentation improvements

See [RFC.md](RFC.md) for details and [BOUNTY_PROGRAM.md](BOUNTY_PROGRAM.md) for rewards.

---

## Security Warning

**Status**: Experimental - Not Audited

While Schiavinato Sharing is based on well-established cryptographic principles (Shamir's Secret Sharing), this specific implementation has **NOT** been professionally audited.

**DO NOT USE FOR REAL FUNDS** until:
- Professional security audit completed
- Extensive peer review conducted
- Production testing in controlled environments
- v1.0 release

For now, use this for **learning, experimentation, and contribution only**.

See our [Security Policy](.github/SECURITY.md) for reporting vulnerabilities.

---

## Contributing

We welcome contributions! Whether you're:

- Improving documentation clarity
- Finding bugs or edge cases
- Providing mathematical analysis
- Enhancing the reference implementation
- Translating documentation

Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Bounty Program

Active bounty program with rewards up to $10,000 for:
- Critical vulnerability discovery ($5,000)
- Formal verification ($2,000)
- Security improvements ($250-$1,000)
- Additional language implementations

See [BOUNTY_PROGRAM.md](BOUNTY_PROGRAM.md) for full details.

---

## Testing

### Reference Implementation Tests

```bash
cd reference-implementation
npm install
npm test
```

### Linting

```bash
cd reference-implementation
npm run lint
```

### Checksum Verification

```bash
# Linux/macOS
./scripts/verify-checksums.sh v0.1.0

# Windows
.\scripts\verify-checksums.ps1 v0.1.0
```

---

## License

This project uses a **dual license model**:

- **Code & Reference Implementation**: [MIT License](LICENSE)
  - You may use, modify, and distribute freely with attribution

- **Whitepaper**: [CC BY 4.0](LICENSE-WHITEPAPER.md)
  - You may share and adapt, including commercially, with attribution

---

## Links

- **Organization**: [GRIFORTIS](https://github.com/GRIFORTIS)
- **JavaScript Library**: [schiavinato-sharing-js](https://github.com/GRIFORTIS/schiavinato-sharing-js)
- **Python Library**: [schiavinato-sharing-py](https://github.com/GRIFORTIS/schiavinato-sharing-py)
- **Issue Tracker**: [GitHub Issues](https://github.com/GRIFORTIS/schiavinato-sharing-spec/issues)
- **Discussions**: [GitHub Discussions](https://github.com/GRIFORTIS/schiavinato-sharing-spec/discussions)

---

## Acknowledgments

This work builds on decades of research in secret sharing, particularly:

- Adi Shamir's original Secret Sharing Scheme (1979)
- BIP39 specification for Bitcoin mnemonics
- The broader open-source cryptography community

Special thanks to all contributors and reviewers who help make this specification robust and accessible.

---

## Support

- **Documentation**: See [specification repo](https://github.com/GRIFORTIS/schiavinato-sharing-spec)
- **Bug Reports**: [Open an issue](https://github.com/GRIFORTIS/schiavinato-sharing-spec/issues)
- **Discussions**: [GitHub Discussions](https://github.com/GRIFORTIS/schiavinato-sharing-spec/discussions)
- **Security**: security@grifortis.com
- **Bounty Program**: bounty@grifortis.com

---

**Status**: Experimental (RFC Period through January 31, 2026)  
**Created by**: [Renato Schiavinato Lopez](https://github.com/renatoslopes)  
**Maintained by**: [GRIFORTIS](https://github.com/GRIFORTIS)

---

*For questions, suggestions, or collaboration opportunities, please open an issue or discussion on GitHub.*
