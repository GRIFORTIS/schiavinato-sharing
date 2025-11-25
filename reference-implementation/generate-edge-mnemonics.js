/**
 * Temporary script to generate edge case mnemonics
 * Run with: node generate-edge-mnemonics.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load BIP39 English wordlist
const wordlistPath = path.join(__dirname, 'bip39-wordlist.txt');
let wordlist;

// If wordlist file doesn't exist, create it inline
if (!fs.existsSync(wordlistPath)) {
  // BIP39 English wordlist excerpt - just need "abandon" (index 0) and "zoo" (index 2047)
  // For full implementation, we'll use known values
  wordlist = null;
} else {
  wordlist = fs.readFileSync(wordlistPath, 'utf8').split('\n').filter(w => w);
}

/**
 * Generate a valid BIP39 mnemonic with all the same word except the checksum word
 */
function generateRepeatedWordMnemonic(wordIndex, wordCount) {
  // Calculate entropy bits
  const entropyBits = wordCount === 12 ? 128 : 256;
  const checksumBits = wordCount === 12 ? 4 : 8;
  
  // Create binary string with repeated word index (11 bits each)
  let entropyBinary = '';
  for (let i = 0; i < wordCount - 1; i++) {
    entropyBinary += wordIndex.toString(2).padStart(11, '0');
  }
  
  // Take only the entropy bits (excluding the last word)
  entropyBinary = entropyBinary.slice(0, entropyBits);
  
  // Pad to byte boundary if needed
  while (entropyBinary.length % 8 !== 0) {
    entropyBinary += '0';
  }
  
  // Convert binary string to bytes
  const entropyBytes = Buffer.alloc(entropyBits / 8);
  for (let i = 0; i < entropyBits / 8; i++) {
    const byteBinary = entropyBinary.slice(i * 8, (i + 1) * 8);
    entropyBytes[i] = parseInt(byteBinary, 2);
  }
  
  // Calculate SHA256 checksum
  const hash = crypto.createHash('sha256').update(entropyBytes).digest();
  
  // Extract checksum bits
  let checksumBinary = '';
  for (let i = 0; i < checksumBits; i++) {
    const byteIndex = Math.floor(i / 8);
    const bitIndex = i % 8;
    const bit = (hash[byteIndex] >> (7 - bitIndex)) & 1;
    checksumBinary += bit;
  }
  
  // Combine entropy and checksum
  const fullBinary = entropyBinary.slice(0, entropyBits) + checksumBinary;
  
  // Extract last word index (last 11 bits)
  const lastWordBinary = fullBinary.slice(-11);
  const lastWordIndex = parseInt(lastWordBinary, 2);
  
  return { wordIndex, lastWordIndex, wordCount };
}

console.log('Generating edge case mnemonics with valid BIP39 checksums...\n');
console.log('Note: "abandon" = index 0, "zoo" = index 2047\n');

const results = {
  abandon12: generateRepeatedWordMnemonic(0, 12),
  abandon24: generateRepeatedWordMnemonic(0, 24),
  zoo12: generateRepeatedWordMnemonic(2047, 12),
  zoo24: generateRepeatedWordMnemonic(2047, 24)
};

console.log('12-word "abandon" mnemonic:');
console.log(`First 11 words: abandon (repeated 11 times)`);
console.log(`Last word: index ${results.abandon12.lastWordIndex}`);
console.log('');

console.log('24-word "abandon" mnemonic:');
console.log(`First 23 words: abandon (repeated 23 times)`);
console.log(`Last word: index ${results.abandon24.lastWordIndex}`);
console.log('');

console.log('12-word "zoo" mnemonic:');
console.log(`First 11 words: zoo (repeated 11 times)`);
console.log(`Last word: index ${results.zoo12.lastWordIndex}`);
console.log('');

console.log('24-word "zoo" mnemonic:');
console.log(`First 23 words: zoo (repeated 23 times)`);
console.log(`Last word: index ${results.zoo24.lastWordIndex}`);
console.log('');

// Common BIP39 words for reference
const commonWords = {
  0: 'abandon',
  204: 'boat',
  1: 'ability',
  3: 'about',
  2047: 'zoo'
};

console.log('Look up these indices in BIP39 wordlist to get the actual last words:');
console.log(`- 12-word abandon: index ${results.abandon12.lastWordIndex}`);
console.log(`- 24-word abandon: index ${results.abandon24.lastWordIndex}`);
console.log(`- 12-word zoo: index ${results.zoo12.lastWordIndex}`);
console.log(`- 24-word zoo: index ${results.zoo24.lastWordIndex}`);

