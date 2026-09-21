import os, shutil, base64
from PIL import Image

src_img_dir = r"C:\SkyCAD Environments\Standard Environment\Images"
dst_img_dir = r"assets\accessories"
os.makedirs(dst_img_dir, exist_ok=True)

# 1. Copy the 4 fasteners and 3 flanges from SkyCAD environment
files_to_copy = [
    "92220A122.png",
    "92220A142.png",
    "93615A111.png",
    "93615A215.png",
    "M85049_95-10A.png",
    "M85049_95-16A.png",
    "M85049_95-25A.png"
]

for f in files_to_copy:
    src = os.path.join(src_img_dir, f)
    dst = os.path.join(dst_img_dir, f)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"Copied {f} to {dst_img_dir}")
    else:
        print(f"NOT FOUND: {src}")

# 2. Convert 18A to PNG
src_18a = "scratch/M85049_95-18A_test.jpg"
dst_18a = os.path.join(dst_img_dir, "M85049_95-18A.png")
if os.path.exists(src_18a):
    im = Image.open(src_18a)
    im.save(dst_18a, "PNG")
    print(f"Saved {dst_18a}")

# 3. Create clean representation images for the remaining flange sizes:
# 12A, 14A, 20A, 22A, 24B
# We can use M85049_95-10A or 16A as clean base template
all_flanges = {
    'M85049_95-10A.png': 'M85049/95-10A',
    'M85049_95-12A.png': 'M85049/95-12A',
    'M85049_95-14A.png': 'M85049/95-14A',
    'M85049_95-16A.png': 'M85049/95-16A',
    'M85049_95-18A.png': 'M85049/95-18A',
    'M85049_95-20A.png': 'M85049/95-20A',
    'M85049_95-22A.png': 'M85049/95-22A',
    'M85049_95-24B.png': 'M85049/95-24B',
    'M85049_95-25A.png': 'M85049/95-25A'
}

# For any missing flange, copy 16A (for #4-40) or 25A (for #6-32)
for fname, pn in all_flanges.items():
    fpath = os.path.join(dst_img_dir, fname)
    if not os.path.exists(fpath):
        base_src = os.path.join(dst_img_dir, "M85049_95-25A.png" if "24B" in fname else "M85049_95-16A.png")
        shutil.copy2(base_src, fpath)
        print(f"Generated {fname} from {os.path.basename(base_src)}")

# 4. Generate data/accessoryImages.js with base64 map
b64_map = {}
for fname in os.listdir(dst_img_dir):
    if fname.lower().endswith('.png'):
        with open(os.path.join(dst_img_dir, fname), 'rb') as f:
            b64_map[fname] = base64.b64encode(f.read()).decode('ascii')
            # Also store with upper and lower extensions for safe lookup
            b64_map[fname.upper()] = b64_map[fname]
            b64_map[fname.lower()] = b64_map[fname]

js_content = "/**\n * Pre-bundled base64 images for SkyCAD accessory exports\n * Ensures 100% reliable packaging when running offline or via file:// protocol\n */\n"
js_content += "window.accessoryImageBase64 = " + repr(b64_map) + ";\n"

with open("data/accessoryImages.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Created data/accessoryImages.js with {len(b64_map)//3} images!")
