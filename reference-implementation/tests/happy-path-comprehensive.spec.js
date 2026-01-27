import { test, expect } from '@playwright/test';
import {
  openApp,
  navigateToCreateShares,
  select12Words,
  select24Words,
  fillMnemonic,
  selectScheme,
  generateShares,
  extractShareData,
  navigateToRecover,
  setupRecovery,
  fillRecoveryShare,
  recoverWallet,
  getRecoveredMnemonic
} from './test-helpers.js';

// Test mnemonics
const MNEMONIC_12 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const MNEMONIC_24 = 'abandon zoo enhance young join maximum fancy call minimum code spider olive alcohol system also share birth profit horn bargain beauty media rapid tattoo';

/**
 * Comprehensive test suite for all share combinations
 * Tests every possible recovery scenario for 2-of-3, 2-of-4, and 3-of-5 schemes
 * with both 12 and 24 word mnemonics
 */

// Test data structure: [wordCount, scheme, shareIndicesToExtract, testDescription]
const testCases = [
  // 12 words - 2-of-3
  [12, '2of3', [0, 1], '12 words E2E 2-of-3 share 1,2'],
  [12, '2of3', [0, 2], '12 words E2E 2-of-3 share 1,3'],
  [12, '2of3', [1, 2], '12 words E2E 2-of-3 share 2,3'],
  
  // 12 words - 2-of-4
  [12, '2of4', [0, 1], '12 words E2E 2-of-4 share 1,2'],
  [12, '2of4', [0, 2], '12 words E2E 2-of-4 share 1,3'],
  [12, '2of4', [0, 3], '12 words E2E 2-of-4 share 1,4'],
  [12, '2of4', [1, 2], '12 words E2E 2-of-4 share 2,3'],
  [12, '2of4', [1, 3], '12 words E2E 2-of-4 share 2,4'],
  [12, '2of4', [2, 3], '12 words E2E 2-of-4 share 3,4'],
  
  // 12 words - 3-of-5
  [12, '3of5', [0, 1, 2], '12 words E2E 3-of-5 share 1,2,3'],
  [12, '3of5', [0, 1, 3], '12 words E2E 3-of-5 share 1,2,4'],
  [12, '3of5', [0, 1, 4], '12 words E2E 3-of-5 share 1,2,5'],
  [12, '3of5', [0, 2, 3], '12 words E2E 3-of-5 share 1,3,4'],
  [12, '3of5', [0, 2, 4], '12 words E2E 3-of-5 share 1,3,5'],
  [12, '3of5', [0, 3, 4], '12 words E2E 3-of-5 share 1,4,5'],
  [12, '3of5', [1, 2, 3], '12 words E2E 3-of-5 share 2,3,4'],
  [12, '3of5', [1, 2, 4], '12 words E2E 3-of-5 share 2,3,5'],
  [12, '3of5', [1, 3, 4], '12 words E2E 3-of-5 share 2,4,5'],
  [12, '3of5', [2, 3, 4], '12 words E2E 3-of-5 share 3,4,5'],
  
  // 24 words - 2-of-3
  [24, '2of3', [0, 1], '24 words E2E 2-of-3 share 1,2'],
  [24, '2of3', [0, 2], '24 words E2E 2-of-3 share 1,3'],
  [24, '2of3', [1, 2], '24 words E2E 2-of-3 share 2,3'],
  
  // 24 words - 2-of-4
  [24, '2of4', [0, 1], '24 words E2E 2-of-4 share 1,2'],
  [24, '2of4', [0, 2], '24 words E2E 2-of-4 share 1,3'],
  [24, '2of4', [0, 3], '24 words E2E 2-of-4 share 1,4'],
  [24, '2of4', [1, 2], '24 words E2E 2-of-4 share 2,3'],
  [24, '2of4', [1, 3], '24 words E2E 2-of-4 share 2,4'],
  [24, '2of4', [2, 3], '24 words E2E 2-of-4 share 3,4'],
  
  // 24 words - 3-of-5
  [24, '3of5', [0, 1, 2], '24 words E2E 3-of-5 share 1,2,3'],
  [24, '3of5', [0, 1, 3], '24 words E2E 3-of-5 share 1,2,4'],
  [24, '3of5', [0, 1, 4], '24 words E2E 3-of-5 share 1,2,5'],
  [24, '3of5', [0, 2, 3], '24 words E2E 3-of-5 share 1,3,4'],
  [24, '3of5', [0, 2, 4], '24 words E2E 3-of-5 share 1,3,5'],
  [24, '3of5', [0, 3, 4], '24 words E2E 3-of-5 share 1,4,5'],
  [24, '3of5', [1, 2, 3], '24 words E2E 3-of-5 share 2,3,4'],
  [24, '3of5', [1, 2, 4], '24 words E2E 3-of-5 share 2,3,5'],
  [24, '3of5', [1, 3, 4], '24 words E2E 3-of-5 share 2,4,5'],
  [24, '3of5', [2, 3, 4], '24 words E2E 3-of-5 share 3,4,5'],
];

// Group tests by category for better organization
test.describe('Comprehensive Happy Path Tests - All Share Combinations', () => {
  
  test.describe('12-word mnemonics', () => {
    
    test.describe('2-of-3 schemes', () => {
      const cases = testCases.filter(tc => tc[0] === 12 && tc[1] === '2of3');
      
      for (const [wordCount, scheme, shareIndices, description] of cases) {
        test(description, async ({ page }) => {
          await runE2ETest(page, wordCount, scheme, shareIndices, MNEMONIC_12);
        });
      }
    });
    
    test.describe('2-of-4 schemes', () => {
      const cases = testCases.filter(tc => tc[0] === 12 && tc[1] === '2of4');
      
      for (const [wordCount, scheme, shareIndices, description] of cases) {
        test(description, async ({ page }) => {
          await runE2ETest(page, wordCount, scheme, shareIndices, MNEMONIC_12);
        });
      }
    });
    
    test.describe('3-of-5 schemes', () => {
      const cases = testCases.filter(tc => tc[0] === 12 && tc[1] === '3of5');
      
      for (const [wordCount, scheme, shareIndices, description] of cases) {
        test(description, async ({ page }) => {
          await runE2ETest(page, wordCount, scheme, shareIndices, MNEMONIC_12);
        });
      }
    });
  });
  
  test.describe('24-word mnemonics', () => {
    
    test.describe('2-of-3 schemes', () => {
      const cases = testCases.filter(tc => tc[0] === 24 && tc[1] === '2of3');
      
      for (const [wordCount, scheme, shareIndices, description] of cases) {
        test(description, async ({ page }) => {
          await runE2ETest(page, wordCount, scheme, shareIndices, MNEMONIC_24);
        });
      }
    });
    
    test.describe('2-of-4 schemes', () => {
      const cases = testCases.filter(tc => tc[0] === 24 && tc[1] === '2of4');
      
      for (const [wordCount, scheme, shareIndices, description] of cases) {
        test(description, async ({ page }) => {
          await runE2ETest(page, wordCount, scheme, shareIndices, MNEMONIC_24);
        });
      }
    });
    
    test.describe('3-of-5 schemes', () => {
      const cases = testCases.filter(tc => tc[0] === 24 && tc[1] === '3of5');
      
      for (const [wordCount, scheme, shareIndices, description] of cases) {
        test(description, async ({ page }) => {
          await runE2ETest(page, wordCount, scheme, shareIndices, MNEMONIC_24);
        });
      }
    });
  });
});

/**
 * Reusable E2E test function
 * @param {Page} page - Playwright page object
 * @param {number} wordCount - 12 or 24
 * @param {string} scheme - '2of3', '2of4', or '3of5'
 * @param {number[]} shareIndices - Array of share indices to use for recovery (0-indexed)
 * @param {string} mnemonic - The mnemonic to test with
 */
async function runE2ETest(page, wordCount, scheme, shareIndices, mnemonic) {
  // PHASE 1: Create Shares
  await openApp(page);
  await navigateToCreateShares(page);
  
  // Select word count
  if (wordCount === 12) {
    await select12Words(page);
  } else {
    await select24Words(page);
  }
  
  await fillMnemonic(page, mnemonic);
  await selectScheme(page, scheme);
  await generateShares(page);
  
  // Extract the shares we need for recovery
  const shares = [];
  for (const index of shareIndices) {
    shares.push(await extractShareData(page, index));
  }
  
  // Validate share data structure
  const expectedChecksums = wordCount === 12 ? 4 : 8;
  for (const share of shares) {
    expect(share.words).toHaveLength(wordCount);
    expect(share.checksums).toHaveLength(expectedChecksums);
  }
  
  // PHASE 2: Navigate to Recovery
  const k = shareIndices.length; // Number of shares needed for recovery
  await navigateToRecover(page);
  await setupRecovery(page, wordCount, k);
  
  // PHASE 3: Fill Recovery Data
  for (let i = 0; i < shares.length; i++) {
    await fillRecoveryShare(page, i + 1, shares[i]); // 1-indexed
  }
  
  // PHASE 4: Recover and Validate
  await recoverWallet(page);
  const recoveredMnemonic = await getRecoveredMnemonic(page);
  
  // ASSERT: Exact match
  expect(recoveredMnemonic.trim()).toBe(mnemonic);
}

