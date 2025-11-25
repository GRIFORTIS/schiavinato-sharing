## Contributing to Schiavinato Sharing

This project follows the organization-wide GRIFORTIS contributing guidelines. For canonical rules, see:

- **[`GRIFORTIS/.github/CONTRIBUTING.md`](https://github.com/GRIFORTIS/.github/blob/main/CONTRIBUTING.md)**

The sections below provide additional, project-specific notes and legacy detail for Schiavinato Sharing.

Thank you for your interest in contributing to the Schiavinato Sharing project. This repository currently focuses on the **whitepaper** and related reference materials for a human-executable BIP39 mnemonic sharing scheme.

Because this work touches real financial security, we ask contributors to adhere to the following guidelines.

---

## Ways to Contribute

- **Review and feedback on the whitepaper**  
  - Suggest clarifications, fix typos, or propose reorganization to improve readability.  
  - Point out ambiguous wording or missing assumptions in the threat model and operational guidance.

- **Technical validation**  
  - Check the mathematical arguments and derivations for correctness.  
  - Verify examples, tables (e.g., pre-computed coefficients), and worked calculations.
  - Use `TEST_VECTORS.md` as a concrete $GF(2053)$ test case for sharing and recovery logic.

- **Reference implementations and tooling**  
  - Propose or build small, auditable tools that implement parts of the scheme (e.g., GF(2053) arithmetic, Lagrange coefficient calculators, or worksheet generators).  
  - Keep such implementations minimal, well-documented, and aligned with the whitepaper’s specification.

---

## Pull Request Guidelines

1. **Open an issue first (recommended)**  
   - For substantial changes (new sections, major rewrites, new tools), please open a GitHub issue to discuss your proposal before investing significant effort.

2. **Keep changes focused**  
   - Prefer small, well-scoped pull requests over large, sweeping edits.  
   - Separate editorial changes (typos, formatting) from conceptual or security-relevant changes when possible.

3. **Document your reasoning**  
   - In your PR description, explain *why* the change is needed and how it aligns with the goals of Schiavinato Sharing (human executability, clarity, interoperability, security).

4. **Preserve safety warnings and threat model clarity**  
   - Do not weaken or remove caveats, disclaimers, or safety notes without careful discussion.  
   - If you believe wording is alarmist or unclear, suggest alternatives that remain honest about risks.

5. **Style and formatting**  
   - Use Markdown consistently (headings with `##` and `###`, lists, fenced code blocks for examples).  
   - Follow the existing tone: precise but accessible, with math rendered using inline or block LaTeX where appropriate.

---

## Code and Security-Sensitive Contributions

If you contribute code (for example, reference implementations or tooling):

- Keep it **small, auditable, and dependency-light**.  
- Include tests or examples where practical.  
- Clearly mark experimental or non-production-ready components.

If you believe you have found a **security issue** or a subtle failure mode (whether in the scheme, the whitepaper, or a reference implementation), please **do not** open a public issue with full details immediately. Instead, follow the process in `SECURITY.md` so that we can triage and address the problem responsibly.

---

## Recognition and Attribution

Meaningful contributions—whether editorial, conceptual, or technical—may be acknowledged in the repository or in future versions of the whitepaper, subject to the maintainers’ discretion and your preferences.

If you are contributing on behalf of an organization, please indicate this in your pull request so that we can credit both individuals and institutions appropriately.


