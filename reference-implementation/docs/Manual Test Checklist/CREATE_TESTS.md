# Create Share Flow Manual Test Checklist

These scenarios keep exploratory testing consistent until we automate the suite. For each test, work entirely offline and use `Schiavinato_Sharing/tools/html/schiavinato_sharing.html` opened from disk.

## 1. Happy Path (Baseline)
1. Choose the `Create Shares` flow from the home page.
2. Enter a valid 24-word BIP39 mnemonic (e.g., use the test vector from `TEST_VECTORS.md`: "spin result brand ahead poet carpet unusual chronic denial festival toy autumn").
3. Select the 2-of-3 scheme.
4. Optionally add a wallet identifier (e.g., "Main Wallet") and select today's date.
5. Click **Generate Shares**.
6. **Expect:** Page 2 displays with exactly 3 share cards, each containing proper metadata (wallet identifier, date, share number, scheme, word count), 24 word shares in "word - ####" format, 8 row checksums (C1-C8), and a master verification value.

## 2. Invalid BIP39 Mnemonic

### 2a. Incorrect Checksum
1. Enter 24 words where the last word creates an invalid BIP39 checksum (e.g., change "autumn" to "abandon" in the test mnemonic).
2. Click **Generate Shares**.
3. **Expect:** Error modal stating "BIP39 checksum invalid" or similar validation error before share generation.

### 2b. Non-BIP39 Words
1. Enter one or more words not in the BIP39 wordlist (e.g., replace "spin" with "notaword").
2. Click **Generate Shares**.
3. **Expect:** Error modal indicating the invalid word(s) and their position(s).

### 2c. Misspelled Words
1. Enter valid BIP39 words with typos (e.g., "abandn" instead of "abandon").
2. Click **Generate Shares**.
3. **Expect:** Error modal identifying the misspelled word(s) or suggesting corrections.

## 3. Incomplete Input Fields

### 3a. Missing Words
1. Leave one or more word fields empty (e.g., leave word #12 blank).
2. Click **Generate Shares**.
3. **Expect:** Error message "Word #12 is missing" (or similar) and the empty field(s) highlighted or focused.

### 3b. Completely Empty Mnemonic
1. Leave all word fields blank.
2. Click **Generate Shares**.
3. **Expect:** Clear error message about missing mnemonic, no cryptographic work attempted.

## 4. Word Count Toggle (12 vs 24 words)

### 4a. Switch from 12 to 24 Words
1. Click the "12 Words" button to display 12 input fields.
2. Enter 6-8 words.
3. Click the "24 Words" button.
4. **Expect:** Form expands to 24 fields. Document whether the first 12 words are preserved or cleared.

### 4b. Switch from 24 to 12 Words
1. Start with 24-word mode (default).
2. Enter 15-20 words.
3. Click the "12 Words" button.
4. **Expect:** Form contracts to 12 fields. Document data handling behavior (preserved, cleared, or truncated).

### 4c. Generate with 12-Word Mnemonic
1. Click "12 Words" button.
2. Enter a valid 12-word BIP39 mnemonic.
3. Select a scheme and click **Generate Shares**.
4. **Expect:** Shares generated successfully with 4 row checksums (C1-C4) instead of 8, and metadata shows "Original Seed Phrase Length: 12".

## 5. Scheme Selection Verification

### 5a. 2-of-3 Scheme
1. Enter a valid 24-word mnemonic.
2. Select the "2-of-3" scheme.
3. Click **Generate Shares**.
4. **Expect:** Exactly 3 share cards displayed, metadata shows "Scheme Threshold (K): 2", share numbers are 1, 2, and 3.

### 5b. 3-of-5 Scheme
1. Enter a valid 24-word mnemonic.
2. Select the "3-of-5" scheme.
3. Click **Generate Shares**.
4. **Expect:** Exactly 5 share cards displayed, metadata shows "Scheme Threshold (K): 3", share numbers are 1, 2, 3, 4, and 5.

### 5c. Other Available Schemes
1. Test each additional scheme option available in the UI.
2. **Expect:** Correct number of shares (n) generated with proper threshold (k) displayed in metadata.

## 6. Metadata Handling

### 6a. With Wallet Identifier
1. Enter "Main Wallet" in the wallet identifier field.
2. Complete the form and generate shares.
3. **Expect:** All share cards display "Wallet Identifier: Main Wallet".

### 6b. Without Wallet Identifier
1. Leave the wallet identifier field blank.
2. Complete the form and generate shares.
3. **Expect:** All share cards display "Wallet Identifier: Default Wallet" (or similar default value).

### 6c. With Creation Date
1. Select today's date in the creation date field.
2. Complete the form and generate shares.
3. **Expect:** All share cards display "Creation Date: [selected date]" in YYYY-MM-DD format.

### 6d. Without Creation Date
1. Leave the creation date field blank.
2. Complete the form and generate shares.
3. **Expect:** Shares handle missing date gracefully (either blank, auto-filled with current date, or showing a placeholder).

### 6e. Maximum Length Identifier (40 characters)
1. Enter exactly 40 characters in the wallet identifier field (e.g., "My Very Long Wallet Name For Testing X").
2. Complete the form and generate shares.
3. **Expect:** Full identifier accepted and displayed without truncation.

### 6f. Identifier Over Limit
1. Attempt to type more than 40 characters in the wallet identifier field.
2. **Expect:** Input stops at 40 characters (maxlength enforcement), no error message needed.

## 7. Share Display Validation

### 7a. Correct Share Count
1. Generate shares with 2-of-3 scheme.
2. **Expect:** Exactly 3 share cards appear on page 2.
3. Repeat with 3-of-5 scheme.
4. **Expect:** Exactly 5 share cards appear.

### 7b. Unique Share Numbers
1. Generate shares and examine each share card.
2. **Expect:** Each share has a unique "Share Number (X)" value: 1, 2, 3... up to n.

### 7c. Master Verification Present
1. Generate shares and examine each share card.
2. **Expect:** Each share displays "Master Verification: [word] - [####]" with a valid BIP39 word (if value is 0-2047) or numeric value (if 2048-2052).

### 7d. Row Checksums
1. Generate shares with a 24-word mnemonic.
2. **Expect:** Each share displays 8 checksum values labeled C1, C2, C3, C4, C5, C6, C7, C8 (one per row of 3 words).
3. Generate shares with a 12-word mnemonic.
4. **Expect:** Each share displays 4 checksum values labeled C1, C2, C3, C4.

### 7e. Word Format
1. Generate shares and examine the word display format.
2. **Expect:** All values in range 0-2047 display as "word - ####" (e.g., "abandon - 0000").
3. **Expect:** Any values in range 2048-2052 display as numeric-only (e.g., "2050").

### 7f. Consistent Metadata Across Shares
1. Generate shares and compare metadata across all share cards.
2. **Expect:** All n shares show identical wallet identifier, creation date, scheme threshold, and original seed phrase length.

## 8. Navigation and Confirmation Modals

### 8a. Back to Step 1 - Confirm
1. Generate shares successfully (reach page 2).
2. Click the "Back to Step 1" button.
3. In the confirmation modal, click **Confirm** (or equivalent).
4. **Expect:** Returns to page 1 (Create Shares input form), previous share data is discarded.

### 8b. Back to Step 1 - Cancel
1. Generate shares successfully (reach page 2).
2. Click the "Back to Step 1" button.
3. In the confirmation modal, click **Cancel** (or equivalent).
4. **Expect:** Remains on page 2, share cards unchanged and still visible.

### 8c. Regenerate Produces Different Shares
1. Generate shares for a specific mnemonic, note the share values.
2. Click "Back to Step 1", confirm, then re-enter the same mnemonic and regenerate.
3. **Expect:** New shares have different numeric values than the first generation (due to new random polynomial coefficients), but both sets will recover to the same original mnemonic.

### 8d. Back to Home from Page 1
1. On page 1 (Create Shares input), click the "Back to Home" button.
2. **Expect:** Returns to the home page without confirmation modal (no sensitive data generated yet).

### 8e. Data Loss Warning Visible
1. Generate shares and view page 2.
2. **Expect:** A prominent alert box with text like "ATTENTION: This data will not be saved. After closing this page, it will be gone forever." is clearly visible.

## 9. Edge Cases and Boundaries

### 9a. Minimum Valid Input
1. Enter a valid 12-word BIP39 mnemonic.
2. Leave wallet identifier blank, leave date blank.
3. Select 2-of-3 scheme.
4. Click **Generate Shares**.
5. **Expect:** Shares generated successfully with default/blank metadata values.

### 9b. Maximum Valid Input
1. Enter a valid 24-word BIP39 mnemonic.
2. Enter a 40-character wallet identifier.
3. Select a creation date.
4. Select 3-of-5 scheme (or highest available).
5. Click **Generate Shares**.
6. **Expect:** Shares generated successfully with all metadata populated.

### 9c. Special Characters in Identifier
1. Enter wallet identifier with quotes: `"Main" Wallet`.
2. Generate shares.
3. **Expect:** Characters accepted and displayed correctly (or sanitized appropriately).
4. Repeat with symbols: `Wallet #1 (2025)`.
5. **Expect:** Similar handling.

### 9d. Future Date
1. Select a date in the future (e.g., one year from now).
2. Generate shares.
3. **Expect:** Date accepted without validation error (or warning if validation exists).

### 9e. Past Date
1. Select a date from years ago (e.g., 2020-01-01).
2. Generate shares.
3. **Expect:** Date accepted without validation error.

### 9f. Tab Navigation Through Word Inputs
1. On page 1, click in the first word input field.
2. Press Tab repeatedly to navigate through all word fields.
3. **Expect:** Tab order progresses logically through word inputs (1→2→3...→24), then to the "Generate Shares" button.

### 9g. Print Button State
1. Generate shares and view page 2.
2. Locate the "Print Shares" button.
3. **Expect:** Button is disabled (grayed out).
4. Hover over the button.
5. **Expect:** Tooltip displays "Printing will be available soon" or similar message.

## 10. Cross-Validation with Recovery Flow

### 10a. Round-Trip Test (2-of-3)
1. Generate shares for a known 24-word mnemonic using 2-of-3 scheme.
2. Manually transcribe or note shares #1 and #2.
3. Navigate to the Recovery flow.
4. Enter shares #1 and #2 with k=2.
5. Click **Recover Wallet**.
6. **Expect:** Recovered mnemonic matches the original exactly, all checksums pass.

### 10b. Round-Trip Test (3-of-5)
1. Generate shares for a known mnemonic using 3-of-5 scheme.
2. Manually transcribe shares #1, #3, and #5.
3. Navigate to the Recovery flow.
4. Enter shares #1, #3, and #5 with k=3.
5. Click **Recover Wallet**.
6. **Expect:** Recovered mnemonic matches the original exactly.

### 10c. Verify Insufficient Shares Fail
1. Generate 3 shares using 2-of-3 scheme.
2. Attempt recovery using only share #1 (if the UI allows k=1 selection for testing).
3. **Expect:** Recovery fails or UI prevents attempting recovery with insufficient shares.

Repeat these scenarios whenever the Create Share UI changes or before publishing a release. Document any deviations or follow-up bugs directly in the issue tracker.

