import os, sys, argparse, zipfile

def decode_leb128(b, offset):
    val = 0
    shift = 0
    count = 0
    while True:
        byte = b[offset + count]
        val |= (byte & 0x7F) << shift
        count += 1
        shift += 7
        if not (byte & 0x80):
            break
    return val, count

def encode_leb128(val):
    out = []
    while val >= 0x80:
        out.append((val & 0x7F) | 0x80)
        val >>= 7
    out.append(val & 0x7F)
    return bytes(out)

def find_subarray(src, sub, start=0):
    for i in range(start, len(src) - len(sub) + 1):
        if src[i:i+len(sub)] == sub:
            return i
    return -1

def export_package(part_number, manufacturer="Amphenol Aerospace", description=None, output_dir=None):
    if not output_dir:
        output_dir = os.path.expanduser(r'~\Downloads')
    os.makedirs(output_dir, exist_ok=True)

    safe_pn = part_number.replace('/', '_').replace('\\', '_').replace(':', '_').replace(' ', '_').strip()
    if not description:
        description = f"{part_number} Circular Connector"

    base_template_dir = os.path.join(os.path.dirname(__file__), '..', 'assets', 'skycad', 'package_template')
    conn_template_file = os.path.join(base_template_dir, 'Catalogue', 'Root Class', 'Work field classes', 'Component', 'Connector', 'D38999_26WE35PN.SkyCadFile')
    
    with open(conn_template_file, 'rb') as f:
        template_bytes = f.read()

    p_prefix = b"\\Catalogue\\Root Class\\Work field classes\\Component\\Connector\\"
    dot_ext = b".SkyCadFile"
    old_pn_marker = b"D38999/26WE35PN"
    old_mfr_marker = b"Amphenol Aerospace"

    # 1. Path Header
    p_start = find_subarray(template_bytes, p_prefix)
    old_path_len, old_path_count = decode_leb128(template_bytes, p_start - 1)
    old_path_end = p_start + old_path_len

    new_path = p_prefix + safe_pn.encode('utf-8') + dot_ext
    new_path_len = encode_leb128(len(new_path))

    # 2. Part Number Property
    pn_pos = find_subarray(template_bytes, old_pn_marker, old_path_end)
    old_pn_len, old_pn_count = decode_leb128(template_bytes, pn_pos - 1)
    actual_pn_bytes = part_number.encode('utf-8')
    actual_pn_len = encode_leb128(len(actual_pn_bytes))

    # 3. Manufacturer Property
    mfr_pos = find_subarray(template_bytes, old_mfr_marker, pn_pos + len(old_pn_marker))
    old_mfr_len, old_mfr_count = decode_leb128(template_bytes, mfr_pos - 1)
    new_mfr_bytes = manufacturer.encode('utf-8')
    new_mfr_len = encode_leb128(len(new_mfr_bytes))

    # Slices
    parts = [
        template_bytes[:p_start - old_path_count],
        new_path_len,
        new_path,
        template_bytes[old_path_end:pn_pos - old_pn_count],
        actual_pn_len,
        actual_pn_bytes,
        template_bytes[pn_pos + len(old_pn_marker):mfr_pos - old_mfr_count],
        new_mfr_len,
        new_mfr_bytes,
        template_bytes[mfr_pos + len(old_mfr_marker):]
    ]
    custom_conn_file = b''.join(parts)

    pkg_folder = f"{safe_pn} Package"
    pkg_info = f"\\Catalogue\\Root Class\\Work field classes\\Component\\Connector\\{safe_pn}.SkyCadFile\r\n1.3.65.17278\r\n"

    out_package_path = os.path.join(output_dir, f"{safe_pn}.SkyCadPackage")
    with zipfile.ZipFile(out_package_path, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr(f"{pkg_folder}/PackageInfo.txt", pkg_info)
        z.write(os.path.join(base_template_dir, 'EnvironmentStructure.SkyCadFile'), f"{pkg_folder}/EnvironmentStructure.SkyCadFile")
        z.write(os.path.join(base_template_dir, 'Catalogue', 'Library', 'Package library.SkyCadFile'), f"{pkg_folder}/Catalogue/Library/Package library.SkyCadFile")
        z.write(os.path.join(base_template_dir, 'Catalogue', 'Connector pin', 'M39029_58-360.SkyCadFile'), f"{pkg_folder}/Catalogue/Connector pin/M39029_58-360.SkyCadFile")
        z.write(os.path.join(base_template_dir, 'Catalogue', 'Harness accessory', 'M85049_38-17W.SkyCadFile'), f"{pkg_folder}/Catalogue/Harness accessory/M85049_38-17W.SkyCadFile")
        z.writestr(f"{pkg_folder}/Catalogue/Root Class/Work field classes/Component/Connector/{safe_pn}.SkyCadFile", custom_conn_file)
        z.write(os.path.join(base_template_dir, 'Icons', 'addlabelicon.png'), f"{pkg_folder}/Icons/addlabelicon.png")
        z.write(os.path.join(base_template_dir, 'Icons', 'ComponentSmall.png'), f"{pkg_folder}/Icons/ComponentSmall.png")
        z.write(os.path.join(base_template_dir, 'Icons', 'labelicon.png'), f"{pkg_folder}/Icons/labelicon.png")
        img_file = os.path.join(base_template_dir, 'Images', 'E35.PNG')
        if os.path.exists(img_file):
            z.write(img_file, f"{pkg_folder}/Images/E35.PNG")

    print(f"SUCCESS: Generated {out_package_path} ({os.path.getsize(out_package_path):,} bytes)")
    return out_package_path

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--part-number', required=True)
    parser.add_argument('--manufacturer', default='Amphenol Aerospace')
    parser.add_argument('--description', default=None)
    parser.add_argument('--output-dir', default=None)
    args = parser.parse_args()
    export_package(args.part_number, args.manufacturer, args.description, args.output_dir)
