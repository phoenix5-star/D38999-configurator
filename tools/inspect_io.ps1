Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"
[SkyCadKernel.SkyCadIO].GetFields([System.Reflection.BindingFlags]"Public,NonPublic,Static") | ForEach-Object {
    Write-Host "$($_.FieldType.Name) $($_.Name)"
}
