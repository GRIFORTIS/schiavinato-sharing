# Reference Implementation: Schiavinato Sharing HTML Tool

A self-contained, browser-based reference implementation of the Schiavinato Sharing scheme.

## 📋 Overview

This directory contains:
- **`schiavinato_sharing.html`** – Single-file HTML/JavaScript application (copy from `tools/html/` in migration)
- **`tests/`** – Comprehensive Playwright test suite
- **`docs/`** – Implementation documentation

## 🚀 Quick Start

### For End Users

1. Download or open `schiavinato_sharing.html`
2. Open in any modern web browser (Chrome, Firefox, Safari, Edge)
3. Follow the on-screen instructions

**No installation, no dependencies, no network connection required.**

### For Developers

#### Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suite
npx playwright test tests/happy-path.spec.js

# Run tests in UI mode (interactive)
npx playwright test --ui

# Run tests with specific browser
npx playwright test --project=chromium
```

#### Test Coverage

The test suite includes:

- **Happy Path Tests** (`happy-path.spec.js`)
  - Standard 2-of-3 and 3-of-5 splits
  - Complete recovery flows
  - UI interaction validation

- **Edge Cases** (`edge-cases.spec.js`)
  - Invalid share formats
  - Corrupted checksums
  - Boundary conditions
  - Error handling

- **Validation Tests** (`validation.spec.js`)
  - Input validation
  - BIP39 wordlist checking
  - Parameter constraints

- **Comprehensive Tests** (`happy-path-comprehensive.spec.js`)
  - Extended scenarios
  - Multiple threshold combinations
  - Cross-browser compatibility

## 📁 File Structure

```
reference-implementation/
├── schiavinato_sharing.html      # Main application (COPY FROM tools/html/)
├── package.json                  # Test dependencies
├── playwright.config.js          # Test configuration
├── tests/
│   ├── happy-path.spec.js
│   ├── edge-cases.spec.js
│   ├── validation.spec.js
│   ├── happy-path-comprehensive.spec.js
│   └── test-helpers.js
├── docs/
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── COMPREHENSIVE_TESTS_SUMMARY.md
│   ├── TEST_STRATEGY.md
│   └── Manual Test Checklist/
│       ├── CREATE_TESTS.md
│       └── RECOVERY_TESTS.md
└── README.md                     # This file
```

## 🧪 Test Requirements

- **Node.js**: 18+ or 20+ LTS
- **npm**: 9+ (comes with Node.js)
- **Playwright**: Automatically installed via `npm install`

## 📊 Test Results

Tests run automatically on:
- Every push to `main` or `develop` branches
- Every pull request affecting the reference implementation
- Manual workflow dispatch

View test results in the GitHub Actions tab.

## 🔧 Development

### Making Changes

1. Edit `schiavinato_sharing.html`
2. Run tests: `npm test`
3. Check for regressions
4. Update tests if behavior changes intentionally

### Adding Tests

1. Create or modify test files in `tests/`
2. Use `test-helpers.js` for common utilities
3. Follow existing patterns for consistency
4. Ensure tests are deterministic and isolated

### Test Helpers

The `test-helpers.js` file provides utilities for:
- Filling forms
- Extracting share data
- Validating outputs
- Common test assertions

Example:
```javascript
const { fillMnemonicForm, extractShares } = require('./test-helpers');

test('my test', async ({ page }) => {
  await page.goto('file://' + path.resolve(__dirname, '../schiavinato_sharing.html'));
  await fillMnemonicForm(page, {
    mnemonic: 'abandon abandon ... art',
    threshold: 2,
    totalShares: 3
  });
  const shares = await extractShares(page);
  expect(shares).toHaveLength(3);
});
```

## 📖 Documentation

- **[IMPLEMENTATION_SUMMARY.md](docs/IMPLEMENTATION_SUMMARY.md)** – Architecture and design decisions
- **[TEST_STRATEGY.md](docs/TEST_STRATEGY.md)** – Testing approach and philosophy
- **[COMPREHENSIVE_TESTS_SUMMARY.md](docs/COMPREHENSIVE_TESTS_SUMMARY.md)** – Detailed test coverage report

## ⚠️ Important Notes

### Self-Contained Design

The HTML file is intentionally **self-contained**:
- All JavaScript embedded in the HTML
- No external dependencies at runtime
- Can be saved and used offline
- Survives copy/paste and email transfer

This is a **feature**, not a bug. It ensures the tool remains usable even if:
- GitHub goes down
- npm packages become unavailable
- Network connections are limited
- Users are in air-gapped environments

### Production Use Warning

This is a **reference implementation** for:
- ✅ Learning the Schiavinato Sharing scheme
- ✅ Testing and validation
- ✅ Educational purposes
- ✅ Comparing against library implementations

For production use, prefer the [JavaScript library](https://github.com/GRIFORTIS/schiavinato-sharing-js) which offers:
- Better modularity
- npm package management
- TypeScript types
- Tree-shaking and optimization

## 🐛 Found a Bug?

1. Check if it's already reported in [Issues](https://github.com/GRIFORTIS/schiavinato-sharing-spec/issues)
2. If not, create a new issue using the "Bug Report" template
3. Include:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and OS
   - Console logs (if available)

## 🤝 Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

When contributing to the reference implementation:
- Maintain the self-contained nature
- Add tests for new features
- Update documentation
- Follow existing code style

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

---

**Note**: After migration, ensure `schiavinato_sharing.html` is copied from `Schiavinato_Sharing/tools/html/` to this directory.

