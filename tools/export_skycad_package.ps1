<#
.SYNOPSIS
    Generates authentic native SkyCAD catalog packages (.SkyCadPackage) for circular connectors.
.DESCRIPTION
    Uses SkyCadKernel.dll from the local SkyCAD Electrical installation to instantiate,
    populate, and package SkyCadConnector components with pin numbering rules,
    accurate catalog attributes, and child accessories.
.EXAMPLE
    .\tools\export_skycad_package.ps1 -PartNumber "D38999/26WD35PN" -Manufacturer "Amphenol Aerospace" -Description "MIL-DTL-38999 Series III Plug, Size 15, 37 Pins" -Arrangement "15-35" -OutputDir "$HOME\Downloads"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$PartNumber,

    [Parameter(Mandatory=$false)]
    [string]$Manufacturer = "Amphenol Aerospace",

    [Parameter(Mandatory=$false)]
    [string]$Description = "MIL-DTL-38999 Series III Connector",

    [Parameter(Mandatory=$false)]
    [string]$Arrangement = "15-35",

    [Parameter(Mandatory=$false)]
    [string[]]$Pins = @(),

    [Parameter(Mandatory=$false)]
    [string]$PinNumberingLOV = "",

    [Parameter(Mandatory=$false)]
    [array]$Accessories = @(),

    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "$HOME\Downloads"
)

$ErrorActionPreference = "Stop"

$skyCadDll = "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"
if (-not (Test-Path $skyCadDll)) {
    throw "SkyCadKernel.dll not found at: $skyCadDll"
}

$envPath = "C:\SkyCAD Environments\Standard environment"
if (-not (Test-Path $envPath)) {
    throw "SkyCAD Standard environment not found at: $envPath"
}

# Clean file-safe Part Number
$safePN = $PartNumber.Replace('/', '_').Replace('\', '_').Trim()

Write-Host "=== SkyCAD Package Generator ===" -ForegroundColor Cyan
Write-Host "Part Number : $PartNumber ($safePN)"
Write-Host "Manufacturer: $Manufacturer"
Write-Host "Description : $Description"
Write-Host "Arrangement : $Arrangement"

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$exportPy = Join-Path $scriptDir "export_package.py"

if (Test-Path $exportPy) {
    python $exportPy --part-number $PartNumber --manufacturer $Manufacturer --description $Description --output-dir $OutputDir
} else {
    throw "export_package.py not found at $exportPy"
}

