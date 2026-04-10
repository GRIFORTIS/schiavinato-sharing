# Verify SHA256 checksums for Schiavinato Sharing Specification (Windows PowerShell)
#
# Usage:
#   .\scripts\verify-checksums.ps1 [version]
#
# Example:
#   .\scripts\verify-checksums.ps1 v0.1.0
#

param(
    [string]$Version = "latest"
)

$ErrorActionPreference = "Stop"
$Repo = "GRIFORTIS/schiavinato-sharing"

Write-Host "🔐 Verifying checksums for Schiavinato Sharing Specification" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: checksum validation confirms file integrity only." -ForegroundColor Yellow
Write-Host "For authenticity, also verify the signed git tag and any detached .asc signatures." -ForegroundColor Yellow
Write-Host ""

# Download checksums from GitHub release
Write-Host "📥 Downloading checksums for version: $Version" -ForegroundColor Yellow

if ($Version -eq "latest") {
    $ChecksumUrl = "https://github.com/$Repo/releases/latest/download/CHECKSUMS.txt"
} else {
    $ChecksumUrl = "https://github.com/$Repo/releases/download/$Version/CHECKSUMS.txt"
}

Write-Host "   URL: $ChecksumUrl"
Write-Host ""

# Download checksums file
try {
    Invoke-WebRequest -Uri $ChecksumUrl -OutFile "CHECKSUMS.txt"
    Write-Host "✓ Downloaded CHECKSUMS.txt" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to download checksums" -ForegroundColor Red
    Write-Host "   Make sure the release exists and has checksums attached"
    exit 1
}

Write-Host ""
Write-Host "📝 Checksums file content:"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Get-Content "CHECKSUMS.txt"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

# Verify checksums
Write-Host "🔍 Verifying checksums..." -ForegroundColor Cyan
Write-Host ""

$Passed = 0
$Failed = 0

Get-Content "CHECKSUMS.txt" | ForEach-Object {
    $line = $_
    
    # Skip empty lines and comments
    if ([string]::IsNullOrWhiteSpace($line) -or 
        $line -match "^#" -or 
        $line -match "^Version:" -or 
        $line -match "^Generated:" -or 
        $line -match "^##" -or 
        $line -match "^To verify" -or 
        $line -match "^\s+cd" -or
        $line -match "^\s+sha256sum") {
        return
    }
    
    # Extract checksum and filename
    $parts = $line -split '\s+', 2
    if ($parts.Length -lt 2) { return }
    
    $ExpectedHash = $parts[0]
    $Filename = $parts[1]
    
    # Skip if no filename
    if ([string]::IsNullOrWhiteSpace($Filename)) { return }
    
    $ActualFile = $Filename
    
    if (Test-Path $ActualFile) {
        $ActualHash = (Get-FileHash -Path $ActualFile -Algorithm SHA256).Hash.ToLower()
        
        if ($ExpectedHash -eq $ActualHash) {
            Write-Host "✓ $ActualFile" -ForegroundColor Green
            $script:Passed++
        } else {
            Write-Host "✗ $ActualFile" -ForegroundColor Red
            Write-Host "   Expected: $ExpectedHash"
            Write-Host "   Got:      $ActualHash"
            $script:Failed++
        }
    } else {
        Write-Host "⚠  $ActualFile (not found)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "Results:"
Write-Host "  Passed: $Passed" -ForegroundColor Green
Write-Host "  Failed: $Failed" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ($Failed -gt 0) {
    Write-Host ""
    Write-Host "✗ Checksum verification FAILED" -ForegroundColor Red
    Write-Host "  Some files do not match the expected checksums."
    Write-Host "  This could indicate tampering or corruption."
    exit 1
} else {
    Write-Host ""
    Write-Host "✓ All checksums verified successfully!" -ForegroundColor Green
    Write-Host "  The files match the published checksums."
    Write-Host "  This alone does not prove authenticity; also verify the signed tag and detached signatures."
    exit 0
}

