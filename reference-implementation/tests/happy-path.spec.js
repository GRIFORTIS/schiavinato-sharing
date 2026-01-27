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

test('complete happy path: create 2-of-3 shares (24 words) and recover', async ({ page }) => {
  // Test mnemonic (24 words)
  const originalMnemonic = 'abandon zoo enhance young join maximum fancy call minimum code spider olive alcohol system also share birth profit horn bargain beauty media rapid tattoo';
  
  // PHASE 1: Create Shares
  console.log('Phase 1: Creating shares...');
  await openApp(page);
  await navigateToCreateShares(page);
  await select24Words(page);
  await fillMnemonic(page, originalMnemonic);
  await selectScheme(page, '2of3');
  await generateShares(page);
  
  // Extract shares 1 and 2 (need 2 for 2-of-3)
  console.log('Extracting share data...');
  const share1 = await extractShareData(page, 0);
  const share2 = await extractShareData(page, 1);
  
  console.log('Share 1:', {
    number: share1.shareNumber,
    globalIntegrityCheck: share1.globalIntegrityCheck,
    wordCount: share1.words.length,
    checksumCount: share1.checksums.length
  });
  
  console.log('Share 2:', {
    number: share2.shareNumber,
    globalIntegrityCheck: share2.globalIntegrityCheck,
    wordCount: share2.words.length,
    checksumCount: share2.checksums.length
  });
  
  // Validate share data structure
  expect(share1.words).toHaveLength(24);
  expect(share1.checksums).toHaveLength(8);
  expect(share2.words).toHaveLength(24);
  expect(share2.checksums).toHaveLength(8);
  
  // PHASE 2: Navigate to Recovery
  console.log('Phase 2: Navigating to recovery...');
  await navigateToRecover(page);
  await setupRecovery(page, 24, 2);
  
  // PHASE 3: Fill Recovery Data
  console.log('Phase 3: Filling recovery form...');
  await fillRecoveryShare(page, 1, share1);  // Share inputs are 1-indexed
  await fillRecoveryShare(page, 2, share2);
  
  // PHASE 4: Recover and Validate
  console.log('Phase 4: Recovering wallet...');
  await recoverWallet(page);
  const recoveredMnemonic = await getRecoveredMnemonic(page);
  
  console.log('Original mnemonic:', originalMnemonic);
  console.log('Recovered mnemonic:', recoveredMnemonic);
  
  // ASSERT: Exact match
  expect(recoveredMnemonic.trim()).toBe(originalMnemonic);
  
  console.log('✅ Test passed! Mnemonic recovered successfully.');
});

test('complete happy path: create 2-of-4 shares (12 words) and recover with shares 3 and 4', async ({ page }) => {
  // Test mnemonic (12 words)
  const originalMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
  
  // PHASE 1: Create Shares
  console.log('Phase 1: Creating shares...');
  await openApp(page);
  await navigateToCreateShares(page);
  await select12Words(page);
  await fillMnemonic(page, originalMnemonic);
  await selectScheme(page, '2of4');
  await generateShares(page);
  
  // Extract shares 3 and 4 (testing with non-first shares)
  console.log('Extracting share data...');
  const share3 = await extractShareData(page, 2);  // Index 2 = Share 3
  const share4 = await extractShareData(page, 3);  // Index 3 = Share 4
  
  console.log('Share 3:', {
    number: share3.shareNumber,
    globalIntegrityCheck: share3.globalIntegrityCheck,
    wordCount: share3.words.length,
    checksumCount: share3.checksums.length
  });
  
  console.log('Share 4:', {
    number: share4.shareNumber,
    globalIntegrityCheck: share4.globalIntegrityCheck,
    wordCount: share4.words.length,
    checksumCount: share4.checksums.length
  });
  
  // Validate share data structure (12 words = 4 checksums)
  expect(share3.words).toHaveLength(12);
  expect(share3.checksums).toHaveLength(4);
  expect(share4.words).toHaveLength(12);
  expect(share4.checksums).toHaveLength(4);
  
  // PHASE 2: Navigate to Recovery
  console.log('Phase 2: Navigating to recovery...');
  await navigateToRecover(page);
  await setupRecovery(page, 12, 2);
  
  // PHASE 3: Fill Recovery Data
  console.log('Phase 3: Filling recovery form...');
  await fillRecoveryShare(page, 1, share3);  // Share inputs are 1-indexed
  await fillRecoveryShare(page, 2, share4);
  
  // PHASE 4: Recover and Validate
  console.log('Phase 4: Recovering wallet...');
  await recoverWallet(page);
  const recoveredMnemonic = await getRecoveredMnemonic(page);
  
  console.log('Original mnemonic:', originalMnemonic);
  console.log('Recovered mnemonic:', recoveredMnemonic);
  
  // ASSERT: Exact match
  expect(recoveredMnemonic.trim()).toBe(originalMnemonic);
  
  console.log('✅ Test passed! Mnemonic recovered successfully with shares 3 and 4.');
});

test('complete happy path: create 3-of-5 shares (24 words) and recover with shares 1, 3, and 5', async ({ page }) => {
  // Test mnemonic (24 words)
  const originalMnemonic = 'abandon zoo enhance young join maximum fancy call minimum code spider olive alcohol system also share birth profit horn bargain beauty media rapid tattoo';
  
  // PHASE 1: Create Shares
  console.log('Phase 1: Creating shares...');
  await openApp(page);
  await navigateToCreateShares(page);
  await select24Words(page);
  await fillMnemonic(page, originalMnemonic);
  await selectScheme(page, '3of5');
  await generateShares(page);
  
  // Extract shares 1, 3, and 5 (testing with non-consecutive shares)
  console.log('Extracting share data...');
  const share1 = await extractShareData(page, 0);  // Index 0 = Share 1
  const share3 = await extractShareData(page, 2);  // Index 2 = Share 3
  const share5 = await extractShareData(page, 4);  // Index 4 = Share 5
  
  console.log('Share 1:', {
    number: share1.shareNumber,
    globalIntegrityCheck: share1.globalIntegrityCheck,
    wordCount: share1.words.length,
    checksumCount: share1.checksums.length
  });
  
  console.log('Share 3:', {
    number: share3.shareNumber,
    globalIntegrityCheck: share3.globalIntegrityCheck,
    wordCount: share3.words.length,
    checksumCount: share3.checksums.length
  });
  
  console.log('Share 5:', {
    number: share5.shareNumber,
    globalIntegrityCheck: share5.globalIntegrityCheck,
    wordCount: share5.words.length,
    checksumCount: share5.checksums.length
  });
  
  // Validate share data structure (24 words = 8 checksums)
  expect(share1.words).toHaveLength(24);
  expect(share1.checksums).toHaveLength(8);
  expect(share3.words).toHaveLength(24);
  expect(share3.checksums).toHaveLength(8);
  expect(share5.words).toHaveLength(24);
  expect(share5.checksums).toHaveLength(8);
  
  // PHASE 2: Navigate to Recovery
  console.log('Phase 2: Navigating to recovery...');
  await navigateToRecover(page);
  await setupRecovery(page, 24, 3);
  
  // PHASE 3: Fill Recovery Data
  console.log('Phase 3: Filling recovery form...');
  await fillRecoveryShare(page, 1, share1);  // Share inputs are 1-indexed
  await fillRecoveryShare(page, 2, share3);
  await fillRecoveryShare(page, 3, share5);
  
  // PHASE 4: Recover and Validate
  console.log('Phase 4: Recovering wallet...');
  await recoverWallet(page);
  const recoveredMnemonic = await getRecoveredMnemonic(page);
  
  console.log('Original mnemonic:', originalMnemonic);
  console.log('Recovered mnemonic:', recoveredMnemonic);
  
  // ASSERT: Exact match
  expect(recoveredMnemonic.trim()).toBe(originalMnemonic);
  
  console.log('✅ Test passed! Mnemonic recovered successfully with shares 1, 3, and 5.');
});

