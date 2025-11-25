# Schiavinato Sharing - End-to-End Test

## Overview

This directory contains a simple, reliable Playwright-based end-to-end test that validates the complete share creation and recovery workflow for the Schiavinato Sharing HTML tool.

## Test Strategy

The test suite is organized into **two tiers** for optimal CI/CD performance:

### 🚀 Tier 1: Basic Tests (CI/CD)
- **File**: `tests/happy-path.spec.js`
- **Purpose**: Quick smoke tests (< 30 seconds)
- **Coverage**: 3 representative scenarios
- **Run on**: Every commit, PR, push

### 🔬 Tier 2: Comprehensive Tests (Pre-Release)
- **File**: `tests/happy-path-comprehensive.spec.js`
- **Purpose**: All 38 share combinations
- **Coverage**: 12/24 words × 2-of-3/2-of-4/3-of-5 × all share permutations
- **Run on**: Before releases, nightly builds

📖 **See [TEST_STRATEGY.md](./TEST_STRATEGY.md) for detailed strategy documentation**

## Test Coverage

The tests validate:

1. ✅ **Share Creation**: Creates shares from known BIP39 mnemonics
2. ✅ **Data Extraction**: Extracts share numbers, master verification codes, words, and checksums
3. ✅ **Navigation**: Navigates between pages (Create → Recovery)
4. ✅ **Recovery Setup**: Configures recovery parameters (12/24 words, k=2/3)
5. ✅ **Data Input**: Fills in share data into recovery form
6. ✅ **Wallet Recovery**: Recovers the original mnemonic
7. ✅ **Validation**: Verifies exact match between original and recovered mnemonic
8. ✅ **All Combinations**: Tests all possible share selection permutations

## Files Created

```
tools/html/
├── package.json                        # Dependencies and test scripts
├── playwright.config.js                # Playwright configuration
├── .gitignore                         # Excludes test artifacts
├── TEST_MNEMONIC.md                   # Test mnemonic documentation
├── TEST_STRATEGY.md                   # Test strategy documentation
├── TESTING_README.md                  # This file
└── tests/
    ├── test-helpers.js                # Shared utility functions
    ├── happy-path.spec.js             # Basic tests (CI/CD)
    ├── happy-path-comprehensive.spec.js # All 38 combinations
    ├── validation.spec.js             # Error handling tests
    └── edge-cases.spec.js             # Boundary value tests
```

## Quick Start

### First-Time Setup

```bash
cd "/path/to/Schiavinato_Sharing/tools/html"
npm install
npx playwright install chromium
```

### Running Tests

**Run basic tests (CI/CD - fast):**
```bash
npm test
```

**Run comprehensive tests (all 38 combinations):**
```bash
npx playwright test tests/happy-path-comprehensive.spec.js
```

**Run all tests:**
```bash
npx playwright test
```

**Run with parallel execution (faster):**
```bash
npx playwright test --workers=4
```

**Run edge case tests (boundary values):**
```bash
npx playwright test tests/edge-cases.spec.js
```

### Expected Output

```
Running 1 test using 1 worker

Phase 1: Creating shares...
Extracting share data...
Share 1: { number: '1', master: '1471', wordCount: 24, checksumCount: 8 }
Share 2: { number: '2', master: '0240', wordCount: 24, checksumCount: 8 }
Phase 2: Navigating to recovery...
Phase 3: Filling recovery form...
Phase 4: Recovering wallet...
Original mnemonic: sand design enrich young absurd maximum fancy obvious system code spider grit toilet minimum also orchard birth scatter horn bargain beauty media rapid parade
Recovered mnemonic: sand design enrich young absurd maximum fancy obvious system code spider grit toilet minimum also orchard birth scatter horn bargain beauty media rapid parade
✅ Test passed! Mnemonic recovered successfully.

1 passed (2.2s)
```

## Test Details

### Test Mnemonic

**24-word BIP39 mnemonic:**
```
sand design enrich young absurd maximum fancy obvious system code spider grit toilet minimum also orchard birth scatter horn bargain beauty media rapid parade
```

⚠️ **FOR TESTING ONLY** - Never use this mnemonic for real funds.

### Test Configuration

- **Browser**: Chromium (headless)
- **Timeout**: 15 seconds per test
- **Scheme**: 2-of-3 (requires 2 shares out of 3 to recover)
- **Word Count**: 24 words
- **Protocol**: file:// (matches real-world air-gapped usage)

### Key Features

1. **Offline Testing**: Opens HTML directly from disk (no web server required)
2. **Custom Element Handling**: Correctly handles custom-styled checkboxes and radio buttons
3. **Dynamic Form Generation**: Waits for dynamically generated form elements
4. **Format Parsing**: Correctly parses "word - ####" share data format
5. **Page Reload Handling**: Manages confirmation dialogs and page reloads
6. **1-indexed Inputs**: Correctly handles 1-indexed share input fields

## Troubleshooting

### Test Fails

1. Check that `schiavinato_sharing.html` is in the same directory
2. Ensure Playwright browsers are installed: `npx playwright install chromium`
3. Review the screenshot in `test-results/` directory
4. Watch the video recording in `test-results/` directory

### Run in Headed Mode

To see the browser in action:

```bash
npm test -- --headed
```

### Debug Mode

To step through the test:

```bash
npm test -- --debug
```

## Test Execution Time

- **Full test**: ~2-3 seconds
- **With browser startup**: ~5 seconds

## Technical Implementation

### Helper Functions

The test uses modular helper functions for:

- `openApp(page)` - Opens app and accepts disclaimer
- `navigateToCreateShares(page)` - Navigates to create page
- `select24Words(page)` - Selects 24-word option
- `fillMnemonic(page, mnemonic)` - Fills mnemonic words
- `selectScheme(page, scheme)` - Selects share scheme
- `generateShares(page)` - Generates shares
- `extractShareData(page, index)` - Extracts share data from display
- `navigateToRecover(page)` - Returns to home and navigates to recovery
- `setupRecovery(page, wordCount, k)` - Configures recovery parameters
- `fillRecoveryShare(page, index, data)` - Fills share into recovery form
- `recoverWallet(page)` - Triggers wallet recovery
- `getRecoveredMnemonic(page)` - Extracts recovered mnemonic

### Fixed Issues from Original Plan

During implementation, several issues were discovered and fixed:

1. **Share Data Structure**: Updated selectors to match actual HTML structure (`.share-metadata p` instead of `.share-number`)
2. **Navigation**: Used `#btn-start-over-create` with confirmation dialog instead of non-existent back button
3. **Page Reload**: Handled `window.location.reload()` and re-accepting disclaimer
4. **Radio Buttons**: Used `label[for="..."]` instead of direct radio input clicks
5. **Share Indices**: Corrected to 1-indexed (share 1, share 2) instead of 0-indexed
6. **Input IDs**: Used correct format `word-0` and `checksum` instead of `w0` and `c`

## Next Steps

### Completed ✅

1. ✅ All test cases (3-of-5 scheme, 12-word mnemonics) - **38 tests total**
2. ✅ Test error conditions (invalid inputs, mismatched shares) - **validation.spec.js**
3. ✅ Two-tier test strategy (CI/CD + Comprehensive)

### Possible Future Enhancements

1. Add visual regression testing
2. Test browser compatibility (Firefox, Safari) - currently focused on Chromium
3. Add performance benchmarks (share generation/recovery timing)
4. Stress testing (memory leaks, multiple operations)
5. Integration with real wallet software

### Before Production Use

✅ All tests passing
✅ Validates core functionality
✅ Ready for TailOS deployment

## Security Note

This test runs completely offline using the file:// protocol, matching the security-first design of the Schiavinato Sharing tool for air-gapped environments.

---

**Status**: ✅ Complete and Working

**Last Updated**: November 2025

