#!/bin/bash
#
# Master script to run all three security validation experiments
#
# Usage:
#   ./run_all_experiments.sh                    # Standard (8-10 hours)
#   ./run_all_experiments.sh --quick            # Quick test (30 minutes)
#   ./run_all_experiments.sh --seed 42          # Reproducible results
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default parameters
TRIALS=1000
SAMPLES=1000
CONFIGS="2-3,3-5,4-7"
SEED=""
TIMEOUT=300
QUICK=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --quick)
            QUICK=true
            TRIALS=100
            SAMPLES=100
            TIMEOUT=60
            shift
            ;;
        --seed)
            SEED="--seed $2"
            shift 2
            ;;
        --trials)
            TRIALS=$2
            shift 2
            ;;
        --samples)
            SAMPLES=$2
            shift 2
            ;;
        --configs)
            CONFIGS=$2
            shift 2
            ;;
        --timeout)
            TIMEOUT=$2
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--quick] [--seed N] [--trials N] [--samples N] [--configs k-n,...] [--timeout N]"
            exit 1
            ;;
    esac
done

# Print header
clear
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║     Schiavinato Sharing Security Validation Suite       ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "This will run all three security validation experiments:"
echo ""
echo "  1. Entropy Conservation Test"
echo "  2. BIP39 Correlation Analysis"
echo "  3. Adversarial Constraint Solver"
echo ""
echo "Configuration:"
echo "  Trials: $TRIALS"
echo "  Samples: $SAMPLES"
echo "  Configs: $CONFIGS"
echo "  Timeout: ${TIMEOUT}s"
if [ -n "$SEED" ]; then
    echo "  Seed: $SEED"
fi
if [ "$QUICK" = true ]; then
    echo -e "  ${YELLOW}Quick mode enabled${NC}"
fi
echo ""

# Estimate time
if [ "$QUICK" = true ]; then
    ESTIMATED="30-45 minutes"
else
    ESTIMATED="8-10 hours"
fi

echo -e "${YELLOW}Estimated total time: $ESTIMATED${NC}"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""

# Track overall status
FAILED=0
PASSED=0

# Create results directory
mkdir -p results
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
RESULTS_DIR="results/${TIMESTAMP}_full_suite"
mkdir -p "$RESULTS_DIR"

# Log file
LOG_FILE="$RESULTS_DIR/run_log.txt"
exec &> >(tee -a "$LOG_FILE")

echo "Results will be saved to: $RESULTS_DIR"
echo "Log file: $LOG_FILE"
echo ""

# ============================================
# Experiment 1: Entropy Conservation
# ============================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}EXPERIMENT 1: Entropy Conservation Test${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd experiment-1-entropy

if ./run_experiment.sh --trials $TRIALS --samples $SAMPLES --configs "$CONFIGS" $SEED --output "$RESULTS_DIR/experiment-1"; then
    echo -e "${GREEN}✓ Experiment 1 PASSED${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ Experiment 1 FAILED${NC}"
    FAILED=$((FAILED + 1))
fi

cd ..
echo ""

# ============================================
# Experiment 2: BIP39 Correlation
# ============================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}EXPERIMENT 2: BIP39 Correlation Analysis${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd experiment-2-bip39

if ./run_experiment.sh --samples $SAMPLES --configs "$CONFIGS" $SEED --output "$RESULTS_DIR/experiment-2"; then
    echo -e "${GREEN}✓ Experiment 2 PASSED${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ Experiment 2 FAILED${NC}"
    FAILED=$((FAILED + 1))
fi

cd ..
echo ""

# ============================================
# Experiment 3: Constraint Solver
# ============================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}EXPERIMENT 3: Adversarial Constraint Solver${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd experiment-3-constraints

if ./run_experiment.sh --configs "$CONFIGS" --timeout $TIMEOUT --output "$RESULTS_DIR/experiment-3"; then
    echo -e "${GREEN}✓ Experiment 3 PASSED${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ Experiment 3 FAILED${NC}"
    FAILED=$((FAILED + 1))
fi

cd ..
echo ""

# ============================================
# Summary
# ============================================

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    FINAL SUMMARY                         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Experiments completed: 3"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""
echo "Results saved to: $RESULTS_DIR"
echo ""

# Generate combined summary
SUMMARY_FILE="$RESULTS_DIR/SUMMARY.md"
cat > "$SUMMARY_FILE" << EOF
# Security Validation Suite - Summary

**Date**: $(date)
**Configuration**:
- Trials: $TRIALS
- Samples: $SAMPLES
- Configs: $CONFIGS
- Timeout: ${TIMEOUT}s
$([ -n "$SEED" ] && echo "- Seed: $SEED")

## Results

| Experiment | Status |
|------------|--------|
| 1. Entropy Conservation | $([ $PASSED -ge 1 ] && echo "✅ PASS" || echo "❌ FAIL") |
| 2. BIP39 Correlation | $([ $PASSED -ge 2 ] && echo "✅ PASS" || echo "❌ FAIL") |
| 3. Constraint Solver | $([ $PASSED -ge 3 ] && echo "✅ PASS" || echo "❌ FAIL") |

**Overall**: $PASSED/3 passed

## Detailed Results

See individual experiment directories for detailed results:
- \`experiment-1/\` - Entropy conservation test
- \`experiment-2/\` - BIP39 correlation analysis
- \`experiment-3/\` - Constraint solver results

## Interpretation

$(if [ $PASSED -eq 3 ]; then
    echo "✅ **All experiments passed**. Strong empirical evidence supporting security claims."
    echo ""
    echo "The scheme demonstrates:"
    echo "- No detectable entropy reduction with k-1 shares"
    echo "- BIP39 structure does not leak through share distributions"
    echo "- Adversarial constraint solving fails to recover secrets"
    echo ""
    echo "These results support the information-theoretic security arguments in Section 6.1 of the whitepaper."
elif [ $FAILED -eq 1 ]; then
    echo "⚠️ **One experiment failed**. Requires investigation."
elif [ $FAILED -eq 2 ]; then
    echo "❌ **Two experiments failed**. Significant concerns about security."
else
    echo "❌ **All experiments failed**. CRITICAL: Security assumptions violated."
fi)

## Next Steps

$(if [ $PASSED -eq 3 ]; then
    echo "1. Update WHITEPAPER_V4.pdf Section 6.1 with experimental results"
    echo "2. Cite these experiments in security analysis"
    echo "3. Proceed with peer review and publication"
else
    echo "1. Investigate failed experiments"
    echo "2. Analyze root cause of failures"
    echo "3. Consider revisions to construction if fundamental flaws found"
fi)

---

*Generated by run_all_experiments.sh*
*Schiavinato Sharing Security Validation Suite*
EOF

echo "Combined summary saved to: $SUMMARY_FILE"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              ✓ ALL EXPERIMENTS PASSED ✓                  ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║           ✗ SOME EXPERIMENTS FAILED ✗                    ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi

