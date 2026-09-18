Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"

$csharp = @"
using System;
using SkyCadKernel;

public class PR6 {
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
[PR6]::Init()

$sess = New-Object SkyCadKernel.SkyCadSession($false, $false, "1.3.65.17276")
$connFile = "C:\SkyCAD Environments\browser_exported_37pin_Package\Catalogue\Root Class\Work field classes\Component\Connector\D38999_26WD35PN.SkyCadFile"
$conn = [SkyCadKernel.SkyCadFileSystem]::Load($sess, $connFile, $false, "", "", $null, $false)

# Set Gender to Jack via PropertyDefinition
$pd = $conn.Class.GetPropertyDefinitionByName("Gender")
$pd.SetValue($conn, "Jack", $true, $false)

$outFile = "c:\Projects\D38999-configurator\scratch\test_conn_jack.SkyCadFile"
if (Test-Path $outFile) { Remove-Item $outFile -Force }

$dict = $null
$res = [SkyCadKernel.SkyCadFileSystem]::Save($conn, $outFile, $true, $false, "", $false, [ref]$dict, $false, $null)
Write-Host "Save result: $res"

if (Test-Path $outFile) {
    Write-Host "Saved file size: $((Get-Item $outFile).Length) bytes"
    # Now reload it and verify Gender!
    $reloaded = [SkyCadKernel.SkyCadFileSystem]::Load($sess, $outFile, $false, "", "", $null, $false)
    Write-Host "Reloaded conn.Gender: $($reloaded.Gender)"
}

