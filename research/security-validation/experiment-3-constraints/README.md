# Experiment 3: Adversarial Constraint Solver

## Hypothesis

**H0 (Null Hypothesis)**: Given k-1 shares + checksum constraints, the constraint system remains underdetermined with ~2^256 solutions.

**H1 (Alternative Hypothesis)**: The constraint system can be solved (or significantly narrowed) computationally.

## Rationale

Tests whether an adversary with k-1 shares can exploit algebraic constraint solving (Gröbner basis methods) to find exploitable structure in the Shamir + linear checksum polynomial system.

**Critical limitation**: This experiment models only the Shamir polynomial evaluations and the 9 linear Schiavinato checksum equations over GF(2053). It does **NOT** encode BIP39's SHA-256 checksum constraint. Therefore, it tests the Shamir + linear checksum subsystem, not the full coupled system including BIP39's nonlinear checksum (which remains the primary open question per Section 6.1.4 of the whitepaper).

## Methodology

### The Adversary's Knowledge (As Modeled)

With k-1 shares, the modeled adversary has:

1. **(k-1) × 33 polynomial evaluations**:  
   For each of 33 elements (24 words + 8 row checksums + 1 GIC), adversary knows:
   - P_i(x_1), P_i(x_2), ..., P_i(x_{k-1})
   
2. **9 linear Schiavinato constraints** (public knowledge):  
   - c_r = w_1 + w_2 + w_3 (mod 2053) for r = 1,...,8 (row checksums)
   - GIC = sum of all 24 words (mod 2053) (Global Integrity Check)

**What is NOT modeled:** BIP39's SHA-256 checksum constraint is not encoded in the polynomial system. The experiment tests only the algebraic structure of Shamir + linear checksums over GF(2053).

### Attack Strategy (As Implemented)

The Sage implementation builds a polynomial system over GF(2053):

```
Variables: w_1, w_2, ..., w_24 ∈ GF(2053)  (24 word unknowns)
           c_1, ..., c_8 ∈ GF(2053)         (8 row checksum unknowns)
           GIC ∈ GF(2053)                   (1 Global Integrity Check unknown)
           a_{i,j} for i=1..33, j=1..(k-1)  (polynomial coefficients)

Constraints:
  - Polynomial evaluations: P_i(x_j) = known_value  [33(k-1) equations]
  - Linear checksums: c_r = w_{3r-2} + w_{3r-1} + w_{3r}  [9 equations]
```

The adversary attempts to solve this using:
- **Gröbner basis computation** (SageMath) - primary implementation
- **Z3 SMT solver** - currently a structural stub, not used for paper results

### Tools Used

1. **SageMath**: Polynomial ideal computation over finite fields (primary implementation)
2. **Z3 Solver**: SMT solver alternative (currently a structural stub; not used for paper results)

### Pass/Fail Criteria

- **PASS**: Solver times out (60s) or finds >2^240 solutions
- **MARGINAL**: Solution space 2^200 - 2^240 (reduced but still large)
- **FAIL**: Unique solution or <2^200 possibilities found

## Running the Experiment

### Prerequisites

**SageMath Installation:**

```bash
# macOS
brew install --cask sage

# Linux (Ubuntu/Debian)
apt-get install sagemath

# Or use Docker
docker pull sagemath/sagemath:latest
```

**Python Dependencies:**

```bash
pip install -r ../requirements.txt
pip install -r ../requirements-sage.txt
```

### Quick Test (5-10 minutes)

```bash
./run_experiment.sh --timeout 60 --config "2-3"
```

### Standard Test (2-3 hours)

```bash
./run_experiment.sh --timeout 300 --configs "2-3,3-5"
```

### Full Test (Paper Results, 4-6 hours)

```bash
./run_experiment.sh --timeout 600 --configs "2-3,3-5,4-7" --seed 42
```

### Command-Line Options

```
--configs "k-n,..."  Threshold configs to test
--timeout N          Solver timeout in seconds (default: 300)
--seed N             Random seed for reproducibility
--output DIR         Output directory (default: ./results/)
--solver sage|z3     Which solver to use (default: sage)
--verbose            Print detailed progress
```

## Output Files

### 1. Raw Data (JSON)
```
results/2024-12-04_constraint_solver_2-3.json
```

Contains:
- Constraint system details
- Solver output
- Solution count/dimensionality

### 2. Summary (Markdown)
```
results/summary.md
```

Human-readable analysis of results.

### 3. Logs
```
results/solver_output.log
```

Complete solver output for debugging.

## Expected Results

### If Secure (Expected)

```
Experiment 3: Adversarial Constraint Solver
============================================

Configuration: 2-of-3 (adversary has 1 share)

Building constraint system...
  Variables: 24 word values + polynomial coefficients
  Constraints:
    - 33 polynomial evaluations
    - 9 linear checksum equations
    - BIP39 validity (implicit)

Attempting to solve via Gröbner basis...
  Ideal dimension: 24 (underdetermined)
  Computing Gröbner basis...
  Timeout after 300s (expected - system too complex)

Result: ✅ PASS
  System remains underdetermined
  Cannot reduce search space below 2^256
  Adversarial constraint solving: FAILED

Interpretation:
  k-1 shares provide insufficient constraints
  Even sophisticated solver cannot narrow possibilities
  Security claim validated
```

### If There's a Problem (Unexpected)

```
Result: ❌ FAIL
  Unique solution found in 12.3 seconds
  Recovered secret: abandon abandon abandon ...
  CRITICAL: Constraint system is solvable!

Interpretation:
  k-1 shares + checksums create solvable system
  Fundamental security flaw discovered
  Construction MUST be revised
```

## Interpreting Results

### Solver Outcomes

| Outcome | Interpretation | Status |
|---------|----------------|--------|
| Timeout (>60s) | System too complex to solve | ✅ PASS |
| Dimension = k-1 | Underdetermined as expected | ✅ PASS |
| Solutions ≥ 2^240 | Search space effectively unbounded | ✅ PASS |
| Solutions < 2^200 | Significant reduction detected | ❌ FAIL |
| Unique solution | Complete break | ❌ CRITICAL |

### Why This is Hard

For 2-of-3 (k=3, adversary has 2 shares):

```
Degrees of freedom:
  - 24 word values (unknowns)
  - 33 × 2 = 66 polynomial coefficients (some unknown)

Constraints:
  - 33 × 2 = 66 polynomial evaluations
  - 8 row checksum equations + 1 GIC equation = 9 linear constraints
  Total: 75 constraints

But: Polynomial evaluations are LINEAR in coefficients
     With only 2 points, degree-2 polynomial underdetermined
     Need k points to uniquely determine degree-(k-1) polynomial
```

System should be underdetermined → no unique solution.

## Reproducing Paper Results

Section 6.1.4 of WHITEPAPER_V4.pdf describes this experiment as testing the Shamir + linear checksum subsystem (without BIP39 SHA-256 encoding). The Sage implementation builds polynomial systems over GF(2053) and uses Gröbner basis computation to check for exploitable structure.

Successfully completed runs used 1,000 trials for 2-of-3 configuration:

```bash
./run_experiment.sh --timeout 600 --trials 1000 --configs "2-3" --seed 42
```

**Expected result**: All trials show "UNDERDETERMINED" status with 24 degrees of freedom (66 unknowns, 42 constraints for 2-of-3). Gröbner basis computation completes in <0.1 seconds per case, immediately confirming the system remains underdetermined.

**Note**: The experiment confirms the linear checksum equations do not create solvable structure when combined with Shamir polynomials, but does not test the BIP39 SHA-256 interaction.

## Implementation Details

See:
- `constraint_solver.sage`: SageMath implementation (main)
- `adversarial_search.py`: Z3 SMT solver implementation (alternative)

Key functions:
- `build_constraint_system()`: Construct polynomial ideal
- `attempt_groebner_basis()`: Try to solve via Gröbner bases
- `analyze_solution_space()`: Estimate dimensionality

## Limitations

1. **Does NOT encode BIP39 SHA-256**: The primary limitation. This experiment tests only Shamir + linear checksums, not the coupled system with BIP39's nonlinear constraint
2. **Timeout-based**: Cannot prove hardness, only demonstrate difficulty for Gröbner basis methods
3. **Specific solvers**: Tests SageMath Gröbner bases (Z3 implementation is currently a stub)
4. **Computational validation**: Doesn't constitute formal cryptographic proof
5. **Finite sampling**: Tests many random instances but not exhaustive

## Technical Background

### Why Gröbner Bases?

Gröbner bases are powerful tools for solving polynomial systems:
- Convert ideal to canonical form
- Reveal solvability and solution count
- Used in cryptanalysis of algebraic systems

If constraint system were weak, Gröbner bases would expose it.

### What This Tests

This experiment validates that the Shamir + linear checksum polynomial system over GF(2053) does not accidentally create exploitable algebraic structure:
- Uses actual k-1 shares from the reference implementation
- Applies standard cryptanalytic tools (Gröbner basis)
- Tests across many random instances

**What it does NOT test**: The interaction with BIP39's SHA-256 checksum, which is the primary open question requiring formal cryptographic analysis (see Section 6.1.4 of the whitepaper).

## Next Steps

- If PASS: Cite in paper as strong validation
- If FAIL: CRITICAL - revise construction immediately
- If MARGINAL: Test with larger timeout/resources

## Contact

Questions:
- GitHub Issues: [schiavinato-sharing/issues](https://github.com/GRIFORTIS/schiavinato-sharing/issues)
- Discussion: [schiavinato-sharing/discussions](https://github.com/GRIFORTIS/schiavinato-sharing/discussions)

