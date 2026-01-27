# Test Mnemonic

## Purpose

This document contains the test mnemonic used for automated testing of the Schiavinato Sharing HTML tool.

## Test Mnemonic (24 words)

```
abandon zoo enhance young join maximum fancy call minimum code spider olive alcohol system also share birth profit horn bargain beauty media rapid tattoo
```

## Usage

This mnemonic is used in the `happy-path.spec.js` test to validate the complete share creation and recovery workflow:

1. **Create Phase**: The mnemonic is split into shares using a 2-of-3 scheme
2. **Recovery Phase**: Two of the three shares are used to recover the original mnemonic
3. **Validation**: The recovered mnemonic is compared with the original to ensure perfect match

## Important Notes

⚠️ **FOR TESTING ONLY** - This mnemonic is used exclusively for automated testing and should NEVER be used for real cryptocurrency wallets or assets.

## Test Characteristics

- **Word Count**: 24 words
- **Scheme**: 2-of-3 (requires 2 shares out of 3 to recover)
- **Shares Tested**: Share 1 and Share 2
- **Expected Result**: Exact recovery of original mnemonic

## Mnemonic Properties

This test mnemonic was chosen because it:
- Contains valid BIP39 words
- Has proper checksum (valid Bitcoin/cryptocurrency mnemonic)
- Represents a real-world 24-word seed phrase structure
- Provides comprehensive testing of the share creation algorithm

## Test Coverage

The automated test validates:
- ✅ Share generation from 24-word mnemonic
- ✅ Proper formatting of share data (words and checksums)
- ✅ Global Integrity Check (GIC) verification code generation
- ✅ Share metadata (share numbers, threshold)
- ✅ Recovery form input handling
- ✅ Lagrange interpolation reconstruction
- ✅ Exact mnemonic recovery

## Security Reminder

🔒 Always use **randomly generated** mnemonics for real cryptocurrency wallets. Never reuse test mnemonics or example mnemonics for actual funds.

