# Security Validation Experiments

This directory contains cryptographic security validation experiments for DuraShare as described in the Whitepaper ([PDF (latest)](https://github.com/GRIFORTIS/durashare/releases/latest/download/WHITEPAPER.pdf) | [Releases (versioned PDF)](https://github.com/GRIFORTIS/durashare/releases) | [LaTeX](../../whitepaper/WHITEPAPER.tex)).

## Purpose

Validate key security properties:

1. **Experiment 1: Entropy Conservation Test**  
   Validates that k-1 shares + checksum constraints do not reduce effective search space below 2^256

2. **Experiment 2: Adversarial Constraint Solving**  
   Simulates sophisticated adversary attempting to solve constraint system computationally

3. **LLR Uniformity Check** ([`llr-uniformity/`](llr-uniformity/))  
   Lightweight, dependency-free exhaustive enumeration over GF(2053), verifying that k-1 shares of a single word polynomial leave all 2053 candidate secrets equiprobable at every unseen position.

4. **QR Hand-Transcription Estimate** ([`qr-hand-transcription/`](qr-hand-transcription/))  
   Structural count of dark modules to hand-mark on representative share QRs (Full vs Compact, template-assisted), supporting the QR workload discussion in the whitepaper.

## Quick Start

### Prerequisites

- Python 3.9 or later
- Node.js 18 or later (for JS implementation bridge)
- SageMath 9.8 or later (Experiment 3 only)

### Installation

```bash
# Install Python dependencies
cd research/security-validation
pip install -r requirements.txt

# For Experiment 3, also install SageMath
pip install -r requirements-sage.txt
# Or use system SageMath: https://www.sagemath.org/
```

### Running All Experiments

```bash
# Run all experiments (takes 6-10 hours)
./run_all_experiments.sh

# Or run with specific configurations
./run_all_experiments.sh --trials 100 --quick
```

### Running Individual Experiments

```bash
# Experiment 1: Entropy Conservation (2-3 hours)
cd experiment-1-entropy
./run_experiment.sh --trials 1000 --configs "2-3,3-5,4-7"

# Experiment 2: Constraint Solver (3-5 hours)
cd experiment-3-constraints
./run_experiment.sh --configs "2-3,3-5"

# LLR uniformity check (dependency-free)
cd ../llr-uniformity
python3 llr_uniformity.py

# QR hand-transcription estimate (requires qrcode)
cd ../qr-hand-transcription
python3 qr_hand_transcription_estimate.py
```

## Results

All experimental results are stored in `experiment-*/results/` with:
- **Raw data**: JSON files with complete experimental data
- **Summaries**: Markdown files with statistical analysis
- **Visualizations**: PNG plots and charts

### Latest Results

- Experiment 1: `experiment-1-entropy/results/summary.md`
- Experiment 2: `experiment-3-constraints/results/summary.md`

## Directory Structure

```
security-validation/
├── README.md                       (this file)
├── requirements.txt                (Python dependencies, including qrcode for QR estimate)
├── requirements-sage.txt           (SageMath dependencies)
├── run_all_experiments.sh          (Master script)
│
├── experiment-1-entropy/           (Entropy conservation test)
│   ├── README.md
│   ├── entropy_conservation.py
│   ├── run_experiment.sh
│   └── results/
│
├── experiment-3-constraints/       (Constraint solving)
│   ├── README.md
│   ├── constraint_solver.sage
│   ├── adversarial_search.py
│   ├── run_experiment.sh
│   └── results/
│
└── shared/                         (Common utilities)
    ├── __init__.py
    ├── schiavinato_bridge.py       (JS implementation bridge)
    ├── bip39_utils.py
    ├── field_arithmetic.py
    └── reporting.py
```

## Reproducibility

All experiments are designed for complete reproducibility:

- **Fixed random seeds**: Results can be exactly reproduced
- **Versioned dependencies**: All dependency versions locked
- **Complete documentation**: Every parameter documented
- **Cross-platform**: Tested on macOS, Linux, and Windows

### Reproducing Paper Results

The results cited in the Whitepaper ([PDF (latest)](https://github.com/GRIFORTIS/durashare/releases/latest/download/WHITEPAPER.pdf) | [Releases (versioned PDF)](https://github.com/GRIFORTIS/durashare/releases) | [LaTeX](../../whitepaper/WHITEPAPER.tex)) were generated with:

```bash
./run_all_experiments.sh --seed 42 --trials 1000 --configs "2-3,3-5,4-7"
```

**Expected runtime**: 8-10 hours on modern hardware

## Citation

If you reproduce or build upon these experiments, please cite:

```
Schiavinato Lopez, R. (2026). DuraShare: BIP39-Native Threshold Backup
over GF(2053) with Full Manual Fallback and Per-Share Audit.
https://github.com/GRIFORTIS/durashare
```

## Contributing

Found an issue or have suggestions for additional validation experiments?

1. Open an issue: [GitHub Issues](https://github.com/GRIFORTIS/durashare/issues)
2. Propose changes via pull request
3. Follow guidelines in [CONTRIBUTING](https://github.com/GRIFORTIS/.github/blob/main/CONTRIBUTING.md)

## License

These validation experiments are licensed under MIT License, same as the main repository.

See `LICENSE` in repository root for details.

---

**Status**: Active development (December 2024)  
**Maintainer**: GRIFORTIS  
**Contact**: [GitHub Discussions](https://github.com/GRIFORTIS/durashare/discussions)

