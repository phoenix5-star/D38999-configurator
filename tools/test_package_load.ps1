param (
    [Parameter(Mandatory=$true)]
    [string]$PackagePath
)

Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"

$csharp = @"
using System;
using System.Collections.Generic;
using SkyCadKernel;

public class PackageTester {
    static PackageTester() {
        AppDomain.CurrentDomain.AssemblyResolve += (sender, args) => {
            string folder = @"C:\Program Files\SkyCAD Electrical";
            string name = new System.Reflection.AssemblyName(args.Name).Name + ".dll";
            string full = System.IO.Path.Combine(folder, name);
            if (System.IO.File.Exists(full)) return System.Reflection.Assembly.LoadFrom(full);
            return null;
        };
    }

    public static string TestStream(string filePath) {
        SkyCadLoadedFile loaded = new SkyCadLoadedFile(filePath, false, "");
        SkyCadFileLoadingDictionnary dict = new SkyCadFileLoadingDictionnary();
        int inc = 0;
        try {
            var m = typeof(SkyCadLoadedFile).GetMethod("GetListOfPresetObjectsFromStream", 
                System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            object[] args = new object[] { "", false, dict, null, inc };
            var res = m.Invoke(loaded, args);
            var skydict = dict.GetSkyCadDictionnary();
            return "STREAM_SUCCESS: Pos=" + loaded.ObjectStructureStream.Position + "/" + loaded.ObjectStructureStream.Length + " DictCount=" + skydict.Count;
        } catch (Exception ex) {
            return "STREAM_FAIL at Pos=" + loaded.ObjectStructureStream.Position + "/" + loaded.ObjectStructureStream.Length + " Ex: " + (ex.InnerException != null ? ex.InnerException.ToString() : ex.ToString());
        }
    }

    public static Dictionary<string, string> InspectStreamProperties(string filePath) {
        var result = new Dictionary<string, string>();
        SkyCadLoadedFile loaded = new SkyCadLoadedFile(filePath, false, "");
        SkyCadFileLoadingDictionnary dict = new SkyCadFileLoadingDictionnary();
        int inc = 0;
        var m = typeof(SkyCadLoadedFile).GetMethod("GetListOfPresetObjectsFromStream", 
            System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        object[] args = new object[] { "", false, dict, null, inc };
        m.Invoke(loaded, args);
        var skydict = dict.GetSkyCadDictionnary();
        foreach (var obj in skydict.List) {
            if (obj.GetType().Name == "SkyCadProperty") {
                var fVal = obj.GetType().GetField("_Value", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                var fDefId = obj.GetType().GetField("_PropertyDefinitionID", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                var val = fVal.GetValue(obj) != null ? fVal.GetValue(obj).ToString() : "";
                var did = fDefId.GetValue(obj) != null ? fDefId.GetValue(obj).ToString() : "";
                
                if (did.Contains("a7073857-50bc-4935-a474-4dd9d5a7abe5")) result["PartNumber"] = val;
                if (did.Contains("827b9a04-9c5d-4c3d-b892-cb97bad90741")) result["Gender"] = val;
                if (did.Contains("4ffe94b7-c9ae-43be-9d3e-1d82323866d8")) result["Description"] = val;
                if (did.Contains("c99e4224-a653-4d8b-bbe9-1b65b53d7c31")) result["Image"] = val;
                if (did.Contains("df4db298-037c-4b35-aa04-6b35dab51f5b")) result["Manufacturer"] = val;
                if (did.Contains("be54de67-db49-4cd8-b69b-06199034d5b7")) result["LayoutWidth"] = val;
                if (did.Contains("6601bc12-0d5e-41b2-a8d6-0e62d8a3c17e")) result["LayoutHeight"] = val;
                if (did.Contains("ff3cc687-30df-4199-bd3f-3f8f3855c159")) result["LayoutIPX"] = val;
                if (did.Contains("4c1e4f05-debc-43b0-aead-3763cf91aa31")) result["LayoutIPY"] = val;
                if (did.Contains("3f9852d0-2475-476c-85c4-2dd9277f9183")) result["LayoutImage"] = val;
                if (did.Contains("9e962f59-97d8-453e-aad5-5969d6046d2a")) result["Type"] = val;
            }
        }
        return result;
    }
}
"@

Add-Type -TypeDefinition $csharp -ReferencedAssemblies @("C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll")

$PackagePath = (Resolve-Path $PackagePath).Path
$sess = New-Object SkyCadKernel.SkyCadSession($false, $false, "1.3.65.17276")

Write-Host "Testing Package: $PackagePath"
$extracted = [SkyCadKernel.SkyCadIO]::ExtractPackageFile($PackagePath)
if (-not $extracted) {
    Write-Host "EXTRACTION FAILED!"
    exit 1
}
Write-Host "Extracted to: $extracted"
$streamRes = [PackageTester]::TestStream($extracted)
Write-Host "Stream result: $streamRes"

$props = [PackageTester]::InspectStreamProperties($extracted)
Write-Host "STREAM_INSPECT:"
Write-Host "  PartNumber: '$($props['PartNumber'])'"
Write-Host "  Gender: '$($props['Gender'])'"
Write-Host "  Description: '$($props['Description'])'"
Write-Host "  Manufacturer: '$($props['Manufacturer'])'"
Write-Host "  Image: '$($props['Image'])'"
Write-Host "  LayoutWidth: '$($props['LayoutWidth'])'"
Write-Host "  LayoutHeight: '$($props['LayoutHeight'])'"
Write-Host "  LayoutIPX: '$($props['LayoutIPX'])'"
Write-Host "  LayoutIPY: '$($props['LayoutIPY'])'"
Write-Host "  LayoutImage: '$($props['LayoutImage'])'"

# Check contact pin file in package
$pkgDir = Split-Path (Split-Path (Split-Path (Split-Path (Split-Path (Split-Path $extracted -Parent) -Parent) -Parent) -Parent) -Parent) -Parent
$contactFiles = Get-ChildItem -Path $pkgDir -Filter "*.SkyCadFile" -Recurse | Where-Object { $_.FullName -like "*Connector pin*" }
foreach ($cfile in $contactFiles) {
    Write-Host "Found Contact Pin File: $($cfile.Name)"
    $cStream = [PackageTester]::TestStream($cfile.FullName)
    Write-Host "  Contact Stream: $cStream"
    $cProps = [PackageTester]::InspectStreamProperties($cfile.FullName)
    Write-Host "  Contact PartNumber: '$($cProps['PartNumber'])'"
    Write-Host "  Contact Type: '$($cProps['Type'])'"
    Write-Host "  Contact Description: '$($cProps['Description'])'"
}

if ($streamRes -like "*STREAM_SUCCESS*") {
    Write-Host "LOAD_SUCCESS"
}

