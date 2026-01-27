#!/bin/bash
#
# Run Experiment 1: Entropy Conservation Test
#
# Usage:
#   ./run_experiment.sh                           # Standard test
#   ./run_experiment.sh --quick                   # Quick test
#   ./run_experiment.sh --trials 1000 --seed 42   # Custom parameters
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python version
echo "Checking Python version..."
python3 --version || {
    echo -e "${RED}Error: Python 3 not found${NC}"
    exit 1
}

# Check if virtual environment exists
if [ ! -d "../venv" ]; then
    echo -e "${YELLOW}Virtual environment not found. Creating...${NC}"
    cd ..
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd experiment-1-entropy
else
    echo "Activating virtual environment..."
    source ../venv/bin/activate
fi

# Check dependencies
echo "Checking dependencies..."
python3 -c "import numpy, scipy, matplotlib, tqdm" 2>/dev/null || {
    echo -e "${YELLOW}Installing dependencies...${NC}"
    pip install -r ../requirements.txt
}

# Run experiment
echo ""
echo "=========================================="
echo "  Experiment 1: Entropy Conservation"
echo "=========================================="
echo ""

python3 entropy_conservation.py "$@"

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Experiment completed successfully${NC}"
    echo ""
    echo "Results saved to: ./results/"
    echo ""
    echo "To view summary:"
    echo "  cat results/*/summary.md"
    echo ""
    echo "To view plots:"
    echo "  open results/*/consistency_histogram.png"
else
    echo ""
    echo -e "${RED}✗ Experiment failed with exit code $EXIT_CODE${NC}"
    exit $EXIT_CODE
fi

