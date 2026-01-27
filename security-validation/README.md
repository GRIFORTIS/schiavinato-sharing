# Security Validation Experiments

This directory contains cryptographic security validation experiments for Schiavinato Sharing as described in Section 6 of the Whitepaper ([PDF](https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/latest/download/WHITEPAPER.pdf), [LaTeX](../WHITEPAPER.tex)).

## Purpose

Validate two key security properties:

1. **Experiment 1: Entropy Conservation Test**  
   Validates that k-1 shares + checksum constraints do not reduce effective search space below 2^256

2. **Experiment 2: Adversarial Constraint Solving**  
   Simulates sophisticated adversary attempting to solve constraint system computationally

## Quick Start

### Prerequisites

- Python 3.9 or later
- Node.js 18 or later (for JS implementation bridge)
- SageMath 9.8 or later (Experiment 3 only)

### Installation

```bash
# Install Python dependencies
cd security-validation
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
├── requirements.txt                (Python dependencies)
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

The results cited in Section 6 of the Whitepaper ([PDF](https://github.com/GRIFORTIS/schiavinato-sharing-spec/releases/latest/download/WHITEPAPER.pdf), [LaTeX](../WHITEPAPER.tex)) were generated with:

```bash
./run_all_experiments.sh --seed 42 --trials 1000 --configs "2-3,3-5,4-7"
```

**Expected runtime**: 8-10 hours on modern hardware

## Citation

If you reproduce or build upon these experiments, please cite:

```
Schiavinato, R. (2025). Schiavinato Sharing: Dual-Mode Threshold 
Secret Sharing for BIP39 Mnemonics. Section 6: Security Analysis.
https://github.com/GRIFORTIS/schiavinato-sharing-spec
```

## Contributing

Found an issue or have suggestions for additional validation experiments?

1. Open an issue: https://github.com/GRIFORTIS/schiavinato-sharing-spec/issues
2. Propose changes via pull request
3. Follow guidelines in `CONTRIBUTING.md`

## License

These validation experiments are licensed under MIT License, same as the main repository.

See `LICENSE` in repository root for details.

---

**Status**: Active development (December 2024)  
**Maintainer**: GRIFORTIS  
**Contact**: https://github.com/GRIFORTIS/schiavinato-sharing-spec/discussions

