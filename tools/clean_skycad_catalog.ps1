<#
.SYNOPSIS
    Cleans test connectors and temporary package artifacts from the SkyCAD Electrical Standard Environment.
.DESCRIPTION
    Safely removes test connector catalog files, temporary layout images, and unpackaged test directories
    from 'C:\SkyCAD Environments\' while strictly preserving benchmark files (e.g. D38999_26WE35PN-icreated.SkyCadFile)
    and SkyCAD's standard factory symbols/images.
.PARAMETER PartNumber
    Optional specific part number or pattern to clean (e.g. "D38999_20FD35PN" or "*FD35*").
    If omitted, cleans all generated test connectors matching D38999_* and TEST-*.
.PARAMETER DryRun
    If specified, lists the files that would be removed without deleting them.
#>
param (
    [string]$PartNumber = "",
    [switch]$DryRun
)

$ErrorActionPreference = "Continue"

$envRoot = "C:\SkyCAD Environments"
$stdEnv = Join-Path $envRoot "Standard Environment"
$connectorDir = Join-Path $stdEnv "Catalogue\Root Class\Work field classes\Component\Connector"
$imagesDir = Join-Path $stdEnv "Images"

Write-Host "=== SkyCAD Catalog Cleanup Tool ===" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "[DRY RUN MODE] No files will be deleted." -ForegroundColor Yellow
}

$deletedCount = 0

# 1. Clean connector catalogue files
if (Test-Path $connectorDir) {
    Write-Host "`nScanning Connectors in: $connectorDir" -ForegroundColor White
    $filter = if ($PartNumber) { "*$PartNumber*" } else { "*" }
    $connFiles = Get-ChildItem -Path $connectorDir -Filter "*.SkyCadFile" | Where-Object {
        # Never delete benchmark template
        if ($_.Name -eq "D38999_26WE35PN-icreated.SkyCadFile") { return $false }
        # Preserve standard non-test catalog files (e.g. 1498100000...)
        if ($_.Name -notmatch "^(D38999|TEST-)") { return $false }
        if ($PartNumber) { return $_.Name -like "*$PartNumber*" }
        return $true
    }

    foreach ($file in $connFiles) {
        Write-Host "  Connector: $($file.Name)" -ForegroundColor Magenta
        if (-not $DryRun) {
            Remove-Item -Path $file.FullName -Force
        }
        $deletedCount++
    }
}

# 1b. Clean connector pin catalogue files (e.g. M39029/56-348 socket test contacts)
$pinDir = Join-Path $stdEnv "Catalogue\Connector pin"
if (Test-Path $pinDir) {
    Write-Host "`nScanning Connector Pins in: $pinDir" -ForegroundColor White
    $pinFiles = Get-ChildItem -Path $pinDir -Filter "*.SkyCadFile" | Where-Object {
        # Never delete benchmark pin template
        if ($_.Name -eq "M39029_58-360.SkyCadFile") { return $false }
        # Clean custom/test socket contacts or test contacts
        if ($_.Name -like "M39029_56*" -or $_.Name -like "TEST-*") { return $true }
        if ($PartNumber -and $_.Name -like "*$PartNumber*") { return $true }
        return $false
    }

    foreach ($pfile in $pinFiles) {
        Write-Host "  Connector Pin: $($pfile.Name)" -ForegroundColor Magenta
        if (-not $DryRun) {
            Remove-Item -Path $pfile.FullName -Force
        }
        $deletedCount++
    }
}


# 2. Clean imported test images
if (Test-Path $imagesDir) {
    Write-Host "`nScanning Images in: $imagesDir" -ForegroundColor White
    # Only target specific insert arrangement images that were imported (e.g. D35.png, E35.PNG, etc.)
    $testImageNames = @("D35.png", "D35.PNG", "E35.png", "E35.PNG", "B35.png", "B35.PNG", "WJ4.png", "WJ4.PNG")
    if ($PartNumber) {
        # Extract arrangement like D35, B35, E35 from part number
        if ($PartNumber -match "([A-Z]\d{1,2}|[0-9]{2}-[0-9]{2})") {
            $arr = $matches[1]
            $testImageNames += "$arr.png"
            $testImageNames += "$arr.PNG"
        }
    }

    $imgFiles = Get-ChildItem -Path $imagesDir | Where-Object {
        $name = $_.Name
        return ($testImageNames -contains $name) -or ($name -like "TEST-*")
    }

    foreach ($img in $imgFiles) {
        Write-Host "  Image: $($img.Name)" -ForegroundColor Magenta
        if (-not $DryRun) {
            Remove-Item -Path $img.FullName -Force
        }
        $deletedCount++
    }
}

# 3. Clean temporary package folders and .SkyCadPackage files in C:\SkyCAD Environments\
Write-Host "`nScanning Scratch Packages in: $envRoot" -ForegroundColor White
$scratchItems = Get-ChildItem -Path $envRoot | Where-Object {
    if ($_.Name -eq "Standard Environment") { return $false }
    if ($_.Name -eq "D38999_26WE35PN-icreated_Package") { return $false }
    if ($PartNumber) {
        return $_.Name -like "*$PartNumber*"
    }
    return ($_.Name -like "*Package*" -or $_.Name -like "*.SkyCadPackage" -or $_.Name -like "test_*")
}

foreach ($item in $scratchItems) {
    Write-Host "  Scratch Package: $($item.Name)" -ForegroundColor Magenta
    if (-not $DryRun) {
        Remove-Item -Path $item.FullName -Recurse -Force
    }
    $deletedCount++
}

Write-Host "`nCleanup Summary: $deletedCount item(s) processed." -ForegroundColor Green

