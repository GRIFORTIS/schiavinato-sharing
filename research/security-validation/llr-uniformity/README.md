# LLR Uniformity Check

Exhaustive enumeration over GF(2053) verifying the posterior uniformity statement of [Proposition 7.1 (Confidentiality)](../../../whitepaper/WHITEPAPER.tex) of DuraShare v0.7.0.

## What this checks

For every `(k, n)` configuration tested, the script verifies that an adversary holding any `k-1` shares of a single word polynomial faces a uniform posterior over the 2053 candidate secrets at every unseen position. Concretely, at each unseen index `x*`, the map

```
s -> f(x*)   for s in GF(2053)
```

is shown to be a bijection on GF(2053). This is a direct computational counterpart to the proof of Proposition 7.1.

The script is intentionally lightweight (runs in well under a second on a modern laptop), self-contained, and uses no external dependencies. It is not a statistical experiment; it enumerates the entire candidate space, so the result is a complete verification over the protocol's field rather than a sample.

For `l` independent word polynomials (i.e., the 12 to 24 polynomials of a BIP39 mnemonic), the joint posterior factors into `l` identical uniform marginals; this follows immediately from the per-polynomial result and is not re-verified here.

## Usage

```bash
python3 llr_uniformity.py           # standard configurations
python3 llr_uniformity.py --extra   # additional higher-threshold configurations
```

No third-party packages are required (Python 3.9+).

## Relation to other experiments

- [`../experiment-1-entropy/`](../experiment-1-entropy/) — statistical entropy-conservation tests; complementary to this check.
- [`../experiment-3-constraints/`](../experiment-3-constraints/) — adversarial constraint-solving experiments; complementary to this check.

This folder is intentionally non-numbered: it complements the existing entropy and constraint experiments without claiming a slot in their numbering.

## License

MIT (see repository root).
