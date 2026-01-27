"""
Shared utilities for Schiavinato Sharing security validation experiments.

This module provides common functionality used across all three experiments:
- Bridge to JavaScript reference implementation
- BIP39 utilities
- Finite field arithmetic
- Result reporting and visualization
"""

from .schiavinato_bridge import SchiavatoJS, Share
from .bip39_utils import generate_random_bip39, is_valid_bip39, mnemonic_to_indices
from .field_arithmetic import GF2053
from .reporting import ExperimentReport, save_results, generate_summary

__all__ = [
    'SchiavatoJS',
    'Share',
    'generate_random_bip39',
    'is_valid_bip39',
    'mnemonic_to_indices',
    'GF2053',
    'ExperimentReport',
    'save_results',
    'generate_summary',
]

__version__ = '0.1.0'

