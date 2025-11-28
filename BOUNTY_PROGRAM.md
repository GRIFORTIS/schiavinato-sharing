# Schiavinato Sharing Bounty Program

**Status**: Active through January 31, 2026  
**Total Pool**: $10,000 USD maximum across all categories

---

## Overview

To encourage rigorous analysis of the Schiavinato Sharing specification, GRIFORTIS has established a bounty program for vulnerability discovery, formal verification, and significant improvements.

This program is part of the RFC (Request for Comments) process and aims to ensure the specification is thoroughly vetted before v1.0 release.

---

## Bounty Categories

### 1. Critical Vulnerability Discovery

**Reward**: $5,000 USD + Named acknowledgment in v1.0 specification + Co-authorship on security advisory

**Qualifying Criteria**:
- Must demonstrate an actual mathematical flaw in the scheme specification itself (Sections 3-4 of the whitepaper)
- NOT implementation bugs in software
- Examples of qualifying vulnerabilities:
  - Proof that checksums fail with >1% probability under adversarial corruption
  - Demonstration that k-1 shares + checksums leak >1 bit of entropy
  - Proof that field choice enables attack faster than O(2^11) per share

**Note**: GRIFORTIS retains sole discretion in determining whether a submission qualifies as "fundamental." Borderline cases may receive acknowledgment without financial reward.

---

### 2. Formal Verification

**Reward**: $2,000 USD (paid in stages) + Named acknowledgment

**Payment Structure**:
- $500 on proof outline acceptance
- $1,500 on machine-checked completion

**Qualifying Criteria**:
- Complete formal proof of core properties in Coq, Isabelle, or Lean
- Must cover at least one complete core operation:
  - Polynomial evaluation
  - Lagrange interpolation
  - Checksum bounds
- Machine-checkable proof with publicly available source code
- Clear documentation
- Submitter must demonstrate understanding and be able to defend the proof in technical discussion
- AI assistance must be disclosed (AI-assisted work is acceptable)
- GRIFORTIS may request revisions or clarifications before final payment

---

### 3. Significant Security Improvement

**Reward**: $250-$1,000 (discretionary based on impact) + Named acknowledgment + Potential integration in v1.1

**Qualifying Criteria**:
- Propose a backwards-compatible enhancement that measurably strengthens security
- Must not break existing implementations
- Clear demonstration of security improvement
- Practical implementation path

---

### 4. Implementation in Additional Language

**Reward**: Named acknowledgment + Prominent repository linking + Discretionary stipend (negotiable)

**Qualifying Criteria**:
- Production-quality implementation in Rust, Go, or C
- Full test coverage matching TEST_VECTORS.md
- Comprehensive documentation
- MIT licensed (compatible with specification)
- Passes all canonical test vectors

---

## Program Terms

### Eligibility
- **First submission only**: Each bounty category awards only the first qualifying submission
- Subsequent valid submissions receive acknowledgment without financial reward
- All findings, whether qualifying for bounty or not, will be acknowledged in release notes

### Timeline
- **Valid through**: January 31, 2026
- GRIFORTIS reserves the right to extend, modify, or terminate with 30 days notice

### Payment
- Upon qualification determination, payment via:
  - Bitcoin
  - Ethereum
  - Bank transfer
  - Other mutually agreed method
- Payment within 30 days of qualification

### Disclosure Requirements
- **AI disclosure**: All submissions must disclose any AI assistance used in analysis or proof construction
- **Public disclosure**: Non-security-sensitive findings will be discussed publicly
- **Embargo**: Critical vulnerabilities may be held under embargo until patched

### Final Authority
- GRIFORTIS decisions on qualification are final and not subject to appeal
- Total bounty pool cap: $10,000 USD maximum across all categories

---

## How to Submit

### For Critical Vulnerabilities

**DO NOT** open a public issue with vulnerability details.

**Instead**:
1. Report privately via GitHub Security Advisories:
   https://github.com/GRIFORTIS/schiavinato-sharing-spec/security
2. Or email: security@grifortis.com
3. Subject: `[BOUNTY] Critical Vulnerability - Brief Description`
4. Include:
   - Detailed description of the vulnerability
   - Mathematical proof or demonstration
   - Potential impact assessment
   - Suggested fix (if available)

**Response Time**: Within 48 hours

---

### For Formal Verification

1. Open a GitHub Discussion:
   https://github.com/GRIFORTIS/schiavinato-sharing-spec/discussions
2. Title: `[BOUNTY] Formal Verification - [Property Name]`
3. Include:
   - Proof outline
   - Chosen proof assistant (Coq/Isabelle/Lean)
   - Timeline estimate
   - Any AI assistance used

**Review Process**:
- Initial outline review: 7 days
- Feedback and iteration
- Final submission review: 14 days

---

### For Security Improvements

1. Open a GitHub Issue:
   https://github.com/GRIFORTIS/schiavinato-sharing-spec/issues
2. Use template: "Feature Request"
3. Title: `[BOUNTY] Security Improvement - Brief Description`
4. Include:
   - Current limitation
   - Proposed improvement
   - Security analysis
   - Backwards compatibility assessment

---

### For Language Implementations

1. Create your implementation in a public repository
2. Open a GitHub Discussion:
   https://github.com/GRIFORTIS/schiavinato-sharing-spec/discussions
3. Title: `[BOUNTY] [Language] Implementation`
4. Include:
   - Repository link
   - Test coverage report
   - Documentation
   - Compliance with TEST_VECTORS.md

---

## Evaluation Process

### Stage 1: Initial Review (7 days)
- GRIFORTIS team reviews submission
- Determines if submission is complete and in scope
- Requests clarifications if needed

### Stage 2: Technical Evaluation (14-30 days)
- Deep technical review
- May involve external reviewers
- Testing and validation
- Discussion with submitter

### Stage 3: Qualification Decision
- GRIFORTIS makes final determination
- Communicates decision with rationale
- Arranges payment for qualifying submissions

---

## Additional Engagement Channels

### For Cryptographers and Security Researchers
- **Bitcoin-dev mailing list**: bitcoin-dev@lists.linuxfoundation.org
  - Subject prefix: `[Schiavinato RFC]`
- **GitHub Discussions**: Public technical discussion
- **GitHub Security Advisories**: Private vulnerability reports

### For Bitcoin Core Developers
- Does this approach merit a BIP proposal?
- What modifications would be required?
- Are there Bitcoin Core descriptor wallet integration opportunities?
- Could this complement existing multisig or time-lock strategies?

### For Hardware Wallet Manufacturers
- What are the UX implications of generating shares on hardware?
- Would QR-based share scanning be valuable in your product roadmap?
- What audit depth would you require before considering integration?

### For Academic Researchers
- Is this suitable for submission to Financial Cryptography, IEEE S&P, PETS, or similar venues?
- What additional formal analysis would strengthen the theoretical foundations?
- Are there related problems in human-computable cryptography this informs?

---

## What Would Disqualify the Specification

In the spirit of falsifiability, the following findings would necessitate significant revision or abandonment:

1. Demonstration that the checksum mechanism fails to detect errors with >1% probability under realistic error models
2. Discovery of a correlation between BIP39 indices and GF(2053) arithmetic that leaks >1 bit of entropy per share
3. Proof that manual recovery is impractical for >90% of users under controlled testing
4. Identification of a fundamental incompatibility with existing BIP39 wallets
5. Evidence that GF(2053) field size enables brute-force attacks faster than O(2^11) per share

---

## RFC Timeline

- **RFC Period**: Through January 31, 2026
- **Response Guarantee**: All substantive technical comments will receive a response within 7 days
- **Transparency**: All feedback (except private security disclosures) will be publicly visible
- **Iteration**: Meaningful suggestions will be incorporated in draft revisions posted to the repository
- **v1.0 Target**: February 2026, incorporating community feedback

---

## Acknowledgment Philosophy

All findings, whether qualifying for bounty or not, will be acknowledged in release notes and public communications. The goal is community-driven validation, not bounty hunting.

We believe that rigorous peer review is essential for any cryptographic scheme, especially one designed for long-term asset protection. This bounty program is an investment in the security and reliability of the Schiavinato Sharing specification.

---

## Questions?

- **General questions**: Open a GitHub Discussion
- **Bounty eligibility**: bounty@grifortis.com
- **Security issues**: security@grifortis.com
- **Technical feedback**: Use GitHub Issues with appropriate templates

---

## Links

- **Whitepaper**: [WHITEPAPER.md](WHITEPAPER.md)
- **RFC Document**: [RFC.md](RFC.md)
- **Test Vectors**: [TEST_VECTORS.md](TEST_VECTORS.md)
- **Reference Implementation**: [reference-implementation/](reference-implementation/)
- **Security Policy**: [.github/SECURITY.md](.github/SECURITY.md)
- **Contributing Guidelines**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

**Last Updated**: November 27, 2025  
**Program Status**: Active  
**Valid Through**: January 31, 2026

