Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"
[System.Enum]::GetNames([SkyCadKernel.SkyCadIO+SkyCadIOTypes]) | ForEach-Object { Write-Host $_ }
