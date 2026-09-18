Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"

$csharp = @"
using System;
public class PR5 {
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
[PR5]::Init()

$sess = New-Object SkyCadKernel.SkyCadSession($false, $false, "1.3.65.17276")
$connFile = "C:\SkyCAD Environments\browser_exported_37pin_Package\Catalogue\Root Class\Work field classes\Component\Connector\D38999_26WD35PN.SkyCadFile"
$conn = [SkyCadKernel.SkyCadFileSystem]::Load($sess, $connFile, $false, "", "", $null, $false)

Write-Host "ExistingProperties on conn:"
$ep = $conn.ExistingProperties
Write-Host "Count: $($ep.Count)"
foreach ($item in $ep) {
    Write-Host "  Key: $($item.Key) = $($item.Value) (Type: $($item.Value.GetType().FullName))"
}

# Now let's call $pd.SetValue($conn, "Jack", $true, $false)
$pd = $conn.Class.GetPropertyDefinitionByName("Gender")
Write-Host "`nSetting Gender property via PD..."
$res = $pd.SetValue($conn, "Jack", $true, $false)
Write-Host "SetValue result: $res"
Write-Host "conn.Children count: $($conn.Children.Count)"
$propChildren = @($conn.Children | Where-Object { $_.GetType().Name -like "*Property*" })
Write-Host "Property children on conn: $($propChildren.Count)"
foreach ($pc in $propChildren) {
    Write-Host "  Property Child: $($pc.Name) = $($pc.Value) (Type: $($pc.GetType().FullName), ID: $($pc.ID))"
}
