Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"

$csharp = @"
using System;
public class PR4 {
    public static void Init() {
        AppDomain.CurrentDomain.AssemblyResolve += (sender, args) => {
            string folder = @"C:\Program Files\SkyCAD Electrical";
            string name = new System.Reflection.AssemblyName(args.Name).Name + ".dll";
            string full = System.IO.Path.Combine(folder, name);
            if (System.IO.File.Exists(full)) return System.Reflection.Assembly.LoadFrom(full);
            return null;
        };
    }
}
"@
Add-Type -TypeDefinition $csharp -ReferencedAssemblies @("C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll")
[PR4]::Init()

$sess = New-Object SkyCadKernel.SkyCadSession($false, $false, "1.3.65.17276")
$connFile = "C:\SkyCAD Environments\browser_exported_37pin_Package\Catalogue\Root Class\Work field classes\Component\Connector\D38999_26WD35PN.SkyCadFile"
$conn = [SkyCadKernel.SkyCadFileSystem]::Load($sess, $connFile, $false, "", "", $null, $false)

Write-Host "Current conn.Gender = $($conn.Gender)"

# Now let's see how set_Gender works:
$conn.Gender = [SkyCadKernel.SkyCadConnector+ConnectorGenders]::Jack
Write-Host "After setting to Jack: conn.Gender = $($conn.Gender)"

# Let's save to a test file:
$outFile = "c:\Projects\D38999-configurator\scratch\test_jack_saved.SkyCadFile"
if (Test-Path $outFile) { Remove-Item $outFile -Force }

# Find Save methods on SkyCadFileSystem
[SkyCadKernel.SkyCadFileSystem].GetMethods() | Where-Object { $_.Name -like "*Save*" } | ForEach-Object {
    $p = ($_.GetParameters() | ForEach-Object { $_.ParameterType.Name + " " + $_.Name }) -join ", "
    Write-Host "SAVE METHOD: $($_.Name)($p)"
}

# Try saving
try {
    [SkyCadKernel.SkyCadFileSystem]::Save($conn, $outFile, $false, $false)
    Write-Host "Saved successfully to $outFile!"
} catch {
    Write-Host "Save error: $_"
}

