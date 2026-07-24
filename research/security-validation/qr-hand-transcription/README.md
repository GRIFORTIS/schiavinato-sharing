# QR hand-transcription workload estimate

Structural module counts supporting the QR hand-transcription workload discussion in the Schiavinato Sharing whitepaper v0.7.0.

## What it measures

For **one share QR** with a **pre-printed structural template** (finder patterns, timing strips, alignment pattern, format-information strips), counts how many **dark modules** an operator must mark in the payload-dependent (data + error-correction) region when transcribing from a trusted display.

This is **not** a timed usability study.

## Run

```bash
pip install qrcode
python3 qr_hand_transcription_estimate.py
```

This script depends on the optional `qrcode` package. It is not required for the rest of the security-validation scripts.

Expected ballpark for 24-word representative payloads: Full ~683 dark marks; Compact ~304 (~55% fewer).
