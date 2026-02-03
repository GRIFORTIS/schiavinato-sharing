# Getting Started with Security Validation

Welcome! This guide will help you run the security validation experiments.

## What Was Created

A complete framework for three security validation experiments:

```
research/security-validation/
├── README.md                           # Overview
├── GETTING_STARTED.md                  # This file
├── requirements.txt                    # Python dependencies
├── requirements-sage.txt               # SageMath dependencies
├── run_all_experiments.sh              # Master script (runs all 3)
│
├── shared/                             # Common utilities
│   ├── __init__.py
│   ├── bip39_utils.py                  # BIP39 generation/validation
│   ├── field_arithmetic.py             # GF(2053) operations
│   ├── reporting.py                    # Result visualization
│   └── schiavinato_bridge.py           # JS implementation bridge (⚠️ TODO)
│
├── experiment-1-entropy/               # Entropy conservation test
│   ├── README.md                       # Detailed documentation
│   ├── entropy_conservation.py         # Main implementation
│   ├── run_experiment.sh               # Run script
│   └── results/                        # Output directory
│
├── experiment-2-bip39/                 # BIP39 correlation analysis
│   ├── README.md
│   ├── bip39_correlation.py
│   ├── statistical_tests.py
│   ├── run_experiment.sh
│   └── results/
│
└── experiment-3-constraints/           # Adversarial constraint solver
    ├── README.md
    ├── constraint_solver.sage          # SageMath implementation
    ├── adversarial_search.py           # Z3 alternative
    ├── run_experiment.sh
    └── results/
```

## Prerequisites

The experiments require a working bridge to the JavaScript reference implementation. This allows validation tests to use the authoritative implementation rather than a Python approximation.

## Quick Start

### 1. Install Dependencies

```bash
cd research/security-validation

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python packages
pip install -r requirements.txt

# For Experiment 3 (optional):
# macOS: brew install --cask sage
# Linux: apt-get install sagemath
pip install -r requirements-sage.txt
```

### 2. Run Quick Test (10 minutes)

```bash
# Test each experiment individually
cd experiment-1-entropy
./run_experiment.sh --quick

cd ../experiment-2-bip39
./run_experiment.sh --quick

cd ../experiment-3-constraints
./run_experiment.sh --quick
```

### 3. Run Full Validation (8-10 hours)

```bash
# From research/security-validation/ directory
./run_all_experiments.sh
```

### 4. Run Paper Results (reproducible)

```bash
./run_all_experiments.sh --seed 42 --trials 1000 --samples 1000 --configs "2-3,3-5,4-7"
```

## What Each Experiment Tests

### Experiment 1: Entropy Conservation ⭐⭐⭐
**Question**: Do k-1 shares + checksum constraints reduce search space?  
**Method**: Sample 1000 random BIP39 mnemonics, check consistency with k-1 shares  
**Expected**: ~1000/1000 consistent (no reduction)  
**Runtime**: 2-3 hours  
**Value**: Highest - directly validates Q1

### Experiment 2: BIP39 Correlation ⭐⭐
**Question**: Does post-BIP39 encoding create fingerprints?  
**Method**: Statistical tests (KS, Chi-square, correlation) on share distributions  
**Expected**: p > 0.01 for all tests  
**Runtime**: 1-2 hours  
**Value**: Medium - addresses Q3/Q4

### Experiment 3: Constraint Solver ⭐⭐⭐
**Question**: Can adversary solve constraint system computationally?  
**Method**: Attempt Gröbner basis computation with k-1 shares  
**Expected**: Timeout or >2^240 solutions  
**Runtime**: 3-5 hours  
**Value**: Highest - most rigorous test

## Interpreting Results

### ✅ All Pass (Expected)
- Update WHITEPAPER_V4.tex Section 6.1 with results
- Change Q1 from "open question" to "empirically validated"
- Proceed with publication

### ⚠️ One Fails
- Investigate which experiment and why
- May be implementation bug, not fundamental flaw
- Re-run with more samples/trials

### ❌ Multiple Fail
- CRITICAL: Security assumptions may be violated
- Deep analysis required before publication
- Consider revisions to construction

## Citing Results

If experiments pass and results are used in academic publications, cite as:

> Computational validation across 1000 random trials found no detectable
> entropy reduction (< 0.01 bits). Statistical analysis found no distinguishable
> patterns in share distributions. Adversarial constraint solving failed to
> reduce search space below 2^256. Complete methodology available at
> https://github.com/GRIFORTIS/schiavinato-sharing/tree/main/research/security-validation

## Troubleshooting

### "SageMath not found"
Install SageMath from https://www.sagemath.org/ or use the Z3 alternative (Experiment 3 will auto-detect)

### "Memory error"
Reduce `--trials` or `--samples` parameters

### Results vary between runs
Use `--seed 42` for reproducible results

---

**Created**: December 2024  
**Status**: Experimental validation framework

