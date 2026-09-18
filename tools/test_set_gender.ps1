Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"

$csharp = @"
using System;
using SkyCadKernel;

public class PR7 {
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
[PR7]::Init()

$sess = New-Object SkyCadKernel.SkyCadSession($false, $false, "1.3.65.17276")
$connFile = "C:\SkyCAD Environments\browser_exported_37pin_Package\Catalogue\Root Class\Work field classes\Component\Connector\D38999_26WD35PN.SkyCadFile"
$conn = [SkyCadKernel.SkyCadFileSystem]::Load($sess, $connFile, $false, "", "", $null, $false)

Write-Host "Initial conn.Gender: $($conn.Gender)"
$conn.set_Gender([SkyCadKernel.SkyCadConnector+ConnectorGenders]::Jack)
Write-Host "After set_Gender(Jack): $($conn.Gender)"

# Check property value
$pd = $conn.Class.GetPropertyDefinitionByName("Gender")
Write-Host "PD GetValue: '$($pd.GetValue($conn))'"

