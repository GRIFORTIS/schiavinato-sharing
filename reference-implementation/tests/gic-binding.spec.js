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
  getRecoveredMnemonic
} from './test-helpers.js';

const FIELD_PRIME = 2053;

// Test mnemonic (valid BIP39)
const TEST_MNEMONIC = 'abandon zoo enhance young join maximum fancy call minimum code spider olive alcohol system also share birth profit horn bargain beauty media rapid tattoo';

test('GIC binding validation: sum(words) + x and sum(row checksums) + x', async ({ page }) => {
  const schemes = [
    { name: '2of3', k: 2, n: 3 },
    { name: '2of4', k: 2, n: 4 },
    { name: '3of5', k: 3, n: 5 }
  ];

  for (const scheme of schemes) {
    console.log(`\n=== Testing scheme: ${scheme.name} ===`);
    
    await openApp(page);
    await navigateToCreateShares(page);
    await select24Words(page);
    await fillMnemonic(page, TEST_MNEMONIC);
    await selectScheme(page, scheme.name);
    await generateShares(page);
    
    // Extract and validate all shares
    for (let i = 0; i < scheme.n; i++) {
      const share = await extractShareData(page, i);
      
      // Convert strings to integers
      const shareNumber = parseInt(share.shareNumber, 10);
      const gic = parseInt(share.globalIntegrityCheck, 10);
      const words = share.words.map(w => parseInt(w, 10));
      const rowChecksums = share.checksums.map(c => parseInt(c, 10));
      
      // Path A: sum(words) + x
      const sumWords = words.reduce((acc, val) => (acc + val) % FIELD_PRIME, 0);
      const expectedGIC_PathA = (sumWords + shareNumber) % FIELD_PRIME;
      
      // Path B: sum(row checksums) + x
      const sumRowChecksums = rowChecksums.reduce((acc, val) => (acc + val) % FIELD_PRIME, 0);
      const expectedGIC_PathB = (sumRowChecksums + shareNumber) % FIELD_PRIME;
      
      // Validate both paths
      expect(gic).toBe(expectedGIC_PathA);
      expect(gic).toBe(expectedGIC_PathB);
      expect(expectedGIC_PathA).toBe(expectedGIC_PathB); // Sanity: both paths must agree
      
      console.log(`✅ Share ${shareNumber}: GIC=${gic}, Path A=${expectedGIC_PathA}, Path B=${expectedGIC_PathB}`);
    }
    
    // Validate recovery still works
    const shares = [];
    for (let i = 0; i < scheme.k; i++) {
      shares.push(await extractShareData(page, i));
    }
    
    await navigateToRecover(page);
    await setupRecovery(page, 24, scheme.k);
    
    for (let i = 0; i < scheme.k; i++) {
      await fillRecoveryShare(page, i + 1, shares[i]);
    }
    
    await page.click('#btn-recover-wallet');
    await page.waitForSelector('#pageRecover2', { state: 'visible' });
    
    const recoveredMnemonic = await getRecoveredMnemonic(page);
    expect(recoveredMnemonic.trim()).toBe(TEST_MNEMONIC);
    
    console.log(`✅ Recovery successful for scheme ${scheme.name}`);
  }
});

