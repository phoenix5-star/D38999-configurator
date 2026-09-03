# Automated Regression and Data Integrity Suite
Write-Host "Running Data Architecture & Regression Verification Suite..." -ForegroundColor Cyan

$testFailures = @()

# 1. Validate All JSON Files in /data/
$dataFiles = @("series.json", "shells.json", "finishes.json", "layouts.json", "contacts.json", "tooling.json", "accessories.json")
foreach ($file in $dataFiles) {
    $path = Join-Path "data" $file
    if (-not (Test-Path $path)) {
        $testFailures += "Missing data file: $path"
        continue
    }
    try {
        $content = Get-Content -Raw $path
        $null = ConvertFrom-Json $content
        Write-Host "[PASS] Valid JSON syntax: $path" -ForegroundColor Green
    } catch {
        $testFailures += "Invalid JSON in $path : $($_.Exception.Message)"
    }
}

# 2. Check Fallback Bundle
if (Test-Path "data/fallbackData.js") {
    $fb = Get-Content -Raw "data/fallbackData.js"
    if ($fb.StartsWith("window.CONNECTOR_DATA_FALLBACK =")) {
        Write-Host "[PASS] fallbackData.js format verified." -ForegroundColor Green
    } else {
        $testFailures += "fallbackData.js does not assign window.CONNECTOR_DATA_FALLBACK properly."
    }
} else {
    $testFailures += "Missing data/fallbackData.js"
}

# 3. Check Data Counts
try {
    $layouts = Get-Content -Raw "data/layouts.json" | ConvertFrom-Json
    if ($layouts.Count -ge 50) {
        Write-Host "[PASS] Layouts count verified ($($layouts.Count) layouts loaded)." -ForegroundColor Green
    } else {
        $testFailures += "Layouts count too low: $($layouts.Count)"
    }

    $finishes = Get-Content -Raw "data/finishes.json" | ConvertFrom-Json
    if ($finishes.Count -eq 7) {
        Write-Host "[PASS] Finishes count verified (7 finishes loaded)." -ForegroundColor Green
    } else {
        $testFailures += "Expected 7 finishes, found $($finishes.Count)"
    }

    $shells = Get-Content -Raw "data/shells.json" | ConvertFrom-Json
    if ($shells.Count -ge 4) {
        Write-Host "[PASS] Shell types count verified ($($shells.Count) shells loaded)." -ForegroundColor Green
    } else {
        $testFailures += "Expected at least 4 shell types, found $($shells.Count)"
    }
} catch {
    $testFailures += "Error verifying counts: $($_.Exception.Message)"
}

Write-Host "--------------------------------------------------"
if ($testFailures.Count -gt 0) {
    Write-Host "REGRESSION CHECKS FAILED:" -ForegroundColor Red
    foreach ($err in $testFailures) {
        Write-Host "  * $err" -ForegroundColor Red
    }
    exit 1
} else {
    Write-Host "ALL DATA REGRESSION CHECKS PASSED!" -ForegroundColor Green
    exit 0
}

