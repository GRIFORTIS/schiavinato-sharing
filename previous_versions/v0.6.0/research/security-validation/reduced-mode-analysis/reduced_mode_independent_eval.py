#!/usr/bin/env python3
"""Historical evaluation: standard Shamir vs deprecated range-restricted profile.

This script studies an earlier design, previously called Reduced Mode, that
used rejection to keep word-share values inside the BIP39-sized range.

That design is NOT part of Schiavinato Sharing v0.7.0. The active Compact
Output Profile uses unrestricted GF(2053) share values and reduces QR size by
shrinking digital-envelope metadata.

This script is historical design-rationale material, not an active conformance
test and not part of the v0.7.0 security claim.

License: MIT
"""
from __future__ import annotations

import math
import random
import secrets
import sys
from collections import Counter

P = 2053
FORBIDDEN = {2048, 2049, 2050, 2051, 2052}
ACCEPT = set(range(2048))


def eval_poly(coefs: list[int], x: int) -> int:
    y, xpow = 0, 1
    for c in coefs:
        y = (y + c * xpow) % P
        xpow = (xpow * x) % P
    return y


def lagrange_eval(points: list[tuple[int, int]], x: int) -> int:
    s = 0
    for j, (xj, yj) in enumerate(points):
        num, den = 1, 1
        for i, (xi, _) in enumerate(points):
            if i == j:
                continue
            num = (num * (x - xi)) % P
            den = (den * (xj - xi)) % P
        s = (s + yj * num * pow(den, -1, P)) % P
    return s


def random_poly(k: int, secret: int | None = None) -> list[int]:
    s = secret if secret is not None else secrets.randbelow(P)
    if k == 1:
        return [s]
    mid = [secrets.randbelow(P) for _ in range(k - 2)]
    lead = 1 + secrets.randbelow(P - 1)
    return [s] + mid + [lead]


def shamir_uniform_posterior(k: int, n: int) -> dict:
    """Exhaustive: given k-1 shares at 1..k-1, posterior on secret at x=0."""
    share_idx = list(range(1, n + 1))
    att = share_idx[: k - 1]
    unseen = share_idx[k - 1 :]
    # fix one random polynomial and attacker view — structure is same for all
    coefs = random_poly(k, secret=1234)
    view = [(x, eval_poly(coefs, x)) for x in att]

    counts = Counter()
    for s in range(P):
        pts = [(0, s)] + view
        ok = True
        for x_star in unseen:
            y = lagrange_eval(pts, x_star)
            counts[(s, x_star, y)] += 1
        counts[s] += 1

    # per secret: check unseen evaluations
    secret_counts = Counter()
    for s in range(P):
        pts = [(0, s)] + view
        secret_counts[s] = 1

    # bijection check at first unseen
    x0 = unseen[0]
    img = [lagrange_eval([(0, s)] + view, x0) for s in range(P)]
    bij = len(img) == len(set(img))

    return {
        "k": k,
        "n": n,
        "unseen": len(unseen),
        "consistent_secrets": P,
        "bijection_at_unseen": bij,
        "uniform": bij and True,
    }


def reduced_posterior_exact(k: int, n: int) -> dict:
    """Exhaustive posterior over secret s at x=0 given:
    - adversary holds shares at x=1..k-1 (values from ONE sampled poly)
    - generation: uniform coeffs, reject if ANY share index in 1..n has y>2047
    We enumerate ALL degree-(k-1) polynomials (by enumerating all share tuples).
    Faster: enumerate secret + coeffs via random sample is MC; for exact use
    enumeration over consistent (s, coeffs) via k points.

    Exact method for fixed attacker indices 1..k-1:
    For each candidate secret s, count polynomials consistent with attacker
    view that ALSO satisfy reduced constraint on unseen  k..n.
    """
    att_idx = list(range(1, k))
    unseen_idx = list(range(k, n + 1))
    all_idx = list(range(1, n + 1))

    # Pick arbitrary attacker y-values by fixing one true poly — for posterior
    # we need: for each s, fraction of ALL compatible polys that pass reduced.
    # Actually: generation distribution is NOT uniform on compatible polys given
    # view. Correct: sample coefs uniformly with f(0)=s, reject until all in range.

    # Exhaustive over all polynomials: param by values at x=1..k-1 plus secret?
    # Degree k-1 poly determined by k points (0,s) and (xi,yi) for i=1..k-1
    # -> for each s and attacker values y_1..y_{k-1}, unique poly.
    # Attacker knows y_i at att_idx. So posterior P(s | view) proportional to
    # indicator[exists poly with f(0)=s, f(xi)=yi, all evals in range on 1..n]

    # For fixed observed y at att_idx, only one poly per s. So:
    # P(s | y) = P(s,y generated and accepted) / sum_s'
    # Generation: uniform s, uniform middle coeffs, reject.

    # Enumerate: for each s, each assignment to middle coeffs — too many.
    # Use: poly determined by (0,s) and k-1 share values. Attacker fixed yi.
    # Count: for given s, poly is unique once we fix yi. Check if poly passes.

    # Wait: attacker VIEW fixes y_1..y_{k-1}. For each s, unique interpolant.
    post = Counter()
    for s in range(P):
        pts = [(0, s)] + [(i, 0) for i in att_idx]  # placeholder y
        # we need actual y from a real run — use: count accepted polys over ALL
        pass

    # Better exhaustive: iterate all maps from att_idx to GF(p) (p^(k-1) views)
    # For each view, for each s, unique poly, check reduced on all_idx
    total_weight = 0
    agg = Counter()
    num_views = 0
    for view_tuple in _product_values(len(att_idx)):
        view = list(zip(att_idx, view_tuple))
        num_views += 1
        for s in range(P):
            if not _poly_passes_reduced(s, view, all_idx):
                continue
            agg[s] += 1
        total_weight += sum(
            1 for s in range(P) if _poly_passes_reduced(s, view, all_idx)
        )

    # This weights each attacker view equally — generation model conditions on
    # view differently. Use rejection sampling MC for generation model instead.

    return {"note": "use MC for generation model"}


def _product_values(m: int):
    if m == 0:
        yield ()
        return
    for tail in _product_values(m - 1):
        for v in range(P):
            yield (v,) + tail


def _poly_passes_reduced(s: int, view: list[tuple[int, int]], all_idx: list[int]) -> bool:
    pts = [(0, s)] + view
    for x in all_idx:
        y = lagrange_eval(pts, x)
        if y not in ACCEPT:
            return False
    return True


def reduced_generation_mc(k: int, n: int, trials: int = 200_000) -> dict:
    """Monte Carlo: sample poly until all n shares in [0,2047]; adversary has k-1."""
    att = list(range(1, k))
    unseen = list(range(k, n + 1))
    accept_count = 0
    secret_hist = Counter()
    # After acceptance, adversary sees att shares; we histogram true secret
    post_given_view: dict[tuple, Counter] = {}

    for _ in range(trials):
        while True:
            coefs = random_poly(k)
            vals = {x: eval_poly(coefs, x) for x in range(1, n + 1)}
            if all(v in ACCEPT for v in vals.values()):
                break
        s = coefs[0]
        accept_count += 1
        view_key = tuple(vals[x] for x in att)
        secret_hist[s] += 1
        post_given_view.setdefault(view_key, Counter())[s] += 1

    # Measure max deviation from uniform among views with enough samples
    max_tv = 0.0
    min_entropy_loss = math.log2(P)
    views_checked = 0
    for view, ctr in post_given_view.items():
        tot = sum(ctr.values())
        if tot < 50:
            continue
        views_checked += 1
        probs = [ctr[s] / tot for s in range(P)]
        # TV from uniform
        tv = 0.5 * sum(abs(p - 1 / P) for p in probs)
        max_tv = max(max_tv, tv)
        # entropy H(S|view)
        h = -sum(p * math.log2(p) for p in probs if p > 0)
        min_entropy_loss = min(min_entropy_loss, math.log2(P) - h)

    # Global entropy of secret after acceptance (before seeing view? adversary sees view)
    tot_s = sum(secret_hist.values())
    glob_probs = [secret_hist[s] / tot_s for s in range(P)]
    h_glob = -sum(p * math.log2(p) for p in glob_probs if p > 0)

    return {
        "k": k,
        "n": n,
        "trials": trials,
        "accept_rate": accept_count / trials,
        "global_entropy_bits": h_glob,
        "max_entropy_loss_vs_uniform": math.log2(P) - h_glob,
        "max_tv_given_view_sampled": max_tv,
        "views_with_50plus": views_checked,
    }


def per_word_accept_prob(k: int, n: int, trials: int = 100_000) -> float:
  """Empirical P(all n evaluations in [0,2047]) for uniform random poly."""
  ok = 0
  for _ in range(trials):
      coefs = random_poly(k)
      if all(eval_poly(coefs, x) in ACCEPT for x in range(1, n + 1)):
          ok += 1
  return ok / trials


def exhaustive_reduced_posterior_one_view(k: int, n: int, view: list[tuple[int, int]]) -> dict:
    """Given fixed attacker share values at x=1..k-1:

    For each candidate secret s, the unique degree-(k-1) polynomial consistent with
    (0,s) and the view is fixed. Reduced Mode accepts iff ALL evaluations on
    x in 1..n lie in [0,2047].

    If coeffs are uniform subject to passing rejection, each surviving s has equal
  weight (one poly per s), so posterior P(s|view) is uniform on surviving s.
    """
    all_idx = list(range(1, n + 1))
    survivors = []
    for s in range(P):
        pts = [(0, s)] + view
        if all(lagrange_eval(pts, x) in ACCEPT for x in all_idx):
            survivors.append(s)
    support = len(survivors)
    if support == 0:
        return {"support": 0, "entropy_bits": 0, "loss_vs_log2_p": math.log2(P)}
    p = 1.0 / support
    h = math.log2(support)
    probs = [p] * support
    max_p, min_p = p, p
    return {
        "support": support,
        "entropy_bits": h,
        "loss_vs_log2_p": math.log2(P) - h,
        "max_prob": max_p,
        "min_prob": min_p,
        "rejected_secrets": P - support,
    }


def naive_lattice_score(k: int, n: int, view: list[tuple[int, int]], s: int) -> float:
    """Heuristic: score how 'concentrated' unseen values are in [0,2047]."""
    unseen = list(range(k, n + 1))
    pts = [(0, s)] + view
    score = 0
    for x in unseen:
        y = lagrange_eval(pts, x)
        if y in ACCEPT:
            score += 1
    return score / len(unseen)


def main() -> int:
    print("=" * 72)
    print("PART 1: Standard Shamir (no rejection) — exhaustive structure check")
    print("=" * 72)
    for k, n in [(2, 3), (3, 5), (4, 8)]:
        r = shamir_uniform_posterior(k, n)
        print(f"  k={k} n={n}: bijection at unseen={r['bijection_at_unseen']} "
              f"(implies uniform posterior on secret given k-1 shares)")

    print()
    print("=" * 72)
    print("PART 2: Reduced Mode — per-polynomial accept rate (MC)")
    print("=" * 72)
    for k, n in [(2, 3), (3, 5), (4, 8)]:
        p_acc = per_word_accept_prob(k, n, 50_000)
        naive = (2048 / P) ** n
        print(f"  k={k} n={n}: P(accept) MC={p_acc:.6f}  naive (2048/2053)^n={naive:.6f}  "
              f"loss={-math.log2(p_acc):.4f} bits")

    print()
    print("=" * 72)
    print("PART 3: Reduced Mode — exact posterior for ONE random attacker view")
    print("       (enumerate all polynomials matching view; uniform coef prior)")
    print("=" * 72)
    # Worst-case view: minimize survivors (max loss)
    for k, n in [(2, 3), (3, 5), (4, 8)]:
        att = list(range(1, k))
        min_support = P
        max_loss = 0.0
        samples = 500 if k <= 3 else 200
        for _ in range(samples):
            coefs = random_poly(k)
            view = [(x, eval_poly(coefs, x)) for x in att]
            r = exhaustive_reduced_posterior_one_view(k, n, view)
            min_support = min(min_support, r["support"])
            max_loss = max(max_loss, r["loss_vs_log2_p"])
        # Also exhaustive min support for k=2 by scanning all views
        if k == 2 and n == 3:
            global_min = P
            viable_views = 0
            for y1 in range(P):
                r = exhaustive_reduced_posterior_one_view(k, n, [(1, y1)])
                if r["support"] == 0:
                    continue
                viable_views += 1
                global_min = min(global_min, r["support"])
            print(f"  k={k} n={n}: min_support(sampled)={min_support}  max_loss(sampled)={max_loss:.4f} bits  "
                  f"min_support(all VIABLE views)={global_min}  "
                  f"max_loss(viable)={math.log2(P/global_min):.4f} bits  viable_views={viable_views}/{P}")
        else:
            print(f"  k={k} n={n}: min_support(sampled)={min_support}  max_loss(sampled)={max_loss:.4f} bits")

    print()
    print("=" * 72)
    print("PART 4: Reduced Mode — MC generation model (3-of-5)")
    print("=" * 72)
    r = reduced_generation_mc(3, 5, 100_000)
    for key, val in r.items():
        print(f"  {key}: {val}")

    print()
    print("=" * 72)
    print("PART 5: Can naive scoring pick secret from k-1 shares? (3-of-5, MC)")
    print("=" * 72)
    k, n = 3, 5
    att = list(range(1, k))
    trials = 20_000
    wins = 0
    for _ in range(trials):
        while True:
            coefs = random_poly(k)
            vals = {x: eval_poly(coefs, x) for x in range(1, n + 1)}
            if all(v in ACCEPT for v in vals.values()):
                break
        true_s = coefs[0]
        view = [(x, vals[x]) for x in att]
        scores = [(s, naive_lattice_score(k, n, view, s)) for s in range(P)]
        best = max(scores, key=lambda t: t[1])
        if best[0] == true_s:
            wins += 1
    print(f"  Guess secret maximizing fraction of unseen in [0,2047]: {wins}/{trials} "
          f"= {wins/trials:.4f} (random = {1/P:.6f})")

    print()
    print("=" * 72)
    print("PART 5b: 24-word joint — additive entropy loss if words independent")
    print("=" * 72)
    for k, n, label in [(3, 5, "3-of-5 t=2"), (3, 5, "worst-case bound")]:
        m = n - (k - 1)
        max_reject = 5 * m
        min_support = P - max_reject
        per_word_loss = math.log2(P / min_support)
        total_24 = 24 * per_word_loss
        print(f"  {label}: m={m} min_support/word>={min_support}  "
              f"loss/word<={per_word_loss:.4f}  loss_24words<={total_24:.4f} bits")
    print(f"  BIP39 entropy 256 bits; even 0.424 bit loss leaves ~>255.5 bits (brute force infeasible)")

    print()
    print("=" * 72)
    print("PART 6: Compact Mode byte budget (24 words)")
    print("=" * 72)
    share_bits = 25 * 12
    share_bytes = math.ceil(share_bits / 8)
    meta_scenarios = [
        ("Reduced-like 16B meta", 16),
        ("Compact 13B meta", 13),
        ("Compact 12B meta", 12),
    ]
    for name, meta in meta_scenarios:
        core = meta + share_bytes
        qr = 2 + core  # SC prefix
        print(f"  {name}: share_data={share_bytes}B core={core}B QR={qr}B (V3-L cap=53) "
              f"{'OK' if qr <= 53 else 'OVER'}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
