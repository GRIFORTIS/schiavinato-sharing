# Software Implementation Flow Diagrams

These diagrams are non-normative implementation aids for the v0.6.0 software-assisted sharing flow. They are intended to help implementers and reviewers see the ceremony sequence, resume modes, printer-tier branching, and coefficient-generation paths in one place.

The normative sources remain:

- [`../../software_spec/README.md`](../../software_spec/README.md)
- [`../../manual_spec/README.md`](../../manual_spec/README.md)
- [`../../test_vectors/README.md`](../../test_vectors/README.md)
- [`../../whitepaper/WHITEPAPER.tex`](../../whitepaper/WHITEPAPER.tex)

## Constraints Shown In The Flows

The diagrams encode several operational constraints from the protocol. If a diagram and a normative spec ever diverge, the normative spec wins.

- USB-only offline printers may receive secret-bearing output; network-capable, public/shared, and no-printer paths require hand transcription of secret-bearing material according to the printer-tier rules.
- Full Mode is forced on the USB-only print path shown here because it is the maximum-assurance/default path when a trusted offline printer is available.
- Reduced Mode is available for constrained-output paths where smaller QR transcription burden matters, accepting its documented trade-offs.
- Single-Entropy is used only for Hand Transcribed QR in Reduced Mode. Digital Resume, Hand Transcribed Table, and No Resume use True Random coefficients.
- Coefficients are sampled from the full \(GF(2053)\) coefficient range `0..2052`. Reduced Mode then rejects word polynomials whose evaluated word-share values do not fit the 11-bit share-value range `0..2047`.
- Reduced Mode rejection differs by coefficient source: True Random paths discard the word polynomial and consume/re-roll the next coefficient set; Single-Entropy paths increment the per-word Position and re-derive.
- Resume artifacts are ceremony-continuity material only. They are not recovery inputs and are destroyed or separately secured after successful share creation and validation.

## Diagram Sequence

### 1. Sharing Setup

![v0.6.0 sharing setup](v0.6.0-01-sharing-setup.png)

### 2. Resume Artifact Creation

![v0.6.0 resume artifact creation](v0.6.0-02-resume-artifact-creation.png)

### 3. Share Generation And Output

![v0.6.0 share generation and output](v0.6.0-03-share-generation-and-output.png)

### 4. Polynomial Evaluation

![v0.6.0 polynomial evaluation](v0.6.0-04-polynomial-evaluation.png)
