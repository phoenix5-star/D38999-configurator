param (
    [string]$PackagePath = "scratch/test_20fd35_browser.SkyCadPackage"
)

Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"

$csharp = @"
using System;
using SkyCadKernel;

public class PackageResolver6 {
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
[PackageResolver6]::Init()

$sess = New-Object SkyCadKernel.SkyCadSession($false, $false, "1.3.65.17276")
$extracted = [SkyCadKernel.SkyCadIO]::ExtractPackageFile($PackagePath)

$conn = [SkyCadKernel.SkyCadFileSystem]::Load($sess, $extracted, $false, "", "", $null, $false)
if ($conn) {
    Write-Host "Connector Loaded: $($conn.GetType().FullName)"
    $ep = $conn.ExistingProperties
    Write-Host "ExistingProperties Count: $($ep.Count)"
    foreach ($k in $ep.get_Keys()) {
        $p = $ep.get_Item($k)
        Write-Host "  Property '$k': Value='$($p.Value)' DefID='$($p.Definition.ID)' DefName='$($p.Definition.Name)'"
    }
    Write-Host "`nConnector Gender: $($conn.Gender)"
    Write-Host "ChildrenPins count: $($conn.ChildrenPins.Count)"
    Write-Host "ChildrenLayouts count: $($conn.ChildrenLayouts.Count)"
} else {
    Write-Host "LOAD RETURNED NULL!"
}

