# Schiavinato Sharing (Specification)

[![Security: Experimental](https://img.shields.io/badge/Security-⚠️%20EXPERIMENTAL%20⚠️-red)](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md)
[![CI](https://github.com/GRIFORTIS/schiavinato-sharing/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/GRIFORTIS/schiavinato-sharing/actions/workflows/ci.yml)
[![CodeQL](https://github.com/GRIFORTIS/schiavinato-sharing/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/GRIFORTIS/schiavinato-sharing/actions/workflows/codeql.yml)
[![Whitepaper: CC BY 4.0](https://img.shields.io/badge/Whitepaper-CC%20BY%204.0-green.svg)](LICENSE-WHITEPAPER.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> ## ⚠️ WARNING: EXPERIMENTAL SOFTWARE ⚠️
> 
> DO NOT USE IT FOR REAL FUNDS!
>
> Schiavinato Sharing specification and implementations have NOT been audited. Use for testing, learning, and experimentation only. See [SECURITY](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md) for details.
>
> We invite **cryptographers** and **developers** to review the spec and software. See [CONTRIBUTING](https://github.com/GRIFORTIS/.github/blob/main/CONTRIBUTING.md) to know more.

## About Schiavinato Sharing

**In one line:** Schiavinato Sharing splits a standard **BIP39** recovery phrase into **k-of-n** shares, so a chosen number of shares can recover it while fewer shares reveal nothing; the normal path uses **offline software**, and the same core math can also be **created and recovered by hand** on paper.

### Problem

Self-custody of crypto assets often depends on one recovery phrase. If it is lost, funds may be gone forever; if it is exposed, funds may be stolen. A good long-term backup needs more than secrecy: it should survive missing or unavailable custodians, catch common copying mistakes, remain understandable years later, and recover into the same wallet standard people already use.

Schiavinato Sharing focuses on **cold storage and disaster recovery**. It is intended for long-term self-custody setups where a person, family, business, or advisor wants durable threshold backup of an existing seed phrase without making sharing or future recovery permanently depend on one app, device, vendor, software implementation, or custom share alphabet.

### What Schiavinato Sharing is

A **Shamir-style** secret sharing scheme applied directly to the words of a valid BIP39 mnemonic. Each word is treated as its **1-based index** in the BIP39 word list (`abandon` = 1, `zoo` = 2048), and the sharing math runs modulo **2053**, the smallest prime larger than the word list.

Any **k** of **n** shares reconstruct the original mnemonic. Fewer than **k** shares reveal no information about it, under the standard information-theoretic secrecy claim of Shamir sharing (view Reduced Mode below). The optional **BIP39 passphrase** ("25th word") is **NOT** stored in the shares and must be backed up and re-entered separately if you use one.

### What it does and how

- **Threshold backup:** Split one BIP39 phrase into **n** shares and choose how many are needed to recover it. Typical examples are 2-of-3, 2-of-4, or 3-of-5.
- **Human-readable shares:** A share is a table of numbers and word indices with checksums, optionally paired with a QR payload for software-assisted validation. A separate optional manifest can track the shares, their destinations, and audit fingerprints without containing the mnemonic or plaintext share contents.
- **Offline-first workflow:** The recommended ceremony uses an air-gapped tool to do the error-prone arithmetic, guide the user, create share tables, and optionally produce QR payloads and manifests.
- **Full manual path:** The same protocol can be executed without software: shares can be **created** and later **recovered** with paper tables, modular arithmetic, random coefficients, checksums, and precomputed Lagrange coefficients. Software is helpful, not mandatory forever.
- **Error detection:** Row checksums, column checksums, and a **Global Integrity Check** help catch arithmetic mistakes, transcription errors, damaged entries, and wrong share labels before they silently become a bad recovery.
- **Reduced Mode:** An optional software-assisted profile makes QR codes and hand transcription smaller and easier, especially when printer trust is limited. It is an accessibility trade-off: Full Mode remains the default for maximum assurance, while Reduced Mode accepts a small, quantified bias and fewer digital transport checks in exchange for easier handling.
- **Per-share audit:** In software-assisted workflows, one share can be checked before recovery without combining it with other shares. A QR payload can carry transport checks and GIC binding, while a separately stored manifest can commit to each share with an audit hash.
- **Post-recovery validation:** After recovery, software can check the BIP39 checksum, compare a mnemonic-bound **Blinded Identity**, and optionally compare a truncated **Recovery Verification Address (RVA)** re-derived offline from the intended wallet setup.
- **Nested custody:** A share can itself be shared again, enabling layered arrangements such as family, business, trustee, or inheritance structures. The current envelope supports up to **four active layers**, while single-layer sharing remains the baseline workflow.
- **Output choices:** The protocol distinguishes printer trust levels, so secret-bearing material is only sent to devices appropriate for the ceremony. When printing is not trusted or not available, users can hand-transcribe the share tables and, where used, copy or paint the QR grids by hand.
- **Pause and resume:** Longer software-assisted ceremonies can be paused and resumed with encrypted resume artifacts. A companion app may help store or transport those encrypted artifacts and non-secret print materials without seeing the mnemonic, plaintext shares, coefficients, or recovery secret.

### What it is not

- **Not** multisig, MPC, or a spending policy. It protects recovery material; it does not decide who may sign transactions.
- **Not** protection against every real-world threat. Physical security, custodian selection, ceremony hygiene, and malware resistance still matter.
- **Not** magic against **k or more compromised shares**. If enough valid shares are exposed, the mnemonic can be recovered.
- **Not** authentication by checksums alone. A malicious party who can rewrite a whole share may also recompute its arithmetic checks; substitution detection comes from custody practice, manifests, identity checks, and wallet-context checks where used.
- **Not** audited production cryptography; treat as **experimental**.

### Comparison with related approaches

MPC wallets, on-chain multisig, and social-recovery contracts mostly answer **who may spend** and **under what online policy**. Schiavinato Sharing answers a narrower backup question: how to split an **existing BIP39 mnemonic** into durable threshold shares, optionally audit one share at a time, and later recover the **same standard mnemonic** ordinary wallets already import—with a software-assisted path and a fully manual path.

**Manual-capable mnemonic backup schemes**

Codex32 uses BCH codes and paper aids such as volvelles and tables. It provides strong manual error handling, but it does not round-trip a standard BIP39 mnemonic. SeedXOR is deliberately minimal: XOR splitting has a simple mental model and BIP39-shaped output, but it is n-of-n only and offers little structured detection when something is wrong.

| Feature | Schiavinato | Codex32 | SeedXOR |
| --- | --- | --- | --- |
| Primary scope | BIP39 | Bitcoin/BIP32 only | BIP39 |
| Threshold flexibility | Full *k-of-n* | *k-of-n* (k<=9, n<=31) | *n-of-n* only |
| Manual procedure | Integer arithmetic mod 2053 | BCH + volvelles/tables | XOR |
| Error handling | Detection (*d*=4 linear layer) | Correction (BCH) | Weak / none |
| Per-share pre-recovery check | Yes (a) | Error detection only | No |
| Post-recovery verification | BIP39 + optional RVA; blinded identity in software-assisted flows (b) | Not BIP39-native output | BIP39 only |
| BIP39 round-trip | Native I/O | No | Yes |
| Share representation | Paper table + optional QR | Custom bech32 strings | BIP39 words |
| Recursive composition | Yes | Flat | Flat |

**(a)** In the computational profile, Transport Hash, GIC binding, and row/column arithmetic let you validate one share without recombination; a manifest audit hash helps when the manifest is stored separately from the shares. **(b)** RVA is a truncated wallet witness recorded at setup and re-derived after recovery. Blinded Identity is the mnemonic-bound tag used in software-assisted ceremonies.

**Software-oriented threshold schemes**

SLIP39 and SSKR are built for software-led recovery. Both use sound finite-field sharing, but neither specifies a plain pencil-and-paper prime-field path for the full ceremony. SLIP39 uses a different derivation model than BIP39, so the same underlying material does not restore the same wallet as a normal BIP39 mnemonic. SSKR preserves BIP39 round-trip behavior by operating on raw entropy and packaging shares as Bytewords or UR; recovery still assumes the decoding stack is available.

| Feature | Schiavinato | SLIP39 | SSKR |
| --- | --- | --- | --- |
| Arithmetic domain | Prime GF(2053) | GF(2^8) + RS1024 checksum | Extension GF(2^8) |
| Wallet compatibility | Native BIP39 | Different derivation (a) | BIP39 round-trip via raw entropy (b) |
| Share encoding | Table + optional QR | Custom 20-word encoding | Bytewords / UR |
| Per-share pre-recovery check | Yes (c) | Share checksum only | Share checksum only |
| Post-recovery verification | BIP39 + blinded identity + RVA (d) | Reconstruction digest in polynomial (e) | BIP39 checksum |
| Non-software path | Yes, sharing and recovery | No | No |
| Manual arithmetic | Integer mod 2053 | No | No |

**(a)** SLIP39 restoration does not reproduce a standard BIP39 wallet from the same encoded material. **(b)** SSKR preserves the usual BIP39 seed when round-tripped through its documented encodings; the share transport is not aimed at hand evaluation of GF arithmetic. **(c)** Transport Hash, GIC binding, row/column checks, and an optional manifest audit hash support single-share verification without recombination. **(d)** Blinded Identity tests the recovered mnemonic against the session tag; RVA tests the intended wallet context, including derivation and optional passphrase. **(e)** SLIP39 embeds a four-byte reconstruction digest in the polynomial so the reconstructed master secret self-checks.


## Canonical documents
- **Whitepaper**: [PDF](whitepaper/WHITEPAPER.pdf) | [LaTeX](whitepaper/WHITEPAPER.tex)
- **Current manual execution specification**: [`manual_spec/README`](manual_spec/README.md)
- **Current software (digital envelope) specification**: [`software_spec/README`](software_spec/README.md)
- **Test vectors**: [`test_vectors/README`](test_vectors/README.md)
- **Previous version archives**: [`previous_versions/README`](previous_versions/README.md)
- **Security policy**: [SECURITY](https://github.com/GRIFORTIS/.github/blob/main/SECURITY.md)
- **Proposals**: [`proposals/`](proposals/)

## Implementations
Prototype implementations are work in progress and may lag the current v0.6.0 specification. They are useful for experimentation and review, but should not be treated as v0.6.0-conformant until each repository explicitly declares support for the current spec and vectors:
- **HTML (single-file, air-gapped)**: [`schiavinato-sharing-html`](https://github.com/GRIFORTIS/schiavinato-sharing-html)
- **JavaScript/TypeScript**: [`schiavinato-sharing-js`](https://github.com/GRIFORTIS/schiavinato-sharing-js)
- **Python**: [`schiavinato-sharing-py`](https://github.com/GRIFORTIS/schiavinato-sharing-py)

## What reviewers should look at
Start here:
- [`docs/review`](docs/review.md)

High-value review targets:
- Correctness and clarity of manual validation checkpoints (row checksums, column checksums, and GIC)
- Security analysis and threat model assumptions (see `whitepaper/WHITEPAPER.tex`)
- Backwards decode/versioning rules for the envelope (`software_spec/`)
- Software-assisted ceremony flow diagrams (`docs/software-flows/`)
- Conformance vectors (`test_vectors/`)

## Licenses
- **Code**: [MIT License](LICENSE)
- **Whitepaper**: [CC BY 4.0](LICENSE-WHITEPAPER.md)

## Release authenticity
- Release source state is anchored on signed git tags.
- Release assets such as `WHITEPAPER.pdf` and `CHECKSUMS.txt` are intended to be signed locally and published with detached `.asc` signatures.
- Use [`RELEASE.md`](RELEASE.md) for the maintainer workflow and [`docs/release-verification.md`](docs/release-verification.md) for public verification guidance.

---

**Status**: Experimental  
**Created by**: [Renato Schiavinato Lopez](https://github.com/renatoslopes)  
**Maintained by**: [GRIFORTIS](https://github.com/GRIFORTIS)
