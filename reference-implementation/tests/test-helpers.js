import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Open the app and accept the disclaimer
 */
export async function openApp(page) {
  // Construct file:// URL to schiavinato_sharing.html
  const htmlPath = resolve(__dirname, '..', 'schiavinato_sharing.html');
  const fileUrl = `file://${htmlPath}`;
  
  await page.goto(fileUrl);
  
  // Wait for landing page to be visible
  await page.waitForSelector('#pageLanding', { state: 'visible' });
  
  // Click label for custom styled checkbox (fix for custom checkbox)
  await page.click('label[for="disclaimer-checkbox"]');
  
  // Wait for button to enable
  await page.waitForTimeout(100);
  
  // Click continue button
  await page.click('#btn-continue-to-home');
  
  // Wait for home page to be visible
  await page.waitForSelector('#pageHome', { state: 'visible' });
}

/**
 * Navigate to Create Shares page
 */
export async function navigateToCreateShares(page) {
  await page.click('#btn-go-to-create');
  
  // Wait for create page to be visible (page transition fix)
  await page.waitForSelector('#pageCreate1', { state: 'visible' });
}

/**
 * Select 12 words option
 */
export async function select12Words(page) {
  await page.click('#btn-12-words');
  
  // Wait for word-12 to exist (dynamic input generation fix)
  await page.waitForSelector('#word-12', { state: 'visible' });
}

/**
 * Select 24 words option
 */
export async function select24Words(page) {
  await page.click('#btn-24-words');
  
  // Wait for word-24 to exist (dynamic input generation fix)
  await page.waitForSelector('#word-24', { state: 'visible' });
}

/**
 * Fill mnemonic words into input fields
 * Supports both 12 and 24 word mnemonics
 */
export async function fillMnemonic(page, mnemonic) {
  const words = mnemonic.split(' ');
  
  if (words.length !== 12 && words.length !== 24) {
    throw new Error(`Expected 12 or 24 words, got ${words.length}`);
  }
  
  for (let i = 0; i < words.length; i++) {
    const inputId = `#word-${i + 1}`;
    await page.waitForSelector(inputId, { state: 'visible' });
    await page.fill(inputId, words[i]);
  }
}

/**
 * Select share scheme (e.g., '2of3', '3of5')
 */
export async function selectScheme(page, scheme) {
  await page.click(`label[for="scheme-${scheme}"]`);
}

/**
 * Generate shares and wait for result page
 */
export async function generateShares(page) {
  await page.click('#btn-generate-shares');
  
  // Wait for result page to be visible
  await page.waitForSelector('#pageCreate2', { state: 'visible' });
  
  // Wait for share cards to appear
  await page.waitForSelector('.share-card', { state: 'visible' });
}

/**
 * Extract share data from a share card
 * Handles the "word - ####" format
 */
export async function extractShareData(page, shareIndex) {
  const shareCards = await page.$$('.share-card');
  const shareCard = shareCards[shareIndex];
  
  if (!shareCard) {
    throw new Error(`Share card ${shareIndex} not found`);
  }
  
  // Extract share number from metadata paragraph
  const metadataTexts = await shareCard.$$eval('.share-metadata p', elements => 
    elements.map(el => el.textContent)
  );
  
  // Find the "Share Number (X):" line and extract the number
  const shareNumberLine = metadataTexts.find(text => text.includes('Share Number (X):'));
  const shareNumber = shareNumberLine.match(/:\s*(\d+)/)[1];
  
  // Extract Global Integrity Check (GIC) verification code
  const globalIntegrityCheckText = await shareCard.$eval('.share-metadata code', el => el.textContent);
  // Parse "word-####" → "####" (note: format changed from "word - ####" to "word-####")
  const globalIntegrityCheck = globalIntegrityCheckText ? globalIntegrityCheckText.split('-')[1] : undefined;
  
  // Extract words and checksums
  const wordItems = await shareCard.$$('.share-word-item');
  const words = [];
  const checksums = [];
  
  for (const item of wordItems) {
    const label = await item.$eval('label', el => el.textContent);
    const codeText = await item.$eval('code', el => el.textContent);
    
    // Parse "word-####" → "####" (note: format changed from "word - ####" to "word-####")
    const code = codeText.split('-')[1];
    
    if (label.startsWith('C')) {
      // Checksum
      checksums.push(code);
    } else {
      // Word
      words.push(code);
    }
  }
  
  return {
    shareNumber,
    globalIntegrityCheck,
    words,
    checksums
  };
}

/**
 * Navigate to Recover Wallet page
 */
export async function navigateToRecover(page) {
  // Click "Clear All & Start Over" button to return to home
  await page.click('#btn-start-over-create');
  
  // Confirm the dialog
  await page.click('#modal-confirm');
  
  // Wait for page to reload and land on home page
  await page.waitForSelector('#pageLanding', { state: 'visible' });
  
  // Accept disclaimer again
  await page.click('label[for="disclaimer-checkbox"]');
  await page.waitForTimeout(100);
  await page.click('#btn-continue-to-home');
  await page.waitForSelector('#pageHome', { state: 'visible' });
  
  await page.click('#btn-go-to-recover');
  await page.waitForSelector('#pageRecover1', { state: 'visible' });
}

/**
 * Setup recovery parameters (word count and k value)
 */
export async function setupRecovery(page, wordCount, k) {
  await page.click(`#recover-btn-${wordCount}-words`);
  
  // Click label for custom styled radio button
  await page.click(`label[for="recover-k-${k}"]`);
  
  // Wait for recovery form to regenerate
  await page.waitForTimeout(200);
  
  // Wait for first share input to exist (1-indexed)
  await page.waitForSelector('#recover-x-1', { state: 'visible' });
}

/**
 * Fill recovery share data
 * Handles both 12-word (4 rows) and 24-word (8 rows) shares
 * Note: shareIndex is 1-indexed (1, 2, 3, ...)
 */
export async function fillRecoveryShare(page, shareIndex, shareData) {
  // Fill share number (1-indexed)
  await page.fill(`#recover-x-${shareIndex}`, shareData.shareNumber);
  
  // Fill Global Integrity Check (GIC) verification code
  await page.fill(`#recover-global-integrity-check-${shareIndex}`, shareData.globalIntegrityCheck);
  
  // Determine number of rows based on word count
  // 12 words = 4 rows, 24 words = 8 rows (3 words per row)
  const numRows = shareData.words.length / 3;
  
  // Fill words and checksums
  for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
    // Fill 3 words in this row
    for (let wordIdx = 0; wordIdx < 3; wordIdx++) {
      const wordPosition = rowIndex * 3 + wordIdx;
      const inputId = `#recover-share-${shareIndex}-row-${rowIndex}-word-${wordIdx}`;
      await page.fill(inputId, shareData.words[wordPosition]);
    }
    
    // Fill checksum for this row
    const checksumId = `#recover-share-${shareIndex}-row-${rowIndex}-checksum`;
    await page.fill(checksumId, shareData.checksums[rowIndex]);
  }
}

/**
 * Recover wallet and wait for result page
 */
export async function recoverWallet(page) {
  await page.click('#btn-recover-wallet');
  
  // Wait for result page to be visible
  await page.waitForSelector('#pageRecover2', { state: 'visible' });
}

/**
 * Get recovered mnemonic from result page
 */
export async function getRecoveredMnemonic(page) {
  // Get all word code elements
  const codeElements = await page.$$('#pageRecover2 .share-word-item code');
  
  const words = [];
  for (const element of codeElements) {
    const text = await element.textContent();
    words.push(text.trim());
  }
  
  return words.join(' ');
}

/**
 * Modify a 4-digit share value by adding 1 mod 2053
 * Used to break BIP39 checksum while keeping Schiavinato checksums valid
 */
export function modifyShareValue(value) {
  const num = parseInt(value, 10);
  const modified = (num + 1) % 2053;
  return modified.toString().padStart(4, '0');
}

/**
 * Create a synthetic share object with specified values
 * Used for testing edge cases with extreme field values
 * 
 * @param {number} shareNumber - Share number (1, 2, 3, etc.)
 * @param {number} globalIntegrityCheck - Global Integrity Check (GIC) verification code (0-2052)
 * @param {number[]} wordValues - Array of word values (0-2052)
 * @param {number[]} checksumValues - Array of checksum values (0-2052)
 * @returns {Object} Share object compatible with fillRecoveryShare
 */
export function createSyntheticShare(shareNumber, globalIntegrityCheck, wordValues, checksumValues) {
  return {
    shareNumber: String(shareNumber),
    globalIntegrityCheck: String(globalIntegrityCheck).padStart(4, '0'),
    words: wordValues.map(v => String(v).padStart(4, '0')),
    checksums: checksumValues.map(v => String(v).padStart(4, '0'))
  };
}

