Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"
$flag = New-Object SkyCadKernel.SkyCadBlankObjectCreationFlag
$conn = New-Object SkyCadKernel.SkyCadConnector($flag)
Write-Host "Instantiated: $($conn.GetType().FullName)"
Write-Host "Id: $($conn.Id)"
