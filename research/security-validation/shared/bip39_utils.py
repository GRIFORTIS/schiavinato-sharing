"""
BIP39 mnemonic utilities for validation experiments.

Provides functions for generating, validating, and manipulating BIP39 mnemonics.
"""

import secrets
from typing import List, Optional
from mnemonic import Mnemonic


# Initialize BIP39 wordlist (English)
_mnemonic_generator = Mnemonic("english")
WORDLIST = _mnemonic_generator.wordlist


def generate_random_bip39(word_count: int = 24, entropy_bits: Optional[int] = None) -> str:
    """
    Generate a random valid BIP39 mnemonic.
    
    Args:
        word_count: Number of words (12 or 24)
        entropy_bits: Override entropy bits (default: 128 for 12 words, 256 for 24)
    
    Returns:
        Valid BIP39 mnemonic string
    
    Raises:
        ValueError: If word_count not 12 or 24
    """
    if word_count not in [12, 24]:
        raise ValueError(f"word_count must be 12 or 24, got {word_count}")
    
    if entropy_bits is None:
        entropy_bits = 128 if word_count == 12 else 256
    
    # Generate cryptographically secure random entropy
    entropy = secrets.token_bytes(entropy_bits // 8)
    
    # Generate mnemonic with proper checksum
    mnemonic = _mnemonic_generator.to_mnemonic(entropy)
    
    return mnemonic


def is_valid_bip39(mnemonic: str) -> bool:
    """
    Check if mnemonic is valid BIP39 (including checksum).
    
    Args:
        mnemonic: Space-separated word string
    
    Returns:
        True if valid, False otherwise
    """
    try:
        return _mnemonic_generator.check(mnemonic)
    except Exception:
        return False


def mnemonic_to_indices(mnemonic: str) -> List[int]:
    """
    Convert BIP39 mnemonic to word indices (1-2048).
    
    Args:
        mnemonic: Space-separated word string
    
    Returns:
        List of word indices (1-based)
    
    Raises:
        ValueError: If mnemonic contains invalid words
    """
    words = mnemonic.strip().lower().split()
    indices = []
    
    for word in words:
        try:
            index = WORDLIST.index(word)
            # Convert from 0-based array index to 1-based BIP39 index
            indices.append(index + 1)
        except ValueError:
            raise ValueError(f"Invalid BIP39 word: '{word}'")
    
    return indices


def indices_to_mnemonic(indices: List[int]) -> str:
    """
    Convert word indices back to BIP39 mnemonic.
    
    Args:
        indices: List of word indices (1-2048)
    
    Returns:
        Space-separated word string
    
    Raises:
        ValueError: If any index out of range
    """
    if any(i < 1 or i > 2048 for i in indices):
        raise ValueError("All indices must be in range 1-2048")
    
    # Convert from 1-based BIP39 indices to 0-based array indices
    words = [WORDLIST[i - 1] for i in indices]
    return " ".join(words)


def generate_random_word_sequence(word_count: int = 24) -> str:
    """
    Generate random word sequence (NOT valid BIP39 - no checksum).
    
    Used for control group in statistical tests.
    
    Args:
        word_count: Number of words
    
    Returns:
        Space-separated random words (not a valid BIP39 mnemonic)
    """
    indices = [secrets.randbelow(2048) for _ in range(word_count)]
    return indices_to_mnemonic(indices)


def extract_entropy_bits(mnemonic: str) -> int:
    """
    Extract the entropy bit length from a BIP39 mnemonic.
    
    Args:
        mnemonic: Valid BIP39 mnemonic
    
    Returns:
        Number of entropy bits (128 or 256)
    
    Raises:
        ValueError: If mnemonic invalid or unsupported length
    """
    words = mnemonic.strip().split()
    word_count = len(words)
    
    if word_count == 12:
        return 128
    elif word_count == 24:
        return 256
    else:
        raise ValueError(f"Unsupported word count: {word_count}")


def get_checksum_bits(mnemonic: str) -> int:
    """
    Get number of checksum bits in BIP39 mnemonic.
    
    Args:
        mnemonic: Valid BIP39 mnemonic
    
    Returns:
        Number of checksum bits (4 for 12 words, 8 for 24 words)
    """
    words = mnemonic.strip().split()
    word_count = len(words)
    
    if word_count == 12:
        return 4  # 132 bits total = 128 entropy + 4 checksum
    elif word_count == 24:
        return 8  # 264 bits total = 256 entropy + 8 checksum
    else:
        raise ValueError(f"Unsupported word count: {word_count}")


def count_valid_mnemonics_estimate() -> float:
    """
    Estimate number of valid BIP39 mnemonics.
    
    Returns:
        Approximate count (2^256 for 24-word)
    """
    # 24-word: 2^256 valid out of 2^264 total possible word sequences
    # 12-word: 2^128 valid out of 2^132 total possible word sequences
    return 2**256  # For 24-word mnemonics


if __name__ == "__main__":
    # Quick self-test
    print("BIP39 Utilities Self-Test")
    print("=" * 60)
    
    # Generate random mnemonic
    mnemonic = generate_random_bip39(24)
    print(f"Generated 24-word mnemonic: {mnemonic[:50]}...")
    
    # Validate
    assert is_valid_bip39(mnemonic), "Generated mnemonic should be valid"
    print("✓ Validation passed")
    
    # Convert to indices
    indices = mnemonic_to_indices(mnemonic)
    assert len(indices) == 24, "Should have 24 indices"
    print(f"✓ Converted to indices: [{indices[0]}, {indices[1]}, ..., {indices[-1]}]")
    
    # Convert back
    recovered = indices_to_mnemonic(indices)
    assert recovered == mnemonic, "Round-trip conversion should match"
    print("✓ Round-trip conversion successful")
    
    # Generate invalid sequence
    invalid = generate_random_word_sequence(24)
    is_valid = is_valid_bip39(invalid)
    print(f"✓ Random sequence valid: {is_valid} (should be False most of the time)")
    
    print("\nAll tests passed!")

