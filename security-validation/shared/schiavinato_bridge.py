"""
Bridge to JavaScript reference implementation.

Since the JS implementation in reference-implementation/ is authoritative,
validation experiments should call it rather than reimplementing in Python.
This ensures we're testing the actual construction, not a Python approximation.
"""

import json
import subprocess
import tempfile
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class Share:
    """Represents a single Schiavinato share."""
    
    index: int
    words: List[int]  # 24 word indices in GF(2053)
    checksums: List[int]  # 9 checksum values in GF(2053)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'index': self.index,
            'words': self.words,
            'checksums': self.checksums
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Share':
        return cls(
            index=data['index'],
            words=data['words'],
            checksums=data['checksums']
        )


class SchiavatoJS:
    """
    Python interface to JavaScript reference implementation.
    
    Uses Node.js subprocess to execute JS code from reference-implementation/.
    This ensures validation experiments test the actual published implementation.
    """
    
    def __init__(self, js_impl_path: Optional[Path] = None):
        """
        Initialize bridge to JS implementation.
        
        Args:
            js_impl_path: Path to reference-implementation directory.
                         If None, auto-detects from this file's location.
        """
        if js_impl_path is None:
            # Auto-detect: go up from security-validation/shared/ to repo root
            repo_root = Path(__file__).parent.parent.parent
            js_impl_path = repo_root / "reference-implementation"
        
        self.js_path = Path(js_impl_path)
        self.html_file = self.js_path / "schiavinato_sharing.html"
        
        if not self.html_file.exists():
            raise FileNotFoundError(
                f"JS implementation not found at {self.html_file}\n"
                f"Expected reference-implementation/schiavinato_sharing.html"
            )
        
        # Check Node.js is available
        try:
            subprocess.run(
                ['node', '--version'],
                capture_output=True,
                check=True
            )
        except (subprocess.CalledProcessError, FileNotFoundError):
            raise RuntimeError(
                "Node.js not found. Please install Node.js 18+ to run validation experiments.\n"
                "Download from: https://nodejs.org/"
            )
    
    def create_shares(
        self,
        mnemonic: str,
        k: int,
        n: int,
        seed: Optional[int] = None
    ) -> List[Share]:
        """
        Create Schiavinato shares using JS reference implementation.
        
        Args:
            mnemonic: BIP39 mnemonic (12 or 24 words)
            k: Threshold (minimum shares needed)
            n: Total number of shares
            seed: Optional random seed for reproducibility
        
        Returns:
            List of n Share objects
        
        Raises:
            RuntimeError: If JS execution fails
            ValueError: If mnemonic is invalid or k/n parameters are invalid
        """
        # TODO: Extract JS code from HTML and call via Node.js
        # For now, return mock data for structure
        # Real implementation will parse schiavinato_sharing.html and execute
        
        # Validate inputs
        if k < 2 or k > n:
            raise ValueError(f"Invalid threshold: k={k}, n={n}. Need 2 ≤ k ≤ n")
        
        words = mnemonic.strip().split()
        if len(words) not in [12, 24]:
            raise ValueError(f"Invalid mnemonic length: {len(words)} words. Expected 12 or 24")
        
        # TODO: Real implementation
        # This is a placeholder - actual implementation will:
        # 1. Extract inline JS from HTML file
        # 2. Create wrapper Node.js script
        # 3. Execute and capture JSON output
        # 4. Parse and return Share objects
        
        raise NotImplementedError(
            "JS bridge not yet implemented. Next steps:\n"
            "1. Extract JS code from reference-implementation/schiavinato_sharing.html\n"
            "2. Create Node.js wrapper to call createShares() function\n"
            "3. Parse JSON output into Share objects\n"
            "See: shared/schiavinato_bridge.py for implementation location"
        )
    
    def recover_secret(self, shares: List[Share]) -> str:
        """
        Recover mnemonic from k or more shares.
        
        Args:
            shares: List of Share objects (must have at least k)
        
        Returns:
            Recovered BIP39 mnemonic
        
        Raises:
            RuntimeError: If JS execution fails
            ValueError: If insufficient shares provided
        """
        # TODO: Implement recovery via JS
        raise NotImplementedError("Recovery not yet implemented")
    
    def verify_checksums(self, share: Share) -> bool:
        """
        Verify checksum validity for a share.
        
        Args:
            share: Share object to verify
        
        Returns:
            True if checksums valid, False otherwise
        """
        # TODO: Implement checksum verification
        raise NotImplementedError("Checksum verification not yet implemented")


# Fallback: Pure Python implementation for development
class SchiavanatoPython:
    """
    Pure Python implementation of Schiavinato Sharing.
    
    Used as fallback if JS bridge not working, or for debugging.
    NOT authoritative - use SchiavatoJS for validation experiments.
    """
    
    def __init__(self):
        # TODO: Implement Python version
        pass
    
    def create_shares(self, mnemonic: str, k: int, n: int) -> List[Share]:
        """Create shares using Python implementation."""
        # TODO: Implement
        raise NotImplementedError("Python implementation not yet complete")


def get_implementation(prefer_js: bool = True) -> Any:
    """
    Get Schiavinato implementation (JS or Python).
    
    Args:
        prefer_js: If True, try JS first, fallback to Python
                  If False, use Python directly
    
    Returns:
        SchiavatoJS or SchiavanatoPython instance
    """
    if prefer_js:
        try:
            return SchiavatoJS()
        except (FileNotFoundError, RuntimeError) as e:
            print(f"Warning: JS implementation unavailable: {e}")
            print("Falling back to Python implementation...")
            return SchiavanatoPython()
    else:
        return SchiavanatoPython()

