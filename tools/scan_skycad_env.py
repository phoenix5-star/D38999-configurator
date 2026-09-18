import os
import sys
import json
import argparse
import hashlib
from datetime import datetime, timezone

def get_file_hash(filepath):
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def scan_env(env_path):
    env_path = os.path.abspath(env_path)
    if not os.path.exists(env_path):
        raise FileNotFoundError(f"Environment path does not exist: {env_path}")
    
    dirs = []
    files = []
    total_bytes = 0

    for root, dirnames, filenames in os.walk(env_path):
        rel_root = os.path.relpath(root, env_path).replace(os.sep, '/')
        if rel_root != '.':
            dirs.append(rel_root)
        for fname in filenames:
            full = os.path.join(root, fname)
            rel = os.path.relpath(full, env_path).replace(os.sep, '/')
            try:
                st = os.stat(full)
                h = get_file_hash(full)
                total_bytes += st.st_size
                files.append({
                    'path': rel,
                    'size': st.st_size,
                    'mtime': datetime.fromtimestamp(st.st_mtime, tz=timezone.utc).isoformat(),
                    'sha256': h
                })
            except Exception as e:
                print(f"Warning reading {rel}: {e}", file=sys.stderr)

    dirs.sort()
    files.sort(key=lambda x: x['path'])
    return {
        'env_path': env_path,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'total_dirs': len(dirs),
        'total_files': len(files),
        'total_bytes': total_bytes,
        'dirs': dirs,
        'files': files
    }

def compare_snapshots(prev, curr, output_md=None):
    prev_dirs = set(prev['dirs'])
    curr_dirs = set(curr['dirs'])
    added_dirs = sorted(list(curr_dirs - prev_dirs))
    deleted_dirs = sorted(list(prev_dirs - curr_dirs))

    prev_files = {f['path'].lower(): f for f in prev['files']}
    curr_files = {f['path'].lower(): f for f in curr['files']}

    added_files = []
    modified_files = []
    deleted_files = []

    for k, cf in curr_files.items():
        if k not in prev_files:
            added_files.append(cf)
        else:
            pf = prev_files[k]
            if cf['sha256'] != pf['sha256']:
                modified_files.append({
                    'path': cf['path'],
                    'old_size': pf['size'],
                    'new_size': cf['size'],
                    'diff_size': cf['size'] - pf['size'],
                    'old_sha': pf['sha256'],
                    'new_sha': cf['sha256']
                })

    for k, pf in prev_files.items():
        if k not in curr_files:
            deleted_files.append(pf)

    added_files.sort(key=lambda x: x['path'])
    modified_files.sort(key=lambda x: x['path'])
    deleted_files.sort(key=lambda x: x['path'])

    print('\n' + '=' * 60)
    print(' SkyCAD Environment Comparison Summary')
    print(f" Base:    {prev.get('snapshot_name', 'previous')} ({prev['timestamp']})")
    print(f" Current: {curr.get('snapshot_name', 'current')} ({curr['timestamp']})")
    print('=' * 60)
    print(f"  Directories:   +{len(added_dirs)} / -{len(deleted_dirs)}")
    print(f"  Added Files:    {len(added_files)}")
    print(f"  Modified Files: {len(modified_files)}")
    print(f"  Deleted Files:  {len(deleted_files)}")
    print('-' * 60)

    if added_dirs:
        print('\n-- Added Directories --')
        for d in added_dirs:
            print(f"  + [DIR] {d}")

    if added_files:
        print('\n-- Added Files --')
        for f in added_files:
            print(f"  + {f['path']} ({f['size']:,} bytes)")

    if modified_files:
        print('\n-- Modified Files --')
        for f in modified_files:
            delta = f['diff_size']
            d_str = f"+{delta:,}" if delta >= 0 else f"{delta:,}"
            print(f"  ~ {f['path']} (size {f['old_size']:,} -> {f['new_size']:,}, {d_str} bytes)")

    if deleted_files:
        print('\n-- Deleted Files --')
        for f in deleted_files:
            print(f"  - {f['path']}")

    if output_md:
        with open(output_md, 'w', encoding='utf-8') as mf:
            mf.write('# SkyCAD Environment Diff Report\n\n')
            mf.write(f"- **Base Snapshot**: `{prev.get('snapshot_name', 'base')}` ({prev['timestamp']})\n")
            mf.write(f"- **Current Snapshot**: `{curr.get('snapshot_name', 'current')}` ({curr['timestamp']})\n")
            mf.write(f"- **Environment Path**: `{curr['env_path']}`\n\n")
            mf.write('## Metric Comparison\n\n')
            mf.write('| Metric | Base | Current | Difference |\n|---|---|---|---|\n')
            mf.write(f"| Total Directories | {prev['total_dirs']} | {curr['total_dirs']} | {curr['total_dirs'] - prev['total_dirs']} |\n")
            mf.write(f"| Total Files | {prev['total_files']} | {curr['total_files']} | {curr['total_files'] - prev['total_files']} |\n")
            mf.write(f"| Total Size (Bytes) | {prev['total_bytes']:,} | {curr['total_bytes']:,} | {curr['total_bytes'] - prev['total_bytes']:,} |\n")
            mf.write(f"| **Added Files** | - | - | **{len(added_files)}** |\n")
            mf.write(f"| **Modified Files** | - | - | **{len(modified_files)}** |\n")
            mf.write(f"| **Deleted Files** | - | - | **{len(deleted_files)}** |\n\n")

            if added_dirs:
                mf.write(f"### Added Directories ({len(added_dirs)})\n\n")
                for d in added_dirs:
                    mf.write(f"- `{d}`\n")
                mf.write('\n')

            if added_files:
                mf.write(f"### Added Files ({len(added_files)})\n\n")
                for f in added_files:
                    mf.write(f"- `{f['path']}` ({f['size']:,} bytes)\n")
                mf.write('\n')

            if modified_files:
                mf.write(f"### Modified Files ({len(modified_files)})\n\n")
                for f in modified_files:
                    delta = f['diff_size']
                    d_str = f"+{delta:,}" if delta >= 0 else f"{delta:,}"
                    mf.write(f"- `{f['path']}`: {f['old_size']:,} -> {f['new_size']:,} bytes ({d_str} bytes)\n")
                mf.write('\n')

            if deleted_files:
                mf.write(f"### Deleted Files ({len(deleted_files)})\n\n")
                for f in deleted_files:
                    mf.write(f"- `{f['path']}`\n")
                mf.write('\n')
        print(f"\n[OK] Diff report written to: {output_md}")

def main():
    parser = argparse.ArgumentParser(description='SkyCAD Environment Snapshot & Diff Tool')
    parser.add_argument('--name', default=datetime.now().strftime('snapshot_%Y%m%d_%H%M%S'), help='Snapshot name')
    parser.add_argument('--env', default=r'C:\SkyCAD Environments\Standard Environment', help='SkyCAD environment path')
    parser.add_argument('--outdir', default=r'tools\snapshots', help='Directory to save snapshots')
    parser.add_argument('--compare', help='Path to previous snapshot JSON to compare against')
    args = parser.parse_args()

    os.makedirs(args.outdir, exist_ok=True)
    print(f"Scanning: {args.env}...")
    snapshot = scan_env(args.env)
    snapshot['snapshot_name'] = args.name

    out_json = os.path.join(args.outdir, f"{args.name}.json")
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(snapshot, f, indent=2)
    print(f"[OK] Snapshot saved: {out_json}")
    print(f"  Directories: {snapshot['total_dirs']:,}")
    print(f"  Files:       {snapshot['total_files']:,}")
    print(f"  Total Size:  {snapshot['total_bytes']:,} bytes")

    if args.compare:
        if not os.path.exists(args.compare):
            print(f"Error: Compare file does not exist: {args.compare}", file=sys.stderr)
            sys.exit(1)
        with open(args.compare, 'r', encoding='utf-8') as f:
            prev_snapshot = json.load(f)
        out_md = os.path.join(args.outdir, f"diff_{prev_snapshot.get('snapshot_name', 'prev')}_vs_{args.name}.md")
        compare_snapshots(prev_snapshot, snapshot, output_md=out_md)

if __name__ == '__main__':
    main()

