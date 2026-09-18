param (
    [string]$PackagePath = "scratch/test_20fd35_browser.SkyCadPackage"
)

Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"

$csharp = @"
using System;
using SkyCadKernel;

public class PackageResolver5 {
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
[PackageResolver5]::Init()

$sess = New-Object SkyCadKernel.SkyCadSession($false, $false, "1.3.65.17276")
$extracted = [SkyCadKernel.SkyCadIO]::ExtractPackageFile($PackagePath)

$conn = [SkyCadKernel.SkyCadFileSystem]::Load($sess, $extracted, $false, "", "", $null, $false)
if ($conn) {
    Write-Host "Connector Loaded: $($conn.GetType().FullName)"
    foreach ($p in $conn.GetType().GetProperties()) {
        if ($p.GetIndexParameters().Length -eq 0) {
            try {
                $val = $p.GetValue($conn, $null)
                if ($val -ne $null -and "$val" -ne "" -and "$val" -ne "0") {
                    Write-Host "  $($p.Name): '$val'"
                }
            } catch {}
        }
    }
} else {
    Write-Host "LOAD RETURNED NULL!"
}
