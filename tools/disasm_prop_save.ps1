Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"

$csharp = @"
using System;
using System.Reflection;
using System.Reflection.Emit;

public class DisassemblerPropSave {
    public static void PrintMethod(MethodInfo m) {
        if (m == null) return;
        Console.WriteLine("--- " + m.DeclaringType.Name + "." + m.Name + " (" + m.GetParameters().Length + " params) ---");
        MethodBody mb = m.GetMethodBody();
        if (mb == null) return;
        byte[] il = mb.GetILAsByteArray();
        Module module = m.Module;
        int i = 0;
        while (i < il.Length) {
            int offset = i;
            byte b = il[i++];
            OpCode op = OpCodes.Nop;
            foreach (FieldInfo fi in typeof(OpCodes).GetFields(BindingFlags.Public | BindingFlags.Static)) {
                OpCode cand = (OpCode)fi.GetValue(null);
                if (cand.Size == 1 && cand.Value == b) { op = cand; break; }
            }
            string extra = "";
            switch (op.OperandType) {
                case OperandType.InlineMethod:
                case OperandType.InlineField:
                case OperandType.InlineType:
                case OperandType.InlineTok:
                    int token = BitConverter.ToInt32(il, i);
                    i += 4;
                    try { MemberInfo mem = module.ResolveMember(token); extra = mem.DeclaringType.Name + "." + mem.Name; } catch {}
                    break;
                case OperandType.InlineString:
                    int strToken = BitConverter.ToInt32(il, i);
                    i += 4;
                    try { extra = "\"" + module.ResolveString(strToken) + "\""; } catch {}
                    break;
                case OperandType.ShortInlineI:
                case OperandType.ShortInlineVar:
                    extra = il[i++].ToString();
                    break;
                case OperandType.InlineI:
                    extra = BitConverter.ToInt32(il, i).ToString();
                    i += 4;
                    break;
                case OperandType.ShortInlineBrTarget:
                    sbyte bOffset = (sbyte)il[i++];
                    extra = "IL_" + (i + bOffset).ToString("X4");
                    break;
                case OperandType.InlineBrTarget:
                    int target = BitConverter.ToInt32(il, i);
                    i += 4;
                    extra = "IL_" + (i + target).ToString("X4");
                    break;
            }
            Console.WriteLine(string.Format("IL_{0:X4}: {1} {2}", offset, op.Name, extra));
        }
    }
}
"@
Add-Type -TypeDefinition $csharp -ReferencedAssemblies @("C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll")

$type = [SkyCadKernel.SkyCadProperty]
$flags = [System.Reflection.BindingFlags]"Public,NonPublic,Instance"
[DisassemblerPropSave]::PrintMethod($type.GetMethod("SaveToFile", $flags))

