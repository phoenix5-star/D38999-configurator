Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"

$csharp = @"
using System;
using SkyCadKernel;

public class PackageResolver2 {
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
[PackageResolver2]::Init()

$sess = New-Object SkyCadKernel.SkyCadSession($false, $false, "1.3.65.17276")
$connFile = "C:\SkyCAD Environments\browser_exported_37pin_Package\Catalogue\Root Class\Work field classes\Component\Connector\D38999_26WD35PN.SkyCadFile"

if (-not (Test-Path $connFile)) {
    Write-Host "File not found: $connFile"
    exit
}

$conn = [SkyCadKernel.SkyCadFileSystem]::Load($sess, $connFile, $false, "", "", $null, $false)
if ($conn) {
    Write-Host "Connector Type: $($conn.GetType().FullName)"
    
    $genderProp = $conn.GetType().GetProperty("Gender")
    if ($genderProp) {
        $gVal = $genderProp.GetValue($conn, $null)
        Write-Host "Gender Value: '$gVal'"
        Write-Host "Gender Type: $($genderProp.PropertyType.FullName)"
    }

    $pd = $conn.Class.GetPropertyDefinitionByName("Gender")
    if ($pd) {
        Write-Host "PropertyDefinition Gender found:"
        Write-Host "  Name: $($pd.Name)"
        Write-Host "  ID: $($pd.ID)"
        Write-Host "  Guid: $($pd.Guid)"
        Write-Host "  Value on conn: $($pd.GetValue($conn))"
    } else {
        Write-Host "GetPropertyDefinitionByName('Gender') returned null"
        # Search all property definitions on Class
        Write-Host "All PropertyDefinitions on conn.Class:"
        foreach ($pdef in $conn.Class.PropertyDefinitions) {
            Write-Host "  - $($pdef.Name) (ID: $($pdef.ID), Guid: $($pdef.Guid), Val: $($pdef.GetValue($conn)))"
        }
    }

    # Check dynamic property definitions or dictionary
    Write-Host "`nChecking Property Definitions / Values if any:"
    $methods = $conn.GetType().GetMethods()
    foreach ($m in $methods) {
        if ($m.Name -like "*Property*" -or $m.Name -like "*Gender*") {
            Write-Host "METHOD: $($m.Name) ($($m.GetParameters().Count) params)"
        }
    }
} else {
    Write-Host "Load returned null"
}
