Add-Type -Path "C:\Program Files\SkyCAD Electrical\SkyCadKernel.dll"

$csharp = @"
using System;
using System.Reflection;
using System.Reflection.Emit;

public class Disassembler {
    public static void PrintMethod(MethodInfo m) {
        if (m == null) {
            Console.WriteLine("Method is null");
            return;
        }
        Console.WriteLine("--- " + m.DeclaringType.Name + "." + m.Name + " ---");
        MethodBody mb = m.GetMethodBody();
        if (mb == null) {
            Console.WriteLine("MethodBody is null");
            return;
        }
        byte[] il = mb.GetILAsByteArray();
        Module module = m.Module;
        int i = 0;
        while (i < il.Length) {
            int offset = i;
            byte b = il[i++];
            OpCode op = OpCodes.Nop;
            // Search opcode
            foreach (FieldInfo fi in typeof(OpCodes).GetFields(BindingFlags.Public | BindingFlags.Static)) {
                OpCode cand = (OpCode)fi.GetValue(null);
                if (cand.Size == 1 && cand.Value == b) {
                    op = cand;
                    break;
                }
            }
            string extra = "";
            switch (op.OperandType) {
                case OperandType.InlineMethod:
                case OperandType.InlineField:
                case OperandType.InlineType:
                case OperandType.InlineTok:
                    int token = BitConverter.ToInt32(il, i);
                    i += 4;
                    try {
                        MemberInfo mem = module.ResolveMember(token);
                        extra = mem.DeclaringType.Name + "." + mem.Name;
                    } catch {
                        extra = "token " + token.ToString("X");
                    }
                    break;
                case OperandType.InlineString:
                    int strToken = BitConverter.ToInt32(il, i);
                    i += 4;
                    try {
                        extra = "\"" + module.ResolveString(strToken) + "\"";
                    } catch {
                        extra = "str " + strToken.ToString("X");
                    }
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

[PR4]::Init()
$pdType = [SkyCadKernel.SkyCadPropertyDefinition]
foreach ($m in $pdType.GetMethods()) {
    if ($m.Name -eq "SetValue") {
        [Disassembler]::PrintMethod($m)
    }
}
