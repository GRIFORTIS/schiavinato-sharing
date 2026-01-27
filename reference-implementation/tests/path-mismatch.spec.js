import { test, expect } from '@playwright/test';
import {
  openApp,
  navigateToCreateShares,
  select12Words,
  fillMnemonic,
  selectScheme,
  generateShares,
  extractShareData,
  navigateToRecover,
  setupRecovery,
  fillRecoveryShare,
  modifyShareValue
} from './test-helpers.js';

const MNEMONIC_12 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

test('row path mismatch triggers path-mismatch modal', async ({ page }) => {
  await openApp(page);
  await navigateToCreateShares(page);
  await select12Words(page);
  await fillMnemonic(page, MNEMONIC_12);
  await selectScheme(page, '2of3');
  await generateShares(page);

  const share1 = await extractShareData(page, 0);
  const share2 = await extractShareData(page, 1);

  // Tamper a single row checksum (Path B) to disagree with recomputed Path A
  share1.checksums[0] = modifyShareValue(share1.checksums[0]);

  await navigateToRecover(page);
  await setupRecovery(page, 12, 2);
  await fillRecoveryShare(page, 1, share1);
  await fillRecoveryShare(page, 2, share2);

  await page.click('#btn-recover-wallet');

  const modal = page.locator('#custom-modal:has-text("Recovery Failed - Path Mismatch")');
  await expect(modal).toBeVisible();
  await page.click('#modal-confirm');
  await expect(modal).not.toBeVisible();
});

test('global path mismatch triggers path-mismatch modal', async ({ page }) => {
  await openApp(page);
  await navigateToCreateShares(page);
  await select12Words(page);
  await fillMnemonic(page, MNEMONIC_12);
  await selectScheme(page, '2of3');
  await generateShares(page);

  const share1 = await extractShareData(page, 0);
  const share2 = await extractShareData(page, 1);

  // Tamper only the Global Integrity Check (GIC) share to create a global Path A/B mismatch
  share1.globalIntegrityCheck = modifyShareValue(share1.globalIntegrityCheck);

  await navigateToRecover(page);
  await setupRecovery(page, 12, 2);
  await fillRecoveryShare(page, 1, share1);
  await fillRecoveryShare(page, 2, share2);

  await page.click('#btn-recover-wallet');

  const modal = page.locator('#custom-modal:has-text("Recovery Failed - Path Mismatch")');
  await expect(modal).toBeVisible();
  await page.click('#modal-confirm');
  await expect(modal).not.toBeVisible();
});

test('inline row checksum mismatch highlights the specific row before recover', async ({ page }) => {
  await openApp(page);
  await navigateToCreateShares(page);
  await select12Words(page);
  await fillMnemonic(page, MNEMONIC_12);
  await selectScheme(page, '2of3');
  await generateShares(page);

  const share1 = await extractShareData(page, 0);
  const share2 = await extractShareData(page, 1);

  // Tamper first row checksum on share 1 to create per-row mismatch
  share1.checksums[0] = modifyShareValue(share1.checksums[0]);

  await navigateToRecover(page);
  await setupRecovery(page, 12, 2);
  await fillRecoveryShare(page, 1, share1);
  await fillRecoveryShare(page, 2, share2);

  // Trigger auto-validation (blur a known field)
  await page.click('#recover-x-1');
  await page.click('#recover-global-integrity-check-2');

  // Expect the row 0 inputs in share 1 to be marked invalid
  const rowInputs = page.locator('#share-container-1 input[data-row-index="0"].invalid');
  await expect(rowInputs.first()).toBeVisible();
});
