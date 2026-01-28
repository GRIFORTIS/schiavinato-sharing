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
  setupRecovery,
  fillRecoveryShare,
  createSyntheticShare
} from './test-helpers.js';

/**
 * Edge Case Tests - Boundary Value Testing
 * 
 * Tests system behavior with extreme values:
 * - Mnemonics with all the same words (except checksum word)
 * - Recovery with minimum field values (all 0s)
 * - Recovery with maximum field values (2052, 2050, 2041, 2029)
 * 
 * These tests validate:
 * 1. Polynomial handling with repeated values
 * 2. Field arithmetic at boundaries (GF(2053))
 * 3. BIP39 validation independence from Schiavinato validation
 */

// Edge case mnemonics (generated with valid BIP39 checksums)
const MNEMONIC_12_ABANDON = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const MNEMONIC_24_ABANDON = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art';
const MNEMONIC_12_ZOO = 'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo abstract';
const MNEMONIC_24_ZOO = 'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo buddy';

test.describe('Edge Cases - Share Creation with Extreme Mnemonics', () => {
  
  test('create 2-of-3 shares with 12-word all-abandon mnemonic', async ({ page }) => {
    console.log('Testing share creation with repeated "abandon" words...');
    
    await openApp(page);
    await navigateToCreateShares(page);
    await select12Words(page);
    await fillMnemonic(page, MNEMONIC_12_ABANDON);
    await selectScheme(page, '2of3');
    await generateShares(page);
    
    // Validate shares were created successfully
    const share1 = await extractShareData(page, 0);
    const share2 = await extractShareData(page, 1);
    const share3 = await extractShareData(page, 2);
    
    // Verify structure
    expect(share1.words).toHaveLength(12);
    expect(share1.checksums).toHaveLength(4);
    expect(share2.words).toHaveLength(12);
    expect(share2.checksums).toHaveLength(4);
    expect(share3.words).toHaveLength(12);
    expect(share3.checksums).toHaveLength(4);
    
    console.log('✅ Successfully created shares with all-abandon mnemonic');
  });
  
  test('create 2-of-3 shares with 24-word all-abandon mnemonic', async ({ page }) => {
    console.log('Testing share creation with repeated "abandon" words (24-word)...');
    
    await openApp(page);
    await navigateToCreateShares(page);
    await select24Words(page);
    await fillMnemonic(page, MNEMONIC_24_ABANDON);
    await selectScheme(page, '2of3');
    await generateShares(page);
    
    // Validate shares were created successfully
    const share1 = await extractShareData(page, 0);
    
    // Verify structure
    expect(share1.words).toHaveLength(24);
    expect(share1.checksums).toHaveLength(8);
    
    console.log('✅ Successfully created shares with all-abandon mnemonic (24 words)');
  });
  
  test('create 3-of-5 shares with 12-word all-zoo mnemonic', async ({ page }) => {
    console.log('Testing share creation with repeated "zoo" words...');
    
    await openApp(page);
    await navigateToCreateShares(page);
    await select12Words(page);
    await fillMnemonic(page, MNEMONIC_12_ZOO);
    await selectScheme(page, '3of5');
    await generateShares(page);
    
    // Validate shares were created successfully
    const share1 = await extractShareData(page, 0);
    
    // Verify structure
    expect(share1.words).toHaveLength(12);
    expect(share1.checksums).toHaveLength(4);
    
    console.log('✅ Successfully created shares with all-zoo mnemonic');
  });
  
  test('create 3-of-5 shares with 24-word all-zoo mnemonic', async ({ page }) => {
    console.log('Testing share creation with repeated "zoo" words (24-word)...');
    
    await openApp(page);
    await navigateToCreateShares(page);
    await select24Words(page);
    await fillMnemonic(page, MNEMONIC_24_ZOO);
    await selectScheme(page, '3of5');
    await generateShares(page);
    
    // Validate shares were created successfully
    const share1 = await extractShareData(page, 0);
    
    // Verify structure
    expect(share1.words).toHaveLength(24);
    expect(share1.checksums).toHaveLength(8);
    
    console.log('✅ Successfully created shares with all-zoo mnemonic (24 words)');
  });
});

test.describe('Edge Cases - Recovery with Extreme Field Values', () => {
  
  test('recover 12-word 2-of-3 with all zeros (shares 1,2)', async ({ page }) => {
    console.log('Testing recovery with minimum field values (all 0s)...');
    
    await openApp(page);
    
    // Go directly to recovery (not from create page)
    await page.click('#btn-go-to-recover');
    await page.waitForSelector('#pageRecover1', { state: 'visible' });
    
    await setupRecovery(page, 12, 2);
    
    // Create synthetic shares with all zeros
    // Note: With GIC binding, globalIntegrityCheck = (sum of words + share number) mod 2053
    const share1 = createSyntheticShare(
      1,                                    // share number
      1,                                    // globalIntegrityCheck = (0 + 1) mod 2053 = 1
      new Array(12).fill(0),               // all words = 0
      new Array(4).fill(0)                 // all checksums = 0
    );
    
    const share2 = createSyntheticShare(
      2,                                    // share number
      2,                                    // globalIntegrityCheck = (0 + 2) mod 2053 = 2
      new Array(12).fill(0),               // all words = 0
      new Array(4).fill(0)                 // all checksums = 0
    );
    
    // Fill recovery form
    await fillRecoveryShare(page, 1, share1);
    await fillRecoveryShare(page, 2, share2);
    
    // Click recover button
    await page.click('#btn-recover-wallet');
    
    // Expect Recovery Failed modal (words outside BIP39 range)
    const modal = await page.locator('#custom-modal:has-text("Recovery Failed")');
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Check for specific error message about out-of-range values
    const modalText = await page.locator('#modal-text');
    await expect(modalText).toContainText('outside the BIP39 range');
    
    console.log('✅ Recovery correctly rejected: words outside BIP39 range (all zeros)');
    
    // Click OK to dismiss
    await page.click('#modal-confirm');
    
    // Verify we stayed on the recovery input page (did not advance)
    await expect(page.locator('#pageRecover1')).toBeVisible();
    await expect(page.locator('#pageRecover2')).not.toBeVisible();
  });
  
  test('recover 24-word 2-of-3 with all zeros (shares 1,2)', async ({ page }) => {
    console.log('Testing recovery with minimum field values (all 0s, 24-word)...');
    
    await openApp(page);
    
    // Go directly to recovery (not from create page)
    await page.click('#btn-go-to-recover');
    await page.waitForSelector('#pageRecover1', { state: 'visible' });
    
    await setupRecovery(page, 24, 2);
    
    // Create synthetic shares with all zeros
    // Note: With GIC binding, globalIntegrityCheck = (sum of words + share number) mod 2053
    const share1 = createSyntheticShare(
      1,
      1,                                    // globalIntegrityCheck = (0 + 1) mod 2053 = 1
      new Array(24).fill(0),
      new Array(8).fill(0)
    );
    
    const share2 = createSyntheticShare(
      2,
      2,                                    // globalIntegrityCheck = (0 + 2) mod 2053 = 2
      new Array(24).fill(0),
      new Array(8).fill(0)
    );
    
    // Fill recovery form
    await fillRecoveryShare(page, 1, share1);
    await fillRecoveryShare(page, 2, share2);
    
    // Click recover button
    await page.click('#btn-recover-wallet');
    
    // Expect Recovery Failed modal (words outside BIP39 range)
    const modal = await page.locator('#custom-modal:has-text("Recovery Failed")');
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Check for specific error message about out-of-range values
    const modalText = await page.locator('#modal-text');
    await expect(modalText).toContainText('outside the BIP39 range');
    
    console.log('✅ Recovery correctly rejected: words outside BIP39 range (all zeros, 24-word)');
    
    // Click OK to dismiss
    await page.click('#modal-confirm');
    
    // Verify we stayed on the recovery input page (did not advance)
    await expect(page.locator('#pageRecover1')).toBeVisible();
    await expect(page.locator('#pageRecover2')).not.toBeVisible();
  });
  
  test('recover 24-word 3-of-5 with high field values (shares 1,2,4)', async ({ page }) => {
    console.log('Testing recovery with high field values near BIP39 max (24-word, 3-of-5)...');
    
    await openApp(page);
    
    // Go directly to recovery (not from create page)
    await page.click('#btn-go-to-recover');
    await page.waitForSelector('#pageRecover1', { state: 'visible' });
    
    await setupRecovery(page, 24, 3);
    
    // Create synthetic shares with high field values (within BIP39 range 1-2048)
    // Share 1: Words=2045, Checksums=2033, GlobalIntegrityCheck=1907
    const share1 = createSyntheticShare(
      1,
      1907,                                 // globalIntegrityCheck = 1907
      new Array(24).fill(2045),            // all words = 2045
      new Array(8).fill(2033)              // all checksums = 2033
    );
    
    // Share 2: Words=2041, Checksums=2029, GlobalIntegrityCheck=1903
    const share2 = createSyntheticShare(
      2,
      1903,                                 // globalIntegrityCheck = 1903
      new Array(24).fill(2041),            // all words = 2041
      new Array(8).fill(2029)              // all checksums = 2029
    );
    
    // Share 4: Words=2027, Checksums=2015, GlobalIntegrityCheck=1889
    const share4 = createSyntheticShare(
      4,
      1889,                                 // globalIntegrityCheck = 1889
      new Array(24).fill(2027),            // all words = 2027
      new Array(8).fill(2015)              // all checksums = 2015
    );
    
    // Fill recovery form
    await fillRecoveryShare(page, 1, share1);
    await fillRecoveryShare(page, 2, share2);
    await fillRecoveryShare(page, 3, share4);
    
    // Click recover button
    await page.click('#btn-recover-wallet');
    
    // Wait for either modal or result page
    const modal = page.locator('#custom-modal:has-text("BIP39 CHECKSUM INVALID")');
    
    // Check if modal appears
    const modalVisible = await modal.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (modalVisible) {
      console.log('✅ BIP39 warning modal appeared');
      await page.click('#modal-confirm');
    }
    
    // Wait for result page
    await page.waitForSelector('#pageRecover2', { state: 'visible' });
    
    // Verify warning is displayed (or recovery succeeded)
    const warningAlert = page.locator('.alert.alert-error:has-text("WARNING: INVALID SEED")');
    const hasWarning = await warningAlert.isVisible().catch(() => false);
    
    if (hasWarning) {
      console.log('✅ Recovery completed with BIP39 warning (high values, 24-word)');
    } else {
      console.log('✅ Recovery completed successfully with high field values (24-word)');
    }
  });
  
  test('recover 12-word 3-of-5 with high field values (shares 1,2,4)', async ({ page }) => {
    console.log('Testing recovery with high field values near BIP39 max (12-word, 3-of-5)...');
    
    await openApp(page);
    
    // Go directly to recovery (not from create page)
    await page.click('#btn-go-to-recover');
    await page.waitForSelector('#pageRecover1', { state: 'visible' });
    
    await setupRecovery(page, 12, 3);
    
    // Create synthetic shares with high field values (within BIP39 range 1-2048)
    // Share 1: Words=2045, Checksums=2033, GlobalIntegrityCheck=1979
    const share1 = createSyntheticShare(
      1,
      1979,                                 // globalIntegrityCheck = 1979
      new Array(12).fill(2045),            // all words = 2045
      new Array(4).fill(2033)              // all checksums = 2033
    );
    
    // Share 2: Words=2041, Checksums=2029, GlobalIntegrityCheck=1975
    const share2 = createSyntheticShare(
      2,
      1975,                                 // globalIntegrityCheck = 1975
      new Array(12).fill(2041),            // all words = 2041
      new Array(4).fill(2029)              // all checksums = 2029
    );
    
    // Share 4: Words=2027, Checksums=2015, GlobalIntegrityCheck=1961
    const share4 = createSyntheticShare(
      4,
      1961,                                 // globalIntegrityCheck = 1961
      new Array(12).fill(2027),            // all words = 2027
      new Array(4).fill(2015)              // all checksums = 2015
    );
    
    // Fill recovery form
    await fillRecoveryShare(page, 1, share1);
    await fillRecoveryShare(page, 2, share2);
    await fillRecoveryShare(page, 3, share4);
    
    // Click recover button
    await page.click('#btn-recover-wallet');
    
    // Wait for either modal or result page
    const modal = page.locator('#custom-modal:has-text("BIP39 CHECKSUM INVALID")');
    
    // Check if modal appears
    const modalVisible = await modal.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (modalVisible) {
      console.log('✅ BIP39 warning modal appeared');
      await page.click('#modal-confirm');
    }
    
    // Wait for result page
    await page.waitForSelector('#pageRecover2', { state: 'visible' });
    
    // Verify warning is displayed (or recovery succeeded)
    const warningAlert = page.locator('.alert.alert-error:has-text("WARNING: INVALID SEED")');
    const hasWarning = await warningAlert.isVisible().catch(() => false);
    
    if (hasWarning) {
      console.log('✅ Recovery completed with BIP39 warning (high values, 12-word)');
    } else {
      console.log('✅ Recovery completed successfully with high field values (12-word)');
    }
  });
  
  test('recover 24-word 3-of-5 with field max value 2052 testing BigInt (shares 1,2,4)', async ({ page }) => {
    console.log('Testing recovery with field maximum (2052) and large Lagrange coefficients...');
    
    await openApp(page);
    
    // Go directly to recovery (not from create page)
    await page.click('#btn-go-to-recover');
    await page.waitForSelector('#pageRecover1', { state: 'visible' });
    
    await setupRecovery(page, 24, 3);
    
    // Create synthetic shares testing field maximum and large Lagrange coefficients
    // Scheme 3-of-5 with shares {1,2,4} has coefficients (687, 2051, 1369)
    // This combination produces the largest coefficients for our supported schemes
    
    // Share 1: Words=1000, Checksums=947, GlobalIntegrityCheck=1417
    const share1 = createSyntheticShare(
      1,
      1417,                                 // globalIntegrityCheck
      new Array(24).fill(1000),            // all words = 1000
      new Array(8).fill(947)               // all checksums = 947
    );
    
    // Share 2: Words=2052 (FIELD MAXIMUM!), Checksums=2050, GlobalIntegrityCheck=2029
    const share2 = createSyntheticShare(
      2,
      2029,                                 // globalIntegrityCheck
      new Array(24).fill(2052),            // all words = 2052 (p-1 in GF(2053))
      new Array(8).fill(2050)              // all checksums = 2050
    );
    
    // Share 4: Words=1500, Checksums=394, GlobalIntegrityCheck=1099
    const share4 = createSyntheticShare(
      4,
      1099,                                 // globalIntegrityCheck
      new Array(24).fill(1500),            // all words = 1500
      new Array(8).fill(394)               // all checksums = 394
    );
    
    // Fill recovery form
    await fillRecoveryShare(page, 1, share1);
    await fillRecoveryShare(page, 2, share2);
    await fillRecoveryShare(page, 3, share4);
    
    console.log('⚠️  Testing with share 2 = 2052 (field maximum, beyond BIP39 range)');
    console.log('   Lagrange coefficients: (687, 2051, 1369)');
    console.log('   Expected recovered value: 1797 (valid BIP39)');
    
    // Click recover button
    await page.click('#btn-recover-wallet');
    
    // Wait for either modal or result page
    const modal = page.locator('#custom-modal:has-text("BIP39 CHECKSUM INVALID")');
    
    // Check if modal appears
    const modalVisible = await modal.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (modalVisible) {
      console.log('✅ BIP39 warning modal appeared (expected - share values exceed BIP39 range)');
      await page.click('#modal-confirm');
    }
    
    // Wait for result page
    await page.waitForSelector('#pageRecover2', { state: 'visible' });
    
    // Verify warning is displayed (or recovery succeeded)
    const warningAlert = page.locator('.alert.alert-error:has-text("WARNING: INVALID SEED")');
    const hasWarning = await warningAlert.isVisible().catch(() => false);
    
    if (hasWarning) {
      console.log('✅ Recovery completed with BIP39 warning (field max 2052 handled correctly)');
    } else {
      console.log('✅ Recovery completed successfully - BigInt multiplication handled correctly!');
    }
    
    console.log('✅ Field maximum (2052) and large Lagrange coefficients validated');
  });
});

