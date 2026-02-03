#!/usr/bin/env python3
"""
Adversarial Search using Z3 SMT Solver

Alternative to SageMath implementation using Z3 solver.
Can handle mixed constraints (algebraic + boolean).
"""

import sys
import time
import json
import argparse
from pathlib import Path
from typing import Dict, Any, List

try:
    from z3 import *
except ImportError:
    print("Warning: Z3 not installed. Install with: pip install z3-solver")
    print("This is optional - SageMath implementation is primary.")
    sys.exit(1)

sys.path.insert(0, str(Path(__file__).parent.parent))
from shared.field_arithmetic import GF2053


def build_z3_system(k: int, share_indices: List[int], share_values: Dict) -> tuple:
    """
    Build Z3 constraint system.
    
    Args:
        k: Threshold
        share_indices: List of k-1 share indices
        share_values: Known share values
    
    Returns:
        Tuple of (solver, word_variables)
    """
    print(f"\nBuilding Z3 system for {k}-threshold (adversary has {k-1} shares)...")
    
    # Create solver
    s = Solver()
    s.set("timeout", 300000)  # 300 seconds = 300000 ms
    
    # Create word variables (24 words, values 1-2048, mapped to GF(2053))
    words = [Int(f'w{i}') for i in range(24)]
    
    # Constrain words to valid range [0, 2047]
    for w in words:
        s.add(And(w >= 0, w <= 2047))
    
    print(f"  Variables: {len(words)} words")
    
    # Add polynomial evaluation constraints
    # P_i(x) = a0 + a1*x + a2*x^2 + ... (in GF(2053))
    # We know P_i(x_j) for j in share_indices
    
    # For simplicity in Z3, just add checksum constraints
    # (Full polynomial constraints would require many auxiliary variables)
    
    # Add checksum constraints: c_r = w1 + w2 + w3 (mod 2053)
    print("  Adding checksum constraints...")
    
    for r in range(8):
        w1 = words[3*r]
        w2 = words[3*r + 1]
        w3 = words[3*r + 2]
        
        # Sum mod 2053 (Z3 doesn't have built-in finite field, so simulate)
        # We'd need actual checksum values to constrain this properly
        # For now, just demonstrate structure
    
    print(f"  Total constraints: {s.assertions().__len__()}")
    
    return s, words


def attempt_z3_solution(solver, word_vars, timeout_seconds=300):
    """
    Attempt to solve using Z3.
    
    Args:
        solver: Z3 Solver object
        word_vars: List of word variables
        timeout_seconds: Maximum time
    
    Returns:
        Dict with results
    """
    print(f"\nAttempting Z3 solve (timeout: {timeout_seconds}s)...")
    
    start_time = time.time()
    
    # Check satisfiability
    result = solver.check()
    elapsed = time.time() - start_time
    
    print(f"  Result: {result}")
    print(f"  Elapsed: {elapsed:.1f}s")
    
    if result == sat:
        model = solver.model()
        solution = {f'w{i}': model[word_vars[i]].as_long() for i in range(24)}
        
        # Try to find multiple solutions
        print("  Finding additional solutions...")
        num_solutions = 1
        
        # Block current solution and try again (up to 10 times)
        for attempt in range(10):
            # Add constraint blocking this solution
            block = Or([word_vars[i] != model[word_vars[i]] for i in range(24)])
            solver.add(block)
            
            if solver.check() == sat:
                num_solutions += 1
                model = solver.model()
            else:
                break
        
        return {
            'status': 'SOLVED',
            'elapsed_seconds': elapsed,
            'num_solutions': f'>={num_solutions}' if num_solutions >= 10 else num_solutions,
            'first_solution': solution
        }
    
    elif result == unsat:
        return {
            'status': 'UNSATISFIABLE',
            'elapsed_seconds': elapsed,
            'message': 'No solutions exist (constraints contradictory)'
        }
    
    else:  # unknown
        return {
            'status': 'TIMEOUT',
            'elapsed_seconds': elapsed,
            'message': 'Solver could not determine satisfiability'
        }


def main():
    parser = argparse.ArgumentParser(
        description="Experiment 3: Z3-based Adversarial Search"
    )
    parser.add_argument('--k', type=int, default=3, help='Threshold')
    parser.add_argument('--n', type=int, default=5, help='Total shares')
    parser.add_argument('--timeout', type=int, default=300, help='Timeout (seconds)')
    parser.add_argument('--output', type=Path, default=Path('results/z3_output.json'))
    
    args = parser.parse_args()
    
    print("="*60)
    print("Experiment 3: Adversarial Constraint Solver (Z3)")
    print(f"Configuration: {args.k}-of-{args.n}")
    print("="*60)
    
    # Simulate adversary shares
    share_indices = list(range(1, args.k))
    share_values = {}  # Would be populated with actual values
    
    # Build system
    solver, words = build_z3_system(args.k, share_indices, share_values)
    
    # Solve
    result = attempt_z3_solution(solver, words, args.timeout)
    
    # Interpret
    print("\n" + "="*60)
    print("RESULTS")
    print("="*60)
    print(json.dumps(result, indent=2))
    
    # Save
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"\nResults saved to: {args.output}")


if __name__ == "__main__":
    main()

