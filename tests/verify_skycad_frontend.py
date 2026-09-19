import http.server
import json
import os
import subprocess
import sys
import threading
import time
import urllib.request
import zipfile
import io
import websocket

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9222
HTTP_PORT = 8089
PROJECT_DIR = r"c:\Projects\D38999-configurator"

def start_http_server():
    os.chdir(PROJECT_DIR)
    handler = http.server.SimpleHTTPRequestHandler
    httpd = http.server.HTTPServer(('127.0.0.1', HTTP_PORT), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd

def launch_edge():
    cmd = [
        EDGE_PATH,
        "--headless=new",
        f"--remote-debugging-port={PORT}",
        "--remote-allow-origins=*",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        f"http://127.0.0.1:{HTTP_PORT}/index.html"
    ]
    return subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def cdp_eval(ws, expr, msg_id=[1]):
    mid = msg_id[0]
    msg_id[0] += 1
    req = {
        "id": mid,
        "method": "Runtime.evaluate",
        "params": {
            "expression": expr,
            "returnByValue": True,
            "awaitPromise": True
        }
    }
    ws.send(json.dumps(req))
    while True:
        resp = json.loads(ws.recv())
        if resp.get("id") == mid:
            return resp.get("result", {}).get("result", {}).get("value")

def main():
    print("Starting local HTTP server on port", HTTP_PORT)
    httpd = start_http_server()
    time.sleep(0.5)

    print("Launching Edge headless with remote debugging...")
    edge_proc = launch_edge()

    ws = None
    try:
        targets = None
        for _ in range(20):
            time.sleep(0.5)
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json") as r:
                    targets = json.loads(r.read().decode())
                    if targets:
                        break
            except Exception:
                pass

        if not targets:
            print("[FAIL] Edge remote debugging did not respond.")
            sys.exit(1)

        page_target = next((t for t in targets if t.get("type") == "page"), targets[0])
        ws_url = page_target["webSocketDebuggerUrl"]
        print(f"Connecting to CDP: {ws_url}")
        ws = websocket.create_connection(ws_url, timeout=10)

        ws.send(json.dumps({"id": 901, "method": "Runtime.enable"}))
        for _ in range(10):
            ready = cdp_eval(ws, "document.readyState === 'complete' && typeof CONFIG_VERSION !== 'undefined'")
            if ready:
                break
            time.sleep(0.5)

        cdp_eval(ws, "window.alert = function(msg) { console.warn('INTERCEPTED ALERT:', msg); };")

        console_errors = []

        def check_messages():
            ws.settimeout(0.2)
            try:
                while True:
                    m = json.loads(ws.recv())
                    if m.get("method") == "Console.messageAdded":
                        msg = m["params"]["message"]
                        if msg.get("level") in ("error", "fatal"):
                            console_errors.append(msg.get("text"))
                    elif m.get("method") == "Runtime.exceptionThrown":
                        details = m["params"]["exceptionDetails"]
                        console_errors.append(details.get("text") or details.get("exception", {}).get("description"))
            except Exception:
                pass
            ws.settimeout(10)

        check_messages()

        print("\n--- Check 1: Title & Version Synchronization ---")
        title = cdp_eval(ws, "document.title")
        version_tag = cdp_eval(ws, "document.querySelector('.version-tag')?.textContent")
        config_version = cdp_eval(ws, "typeof CONFIG_VERSION !== 'undefined' ? CONFIG_VERSION : 'undefined'")
        print(f"Document Title: {title}")
        print(f"Header Version Tag: {version_tag}")
        print(f"CONFIG_VERSION constant: {config_version}")

        assert version_tag in title, f"Title does not contain {version_tag}: {title}"
        assert config_version == version_tag, f"CONFIG_VERSION ({config_version}) != version_tag ({version_tag})"
        print("[PASS] Version synchronization verified across DOM and JS.")

        print("\n--- Check 2: Calculation & Solution Card DOM Verification ---")
        cdp_eval(ws, "document.querySelector('#groups .val').value = '22D';")
        cdp_eval(ws, "document.querySelector('#groups .qty').value = '37';")
        cdp_eval(ws, "document.getElementById('filterArrangement').value = '15-35';")
        cdp_eval(ws, "calculate();")
        time.sleep(1)

        card_count = cdp_eval(ws, "document.querySelectorAll('.solution-card').length")
        print(f"Calculated Solution Cards rendered: {card_count}")
        assert card_count > 0, "No solution cards rendered!"

        pri_btn = cdp_eval(ws, "document.querySelector('.primary-card button[onclick*=\"exportSolutionToSkyCAD\"]')?.textContent")
        mat_btn = cdp_eval(ws, "document.querySelector('.mating-card button[onclick*=\"exportSolutionToSkyCAD\"]')?.textContent")
        print(f"Primary Card Export Button: {pri_btn}")
        print(f"Mating Card Export Button: {mat_btn}")
        assert pri_btn and "Export to SkyCAD" in pri_btn, f"Primary card SkyCAD button missing: {pri_btn}"
        assert mat_btn and "Export to SkyCAD" in mat_btn, f"Mating card SkyCAD button missing: {mat_btn}"
        print("[PASS] SkyCAD export buttons verified present on Primary and Mating cards.")

        print("\n--- Check 3: Live 37-Pin Package Generation via Browser Engine ---")
        b64_zip_37 = cdp_eval(ws, """
            (async () => {
                const pair = currentCalculatedSolutions[0];
                const formatted = SkyCadExporter.formatConnectorData(pair.primary, pair, true);
                const blob = await SkyCadExporter.generatePackageBlob(formatted);
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const b64 = reader.result.split(',')[1];
                        resolve(b64);
                    };
                    reader.readAsDataURL(blob);
                });
            })()
        """)
        assert b64_zip_37, "generatePackageBlob returned null for 37-pin connector!"
        import base64
        zip_bytes_37 = base64.b64decode(b64_zip_37)
        print(f"Generated 37-pin .SkyCadPackage ZIP size: {len(zip_bytes_37):,} bytes")

        out_37_pkg = os.path.join(PROJECT_DIR, "scratch", "browser_exported_37pin.SkyCadPackage")
        with open(out_37_pkg, "wb") as f:
            f.write(zip_bytes_37)
        print(f"Saved package to: {out_37_pkg}")

        # Explicitly set Shell Type = 'Wall Mount' to test Jack primary
        cdp_eval(ws, "document.getElementById('filterShellType').value = 'Wall Mount';")
        cdp_eval(ws, "document.getElementById('filterFinish').value = 'F';")
        cdp_eval(ws, "calculate();")
        time.sleep(1)

        pri_obj = cdp_eval(ws, 'currentCalculatedSolutions[0].primary')
        print(f"Primary Object (Wall Mount): PN={pri_obj.get('activePN')} shellType={pri_obj.get('shellType')}")
        pri_fmt = cdp_eval(ws, 'SkyCadExporter.formatConnectorData(currentCalculatedSolutions[0].primary, currentCalculatedSolutions[0], true)')
        print(f"Primary Formatted: PN={pri_fmt.get('partNumber')} Gender={pri_fmt.get('connectorGender')}")
        assert pri_fmt.get('connectorGender') == 'Jack', f"Primary Wall Mount gender must be 'Jack', got {pri_fmt.get('connectorGender')}"

        mat_fmt = cdp_eval(ws, 'SkyCadExporter.formatConnectorData(currentCalculatedSolutions[0].mating, currentCalculatedSolutions[0], false)')
        print(f"Mating Formatted: PN={mat_fmt.get('partNumber')} Gender={mat_fmt.get('connectorGender')}")
        assert mat_fmt.get('connectorGender') == 'Plug', f"Mating Plug gender must be 'Plug', got {mat_fmt.get('connectorGender')}"

        b64_zip_37_jack = cdp_eval(ws, """
            (async () => {
                const pair = currentCalculatedSolutions[0];
                const formatted = SkyCadExporter.formatConnectorData(pair.primary, pair, true);
                const blob = await SkyCadExporter.generatePackageBlob(formatted);
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const b64 = reader.result.split(',')[1];
                        resolve(b64);
                    };
                    reader.readAsDataURL(blob);
                });
            })()
        """)
        zip_bytes_37_jack = base64.b64decode(b64_zip_37_jack)
        out_37_jack_pkg = os.path.join(PROJECT_DIR, "scratch", "browser_exported_20fd35pn_jack.SkyCadPackage")
        with open(out_37_jack_pkg, "wb") as f:
            f.write(zip_bytes_37_jack)

        with zipfile.ZipFile(io.BytesIO(zip_bytes_37_jack), 'r') as zf:
            file_list = zf.namelist()
            print(f"Files inside 37-pin Jack package ({len(file_list)} files):")
            for f in file_list:
                print(f"  - {f}")
            assert any(f.endswith("PackageInfo.txt") for f in file_list)
            assert any("M39029_58-360.SkyCadFile" in f for f in file_list), "Pin contact M39029/58-360 missing!"
            d35_entry = next((f for f in file_list if "d35.png" in f.lower()), None)
            assert d35_entry, "D35 layout image missing from package!"
            d35_bytes = zf.read(d35_entry)
            print(f"Authentic D35.png bytes in package: {len(d35_bytes)} bytes")
            assert len(d35_bytes) == 22524, f"D35.png size mismatch: expected 22,524 bytes, got {len(d35_bytes)} bytes!"

        # Verify 20FD35PN package loading in SkyCadKernel
        print("\nVerifying 37-pin Jack package in SkyCAD Kernel...")
        load_cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", "tools/test_package_load.ps1", "-PackagePath", out_37_jack_pkg]
        load_proc = subprocess.run(load_cmd, capture_output=True, text=True)
        print("SkyCAD Kernel Output (Jack):")
        print(load_proc.stdout)
        assert "STREAM_SUCCESS" in load_proc.stdout, f"Kernel stream failure: {load_proc.stdout}"
        assert "LOAD_SUCCESS" in load_proc.stdout, f"Kernel load failure: {load_proc.stdout}"
        assert "Gender: 'Jack'" in load_proc.stdout, f"Kernel Gender was not 'Jack': {load_proc.stdout}"
        assert "PartNumber: 'D38999/20FD35PN'" in load_proc.stdout, f"Kernel PartNumber mismatch: {load_proc.stdout}"
        assert "LayoutWidth: '1270'" in load_proc.stdout, f"LayoutWidth mismatch: {load_proc.stdout}"
        assert "LayoutHeight: '1502'" in load_proc.stdout, f"LayoutHeight mismatch: {load_proc.stdout}"
        assert "LayoutIPX: '635'" in load_proc.stdout, f"LayoutIPX mismatch: {load_proc.stdout}"
        assert "LayoutIPY: '751'" in load_proc.stdout, f"LayoutIPY mismatch: {load_proc.stdout}"
        assert "Contact Type: 'Pin'" in load_proc.stdout, f"Contact Type was not 'Pin': {load_proc.stdout}"
        print("[PASS] SkyCAD Kernel verified STREAM_SUCCESS, LOAD_SUCCESS, Gender: 'Jack', and scaled layout dimensions for 20FD35PN!")

        # Check 3b: Test 37-pin Socket Connector (D38999/20FD35SN) for Contact Type: 'Socket' and Description
        print("\n--- Check 3b: Testing Socket Contact Assignment (20FD35SN) ---")
        cdp_eval(ws, "document.getElementById('pnDecodeInput').value = '20FD35SN';")
        cdp_eval(ws, "liveDecodePN('20FD35SN');")
        cdp_eval(ws, "applyDecodedPN();")
        time.sleep(1)

        b64_zip_37_sn = cdp_eval(ws, """
            (async () => {
                const pair = currentCalculatedSolutions[0];
                const formatted = SkyCadExporter.formatConnectorData(pair.primary, pair, true);
                const blob = await SkyCadExporter.generatePackageBlob(formatted);
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const b64 = reader.result.split(',')[1];
                        resolve(b64);
                    };
                    reader.readAsDataURL(blob);
                });
            })()
        """)
        zip_bytes_37_sn = base64.b64decode(b64_zip_37_sn)
        out_37_sn_pkg = os.path.join(PROJECT_DIR, "scratch", "browser_exported_20fd35sn_socket.SkyCadPackage")
        with open(out_37_sn_pkg, "wb") as f:
            f.write(zip_bytes_37_sn)

        load_sn_cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", "tools/test_package_load.ps1", "-PackagePath", out_37_sn_pkg]
        load_sn_proc = subprocess.run(load_sn_cmd, capture_output=True, text=True)
        print("SkyCAD Kernel Output (Socket Receptacle 20FD35SN):")
        print(load_sn_proc.stdout)
        assert "STREAM_SUCCESS" in load_sn_proc.stdout, f"Kernel stream failure: {load_sn_proc.stdout}"
        assert "LOAD_SUCCESS" in load_sn_proc.stdout, f"Kernel load failure: {load_sn_proc.stdout}"
        assert "Gender: 'Jack'" in load_sn_proc.stdout, f"Kernel Gender was not 'Jack': {load_sn_proc.stdout}"
        assert "Contact Type: 'Socket'" in load_sn_proc.stdout, f"Contact Type was not 'Socket': {load_sn_proc.stdout}"
        assert "Socket Contact" in load_sn_proc.stdout, f"Contact Description does not mention Socket: {load_sn_proc.stdout}"
        print("[PASS] SkyCAD Kernel verified STREAM_SUCCESS, LOAD_SUCCESS, Contact Type: 'Socket', and Description for 20FD35SN!")

        # Also test 37-pin Plug Connector (D38999/26...)
        cdp_eval(ws, "document.getElementById('pnDecodeInput').value = '26FD35PN';")
        cdp_eval(ws, "liveDecodePN('26FD35PN');")
        cdp_eval(ws, "applyDecodedPN();")
        time.sleep(1)

        b64_zip_37_plug = cdp_eval(ws, """
            (async () => {
                const pair = currentCalculatedSolutions[0];
                const formatted = SkyCadExporter.formatConnectorData(pair.primary, pair, true);
                const blob = await SkyCadExporter.generatePackageBlob(formatted);
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const b64 = reader.result.split(',')[1];
                        resolve(b64);
                    };
                    reader.readAsDataURL(blob);
                });
            })()
        """)
        zip_bytes_37_plug = base64.b64decode(b64_zip_37_plug)
        out_37_plug_pkg = os.path.join(PROJECT_DIR, "scratch", "browser_exported_26fd35pn_plug.SkyCadPackage")
        with open(out_37_plug_pkg, "wb") as f:
            f.write(zip_bytes_37_plug)

        print("\nVerifying 37-pin Plug package in SkyCAD Kernel...")
        load_plug_cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", "tools/test_package_load.ps1", "-PackagePath", out_37_plug_pkg]
        load_plug_proc = subprocess.run(load_plug_cmd, capture_output=True, text=True)
        print("SkyCAD Kernel Output (Plug):")
        print(load_plug_proc.stdout)
        assert "STREAM_SUCCESS" in load_plug_proc.stdout, f"Kernel stream failure: {load_plug_proc.stdout}"
        assert "LOAD_SUCCESS" in load_plug_proc.stdout, f"Kernel load failure: {load_plug_proc.stdout}"
        assert "Gender: 'Plug'" in load_plug_proc.stdout, f"Kernel Gender was not 'Plug': {load_plug_proc.stdout}"
        print("[PASS] SkyCAD Kernel verified STREAM_SUCCESS, LOAD_SUCCESS, and Gender: 'Plug' for 26FD35PN!")

        print("[PASS] Browser-generated 37-pin primary, socket, and mating package archives validated!")


        print("\n--- Check 4: Live 13-Pin Package Generation via Browser Engine ---")
        cdp_eval(ws, """
            document.getElementById('filterShellType').value = 'ALL';
            document.getElementById('filterFinish').value = 'ALL';
            document.getElementById('filterShellSize').value = 'ALL';
            document.getElementById('filterContactType').value = 'ALL';
            document.getElementById('filterKeying').value = 'ALL';
            populateArrangementDropdown();
        """)
        cdp_eval(ws, "document.querySelector('#groups .val').value = '22D';")
        cdp_eval(ws, "document.querySelector('#groups .qty').value = '13';")
        cdp_eval(ws, "document.getElementById('filterArrangement').value = '11-35';")
        cdp_eval(ws, "calculate();")
        time.sleep(1)

        b64_zip_13 = cdp_eval(ws, """
            (async () => {
                const pair = currentCalculatedSolutions[0];
                const formatted = SkyCadExporter.formatConnectorData(pair.primary, pair, true);
                const blob = await SkyCadExporter.generatePackageBlob(formatted);
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const b64 = reader.result.split(',')[1];
                        resolve(b64);
                    };
                    reader.readAsDataURL(blob);
                });
            })()
        """)
        assert b64_zip_13, "generatePackageBlob returned null for 13-pin connector!"
        zip_bytes_13 = base64.b64decode(b64_zip_13)
        print(f"Generated 13-pin .SkyCadPackage ZIP size: {len(zip_bytes_13):,} bytes")
        out_13_pkg = os.path.join(PROJECT_DIR, "scratch", "browser_exported_13pin.SkyCadPackage")
        with open(out_13_pkg, "wb") as f:
            f.write(zip_bytes_13)

        with zipfile.ZipFile(io.BytesIO(zip_bytes_13), 'r') as zf:
            f13_list = zf.namelist()
            assert any("b35.png" in f.lower() for f in f13_list), "B35 layout image missing from 13-pin package!"

        print("[PASS] Browser-generated 13-pin package archive validated!")

        print("\n--- Check 5: Live 55-Pin Package Generation via Browser Engine ---")
        cdp_eval(ws, """
            document.getElementById('filterShellType').value = 'ALL';
            document.getElementById('filterFinish').value = 'ALL';
            document.getElementById('filterShellSize').value = 'ALL';
            document.getElementById('filterContactType').value = 'ALL';
            document.getElementById('filterKeying').value = 'ALL';
            populateArrangementDropdown();
        """)
        cdp_eval(ws, "document.querySelector('#groups .val').value = '22D';")
        cdp_eval(ws, "document.querySelector('#groups .qty').value = '55';")
        cdp_eval(ws, "document.getElementById('filterArrangement').value = '17-35';")
        cdp_eval(ws, "calculate();")
        time.sleep(1)

        b64_zip_55 = cdp_eval(ws, """
            (async () => {
                const pair = currentCalculatedSolutions[0];
                const formatted = SkyCadExporter.formatConnectorData(pair.primary, pair, true);
                const blob = await SkyCadExporter.generatePackageBlob(formatted);
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const b64 = reader.result.split(',')[1];
                        resolve(b64);
                    };
                    reader.readAsDataURL(blob);
                });
            })()
        """)
        assert b64_zip_55, "generatePackageBlob returned null for 55-pin connector!"
        zip_bytes_55 = base64.b64decode(b64_zip_55)
        print(f"Generated 55-pin .SkyCadPackage ZIP size: {len(zip_bytes_55):,} bytes")
        out_55_pkg = os.path.join(PROJECT_DIR, "scratch", "browser_exported_55pin.SkyCadPackage")
        with open(out_55_pkg, "wb") as f:
            f.write(zip_bytes_55)

        with zipfile.ZipFile(io.BytesIO(zip_bytes_55), 'r') as zf:
            f55_list = zf.namelist()
            assert any("e35.png" in f.lower() for f in f55_list), "E35 layout image missing from 55-pin package!"

        print("[PASS] Browser-generated 55-pin package archive validated!")

        print("\n--- Check 5b: Live 56-Pin Package Generation via Browser Engine (20FJ4SN) ---")
        cdp_eval(ws, """
            document.getElementById('filterShellType').value = 'ALL';
            document.getElementById('filterFinish').value = 'ALL';
            document.getElementById('filterShellSize').value = 'ALL';
            document.getElementById('filterContactType').value = 'ALL';
            document.getElementById('filterKeying').value = 'ALL';
            document.getElementById('pnDecodeInput').value = '20FJ4SN';
            liveDecodePN('20FJ4SN');
            applyDecodedPN();
        """)
        time.sleep(1)

        b64_zip_56 = cdp_eval(ws, """
            (async () => {
                const pair = currentCalculatedSolutions[0];
                const formatted = SkyCadExporter.formatConnectorData(pair.primary, pair, true);
                const blob = await SkyCadExporter.generatePackageBlob(formatted);
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const b64 = reader.result.split(',')[1];
                        resolve(b64);
                    };
                    reader.readAsDataURL(blob);
                });
            })()
        """)
        assert b64_zip_56, "generatePackageBlob returned null for 56-pin connector (20FJ4SN)!"
        zip_bytes_56 = base64.b64decode(b64_zip_56)
        print(f"Generated 56-pin .SkyCadPackage ZIP size: {len(zip_bytes_56):,} bytes")
        out_56_pkg = os.path.join(PROJECT_DIR, "scratch", "browser_exported_20fj4sn_56pin.SkyCadPackage")
        with open(out_56_pkg, "wb") as f:
            f.write(zip_bytes_56)

        with zipfile.ZipFile(io.BytesIO(zip_bytes_56), 'r') as zf:
            f56_list = zf.namelist()
            print("56-pin package contact files:", [f for f in f56_list if "Catalogue/Connector pin" in f])
            assert any("M39029_56-352.SkyCadFile" in f for f in f56_list), "Size 16 socket M39029_56-352 missing from package!"
            assert any("M39029_56-351.SkyCadFile" in f for f in f56_list), "Size 20 socket M39029_56-351 missing from package!"

            # Verify Pin Schedule
            pin_sched_file = next(f for f in f56_list if "Pin_Schedule.txt" in f)
            pin_sched_text = zf.read(pin_sched_file).decode('utf-8')
            assert "Total Contacts: 56" in pin_sched_text
            assert "Pin 1: A (Size #20) (Assigned M39029/56-351)" in pin_sched_text
            # Pins y, z, AA, DD, EE, FF, JJ, LL must be Size #16 (M39029/56-352)
            for p16 in ['y', 'z', 'AA', 'DD', 'EE', 'FF', 'JJ', 'LL']:
                assert f"{p16} (Size #16) (Assigned M39029/56-352)" in pin_sched_text, f"Pin {p16} not assigned size 16 contact in Pin_Schedule!"
            assert pin_sched_text.count("M39029/56-352") == 8, f"Expected 8x M39029/56-352 in Pin_Schedule, got {pin_sched_text.count('M39029/56-352')}"
            assert pin_sched_text.count("M39029/56-351") == 48, f"Expected 48x M39029/56-351 in Pin_Schedule, got {pin_sched_text.count('M39029/56-351')}"

            # Verify Accessories BOM
            bom_file = next(f for f in f56_list if "Accessories_BOM.csv" in f)
            bom_text = zf.read(bom_file).decode('utf-8')
            assert "M39029/56-352" in bom_text and ",8" in bom_text, "Size 16 contact qty 8 missing from Accessories_BOM.csv!"
            assert "M39029/56-351" in bom_text and ",48" in bom_text, "Size 20 contact qty 48 missing from Accessories_BOM.csv!"

        load_56_cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", "tools/test_package_load.ps1", "-PackagePath", out_56_pkg]
        load_56_proc = subprocess.run(load_56_cmd, capture_output=True, text=True)
        print("SkyCAD Kernel Output (56-pin 20FJ4SN):")
        print(load_56_proc.stdout)
        assert "STREAM_SUCCESS" in load_56_proc.stdout, f"Kernel stream failure: {load_56_proc.stdout}"
        assert "LOAD_SUCCESS" in load_56_proc.stdout, f"Kernel load failure: {load_56_proc.stdout}"
        assert "PartNumber: 'D38999/20FJ4SN'" in load_56_proc.stdout, f"PartNumber mismatch: {load_56_proc.stdout}"
        assert "Gender: 'Jack'" in load_56_proc.stdout, f"Gender mismatch: {load_56_proc.stdout}"
        print("[PASS] SkyCAD Kernel verified STREAM_SUCCESS and LOAD_SUCCESS for 56-pin 20FJ4SN!")

        print("\n--- Check 5b-2: Live 56-Pin Plug Package Generation via Browser Engine (26WJ4PN) ---")
        cdp_eval(ws, """
            document.getElementById('pnDecodeInput').value = '26WJ4PN';
            liveDecodePN('26WJ4PN');
            applyDecodedPN();
        """)
        time.sleep(1)

        b64_zip_56p = cdp_eval(ws, """
            (async () => {
                const pair = currentCalculatedSolutions[0];
                const formatted = SkyCadExporter.formatConnectorData(pair.primary, pair, true);
                const blob = await SkyCadExporter.generatePackageBlob(formatted);
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const b64 = reader.result.split(',')[1];
                        resolve(b64);
                    };
                    reader.readAsDataURL(blob);
                });
            })()
        """)
        assert b64_zip_56p, "generatePackageBlob returned null for 26WJ4PN!"
        zip_bytes_56p = base64.b64decode(b64_zip_56p)
        with zipfile.ZipFile(io.BytesIO(zip_bytes_56p), 'r') as zf:
            f56p_list = zf.namelist()
            assert any("M39029_58-364.SkyCadFile" in f for f in f56p_list), "Size 16 pin M39029_58-364 missing from package!"
            assert any("M39029_58-363.SkyCadFile" in f for f in f56p_list), "Size 20 pin M39029_58-363 missing from package!"
            p_sched = zf.read(next(f for f in f56p_list if "Pin_Schedule.txt" in f)).decode('utf-8')
            assert p_sched.count("M39029/58-364") == 8
            assert p_sched.count("M39029/58-363") == 48

        out_56p_pkg = os.path.join(PROJECT_DIR, "scratch", "browser_exported_26wj4pn_56pin.SkyCadPackage")
        with open(out_56p_pkg, "wb") as f:
            f.write(zip_bytes_56p)

        load_56p_cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", "tools/test_package_load.ps1", "-PackagePath", out_56p_pkg]
        load_56p_proc = subprocess.run(load_56p_cmd, capture_output=True, text=True)
        assert "STREAM_SUCCESS" in load_56p_proc.stdout, f"Kernel stream failure: {load_56p_proc.stdout}"
        assert "LOAD_SUCCESS" in load_56p_proc.stdout, f"Kernel load failure: {load_56p_proc.stdout}"
        assert "PartNumber: 'D38999/26WJ4PN'" in load_56p_proc.stdout, f"PartNumber mismatch: {load_56p_proc.stdout}"
        assert "Gender: 'Plug'" in load_56p_proc.stdout, f"Gender mismatch: {load_56p_proc.stdout}"
        print("[PASS] SkyCAD Kernel verified STREAM_SUCCESS and LOAD_SUCCESS for 56-pin Plug 26WJ4PN!")

        print("\n--- Check 5b-3: Live Mixed Contact Verification for 20FD97SN (15-97) ---")
        cdp_eval(ws, """
            document.getElementById('pnDecodeInput').value = '20FD97SN';
            liveDecodePN('20FD97SN');
            applyDecodedPN();
        """)
        time.sleep(1)

        b64_zip_97 = cdp_eval(ws, """
            (async () => {
                const pair = currentCalculatedSolutions[0];
                const formatted = SkyCadExporter.formatConnectorData(pair.primary, pair, true);
                const blob = await SkyCadExporter.generatePackageBlob(formatted);
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const b64 = reader.result.split(',')[1];
                        resolve(b64);
                    };
                    reader.readAsDataURL(blob);
                });
            })()
        """)
        assert b64_zip_97, "generatePackageBlob returned null for 20FD97SN!"
        zip_bytes_97 = base64.b64decode(b64_zip_97)
        with zipfile.ZipFile(io.BytesIO(zip_bytes_97), 'r') as zf:
            f97_list = zf.namelist()
            pin_sched_text = zf.read(next(f for f in f97_list if "Pin_Schedule.txt" in f)).decode('utf-8')
            # Verify MIL-STD-1560 cavity mapping for 15-97:
            # Size 16 (4 contacts): C, G, L, M
            for p16 in ['C', 'G', 'L', 'M']:
                assert f"{p16} (Size #16) (Assigned M39029/56-352)" in pin_sched_text, f"Pin {p16} not assigned size 16 in 15-97!"
            # Size 20 (8 contacts): A, B, D, E, F, H, J, K
            for p20 in ['A', 'B', 'D', 'E', 'F', 'H', 'J', 'K']:
                assert f"{p20} (Size #20) (Assigned M39029/56-351)" in pin_sched_text, f"Pin {p20} not assigned size 20 in 15-97!"
            assert pin_sched_text.count("M39029/56-352") == 4
            assert pin_sched_text.count("M39029/56-351") == 8
        print("[PASS] 20FD97SN verified: C, G, L, M assigned Size 16; A, B, D, E, F, H, J, K assigned Size 20!")

        print("\n--- Check 5b-4: Live Mixed Contact Verification for 20FD15SN (15-15) & 20FE99SN (17-99) ---")
        cdp_eval(ws, """
            document.getElementById('pnDecodeInput').value = '20FD15SN';
            liveDecodePN('20FD15SN');
            applyDecodedPN();
        """)
        time.sleep(1)
        b64_zip_15 = cdp_eval(ws, """
            (async () => {
                const pair = currentCalculatedSolutions[0];
                const formatted = SkyCadExporter.formatConnectorData(pair.primary, pair, true);
                const blob = await SkyCadExporter.generatePackageBlob(formatted);
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const b64 = reader.result.split(',')[1];
                        resolve(b64);
                    };
                    reader.readAsDataURL(blob);
                });
            })()
        """)
        zip_bytes_15 = base64.b64decode(b64_zip_15)
        with zipfile.ZipFile(io.BytesIO(zip_bytes_15), 'r') as zf:
            f15_list = zf.namelist()
            sched_15 = zf.read(next(f for f in f15_list if "Pin_Schedule.txt" in f)).decode('utf-8')
            assert "P (Size #16) (Assigned M39029/56-352)" in sched_15, "Pin P not assigned size 16 in 15-15!"
            assert sched_15.count("M39029/56-352") == 1
            assert sched_15.count("M39029/56-351") == 14
        print("[PASS] 20FD15SN verified: Pin P assigned Size 16, remaining 14 assigned Size 20!")

        cdp_eval(ws, """
            document.getElementById('pnDecodeInput').value = '20FE99SN';
            liveDecodePN('20FE99SN');
            applyDecodedPN();
        """)
        time.sleep(1)
        b64_zip_99 = cdp_eval(ws, """
            (async () => {
                const pair = currentCalculatedSolutions[0];
                const formatted = SkyCadExporter.formatConnectorData(pair.primary, pair, true);
                const blob = await SkyCadExporter.generatePackageBlob(formatted);
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const b64 = reader.result.split(',')[1];
                        resolve(b64);
                    };
                    reader.readAsDataURL(blob);
                });
            })()
        """)
        zip_bytes_99 = base64.b64decode(b64_zip_99)
        with zipfile.ZipFile(io.BytesIO(zip_bytes_99), 'r') as zf:
            f99_list = zf.namelist()
            sched_99 = zf.read(next(f for f in f99_list if "Pin_Schedule.txt" in f)).decode('utf-8')
            for p16 in ['W', 'Z']:
                assert f"{p16} (Size #16) (Assigned M39029/56-352)" in sched_99, f"Pin {p16} not assigned size 16 in 17-99!"
            assert sched_99.count("M39029/56-352") == 2
            assert sched_99.count("M39029/56-351") == 21
        print("[PASS] 20FE99SN verified: Pins W, Z assigned Size 16, remaining 21 assigned Size 20!")

        print("\n--- Check 5c: Live 128-Pin Package Generation via Browser Engine (20FJ35SN) ---")
        cdp_eval(ws, """
            document.getElementById('filterShellType').value = 'ALL';
            document.getElementById('filterFinish').value = 'ALL';
            document.getElementById('filterShellSize').value = 'ALL';
            document.getElementById('filterContactType').value = 'ALL';
            document.getElementById('filterKeying').value = 'ALL';
            document.getElementById('pnDecodeInput').value = '20FJ35SN';
            liveDecodePN('20FJ35SN');
            applyDecodedPN();
        """)
        time.sleep(1)

        b64_zip_128 = cdp_eval(ws, """
            (async () => {
                const pair = currentCalculatedSolutions[0];
                const formatted = SkyCadExporter.formatConnectorData(pair.primary, pair, true);
                const blob = await SkyCadExporter.generatePackageBlob(formatted);
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const b64 = reader.result.split(',')[1];
                        resolve(b64);
                    };
                    reader.readAsDataURL(blob);
                });
            })()
        """)
        assert b64_zip_128, "generatePackageBlob returned null for 128-pin connector (20FJ35SN)!"
        zip_bytes_128 = base64.b64decode(b64_zip_128)
        print(f"Generated 128-pin .SkyCadPackage ZIP size: {len(zip_bytes_128):,} bytes")
        out_128_pkg = os.path.join(PROJECT_DIR, "scratch", "browser_exported_20fj35sn_128pin.SkyCadPackage")
        with open(out_128_pkg, "wb") as f:
            f.write(zip_bytes_128)

        load_128_cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", "tools/test_package_load.ps1", "-PackagePath", out_128_pkg]
        load_128_proc = subprocess.run(load_128_cmd, capture_output=True, text=True)
        print("SkyCAD Kernel Output (128-pin 20FJ35SN):")
        print(load_128_proc.stdout)
        assert "STREAM_SUCCESS" in load_128_proc.stdout, f"Kernel stream failure: {load_128_proc.stdout}"
        assert "LOAD_SUCCESS" in load_128_proc.stdout, f"Kernel load failure: {load_128_proc.stdout}"
        assert "PartNumber: 'D38999/20FJ35SN'" in load_128_proc.stdout, f"PartNumber mismatch: {load_128_proc.stdout}"
        assert "Gender: 'Jack'" in load_128_proc.stdout, f"Gender mismatch: {load_128_proc.stdout}"
        print("[PASS] SkyCAD Kernel verified STREAM_SUCCESS and LOAD_SUCCESS for 128-pin 20FJ35SN!")

        print("\n--- Check 6: BOM Integration Verification ---")
        add_res = cdp_eval(ws, "addSolutionPairToActiveList(0);")
        time.sleep(0.5)
        bom_btn = cdp_eval(ws, "document.querySelector('button[onclick*=\"exportToSkyCAD()\"]')?.textContent")
        print(f"BOM SkyCAD Export Button: {bom_btn}")
        assert bom_btn and ".SkyCadPackage" in bom_btn, f"BOM export button missing or mismatch: {bom_btn}"
        print("[PASS] Active list BOM updated and BOM export button verified.")

        check_messages()
        print("\n--- Console Error Check ---")
        print(f"Console errors detected: {len(console_errors)}")
        if console_errors:
            for err in console_errors:
                print(f"  [ERROR] {err}")
            assert False, "Console runtime errors occurred during browser session!"
        print("[PASS] ZERO console runtime errors detected!")

        print("\n==================================================")
        print("ALL LIVE BROWSER CHECKS & RULE 4 CRITERIA PASSED!")
        print("==================================================")

    finally:
        if ws:
            ws.close()
        edge_proc.terminate()
        edge_proc.wait(timeout=5)
        httpd.shutdown()

if __name__ == "__main__":
    main()

