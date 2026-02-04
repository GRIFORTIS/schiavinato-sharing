# Schiavinato Sharing (Specification)

[![Security: Experimental](https://img.shields.io/badge/Security-⚠️%20EXPERIMENTAL%20⚠️-red)](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/.github/SECURITY.md)
[![CI](https://github.com/GRIFORTIS/schiavinato-sharing/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/GRIFORTIS/schiavinato-sharing/actions/workflows/ci.yml)
[![CodeQL](https://github.com/GRIFORTIS/schiavinato-sharing/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/GRIFORTIS/schiavinato-sharing/actions/workflows/codeql.yml)
[![Whitepaper: CC BY 4.0](https://img.shields.io/badge/Whitepaper-CC%20BY%204.0-green.svg)](LICENSE-WHITEPAPER.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> ## ⚠️ WARNING: EXPERIMENTAL SOFTWARE ⚠️
> 
>DO NOT USE IT FOR REAL FUNDS!
>
> Schiavinato Sharing specification and implementations have NOT been audited. Use for testing, learning, and experimentation only. See [SECURITY](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/.github/SECURITY.md) for details.
>
>We invite **cryptographers** and **developers** to review the spec and software. See [CONTRIBUTING](https://github.com/GRIFORTIS/schiavinato-sharing/blob/main/.github/CONTRIBUTING.md) to know more.

**Dual-mode threshold secret sharing for BIP39 mnemonics over \(GF(2053)\)** — designed to be executable both by software and by hand (pencil & paper), with validation checkpoints to prevent silent mistakes.

## Canonical documents
- **Manual protocol specifications**: [`manual_spec/README`](manual_spec/README.md)
- **Software (Digital envelope) specificatons**: [`software_spec/README`](software_spec/README.md)
- **Proposals**: [`proposals/`](proposals/)
- **Test vectors**: [`test_vectors/README`](test_vectors/README.md)
- **Whitepaper**: [PDF (latest)](https://github.com/GRIFORTIS/schiavinato-sharing/releases/latest/download/WHITEPAPER.pdf) | [Releases (versioned PDF)](https://github.com/GRIFORTIS/schiavinato-sharing/releases) | [LaTeX](whitepaper/WHITEPAPER.tex)
- **Security policy**: [SECURITY](.github/SECURITY.md)

## Implementations
These implementations aim to be compatible with the canonical spec documents above:
- **HTML (single-file, air-gapped)**: [`schiavinato-sharing-html`](https://github.com/GRIFORTIS/schiavinato-sharing-html)
- **JavaScript/TypeScript**: [`schiavinato-sharing-js`](https://github.com/GRIFORTIS/schiavinato-sharing-js)
- **Python**: [`schiavinato-sharing-py`](https://github.com/GRIFORTIS/schiavinato-sharing-py)

## What reviewers should look at
Start here:
- [`docs/review`](docs/review.md)

High-value review targets:
- Correctness and clarity of manual validation checkpoints (row checksum + GIC)
- Security analysis and threat model assumptions (see `whitepaper/WHITEPAPER.tex`)
- Backwards decode/versioning rules for the envelope (`software_spec/`)
- Conformance vectors (`test_vectors/`)

## Licenses
- **Code**: [MIT License](LICENSE)
- **Whitepaper**: [CC BY 4.0](LICENSE-WHITEPAPER.md)

---

**Status**: Experimental  
**Created by**: [Renato Schiavinato Lopez](https://github.com/renatoslopes)  
**Maintained by**: [GRIFORTIS](https://github.com/GRIFORTIS)
