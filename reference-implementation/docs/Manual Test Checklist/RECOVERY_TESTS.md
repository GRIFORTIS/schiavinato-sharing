# Recovery UI Manual Test Checklist

These scenarios keep exploratory testing consistent until we automate the suite. For each test, work entirely offline and use `Schiavinato_Sharing/tools/html/schiavinato_sharing.html` opened from disk.

## 1. Happy Path (Baseline)
1. Choose the `Recover Wallet` flow, select `24 words` and `k=2` (or `k=3` depending on the scheme you generated).
2. Enter known-good share worksheets with matching row/master values.
3. Click **Recover Wallet**.
4. **Expect:** Recovery succeeds, no inputs are highlighted, and the modal transitions to the success screen with the reconstructed mnemonic.

## 2. Blank / Malformed Fields
1. With `k` selected, leave one or more inputs empty (share number, one word, checksum, or master).
2. Click **Recover Wallet**.
3. **Expect:** The empty fields remain highlighted with tooltips explaining the requirement; modal shows a short error summary and no crypto work is attempted.

## 3. Duplicate Share Numbers
1. Enter two shares using the same `Share Number (X)` value.
2. Click **Recover Wallet**.
3. **Expect:** Both duplicate `X` inputs are highlighted with a “duplicate share number” tooltip and the modal reports the issue.

## 4. Row Checksum Failure
1. Type valid-looking word/checksum combos except alter one checksum entry so it no longer matches the three words in that row.
2. Click **Recover Wallet**.
3. **Expect:** The entire row (three words + checksum) stays highlighted, modal warns about row checksum mismatch, and no reconstruction occurs.

## 5. Master Verification Failure
1. Keep every row internally consistent but change one master verification value.
2. Click **Recover Wallet** and pass the row checksum stage.
3. **Expect:** The offending master verification fields remain highlighted, modal mentions master verification failure, and no mnemonic is revealed.

## 6. GF(2053) Bounds Enforcement
1. Enter a numeric value ≥2053 in any recovery field (e.g., `2053`, `2500`, or `zebra - 3000`).
2. Click **Recover Wallet**.
3. **Expect:** That field is flagged with a “must be between 0 and 2052” message before crypto logic runs.

## 7. BIP39 Checksum Failure
1. Provide `k` consistent shares whose recovered numbers alter a single word index (e.g., manually change a row result to `2049`).
2. Click **Recover Wallet** and let the tool interpolate.
3. **Expect:** Modal states “BIP39 Checksum Invalid,” offers optional viewing of the invalid mnemonic, and highlights the affected inputs until corrected.

Repeat these scenarios whenever the Recovery UI changes or before publishing a release. Document any deviations or follow-up bugs directly in the issue tracker.

