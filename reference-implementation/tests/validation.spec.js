import { test, expect } from '@playwright/test';
import {
  openApp,
  navigateToCreateShares,
  select24Words,
  fillMnemonic,
  selectScheme,
  generateShares,
  extractShareData,
  navigateToRecover,
  setupRecovery,
  fillRecoveryShare,
  getRecoveredMnemonic,
  modifyShareValue
} from './test-helpers.js';

test('create shares with invalid BIP39 checksum shows error modal', async ({ page }) => {
  // Valid mnemonic except last word changed to "apple"
  const invalidMnemonic = 'abandon zoo enhance young join maximum fancy call minimum code spider olive alcohol system also share birth profit horn bargain beauty media rapid apple';
  
  console.log('Phase 1: Opening app and navigating to Create Shares...');
  await openApp(page);
  await navigateToCreateShares(page);
  await select24Words(page);
  
  console.log('Phase 2: Filling invalid mnemonic (last word = apple)...');
  await fillMnemonic(page, invalidMnemonic);
  await selectScheme(page, '2of3');
  
  console.log('Phase 3: Clicking Generate Shares...');
  await page.click('#btn-generate-shares');
  
  // Wait for error modal to appear
  const modal = await page.locator('#custom-modal:has-text("Generation Failed")');
  await expect(modal).toBeVisible();
  
  console.log('✅ Error modal displayed');
  
  // Check for specific error message
  const modalText = await page.locator('#modal-text');
  await expect(modalText).toContainText('Mnemonic checksum is invalid');
  
  console.log('✅ Correct error message displayed');
  
  // Click Cancel/OK button
  await page.click('#modal-confirm');
  
  // Wait for modal to close
  await expect(modal).not.toBeVisible();
  
  // Verify still on page 1 (create page)
  await expect(page.locator('#pageCreate1')).toBeVisible();
  await expect(page.locator('#pageCreate2')).not.toBeVisible();
  
  console.log('✅ Stayed on Create Shares page 1 (did not advance)');
  console.log('✅ Test passed! Invalid BIP39 blocked correctly.');
});

test('recovery with modified data shows BIP39 warning', async ({ page }) => {
  // Same test mnemonic
  const originalMnemonic = 'abandon zoo enhance young join maximum fancy call minimum code spider olive alcohol system also share birth profit horn bargain beauty media rapid tattoo';
  
  // PHASE 1: Create Shares (same as happy path)
  console.log('Phase 1: Creating shares...');
  await openApp(page);
  await navigateToCreateShares(page);
  await select24Words(page);
  await fillMnemonic(page, originalMnemonic);
  await selectScheme(page, '2of3');
  await generateShares(page);
  
  // Extract shares
  console.log('Extracting and modifying share data...');
  const share1 = await extractShareData(page, 0);
  const share2 = await extractShareData(page, 1);
  
  // MODIFY: Add 1 mod(2053) to GlobalIntegrityCheck, Word1, and Checksum1
  share1.globalIntegrityCheck = modifyShareValue(share1.globalIntegrityCheck);
  share1.words[0] = modifyShareValue(share1.words[0]);
  share1.checksums[0] = modifyShareValue(share1.checksums[0]);
  
  console.log('Modified share 1:', {
    globalIntegrityCheck: share1.globalIntegrityCheck,
    word1: share1.words[0],
    checksum1: share1.checksums[0]
  });
  
  // PHASE 2: Navigate to Recovery
  console.log('Phase 2: Navigating to recovery...');
  await navigateToRecover(page);
  await setupRecovery(page, 24, 2);
  
  // PHASE 3: Fill Recovery with Modified Data
  console.log('Phase 3: Filling recovery form with modified data...');
  await fillRecoveryShare(page, 1, share1);
  await fillRecoveryShare(page, 2, share2);
  
  // PHASE 4: Recover and Check for BIP39 Warning
  console.log('Phase 4: Recovering wallet...');
  
  // Click recover button
  await page.click('#btn-recover-wallet');
  
  // Wait for BIP39 checksum invalid modal to appear
  const modal = await page.locator('#custom-modal:has-text("BIP39 CHECKSUM INVALID")');
  await expect(modal).toBeVisible();
  
  console.log('✅ BIP39 checksum invalid modal displayed');
  
  // Click CONFIRM button to proceed
  await page.click('#modal-confirm');
  
  // Wait for result page to be visible
  await page.waitForSelector('#pageRecover2', { state: 'visible' });
  
  // Check for BIP39 warning message on the result page
  const warningAlert = await page.locator('.alert.alert-error:has-text("WARNING: INVALID SEED")');
  await expect(warningAlert).toBeVisible();
  
  console.log('✅ BIP39 warning correctly displayed on result page');
  
  // Verify the recovered mnemonic is different from original
  const recoveredMnemonic = await getRecoveredMnemonic(page);
  expect(recoveredMnemonic.trim()).not.toBe(originalMnemonic);
  
  console.log('✅ Recovered mnemonic differs from original (as expected)');
  console.log('Original:', originalMnemonic);
  console.log('Recovered:', recoveredMnemonic);
});

