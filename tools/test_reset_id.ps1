Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"
$path = "C:\SkyCAD Environments\Standard Environment\Catalogue\root class\work field classes\Component\Connector\D38999_26WE35PN-icreated.SkyCadFile"
$ioType = [SkyCadKernel.SkyCadIO+SkyCadIOTypes]::File
try {
    $obj = [SkyCadKernel.SkyCadIO]::LoadObjectStructure($ioType, $null, $path, $false, "", $false, $false, $false)
    Write-Host "Result is null? $([object]::ReferenceEquals($obj, $null))"
} catch {
    Write-Host "Exception: $_"
    Write-Host "Stack: $($_.Exception.StackTrace)"
}
