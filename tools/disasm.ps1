Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"

$csharp = @"
using System;
public class PR3 {
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
[PR3]::Init()

$type = [SkyCadKernel.SkyCadConnector]
$m = $type.GetMethod("get_Gender")
Write-Host "Disassembling get_Gender:"
$il = $m.GetMethodBody().GetILAsByteArray()
$module = $m.Module

for ($i=0; $i -lt $il.Length - 4; $i++) {
    $op = $il[$i]
    if ($op -eq 0x28 -or $op -eq 0x6f -or $op -eq 0x73 -or $op -eq 0x7e -or $op -eq 0x7b) {
        $token = [System.BitConverter]::ToInt32($il, $i+1)
        try {
            $member = $module.ResolveMember($token)
            Write-Host "IL_$("{0:X4}" -f $i): ($op) $($member.DeclaringType.Name).$($member.Name)"
        } catch {}
    }
}

$mSet = $type.GetMethod("set_Gender")
Write-Host "`nDisassembling set_Gender:"
$ilSet = $mSet.GetMethodBody().GetILAsByteArray()
for ($i=0; $i -lt $ilSet.Length - 4; $i++) {
    $op = $ilSet[$i]
    if ($op -eq 0x28 -or $op -eq 0x6f -or $op -eq 0x73 -or $op -eq 0x7e -or $op -eq 0x7b) {
        $token = [System.BitConverter]::ToInt32($ilSet, $i+1)
        try {
            $member = $module.ResolveMember($token)
            Write-Host "IL_$("{0:X4}" -f $i): ($op) $($member.DeclaringType.Name).$($member.Name)"
        } catch {}
    }
}

