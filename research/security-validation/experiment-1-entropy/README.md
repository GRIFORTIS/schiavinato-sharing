# Experiment 1: Entropy Conservation Test

## Hypothesis

**H0 (Null Hypothesis)**: With k-1 shares + checksum constraints, all 2^256 valid BIP39 mnemonics remain equally likely. The effective search space is not reduced below 2^256.

**H1 (Alternative Hypothesis)**: k-1 shares + checksum constraints leak information, reducing effective search space below 2^256.

## Rationale

This experiment serves as an **implementation-level sanity check**, verifying that the Python reference implementation correctly realizes the Shamir + linear checksum construction. The experiment does NOT test the interaction with BIP39's SHA-256 checksum, which is the primary open question requiring formal analysis (see Section 6.1.4 of WHITEPAPER_V4.pdf).

## Methodology

### Overview

For each trial:
1. Generate random valid BIP39 mnemonic (24 words)
2. Create k-of-n Schiavinato shares
3. Give adversary k-1 shares (all 33 polynomials)
4. Sample N random valid BIP39 mnemonics
5. Check how many are consistent with adversary's knowledge
6. Measure: Ratio of consistent mnemonics

**Expected**: ~100% consistent (no reduction in possibilities)  
**Concerning**: <99% consistent (constraints leak information)

### Mathematical Framework

An adversary with k-1 shares knows:
- (k-1) × 33 polynomial evaluations
- 9 linear checksum relationships: c_r = w_1 + w_2 + w_3 (mod 2053)

For a candidate mnemonic to be "consistent":
1. Word indices must satisfy all 9 checksum constraints
2. For each word, a degree-(k-1) polynomial must exist that:
   - Has the word index as constant term
   - Passes through k-1 known share points

With k-1 constraints and k degrees of freedom, step 2 is ALWAYS satisfied (underdetermined system). Only step 1 matters.

### Sampling Strategy

Exhaustive enumeration of 2^256 mnemonics is infeasible. Instead:
- Sample N=1000 random valid BIP39 mnemonics per trial
- Check consistency for each sample
- Estimate: P(consistent | k-1 shares) ≈ (# consistent) / N

If scheme is secure: P ≈ 1.0 (all valid mnemonics equally likely)

### Pass/Fail Criteria

- **PASS**: Mean consistency ratio ≥ 0.99 across all trials
- **MARGINAL**: 0.95 ≤ ratio < 0.99 (requires further analysis)
- **FAIL**: ratio < 0.95 (significant information leakage detected)

## Running the Experiment

### Quick Test (10 minutes)

```bash
./run_experiment.sh --trials 10 --samples 100 --config "2-3"
```

### Standard Test (2-3 hours)

```bash
./run_experiment.sh --trials 1000 --samples 1000 --configs "2-3,3-5"
```

### Full Test (Paper Results, 6-8 hours)

```bash
./run_experiment.sh --trials 1000 --samples 1000 --configs "2-3,3-5,4-7" --seed 42
```

### Command-Line Options

```
--trials N          Number of random source mnemonics (default: 1000)
--samples N         Samples per trial for consistency check (default: 1000)
--configs "k-n,..."  Comma-separated threshold configs (default: "2-3,3-5")
--seed N            Random seed for reproducibility (default: random)
--output DIR        Output directory (default: ./results/)
--verbose           Print detailed progress
--quick             Run quick mode (trials=100, samples=100)
```

## Output Files

All results saved to `results/` directory:

### 1. Raw Data (JSON)
```
results/2024-12-04_15-30-00_entropy_2-3.json
results/2024-12-04_15-30-00_entropy_3-5.json
```

Each file contains:
- Configuration (k, n, trials, samples, seed)
- Per-trial results (source mnemonic, consistent count)
- Aggregate statistics

### 2. Summary (Markdown)
```
results/summary.md
```

Human-readable summary with:
- Pass/fail verdict
- Statistical analysis
- Interpretation

### 3. Visualizations (PNG)
```
results/plots/consistency_histogram.png
results/plots/convergence.png
results/plots/config_comparison.png
```

## Expected Results

### Normal Behavior (Implementation is Correct)

```
Experiment 1: Entropy Conservation Test
========================================

Configuration: 2-of-3, 100 trials, 100 samples per trial

Trial   1: 100/100 consistent (100.0%)
Trial   2: 100/100 consistent (100.0%)
Trial   3: 100/100 consistent (100.0%)
...
Trial 100: 100/100 consistent (100.0%)

RESULTS
-------
Mean consistency: 100.0 / 100 (100.000%)
Std deviation: 0.0
Entropy reduction: 0.000 bits

✅ PASS: Implementation matches theoretical expectation
Conclusion: Python code correctly implements Shamir + linear checksums
```

**Why 100% is guaranteed:** By Shamir's construction, with k-1 share points and any chosen constant term, there exists a unique degree-(k-1) polynomial passing through all k points. The test adds (0, candidate_secret) to the k-1 shares and interpolates; this ALWAYS succeeds for any valid BIP39 mnemonic. The experiment verifies the implementation behaves this way.

### If Implementation Has a Bug (Unexpected)

```
RESULTS
-------
Mean consistency: 84.2 / 100 (84.2%)

❌ FAIL: Implementation error detected
Conclusion: Python code does NOT match the Shamir algebra
CRITICAL: Bug in reference implementation
```

If you see anything other than 100% consistency, there is a bug in the implementation (arithmetic error, incorrect field operations, etc.), not a security flaw in the scheme.

## Interpreting Results

### What the Results Mean

| Outcome | Interpretation |
|---------|----------------|
| 100% consistency, 0 bits reduction | ✅ **EXPECTED**: Implementation correct |
| <100% consistency | ❌ **BUG**: Implementation error (arithmetic, field ops, etc.) |

**Critical understanding:** This experiment tests whether the *implementation* matches the *theory*. The theory (Shamir + linear checksums) mathematically guarantees 100% consistency. Any deviation indicates a bug, not a security flaw.

### What This Experiment Does NOT Test

- **BIP39 SHA-256 interaction**: The test does not encode BIP39's nonlinear checksum constraint
- **Subtle entropy leakage**: The tested model guarantees perfect conservation by construction
- **Adversarial structures**: No sophisticated attack modeling beyond "check if random mnemonics are consistent"

This is a **regression test**, not a security proof.

## Reproducing Paper Results

Section 6.1.4 of WHITEPAPER_V4.pdf describes this experiment as an implementation-level sanity check that confirms the Python code exhibits the mathematically guaranteed property that all valid BIP39 mnemonics remain consistent with any k-1 shares.

Quick test (recommended):

```bash
./run_experiment.sh --quick --configs "2-3"
```

**Expected**: 100% consistency (0 bits entropy reduction) across all trials.  
**Runtime**: ~1-2 minutes  

The experiment confirms implementation correctness but does not test the BIP39 SHA-256 interaction.

## Implementation Details

See `entropy_conservation.py` for full implementation.

Key functions:
- `run_entropy_test()`: Main experiment loop
- `check_consistency()`: Test if mnemonic consistent with k-1 shares
- `compute_statistics()`: Statistical analysis
- `generate_plots()`: Create visualizations

## Limitations

1. **Sampling-based**: Cannot prove security, only provide evidence
2. **Limited configurations**: Tests common cases (2-3, 3-5, 4-7), not all possible
3. **Computational**: Doesn't test sophisticated mathematical attacks
4. **BIP39-only**: Only validates post-BIP39 structure, not general case

## Next Steps

- If PASS: Update paper with results, cite experiment
- If FAIL: Investigate which constraints leak information
- If MARGINAL: Run larger sample (10K trials) for more precision

## Contact

Questions about this experiment:
- GitHub Issues: [schiavinato-sharing/issues](https://github.com/GRIFORTIS/schiavinato-sharing/issues)
- Discussion: [schiavinato-sharing/discussions](https://github.com/GRIFORTIS/schiavinato-sharing/discussions)

