"""
Finite field arithmetic over GF(2053).

Provides field operations used in Schiavinato Sharing:
- Addition/subtraction (modulo 2053)
- Multiplication (modulo 2053)
- Modular inverse
- Polynomial evaluation
"""

from typing import List, Tuple
import functools


class GF2053:
    """
    Galois Field GF(2053) arithmetic.
    
    Prime field used in Schiavinato Sharing for human-executable operations.
    """
    
    PRIME = 2053
    
    @staticmethod
    def add(a: int, b: int) -> int:
        """Addition in GF(2053)."""
        return (a + b) % GF2053.PRIME
    
    @staticmethod
    def sub(a: int, b: int) -> int:
        """Subtraction in GF(2053)."""
        return (a - b) % GF2053.PRIME
    
    @staticmethod
    def mul(a: int, b: int) -> int:
        """Multiplication in GF(2053)."""
        return (a * b) % GF2053.PRIME
    
    @staticmethod
    def inv(a: int) -> int:
        """
        Modular multiplicative inverse in GF(2053).
        
        Uses extended Euclidean algorithm.
        
        Args:
            a: Element to invert (must be non-zero)
        
        Returns:
            b such that (a * b) mod 2053 = 1
        
        Raises:
            ValueError: If a is 0
        """
        if a == 0:
            raise ValueError("Cannot compute inverse of 0")
        
        # Extended Euclidean algorithm
        def extended_gcd(a: int, b: int) -> Tuple[int, int, int]:
            if a == 0:
                return b, 0, 1
            gcd, x1, y1 = extended_gcd(b % a, a)
            x = y1 - (b // a) * x1
            y = x1
            return gcd, x, y
        
        a = a % GF2053.PRIME
        _, x, _ = extended_gcd(a, GF2053.PRIME)
        return x % GF2053.PRIME
    
    @staticmethod
    def div(a: int, b: int) -> int:
        """Division in GF(2053): a / b = a * b^(-1)."""
        return GF2053.mul(a, GF2053.inv(b))
    
    @staticmethod
    def pow(a: int, n: int) -> int:
        """Exponentiation in GF(2053)."""
        return pow(a, n, GF2053.PRIME)
    
    @staticmethod
    def polynomial_eval(coefficients: List[int], x: int) -> int:
        """
        Evaluate polynomial at x in GF(2053).
        
        Uses Horner's method for efficiency.
        
        Args:
            coefficients: [a0, a1, a2, ...] where poly = a0 + a1*x + a2*x^2 + ...
            x: Evaluation point
        
        Returns:
            P(x) mod 2053
        """
        if not coefficients:
            return 0
        
        # Horner's method: a0 + x(a1 + x(a2 + x(...)))
        result = coefficients[-1]
        for i in range(len(coefficients) - 2, -1, -1):
            result = GF2053.add(coefficients[i], GF2053.mul(result, x))
        
        return result
    
    @staticmethod
    def lagrange_coefficient(
        x_values: List[int],
        x_target: int,
        j: int
    ) -> int:
        """
        Compute Lagrange coefficient L_j for interpolation.
        
        L_j(x_target) = ∏(i≠j) (x_target - x_i) / (x_j - x_i)
        
        Args:
            x_values: List of x-coordinates (share indices)
            x_target: Target x value (typically 0 for recovery)
            j: Index of coefficient to compute
        
        Returns:
            L_j(x_target) in GF(2053)
        """
        numerator = 1
        denominator = 1
        
        x_j = x_values[j]
        
        for i, x_i in enumerate(x_values):
            if i != j:
                # numerator *= (x_target - x_i)
                numerator = GF2053.mul(numerator, GF2053.sub(x_target, x_i))
                
                # denominator *= (x_j - x_i)
                denominator = GF2053.mul(denominator, GF2053.sub(x_j, x_i))
        
        # Return numerator / denominator
        return GF2053.div(numerator, denominator)
    
    @staticmethod
    def interpolate(points: List[Tuple[int, int]]) -> int:
        """
        Lagrange interpolation at x=0.
        
        Given points (x_i, y_i), recover the constant term of polynomial.
        
        Args:
            points: List of (x, y) tuples representing polynomial evaluations
        
        Returns:
            P(0) - the secret (constant term)
        """
        if not points:
            raise ValueError("Need at least one point")
        
        x_values = [x for x, _ in points]
        y_values = [y for _, y in points]
        
        result = 0
        for j in range(len(points)):
            coeff = GF2053.lagrange_coefficient(x_values, 0, j)
            term = GF2053.mul(coeff, y_values[j])
            result = GF2053.add(result, term)
        
        return result
    
    @staticmethod
    @functools.lru_cache(maxsize=2053)
    def inverse_table() -> List[int]:
        """
        Pre-compute table of modular inverses.
        
        Returns:
            List where inverse_table[i] = i^(-1) mod 2053
        """
        table = [0]  # 0 has no inverse
        for i in range(1, GF2053.PRIME):
            table.append(GF2053.inv(i))
        return table


def verify_field_properties():
    """Self-test: Verify GF(2053) satisfies field axioms."""
    print("Verifying GF(2053) field properties...")
    
    # Test additive identity
    assert GF2053.add(42, 0) == 42, "Additive identity failed"
    
    # Test multiplicative identity
    assert GF2053.mul(42, 1) == 42, "Multiplicative identity failed"
    
    # Test additive inverse
    for a in [0, 1, 42, 1000, 2052]:
        assert GF2053.add(a, GF2053.sub(0, a)) == 0, f"Additive inverse failed for {a}"
    
    # Test multiplicative inverse
    for a in [1, 2, 42, 1000, 2052]:
        assert GF2053.mul(a, GF2053.inv(a)) == 1, f"Multiplicative inverse failed for {a}"
    
    # Test polynomial evaluation
    # P(x) = 1 + 2x + 3x^2, P(5) should give specific result
    coeffs = [1, 2, 3]
    result = GF2053.polynomial_eval(coeffs, 5)
    expected = GF2053.add(1, GF2053.add(GF2053.mul(2, 5), GF2053.mul(3, 25)))
    assert result == expected, "Polynomial evaluation failed"
    
    # Test Lagrange interpolation
    # Create polynomial P(x) = 42 + 17x, evaluate at x=1,2,3, then recover P(0)=42
    secret = 42
    points = [
        (1, GF2053.add(secret, GF2053.mul(17, 1))),
        (2, GF2053.add(secret, GF2053.mul(17, 2))),
        (3, GF2053.add(secret, GF2053.mul(17, 3))),
    ]
    recovered = GF2053.interpolate(points)
    assert recovered == secret, f"Lagrange interpolation failed: got {recovered}, expected {secret}"
    
    print("✓ All field property tests passed")


if __name__ == "__main__":
    verify_field_properties()
    
    print("\nGF(2053) Arithmetic Self-Test")
    print("=" * 60)
    
    # Basic operations
    a, b = 1234, 567
    print(f"a = {a}, b = {b}")
    print(f"a + b mod 2053 = {GF2053.add(a, b)}")
    print(f"a - b mod 2053 = {GF2053.sub(a, b)}")
    print(f"a × b mod 2053 = {GF2053.mul(a, b)}")
    print(f"a / b mod 2053 = {GF2053.div(a, b)}")
    
    # Verify inverse
    inv_b = GF2053.inv(b)
    print(f"\nb^(-1) = {inv_b}")
    print(f"b × b^(-1) = {GF2053.mul(b, inv_b)} (should be 1)")
    
    print("\nAll arithmetic operations working correctly!")

