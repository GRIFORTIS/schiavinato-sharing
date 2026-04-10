#!/bin/bash
#
# Verify SHA256 checksums for Schiavinato Sharing Specification
#
# Usage:
#   ./scripts/verify-checksums.sh [version]
#
# Example:
#   ./scripts/verify-checksums.sh v0.1.0
#

set -e

VERSION="${1:-latest}"
REPO="GRIFORTIS/schiavinato-sharing"

echo "🔐 Verifying checksums for Schiavinato Sharing Specification"
echo ""
echo "Note: checksum validation confirms file integrity only."
echo "For authenticity, also verify the signed git tag and any detached .asc signatures."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Download checksums from GitHub release
echo "📥 Downloading checksums for version: ${VERSION}"
if [ "$VERSION" = "latest" ]; then
  CHECKSUM_URL="https://github.com/${REPO}/releases/latest/download/CHECKSUMS.txt"
else
  CHECKSUM_URL="https://github.com/${REPO}/releases/download/${VERSION}/CHECKSUMS.txt"
fi

echo "   URL: ${CHECKSUM_URL}"
echo ""

# Download checksums file
if curl -fSL -o CHECKSUMS.txt "$CHECKSUM_URL"; then
  echo -e "${GREEN}✓${NC} Downloaded CHECKSUMS.txt"
else
  echo -e "${RED}✗${NC} Failed to download checksums"
  echo "   Make sure the release exists and has checksums attached"
  exit 1
fi

echo ""
echo "📝 Checksums file content:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat CHECKSUMS.txt
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verify checksums
echo "🔍 Verifying checksums..."
echo ""

FAILED=0
PASSED=0

while IFS= read -r line; do
  # Skip empty lines and comments
  [[ -z "$line" || "$line" =~ ^#.* || "$line" =~ ^Version:.* || "$line" =~ ^Generated:.* || "$line" =~ ^##.* || "$line" =~ ^To\ verify.* || "$line" =~ ^\ \ cd.* || "$line" =~ ^\ \ sha256sum.* ]] && continue
  
  # Extract checksum and filename
  EXPECTED_HASH=$(echo "$line" | awk '{print $1}')
  FILENAME=$(echo "$line" | awk '{print $2}')
  
  # Skip if no filename
  [[ -z "$FILENAME" ]] && continue
  
  ACTUAL_FILE="$FILENAME"
  
  if [ -f "$ACTUAL_FILE" ]; then
    ACTUAL_HASH=$(sha256sum "$ACTUAL_FILE" | awk '{print $1}')
    
    if [ "$EXPECTED_HASH" = "$ACTUAL_HASH" ]; then
      echo -e "${GREEN}✓${NC} $ACTUAL_FILE"
      ((PASSED++))
    else
      echo -e "${RED}✗${NC} $ACTUAL_FILE"
      echo "   Expected: $EXPECTED_HASH"
      echo "   Got:      $ACTUAL_HASH"
      ((FAILED++))
    fi
  else
    echo -e "${YELLOW}⚠${NC}  $ACTUAL_FILE (not found)"
  fi
done < CHECKSUMS.txt

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Results:"
echo -e "  ${GREEN}Passed:${NC} $PASSED"
echo -e "  ${RED}Failed:${NC} $FAILED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -gt 0 ]; then
  echo ""
  echo -e "${RED}✗ Checksum verification FAILED${NC}"
  echo "  Some files do not match the expected checksums."
  echo "  This could indicate tampering or corruption."
  exit 1
else
  echo ""
  echo -e "${GREEN}✓ All checksums verified successfully!${NC}"
  echo "  The files match the published checksums."
  echo "  This alone does not prove authenticity; also verify the signed tag and detached signatures."
  exit 0
fi

