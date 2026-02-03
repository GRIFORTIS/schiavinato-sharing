"""
Constraint Solver using SageMath

Attempts to solve constraint system available to adversary with k-1 shares.

This file uses SageMath syntax (.sage file).
Run with: sage constraint_solver.sage
"""

# SageMath imports (available in .sage files)
from sage.all import *
import json
import sys
import time
from datetime import datetime


def build_polynomial_system(k, share_indices, share_values):
    """
    Build the polynomial constraint system for adversary.
    
    Args:
        k: Threshold (adversary has k-1 shares)
        share_indices: List of k-1 share indices (x-coordinates)
        share_values: Dict mapping (secret_idx, share_idx) -> value
    
    Returns:
        Tuple of (polynomial_ring, ideal, variable_dict)
    """
    print(f"\nBuilding polynomial system for {k}-of-n (adversary has {k-1} shares)...")
    
    # Prime field
    F = GF(2053)
    
    # Variables: 24 word values + 8 row checksums + 1 GIC + polynomial coefficients
    var_names = []
    
    # Word variables: w0, w1, ..., w23 (24 unknowns)
    for i in range(24):
        var_names.append(f'w{i}')
    
    # Checksum + GIC variables: c0, c1, ..., c8 (9 unknowns)
    # For 24-word mnemonic: c0-c7 are 8 row checksums, c8 is the Global Integrity Check (GIC)
    for i in range(9):
        var_names.append(f'c{i}')
    
    # Polynomial coefficient variables for each element (24 words + 8 checksums + 1 GIC = 33 total)
    # For k-of-n scheme, each polynomial has degree k-1
    # P_i(x) = a_{i,0} + a_{i,1}*x + ... + a_{i,k-1}*x^{k-1}
    # where a_{i,0} = secret value (word or checksum - already in variables above)
    
    # We need (k-1) coefficients for each of the 33 polynomials
    for secret_idx in range(33):
        for coeff_idx in range(1, k):  # Exclude constant term (it's w_i or c_i)
            var_names.append(f'a{secret_idx}_{coeff_idx}')
    
    print(f"  Total variables: {len(var_names)} (24 words + 8 checksums + 1 GIC + {33*(k-1)} polynomial coefficients)")
    
    # Create polynomial ring
    R = PolynomialRing(F, var_names, order='lex')
    variables = {name: R(name) for name in var_names}
    
    # Build equations
    equations = []
    
    # 1. Polynomial evaluation constraints
    # For each element (24 words + 8 checksums + 1 GIC) and each share the adversary has:
    # P_secret(share_x) = known_value
    print(f"  Building polynomial evaluation constraints...")
    
    word_eval_count = 0
    checksum_eval_count = 0
    
    for secret_idx in range(33):
        for i, share_x in enumerate(share_indices):
            # Get the known value
            if (secret_idx, i) in share_values:
                known_val = share_values[(secret_idx, i)]
                
                # Build polynomial: P_secret(share_x) = known_val
                # P(x) = secret_value + a1*x + a2*x^2 + ...
                
                if secret_idx < 24:
                    # Word polynomial - constant term is w_secret_idx
                    poly_eval = variables[f'w{secret_idx}']
                    word_eval_count += 1
                else:
                    # Checksum polynomial - constant term is c_{secret_idx - 24}
                    checksum_idx = secret_idx - 24
                    poly_eval = variables[f'c{checksum_idx}']
                    checksum_eval_count += 1
                
                # Add higher degree terms: a1*x + a2*x^2 + ...
                for deg in range(1, k):
                    coeff_var = variables[f'a{secret_idx}_{deg}']
                    poly_eval += coeff_var * (share_x ** deg)
                
                # Equation: poly_eval - known_val = 0
                equations.append(poly_eval - F(known_val))
    
    print(f"  Added {len(equations)} polynomial evaluation constraints")
    print(f"    - Word polynomials: {word_eval_count} constraints")
    print(f"    - Checksum polynomials: {checksum_eval_count} constraints")
    
    # 2. Checksum relationship constraints
    # Row checksums: c_r = w_{3r} + w_{3r+1} + w_{3r+2} mod 2053 for r = 0,...,7
    # Global Integrity Check: c_8 = sum of all 24 words mod 2053
    print(f"  Building checksum relationship constraints...")
    
    checksum_constraint_count = 0
    
    # Row checksums (8 constraints)
    for r in range(8):
        w1 = variables[f'w{3*r}']
        w2 = variables[f'w{3*r+1}']
        w3 = variables[f'w{3*r+2}']
        c_r = variables[f'c{r}']
        
        # Constraint: c_r = w1 + w2 + w3 (mod 2053)
        # Rearranged: c_r - w1 - w2 - w3 = 0
        equations.append(c_r - w1 - w2 - w3)
        checksum_constraint_count += 1
    
    # Global Integrity Check (1 constraint)
    c_gic = variables['c8']
    word_sum = sum(variables[f'w{i}'] for i in range(24))
    equations.append(c_gic - word_sum)
    checksum_constraint_count += 1
    
    print(f"  Added {checksum_constraint_count} checksum relationship constraints")
    print(f"    - Row checksums: 8 constraints")
    print(f"    - Global Integrity Check: 1 constraint")
    
    print(f"\n  TOTAL CONSTRAINTS: {len(equations)}")
    print(f"  TOTAL UNKNOWNS: {len(var_names)}")
    print(f"  System is: {'underdetermined' if len(equations) < len(var_names) else 'overdetermined' if len(equations) > len(var_names) else 'determined'}")
    
    # Create ideal
    I = R.ideal(equations)
    
    return R, I, variables


def attempt_solution(R, I, timeout_seconds=300):
    """
    Attempt to solve the ideal.
    
    Args:
        R: Polynomial ring
        I: Ideal to solve
        timeout_seconds: Maximum time to spend
    
    Returns:
        Dict with results
    """
    print(f"\nAttempting to solve (timeout: {timeout_seconds}s)...")
    
    start_time = time.time()
    
    try:
        # Try to compute Gröbner basis
        print("  Computing Gröbner basis...")
        
        # Set alarm for timeout
        import signal
        def timeout_handler(signum, frame):
            raise TimeoutError("Gröbner basis computation timed out")
        
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(timeout_seconds)
        
        try:
            GB = I.groebner_basis()
            signal.alarm(0)  # Cancel alarm
            
            elapsed = time.time() - start_time
            
            print(f"  ✓ Gröbner basis computed in {elapsed:.1f}s")
            print(f"  Basis size: {len(GB)} polynomials")
            
            # Try to find solutions
            try:
                variety = I.variety()
                num_solutions = len(variety)
                
                return {
                    'status': 'SOLVED',
                    'elapsed_seconds': elapsed,
                    'groebner_basis_size': len(GB),
                    'num_solutions': num_solutions,
                    'solutions': variety[:5] if num_solutions <= 5 else None  # First 5 only
                }
            except:
                # Variety computation failed - likely infinite solutions
                return {
                    'status': 'UNDERDETERMINED',
                    'elapsed_seconds': elapsed,
                    'groebner_basis_size': len(GB),
                    'num_solutions': 'infinite or very large'
                }
        
        except TimeoutError:
            signal.alarm(0)
            elapsed = time.time() - start_time
            
            return {
                'status': 'TIMEOUT',
                'elapsed_seconds': elapsed,
                'message': f'Gröbner basis computation exceeded {timeout_seconds}s timeout'
            }
    
    except Exception as e:
        elapsed = time.time() - start_time
        return {
            'status': 'ERROR',
            'elapsed_seconds': elapsed,
            'error': str(e)
        }


def run_constraint_solver_experiment(k, n, timeout=300):
    """
    Run complete constraint solver experiment.
    
    Args:
        k: Threshold
        n: Total shares
        timeout: Solver timeout in seconds
    
    Returns:
        Dict with results
    """
    print("="*60)
    print(f"Experiment 3: Adversarial Constraint Solver")
    print(f"Configuration: {k}-of-{n}")
    print("="*60)
    
    # Generate real BIP39 mnemonic and split it
    import sys
    from pathlib import Path
    lib_path = '/Users/renatoslopes/Library/CloudStorage/Dropbox/01. Produto Digital/00. GRIFORTIS/00. GitHub-GRIFORTIS/schiavinato-sharing-py'
    if lib_path not in sys.path:
        sys.path.insert(0, lib_path)
    from schiavinato_sharing import split_mnemonic
    from schiavinato_sharing.checksums import compute_row_checks, compute_global_integrity_check
    from mnemonic import Mnemonic
    
    # Generate random 24-word BIP39 mnemonic
    mnemo = Mnemonic('english')
    mnemonic = mnemo.generate(strength=256)
    print(f"\nGenerated random BIP39 mnemonic")
    
    # Split into shares
    shares = split_mnemonic(mnemonic, k, n)
    print(f"Created {len(shares)} shares with threshold {k}")
    
    # Simulate adversary having k-1 shares (indices 1 through k-1)
    adversary_shares = shares[:k-1]
    share_indices = [s.share_number for s in adversary_shares]
    
    # Build share_values dict mapping (secret_idx, share_idx) -> value
    # Adversary has: word shares + checksum shares for k-1 shares
    share_values = {}
    
    # Word shares (24 words)
    for secret_idx in range(24):
        for i, share in enumerate(adversary_shares):
            share_values[(secret_idx, i)] = share.word_shares[secret_idx]
    
    # Checksum shares (8 checksums for 24-word mnemonic)
    for checksum_idx in range(8):
        for i, share in enumerate(adversary_shares):
            share_values[(24 + checksum_idx, i)] = share.checksum_shares[checksum_idx]
    
    # Global Integrity Check share
    for i, share in enumerate(adversary_shares):
        share_values[(32, i)] = share.global_integrity_check_share
    
    print(f"\nAdversary knowledge:")
    print(f"  Shares: {share_indices}")
    print(f"  Word evaluations: {24 * (k-1)}")
    print(f"  Checksum evaluations: {9 * (k-1)}")
    print(f"  Total constraints: {33 * (k-1)}")
    
    # Build system
    R, I, variables = build_polynomial_system(k, share_indices, share_values)
    
    # Attempt to solve
    result = attempt_solution(R, I, timeout)
    
    # Interpret results
    print("\n" + "="*60)
    print("RESULTS")
    print("="*60)
    print(f"Status: {result['status']}")
    print(f"Time: {result['elapsed_seconds']:.1f}s")
    
    if result['status'] == 'TIMEOUT':
        print("\n✅ PASS: System too complex to solve")
        print("Adversarial attack: FAILED")
        verdict = "PASS"
    elif result['status'] == 'UNDERDETERMINED':
        print("\n✅ PASS: System remains underdetermined")
        print(f"Solutions: {result['num_solutions']}")
        verdict = "PASS"
    elif result['status'] == 'SOLVED':
        num_sol = result.get('num_solutions', 0)
        if num_sol == 1:
            print("\n❌ CRITICAL FAIL: Unique solution found!")
            verdict = "FAIL"
        elif num_sol < 2**200:
            print(f"\n❌ FAIL: Only {num_sol} solutions")
            verdict = "FAIL"
        else:
            print(f"\n✅ PASS: {num_sol} solutions (effectively unbounded)")
            verdict = "PASS"
    else:
        print(f"\n⚠️  ERROR: {result.get('error', 'Unknown error')}")
        verdict = "ERROR"
    
    result['verdict'] = verdict
    result['configuration'] = {'k': k, 'n': n}
    
    return result


# Main execution
if __name__ == '__main__':
    # Parse arguments
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--k', type=int, default=3)
    parser.add_argument('--n', type=int, default=5)
    parser.add_argument('--timeout', type=int, default=300)
    parser.add_argument('--trials', type=int, default=1, help='Number of trials (different random mnemonics)')
    parser.add_argument('--output', type=str, default='results/sage_output.json')
    
    args = parser.parse_args()
    
    # Run multiple trials if requested
    if args.trials > 1:
        print(f"\nRunning {args.trials} trials with different random BIP39 mnemonics...")
        print("="*60)
        
        all_results = []
        pass_count = 0
        underdetermined_count = 0
        
        for trial in range(1, args.trials + 1):
            if trial % 1000 == 0 or trial == 1:
                print(f"Trial {trial}/{args.trials}...")
            
            trial_result = run_constraint_solver_experiment(args.k, args.n, args.timeout)
            all_results.append(trial_result)
            
            if trial_result.get('verdict') == 'PASS':
                pass_count += 1
            if trial_result.get('status') == 'UNDERDETERMINED':
                underdetermined_count += 1
        
        # Aggregate results
        print("\n" + "="*60)
        print("AGGREGATE RESULTS")
        print("="*60)
        print(f"Total trials: {args.trials}")
        print(f"Passed: {pass_count}/{args.trials} ({100.0*pass_count/args.trials:.1f}%)")
        print(f"Underdetermined: {underdetermined_count}/{args.trials} ({100.0*underdetermined_count/args.trials:.1f}%)")
        
        avg_basis_size = sum(r.get('groebner_basis_size', 0) for r in all_results) / len(all_results)
        print(f"Average Gröbner basis size: {avg_basis_size:.1f}")
        
        result = {
            'trials': args.trials,
            'pass_count': pass_count,
            'pass_rate': float(pass_count) / float(args.trials),
            'underdetermined_count': underdetermined_count,
            'all_underdetermined': underdetermined_count == args.trials,
            'average_basis_size': float(avg_basis_size),
            'configuration': {'k': args.k, 'n': args.n},
            'verdict': 'PASS' if pass_count == args.trials else 'FAIL'
        }
    else:
        result = run_constraint_solver_experiment(args.k, args.n, args.timeout)
    
    # Save results
    import pathlib
    output_path = pathlib.Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        # Convert SageMath objects to Python objects for JSON
        json_result = {}
        for key, value in result.items():
            try:
                # Try to convert to standard Python types for JSON
                if isinstance(value, int) or (hasattr(value, '__int__')):
                    json_result[key] = int(value)
                elif isinstance(value, float) or (hasattr(value, '__float__')):
                    json_result[key] = float(value)
                else:
                    json_result[key] = str(value)
            except (TypeError, ValueError):
                json_result[key] = str(value)
        
        json.dump(json_result, f, indent=2)
    
    print(f"\nResults saved to: {output_path}")

