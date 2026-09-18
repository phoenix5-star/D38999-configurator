Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"

$csharp = @"
using System;
using System.Reflection;
using SkyCadKernel;

public class PropInspector {
    public static void Inspect() {
        Type pType = typeof(SkyCadProperty);
        Console.WriteLine("SkyCadProperty methods:");
        foreach (MethodInfo m in pType.GetMethods(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance)) {
            if (m.Name.Contains("Stream") || m.Name.Contains("Save") || m.Name.Contains("Write") || m.Name.Contains("Read")) {
                Console.WriteLine("  " + m.Name);
            }
        }
    }
}
"@
Add-Type -TypeDefinition $csharp -ReferencedAssemblies @("C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll")
[PropInspector]::Inspect()

