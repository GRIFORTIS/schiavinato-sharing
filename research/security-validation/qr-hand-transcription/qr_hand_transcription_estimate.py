#!/usr/bin/env python3
"""Structural estimate of QR hand-mark burden for DuraShare share payloads.

Reproduces the v0.7.0 whitepaper's representative Full vs Compact
QR hand-transcription workload estimate. Requires: pip install qrcode

See README.md in this directory.
"""
from __future__ import annotations

try:
    import qrcode
    from qrcode.constants import ERROR_CORRECT_L, ERROR_CORRECT_M
except ModuleNotFoundError as exc:
    raise SystemExit(
        "Missing optional dependency 'qrcode'. Install research dependencies with "
        "`pip install -r ../requirements.txt` from research/security-validation/, "
        "or run `pip install qrcode` for this script only."
    ) from exc


def structural_modules(version: int) -> set[tuple[int, int]]:
    n = 17 + 4 * version
    s: set[tuple[int, int]] = set()

    def box(r0: int, c0: int, h: int, w: int) -> None:
        for r in range(r0, r0 + h):
            for c in range(c0, c0 + w):
                if 0 <= r < n and 0 <= c < n:
                    s.add((r, c))

    for r0, c0 in [(0, 0), (0, n - 7), (n - 7, 0)]:
        box(r0 - 1, c0 - 1, 9, 9)
    for i in range(8, n - 8):
        s.add((6, i))
        s.add((i, 6))
    centers = {3: [6, 22], 5: [6, 30]}[version]
    for r in centers:
        for c in centers:
            if r == 6 and c == 6:
                continue
            in_finder = (
                (r <= 8 and c <= 8)
                or (r <= 8 and c >= n - 9)
                or (r >= n - 9 and c <= 8)
            )
            if in_finder or r == 6 or c == 6:
                continue
            box(r - 2, c - 2, 5, 5)
    s.add((4 * version + 9, 8))
    return s


def format_modules(version: int) -> set[tuple[int, int]]:
    n = 17 + 4 * version
    s: set[tuple[int, int]] = set()
    for c in range(9):
        s.add((8, c))
    for r in range(9):
        s.add((r, 8))
    for c in range(n - 8, n):
        s.add((8, c))
    for r in range(n - 7, n):
        s.add((r, 8))
    return s


def analyze(label: str, version: int, ec, payload: bytes) -> None:
    n = 17 + 4 * version
    template = structural_modules(version) | format_modules(version)
    qr = qrcode.QRCode(version=version, error_correction=ec, box_size=1, border=0)
    qr.add_data(payload)
    qr.make(fit=False)
    mat = qr.get_matrix()
    hand = [(r, c) for r in range(n) for c in range(n) if (r, c) not in template]
    hand_dark = sum(1 for r, c in hand if mat[r][c])
    print(
        f"{label}: symbol {n}x{n}={n*n}; template {len(template)} modules; "
        f"hand region {len(hand)} cells; hand dark marks {hand_dark}"
    )


def main() -> None:
    print("DuraShare share QR hand-mark estimate (template-assisted)\n")
    analyze(
        "Full 24-word (V6-M, 99 B payload)",
        6,
        ERROR_CORRECT_M,
        b"SF" + bytes(range(97)),
    )
    analyze(
        "Compact 24-word (V3-L, 53 B payload)",
        3,
        ERROR_CORRECT_L,
        b"SC" + bytes(range(51)),
    )


if __name__ == "__main__":
    main()
