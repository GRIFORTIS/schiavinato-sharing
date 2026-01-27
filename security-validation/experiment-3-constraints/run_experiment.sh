#!/bin/bash
#
# Run Experiment 3: Adversarial Constraint Solver
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Checking for SageMath..."
if command -v sage &> /dev/null; then
    echo "✓ SageMath found: $(sage --version | head -n1)"
    SOLVER="sage"
elif command -v python3 &> /dev/null && python3 -c "import z3" 2>/dev/null; then
    echo "⚠️  SageMath not found, using Z3 solver"
    SOLVER="z3"
else
    echo -e "${RED}Error: Neither SageMath nor Z3 found${NC}"
    echo ""
    echo "Install SageMath:"
    echo "  macOS: brew install --cask sage"
    echo "  Linux: apt-get install sagemath"
    echo ""
    echo "Or install Z3:"
    echo "  pip install z3-solver"
    exit 1
fi

# Parse arguments
K=3
N=5
TIMEOUT=300
TRIALS=1000
CONFIGS="2-3,3-5"

while [[ $# -gt 0 ]]; do
    case $1 in
        --configs)
            CONFIGS="$2"
            shift 2
            ;;
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --trials)
            TRIALS="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

echo ""
echo "=========================================="
echo "  Experiment 3: Constraint Solver"
echo "=========================================="
echo ""

# Run for each configuration
IFS=',' read -ra CONFIG_ARRAY <<< "$CONFIGS"
for config in "${CONFIG_ARRAY[@]}"; do
    IFS='-' read -r K N <<< "$config"
    
    echo "Testing $K-of-$N..."
    
    mkdir -p results/$K-of-$N
    
    if [ "$SOLVER" = "sage" ]; then
        sage constraint_solver.sage --k $K --n $N --timeout $TIMEOUT --trials $TRIALS --output "results/$K-of-$N/sage_output.json"
    else
        python3 adversarial_search.py --k $K --n $N --timeout $TIMEOUT --output "results/$K-of-$N/z3_output.json"
    fi
    
    echo ""
done

echo -e "${GREEN}✓ Experiment completed${NC}"
echo "Results saved to: ./results/"

