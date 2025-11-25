# Test Strategy

## Overview

The test suite is organized into two tiers to balance comprehensive coverage with fast feedback cycles in CI/CD pipelines.

---

## Test Tiers

### 🚀 **Tier 1: Basic Tests** (CI/CD Pipeline)

**File:** `tests/happy-path.spec.js`

**Purpose:** Quick smoke tests that catch major regressions

**When to Run:**
- ✅ Every commit
- ✅ Every pull request
- ✅ Every push to main/master
- ✅ Before starting development work

**Characteristics:**
- **Speed:** < 30 seconds
- **Coverage:** Representative scenarios
- **Test Count:** 3-5 tests
- **Focus:** Core functionality validation

**Current Tests:**
1. 2-of-3 with 24 words (shares 1,2)
2. 2-of-4 with 12 words (shares 3,4)
3. 3-of-5 with 24 words (shares 1,3,5)

**Run Command:**
```bash
npx playwright test tests/happy-path.spec.js
```

---

### 🔬 **Tier 2: Comprehensive Tests** (Pre-Release/Nightly)

**File:** `tests/happy-path-comprehensive.spec.js`

**Purpose:** Exhaustive validation of all share combinations

**When to Run:**
- ✅ Before releases
- ✅ Nightly builds
- ✅ Manual trigger before major changes
- ✅ After cryptographic logic changes

**Characteristics:**
- **Speed:** 2-5 minutes (can run in parallel)
- **Coverage:** All possible combinations
- **Test Count:** 38 tests
- **Focus:** Complete validation

**Test Coverage:**
- **12-word mnemonics:**
  - 3 tests for 2-of-3 (all combinations)
  - 6 tests for 2-of-4 (all combinations)
  - 10 tests for 3-of-5 (all combinations)
- **24-word mnemonics:**
  - 3 tests for 2-of-3 (all combinations)
  - 6 tests for 2-of-4 (all combinations)
  - 10 tests for 3-of-5 (all combinations)

**Run Command:**
```bash
npx playwright test tests/happy-path-comprehensive.spec.js
```

**Parallel Execution:**
```bash
npx playwright test tests/happy-path-comprehensive.spec.js --workers=4
```

---

## Test Architecture

### Data-Driven Approach

All tests use a data-driven approach with individual test cases to provide:

✅ **Better Error Reporting**
- Know exactly which share combination failed
- Example: "24 words E2E 2-of-4 share 3,4 FAILED" vs "Test suite failed"

✅ **Parallel Execution**
- Playwright can run multiple tests concurrently
- Reduces total execution time significantly

✅ **Test Isolation**
- One failure doesn't stop other tests
- Complete picture of what works and what doesn't

✅ **Granular Control**
- Can skip specific tests: `test.skip(...)`
- Can focus on specific tests: `test.only(...)`
- Can add custom timeouts per test

✅ **Better CI/CD Reporting**
- See "34/38 tests passed" instead of "Test suite failed"
- Track test results over time
- Identify patterns in failures

---

## Validation Tests

**File:** `tests/validation.spec.js`

**Purpose:** Test error handling and validation logic

**Coverage:**
- Invalid mnemonic checksums
- Modified share data detection
- Invalid recovery data handling
- Edge cases and error conditions

**Run Command:**
```bash
npx playwright test tests/validation.spec.js
```

---

## Edge Case Tests

**File:** `tests/edge-cases.spec.js`

**Purpose:** Boundary value testing with extreme field values

**When to Run:**
- ✅ With comprehensive tests (pre-release)
- ✅ After changes to field arithmetic
- ✅ After changes to polynomial logic
- ✅ After changes to BIP39 validation

**Test Coverage:**

### Share Creation with Extreme Mnemonics (4 tests)
Tests polynomial handling with repeated values:
- 12-word all-"abandon" mnemonic (2-of-3)
- 24-word all-"abandon" mnemonic (2-of-3)
- 12-word all-"zoo" mnemonic (3-of-5)
- 24-word all-"zoo" mnemonic (3-of-5)

### Recovery with Extreme Field Values (5 tests)
Tests field arithmetic at boundaries (GF(2053)):

**Minimum Values (All 0s):**
- 12-word 2-of-3 with all zeros (words=0, checksums=0, master=0)
- 24-word 2-of-3 with all zeros (words=0, checksums=0, master=0)

**High Values (Near BIP39 Maximum 2047):**
- 12-word 3-of-5 with high values (shares 1,2,4):
  - Share 1: words=2045, checksums=2033, master=1979
  - Share 2: words=2041, checksums=2029, master=1975
  - Share 4: words=2027, checksums=2015, master=1961
  
- 24-word 3-of-5 with high values (shares 1,2,4):
  - Share 1: words=2045, checksums=2033, master=1907
  - Share 2: words=2041, checksums=2029, master=1903
  - Share 4: words=2027, checksums=2015, master=1889

**Field Maximum (2052) with Large Lagrange Coefficients:**
- 24-word 3-of-5 testing BigInt overflow (shares 1,2,4):
  - Share 1: words=1000, checksums=947, master=1417
  - Share 2: words=2052 (p-1 in GF(2053)), checksums=2050, master=2029
  - Share 4: words=1500, checksums=394, master=1099
  - Lagrange coefficients: (687, 2051, 1369) - largest for supported schemes
  - Expected recovery: 1797 (valid BIP39 value)
  - Tests: BigInt multiplication overflow scenarios and field maximum handling

These values validate field arithmetic at boundaries with mathematically valid Schiavinato checksums while triggering BIP39 validation warnings.

**What These Tests Validate:**
- ✅ Lagrange interpolation works at field boundaries
- ✅ BIP39 validation is independent from Schiavinato validation
- ✅ System handles invalid BIP39 checksums gracefully
- ✅ Warning modals appear correctly
- ✅ Recovery completes despite BIP39 errors

**Run Command:**
```bash
npx playwright test tests/edge-cases.spec.js
```

---

## Running All Tests

### Run Everything
```bash
npx playwright test
```

### Run with UI (for debugging)
```bash
npx playwright test --ui
```

### Run specific test file
```bash
npx playwright test tests/happy-path.spec.js
```

### Run with multiple workers (parallel)
```bash
npx playwright test --workers=4
```

### Run in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Generate HTML report
```bash
npx playwright test
npx playwright show-report
```

---

## CI/CD Integration

### Recommended GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  basic-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd Schiavinato_Sharing/tools/html && npm ci
      - name: Install Playwright browsers
        run: cd Schiavinato_Sharing/tools/html && npx playwright install --with-deps chromium
      - name: Run basic tests
        run: cd Schiavinato_Sharing/tools/html && npx playwright test tests/happy-path.spec.js tests/validation.spec.js
  
  comprehensive-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule' || github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd Schiavinato_Sharing/tools/html && npm ci
      - name: Install Playwright browsers
        run: cd Schiavinato_Sharing/tools/html && npx playwright install --with-deps
      - name: Run comprehensive tests
        run: cd Schiavinato_Sharing/tools/html && npx playwright test tests/happy-path-comprehensive.spec.js --workers=4
```

---

## Test Maintenance

### Adding New Test Cases

**For Basic Tests (happy-path.spec.js):**
- Add only representative scenarios
- Keep total execution time < 30 seconds
- Focus on most critical paths

**For Comprehensive Tests (happy-path-comprehensive.spec.js):**
- Add to the `testCases` array
- Follow the format: `[wordCount, scheme, shareIndices, description]`
- Tests are automatically organized into describe blocks

### Test Data

**Mnemonics Used:**
- 12-word: `abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about`
- 24-word: `abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art`

These are valid BIP39 mnemonics with proper checksums, safe for testing.

---

## Benefits of This Approach

### For Developers
- Fast feedback during development (< 30 seconds)
- Complete confidence before releases (comprehensive tests)
- Easy to debug specific scenarios
- Clear test organization

### For CI/CD
- Quick pipeline execution on every commit
- Detailed failure reporting
- Parallelizable tests for speed
- Flexible execution strategies

### For Quality Assurance
- 100% coverage of share combinations
- Isolated test cases for precise debugging
- Historical test result tracking
- Easy identification of regression patterns

---

## Future Enhancements

Potential additions to the test suite:

1. **Performance Tests**
   - Measure share generation time
   - Measure recovery time
   - Validate acceptable latency

2. **Cross-Browser Tests**
   - Validate all functionality in Chrome, Firefox, Safari
   - Currently focused on Chromium for speed

3. **Stress Tests**
   - Generate/recover many wallets in sequence
   - Memory leak detection
   - Browser performance under load

4. **Integration Tests**
   - Test with real wallet imports
   - Validate against external BIP39 validators
   - Cross-implementation compatibility

---

## Questions?

For questions or suggestions about the test strategy, please open an issue or discussion in the repository.

