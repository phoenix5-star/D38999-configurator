Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"
[SkyCadKernel.SkyCadPackage].GetMethods([System.Reflection.BindingFlags]"Public,NonPublic,Static,Instance") | ForEach-Object {
    $p = ($_.GetParameters() | ForEach-Object { "$($_.ParameterType.Name) $($_.Name)" }) -join ", "
    Write-Host "$($_.ReturnType.Name) $($_.Name)($p)"
}
