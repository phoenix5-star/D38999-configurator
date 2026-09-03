# Automated Regression and Engine Integrity Suite
Write-Host "Running Data Architecture, Engine & Regression Verification Suite..." -ForegroundColor Cyan

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

# 3. Check Modular Engine Files
$engineFiles = @(
    @{ Path = "js/engines/decoderEngine.js"; Identifier = "DecoderEngine" },
    @{ Path = "js/engines/toolingEngine.js"; Identifier = "ToolingEngine" },
    @{ Path = "js/engines/configuratorEngine.js"; Identifier = "ConfiguratorEngine" },
    @{ Path = "js/services/dataService.js"; Identifier = "DataService" }
)

foreach ($ef in $engineFiles) {
    $p = $ef.Path
    if (-not (Test-Path $p)) {
        $testFailures += "Missing engine file: $p"
        continue
    }
    $code = Get-Content -Raw $p
    if (-not $code.Contains($ef.Identifier)) {
        $testFailures += "Engine file $p does not declare $($ef.Identifier)."
        continue
    }
    # Check brace balance
    $openCount = ($code.ToCharArray() | Where-Object { $_ -eq '{' }).Count
    $closeCount = ($code.ToCharArray() | Where-Object { $_ -eq '}' }).Count
    if ($openCount -ne $closeCount) {
        $testFailures += "Mismatched braces in $p (Open: $openCount, Close: $closeCount)."
    } else {
        Write-Host "[PASS] Engine module verified: $p (identifier '$($ef.Identifier)', balanced braces)." -ForegroundColor Green
    }
}

# 4. Check Data Counts & Domain Consistency
try {
    $layouts = Get-Content -Raw "data/layouts.json" | ConvertFrom-Json
    if ($layouts.Count -ge 50) {
        Write-Host "[PASS] Layouts count verified ($($layouts.Count) layouts loaded)." -ForegroundColor Green
    } else {
        $testFailures += "Layouts count too low: $($layouts.Count)"
    }

    # Verify cavity sum matches pin count for all layouts
    $layoutErrors = 0
    foreach ($l in $layouts) {
        $sum = 0
        foreach ($prop in $l.counts.PSObject.Properties) {
            $sum += [int]$prop.Value
        }
        if ($sum -ne $l.pins.Count) {
            $testFailures += "Layout $($l.arrangement): Cavity count sum ($sum) does not match pin array count ($($l.pins.Count))."
            $layoutErrors++
        }
    }
    if ($layoutErrors -eq 0) {
        Write-Host "[PASS] All $($layouts.Count) layouts have matching cavity sums and pin arrays." -ForegroundColor Green
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

    $tooling = Get-Content -Raw "data/tooling.json" | ConvertFrom-Json
    if ($tooling.shopInventory.frames.Count -ge 2 -and $tooling.shopInventory.positioners.Count -ge 4) {
        Write-Host "[PASS] Shop tooling inventory verified ($($tooling.shopInventory.frames.Count) frames, $($tooling.shopInventory.positioners.Count) positioners)." -ForegroundColor Green
    } else {
        $testFailures += "Shop tooling inventory counts below baseline."
    }

} catch {
    $testFailures += "Error verifying data consistency: $($_.Exception.Message)"
}

Write-Host "--------------------------------------------------"
if ($testFailures.Count -gt 0) {
    Write-Host "REGRESSION CHECKS FAILED:" -ForegroundColor Red
    foreach ($err in $testFailures) {
        Write-Host "  * $err" -ForegroundColor Red
    }
    exit 1
} else {
    Write-Host "ALL ENGINE & DATA REGRESSION CHECKS PASSED!" -ForegroundColor Green
    exit 0
}
