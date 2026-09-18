Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"
[SkyCadKernel.SkyCadSession].GetProperties([System.Reflection.BindingFlags]"Public,Static") | ForEach-Object {
    Write-Host "$($_.PropertyType.Name) $($_.Name)"
}
