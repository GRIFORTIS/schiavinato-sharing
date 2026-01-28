# Schiavinato Sharing: Specification & Reference Implementation

> ## ⚠️ EXPERIMENTAL - NOT AUDITED - DO NOT USE FOR REAL FUNDS
> 
> This specification has NOT been professionally audited. Use only for testing, learning, and experimentation.
> 
> **[See Security Status](#security-warning) for details.**

**Human-Executable Secret Sharing for BIP39 Mnemonics**

A pencil-and-paper arithmetic scheme for inheritance and disaster recovery

[![RFC Status](https://img.shields.io/badge/RFC-Active%20through%20Jan%202026-blue)](RFC.md)
[![Reference Tests](https://github.com/GRIFORTIS/schiavinato-sharing-spec/workflows/Reference%20Implementation%20Tests/badge.svg)](https://github.com/GRIFORTIS/schiavinato-sharing-spec/actions)
[![Security: Experimental](https://img.shields.io/badge/Security-⚠️%20Experimental-red)](https://github.com/GRIFORTIS/schiavinato-sharing-spec#security-warning)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Whitepaper: CC BY 4.0](https://img.shields.io/badge/Whitepaper-CC%20BY%204.0-green.svg)](LICENSE-WHITEPAPER.md)

---

## Overview

This repository contains the **complete specification** for the Schiavinato Sharing scheme, including:

- **Whitepaper**: [PDF](https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/latest/download/WHITEPAPER.pdf) ([LaTeX source](WHITEPAPER.tex)) - Full technical description of the scheme
- **[RFC Document](RFC.md)** - Request for Comments summary
- **[Test Vectors](TEST_VECTORS.md)** - Reproducible GF(2053) test vectors for validation
- **[Reference Implementation](reference-implementation/)** - Self-contained HTML/JavaScript tool

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
- **Whitepaper**: [PDF](https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/latest/download/WHITEPAPER.pdf) ([LaTeX source](WHITEPAPER.tex)) - Complete mathematical and conceptual description
- **[RFC.md](RFC.md)** - Request for Comments summary
- **[TEST_VECTORS.md](TEST_VECTORS.md)** - Reference test cases for validation
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guidelines for contributors
- **[SECURITY.md](.github/SECURITY.md)** - Security policy and vulnerability reporting

### Reference Implementation
- **[reference-implementation/](reference-implementation/)** - Self-contained HTML tool
  - Fully functional split/recover interface
  - Comprehensive test suite (Playwright)
  - No external dependencies beyond HTML/JS

### Documentation
- **[CHANGELOG.md](CHANGELOG.md)** - Version history
- **[PRELIMINARY_VALIDATION_STUDY.md](PRELIMINARY_VALIDATION_STUDY.md)** - Usability validation results
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community standards

---

## Supplementary Material

Supplementary artifacts are provided for clarity and reproducibility. They are **not** controlled usability studies.

- **Video: Full Manual Demonstration (12-word, 2-of-3)**  
  Complete end-to-end demonstration including introduction to Schiavinato Sharing, manual share generation, and manual recovery using pre-computed Lagrange coefficients with row checksums and GIC validation. No software, no printed templates.  
  Watch: [https://www.youtube.com/watch?v=VsEWstFWT2M](https://www.youtube.com/watch?v=VsEWstFWT2M)

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

## 🔐 Verifying Release Authenticity

**CRITICAL:** Before using the HTML file with real crypto seeds, verify it hasn't been tampered with.

All official releases are cryptographically signed with GRIFORTIS GPG key. Follow these steps to verify:

### Step 1: Import GRIFORTIS Public Key (One-Time Setup)

```bash
# Download and import the public key
curl -fsSL https://raw.githubusercontent.com/GRIFORTIS/schiavinato-sharing-spec/main/GRIFORTIS-PGP-PUBLIC-KEY.asc | gpg --import
```

**Expected output:**
```
gpg: key 4CFE6248C57F15DF: public key "GRIFORTIS <security@grifortis.com>" imported
gpg: Total number processed: 1
gpg:               imported: 1
```

**Verify the key fingerprint:**
```bash
gpg --fingerprint security@grifortis.com
```

**Expected fingerprint:**
```
7921 FD56 9450 8DA4 020E  671F 4CFE 6248 C57F 15DF
```

⚠️ **If the fingerprint doesn't match exactly, DO NOT proceed. Report it immediately.**

### Step 2: Download Release Files

Download both the HTML file and its signature from the [latest release](https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/latest):

```bash
# Example for v0.4.0 (replace with actual version)
wget https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/download/v0.4.0/schiavinato_sharing.html
wget https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/download/v0.4.0/schiavinato_sharing.html.asc
```

Or use `curl`:
```bash
curl -fsSL -O https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/download/v0.4.0/schiavinato_sharing.html
curl -fsSL -O https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/download/v0.4.0/schiavinato_sharing.html.asc
```

### Step 3: Verify the Signature

```bash
gpg --verify schiavinato_sharing.html.asc schiavinato_sharing.html
```

**Expected output (signature is GOOD):**
```
gpg: Signature made [date]
gpg:                using RSA key E73C2E9C97BB89D3B223C3E9E1AC5385F32E112A
gpg: Good signature from "GRIFORTIS <security@grifortis.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 7921 FD56 9450 8DA4 020E  671F 4CFE 6248 C57F 15DF
     Subkey fingerprint: E73C 2E9C 97BB 89D3 B223  C3E9 E1AC 5385 F32E 112A
```

✅ **"Good signature"** means the file is authentic and hasn't been modified.

⚠️ The "WARNING" about untrusted signature is normal - it means you haven't explicitly marked this key as trusted in your GPG keyring. As long as the fingerprint matches, the file is authentic.

### Step 4: Verify Checksums (Optional but Recommended)

```bash
# Download checksums and signature
curl -fsSL -O https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/download/v0.4.0/CHECKSUMS.txt
curl -fsSL -O https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/download/v0.4.0/CHECKSUMS.txt.asc

# Verify checksums file signature
gpg --verify CHECKSUMS.txt.asc CHECKSUMS.txt

# Verify HTML file checksum
sha256sum --check CHECKSUMS.txt --ignore-missing
```

**Expected output:**
```
schiavinato_sharing.html: OK
```

### Common Issues

**"gpg: command not found"**
- **macOS:** `brew install gnupg`
- **Ubuntu/Debian:** `sudo apt install gnupg`
- **Windows:** Install [Gpg4win](https://gpg4win.org/)

**"No public key"**
- You skipped Step 1. Import the public key first.

**"BAD signature"**
- ❌ **DO NOT USE THIS FILE.** It has been modified or corrupted.
- Download again from official GitHub releases only.
- If problem persists, report to security@grifortis.com

### Why Verify?

Without verification, you cannot be certain:
- The file came from GRIFORTIS
- The file wasn't modified by an attacker
- You're running the correct, audited code

For a tool managing crypto seeds worth potentially millions, **verification is not optional.**

---

## Getting Started

### For Users
1. Read the Whitepaper ([PDF](https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/latest/download/WHITEPAPER.pdf) or [LaTeX source](WHITEPAPER.tex)) to understand the scheme
2. Try the [Reference Implementation](reference-implementation/) to experiment
3. Use a [Production Library](#production-implementations) for real applications

### For Developers
1. Review [Test Vectors](TEST_VECTORS.md) to validate your implementation
2. Check [Contributing Guidelines](CONTRIBUTING.md) to help improve the spec
3. Report issues via GitHub Issues

### For Researchers
1. Analyze the Whitepaper ([PDF](https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/latest/download/WHITEPAPER.pdf) or [LaTeX source](WHITEPAPER.tex)) for cryptographic properties
2. Provide feedback via GitHub Issues (use the "Whitepaper Feedback" template)
3. Help improve clarity, correctness, and examples

---

## RFC Status

**Request for Comments Period**: Through January 31, 2026

This specification is currently in RFC status, seeking community review and feedback. We welcome:

- Mathematical analysis and critique
- Security review and vulnerability discovery
- Formal verification efforts
- Implementation feedback
- Documentation improvements

See [RFC.md](RFC.md) for details.

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

---

## Security Validation Experiments

This repository includes cryptographic security validation experiments in `security-validation/`:

### Completed Experiments
- **Experiment 1: Entropy Conservation** ✅ - Validates effective search space remains ≥ 2^256
- **Experiment 2: Adversarial Constraint Solving** ✅ - Tests against sophisticated constraint-solving attacks

See [security-validation/README.md](security-validation/README.md) for details on running experiments and interpreting results.

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

---

**Status**: Experimental (RFC Period through January 31, 2026)  
**Created by**: [Renato Schiavinato Lopez](https://github.com/renatoslopes)  
**Maintained by**: [GRIFORTIS](https://github.com/GRIFORTIS)

---

*For questions, suggestions, or collaboration opportunities, please open an issue or discussion on GitHub.*
