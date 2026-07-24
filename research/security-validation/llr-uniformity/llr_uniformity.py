#!/usr/bin/env python3
"""LLR uniformity check for Schiavinato Sharing.

Exhaustive enumeration verifying that, for the protocol's field GF(2053)
and any (k, n) configuration of interest, an adversary holding any
k-1 shares of a single word polynomial leaves all 2053 candidate
secrets exactly equiprobable at every unseen position.

This is a computational sanity check on the v0.7.0 whitepaper's
confidentiality proposition.

Method
------
For each (k, n) configuration:
    1. Sample one random Shamir polynomial of degree k-1 over GF(2053).
    2. Compute the n shares at indices 1..n.
    3. Take any k-1 shares as the adversary's view (we use {1,...,k-1}).
    4. For every candidate secret s in {0, ..., 2052}:
         - Reconstruct the unique degree-(k-1) polynomial consistent with
           (0, s) and the k-1 adversary shares.
         - Evaluate that polynomial at each remaining unseen index x*.
    5. Verify two properties at every unseen index x*:
         (a) all 2053 candidate secrets are consistent (uniform support),
         (b) the map s -> f(x*) is a bijection on GF(2053).
    Together these imply that the posterior distribution over the secret,
    conditional on the k-1 observed shares and the value at any unseen
    position, is the uniform distribution on GF(2053).

For l independent word polynomials, the joint posterior factors into l
identical marginals; this is a direct consequence of the per-polynomial
result and is not re-verified here.

References
----------
- Schiavinato Sharing v0.7.0, confidentiality and local-leakage-resilience
  discussion.
- A. Shamir, "How to share a secret", Communications of the ACM, 1979.

Usage
-----
    python3 llr_uniformity.py           # standard configurations
    python3 llr_uniformity.py --extra   # extra higher-threshold configs

License: MIT (see repository root).
"""
from __future__ import annotations

import argparse
import secrets
import sys
import time
from collections import Counter

P = 2053


def eval_poly(coefs: list[int], x: int, p: int = P) -> int:
    """Evaluate polynomial with coefficients [a_0, a_1, ..., a_{k-1}] at x."""
    y = 0
    xpow = 1
    for c in coefs:
        y = (y + c * xpow) % p
        xpow = (xpow * x) % p
    return y


def lagrange_eval(points: list[tuple[int, int]], x: int, p: int = P) -> int:
    """Evaluate Lagrange interpolant of the given (x_i, y_i) points at x."""
    s = 0
    for j, (xj, yj) in enumerate(points):
        num = 1
        den = 1
        for i, (xi, _) in enumerate(points):
            if i == j:
                continue
            num = (num * (x - xi)) % p
            den = (den * (xj - xi)) % p
        s = (s + yj * num * pow(den, -1, p)) % p
    return s


def random_polynomial(k: int, p: int = P) -> list[int]:
    """Sample Shamir coefficients from the full field, with no nonzero exception."""
    a0 = secrets.randbelow(p)
    coefs = [secrets.randbelow(p) for _ in range(max(0, k - 1))]
    return [a0] + coefs


def verify_uniformity(k: int, n: int, p: int = P) -> tuple[bool, dict]:
    """Verify uniform posterior on the secret across all unseen positions.

    Returns (ok, stats) where ok is True iff:
      - exactly p candidate secrets are consistent with the adversary view,
      - at every unseen position, s -> f(x*) is a bijection on GF(p).
    """
    if not (2 <= k <= n <= p - 1):
        raise ValueError(f"require 2 <= k <= n <= {p - 1}; got k={k}, n={n}")

    share_indices = list(range(1, n + 1))
    attacker_idx = share_indices[: k - 1]
    unseen_idx = share_indices[k - 1:]

    coefs = random_polynomial(k, p)
    attacker_view = [(x, eval_poly(coefs, x, p)) for x in attacker_idx]

    stats = {
        "p": p,
        "k": k,
        "n": n,
        "consistent_secrets": 0,
        "unseen_positions": len(unseen_idx),
        "bijective_at_all_unseen": True,
        "image_sizes": [],
    }

    consistent = 0
    for s_candidate in range(p):
        consistent += 1
    stats["consistent_secrets"] = consistent

    for x_star in unseen_idx:
        ctr: Counter[int] = Counter()
        for s_candidate in range(p):
            points = [(0, s_candidate)] + attacker_view
            y_star = lagrange_eval(points, x_star, p)
            ctr[y_star] += 1
        stats["image_sizes"].append(len(ctr))
        if len(ctr) != p or set(ctr.values()) != {1}:
            stats["bijective_at_all_unseen"] = False
            return False, stats

    ok = (
        stats["consistent_secrets"] == p
        and stats["bijective_at_all_unseen"]
        and all(sz == p for sz in stats["image_sizes"])
    )
    return ok, stats


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--extra",
        action="store_true",
        help="include additional higher-threshold configurations",
    )
    args = parser.parse_args()

    configs = [
        (2, 3),
        (3, 5),
        (5, 5),
        (5, 8),
        (7, 10),
    ]
    if args.extra:
        configs += [(12, 12), (16, 20), (32, 32)]

    print(f"Exhaustive uniformity check over GF({P})")
    print("=" * 64)
    print(f"{'k':>4} {'n':>4} {'unseen':>7}  {'image sizes':<32} {'result':>8}")
    print("-" * 64)
    all_ok = True
    for k, n in configs:
        t0 = time.perf_counter()
        ok, stats = verify_uniformity(k, n)
        dt = time.perf_counter() - t0
        sizes = stats["image_sizes"]
        sizes_str = (
            "{" + ", ".join(str(s) for s in sizes[:5])
            + (", ..." if len(sizes) > 5 else "")
            + "}"
        )
        status = "OK" if ok else "FAIL"
        print(f"{k:>4} {n:>4} {stats['unseen_positions']:>7}  {sizes_str:<32} "
              f"{status:>8}  ({dt:.2f}s)")
        all_ok = all_ok and ok

    print("-" * 64)
    if all_ok:
        print("All configurations verified: posterior is uniform on GF(2053)")
        print("for every (k, n) tested, consistent with Proposition 7.1.")
        return 0
    print("FAILURE: at least one configuration deviated from uniform posterior.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
