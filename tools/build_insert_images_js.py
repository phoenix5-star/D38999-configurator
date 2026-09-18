import glob, os, base64

inserts_dir = os.path.join(os.path.dirname(__file__), '..', 'assets', 'inserts')
output_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'insertImages.js')

files = sorted(glob.glob(os.path.join(inserts_dir, '*')))
print(f"Found {len(files)} files in {inserts_dir}")

lines = []
lines.append("/**")
lines.append(" * Pre-bundled insert arrangement diagram PNG assets for client-side packaging.")
lines.append(" * Ensures 100% reliable image inclusion even when index.html is loaded via local file:// protocol.")
lines.append(" */")
lines.append("(function(window) {")
lines.append("    'use strict';")
lines.append("    window.insertImageBase64 = {")

for i, f in enumerate(files):
    fname = os.path.basename(f)
    with open(f, 'rb') as fp:
        b64 = base64.b64encode(fp.read()).decode('ascii')
    comma = "," if i < len(files) - 1 else ""
    lines.append(f'        "{fname}": "{b64}"{comma}')

lines.append("    };")
lines.append("})(typeof window !== 'undefined' ? window : this);")

with open(output_file, 'w', encoding='utf-8') as out:
    out.write("\n".join(lines) + "\n")

out_size = os.path.getsize(output_file)
print(f"Generated {output_file} ({out_size} bytes, {out_size / (1024*1024):.2f} MB)")

