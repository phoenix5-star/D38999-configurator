Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"
$path = "C:\SkyCAD Environments\Standard Environment\Catalogue\root class\work field classes\Component\Connector\D38999_26WE35PN-icreated.SkyCadFile"
$flag = New-Object SkyCadKernel.SkyCadBlankObjectCreationFlag
$conn = New-Object SkyCadKernel.SkyCadConnector($flag)

$fs = [System.IO.File]::OpenRead($path)
$br = New-Object System.IO.BinaryReader($fs)
$fileVer = 0

try {
    # Skip header if needed or pass directly
    $status = $conn.LoadFromStream([ref]$fileVer, [ref]$br, "")
    Write-Host "Status: $status"
    Write-Host "FileVersion: $fileVer"
    Write-Host "Id: $($conn.Id)"
    Write-Host "Pins count: $($conn.Pins.Count)"
} catch {
    Write-Host "Error: $_"
} finally {
    $br.Close()
    $fs.Close()
}
