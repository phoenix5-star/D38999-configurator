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
    if ($finishes.Count -ge 8) {
        Write-Host "[PASS] Finishes count verified ($($finishes.Count) finishes loaded)." -ForegroundColor Green
    } else {
        $testFailures += "Expected at least 8 finishes, found $($finishes.Count)"
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

    # Verify AutoSport series and tooling data
    $series = Get-Content -Raw "data/series.json" | ConvertFrom-Json
    $asSeries = $series | Where-Object { $_.id -eq "deutsch_autosport" }
    if ($asSeries -and $asSeries.name -eq "Deutsch AutoSport") {
        Write-Host "[PASS] Deutsch AutoSport series definition verified." -ForegroundColor Green
    } else {
        $testFailures += "Deutsch AutoSport series definition missing or incorrect in series.json."
    }

    $k1584 = $tooling.shopInventory.positioners | Where-Object { $_.id -eq "K1584" }
    $k1585 = $tooling.shopInventory.positioners | Where-Object { $_.id -eq "K1585" }
    if ($k1584 -and $k1585) {
        Write-Host "[PASS] AutoSport DMC positioners K1584 and K1585 verified in shop inventory." -ForegroundColor Green
    } else {
        $testFailures += "AutoSport positioners K1584 / K1585 missing in tooling.json."
    }

    if ($tooling.insertionExtractionTools."24" -and $tooling.insertionExtractionTools."24".toolPN -eq "605837") {
        Write-Host "[PASS] AutoSport insertion/extraction tool 605837 verified." -ForegroundColor Green
    } else {
        $testFailures += "AutoSport insertion/extraction tool 605837 missing in tooling.json."
    }

    $acc = Get-Content -Raw "data/accessories.json" | ConvertFrom-Json
    if ($acc.shrinkBoots -and $acc.shrinkBoots.straight."06" -and $acc.shrinkBoots.straight."06".pn -eq "204W221-25-0" -and $acc.shrinkBoots.rightAngle."06".pn -eq "224W221-25-0") {
        Write-Host "[PASS] Raychem heat shrink boot accessories verified (204W221 / 224W221 for size 06)." -ForegroundColor Green
    } else {
        $testFailures += "Raychem shrink boots missing or incorrect in accessories.json."
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
