Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"

$csharp = @"
using System;
using SkyCadKernel;

public class PR_JackTest {
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
[PR_JackTest]::Init()

$sess = New-Object SkyCadKernel.SkyCadSession($false, $false, "1.3.65.17276")
$connFile = "C:\Projects\D38999-configurator\scratch\test_conn_injected_jack.SkyCadFile"

$conn = [SkyCadKernel.SkyCadFileSystem]::Load($sess, $connFile, $false, "", "", $null, $false)
if ($conn) {
    Write-Host "LOAD_SUCCESS: $($conn.GetType().FullName)"
    Write-Host "conn.Gender: $($conn.Gender)"
    Write-Host "conn.Description: $($conn.Description)"
    $pd = $conn.Class.GetPropertyDefinitionByName("Gender")
    if ($pd) {
        Write-Host "PD Gender value on conn: '$($pd.GetValue($conn))'"
    }
} else {
    Write-Host "LOAD RETURNED NULL!"
}

