Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"
[SkyCadKernel.SessionManager].GetProperties() | ForEach-Object {
    Write-Host "$($_.PropertyType.Name) $($_.Name)"
}
