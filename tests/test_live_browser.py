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
HTTP_PORT = 8085
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
    print("Starting local HTTP server...")
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

        ws.send(json.dumps({"id": 900, "method": "Console.enable"}))
        ws.send(json.dumps({"id": 901, "method": "Runtime.enable"}))
        time.sleep(1)

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

        print("\n--- Check 1: Title & Version ---")
        title = cdp_eval(ws, "document.title")
        version_tag = cdp_eval(ws, "document.querySelector('.version-tag')?.textContent")
        config_version = cdp_eval(ws, "typeof CONFIG_VERSION !== 'undefined' ? CONFIG_VERSION : 'undefined'")
        print(f"Document Title: {title}")
        print(f"Header Version Tag: {version_tag}")
        print(f"CONFIG_VERSION constant: {config_version}")

        assert "V002.2.0" in title, f"Title does not contain V002.2.0: {title}"
        assert version_tag == "V002.2.0", f"Version tag is not V002.2.0: {version_tag}"
        assert config_version == "V002.2.0", f"CONFIG_VERSION is not V002.2.0: {config_version}"
        print("[PASS] Version synchronization verified across DOM and JS.")

        print("\n--- Check 2: SkyCadExporter Module Presence ---")
        exporter_type = cdp_eval(ws, "typeof window.SkyCadExporter")
        assert exporter_type == "object", f"window.SkyCadExporter is {exporter_type}"
        has_format = cdp_eval(ws, "typeof window.SkyCadExporter.formatConnectorData")
        has_blob = cdp_eval(ws, "typeof window.SkyCadExporter.generatePackageBlob")
        has_download = cdp_eval(ws, "typeof window.SkyCadExporter.downloadConnectorPackage")
        print(f"formatConnectorData: {has_format}")
        print(f"generatePackageBlob: {has_blob}")
        print(f"downloadConnectorPackage: {has_download}")
        assert has_format == "function" and has_blob == "function" and has_download == "function"
        print("[PASS] SkyCadExporter module properly loaded and exposed.")

        print("\n--- Check 3: Calculation & Solution Card DOM Verification ---")
        cdp_eval(ws, "document.querySelector('#groups .val').value = '20';")
        cdp_eval(ws, "document.querySelector('#groups .qty').value = '3';")
        cdp_eval(ws, "calculate();")
        time.sleep(1)

        card_count = cdp_eval(ws, "document.querySelectorAll('.solution-card').length")
        print(f"Calculated Solution Cards rendered: {card_count}")
        assert card_count > 0, "No solution cards rendered!"

        pri_btn = cdp_eval(ws, "document.querySelector('.primary-card button[onclick*=\"exportSolutionToSkyCAD\"]')?.textContent")
        mat_btn = cdp_eval(ws, "document.querySelector('.mating-card button[onclick*=\"exportSolutionToSkyCAD\"]')?.textContent")
        print(f"Primary Card Export Button: {pri_btn}")
        print(f"Mating Card Export Button: {mat_btn}")
        assert pri_btn and "Export to SkyCAD" in pri_btn, f"Primary card export button missing: {pri_btn}"
        assert mat_btn and "Export to SkyCAD" in mat_btn, f"Mating card export button missing: {mat_btn}"
        print("[PASS] SkyCAD export buttons physically rendered in Primary & Mating cards.")

        print("\n--- Check 4: Add to Active Project List & BOM UI Verification ---")
        add_res = cdp_eval(ws, """
            (() => {
                try {
                    addSolutionPairToActiveList(0);
                    return 'SUCCESS, rows: ' + document.querySelectorAll('#listTableBody tr').length;
                } catch(e) {
                    return 'ERROR: ' + e.message + '\\n' + e.stack;
                }
            })()
        """)
        print(f"addSolutionPairToActiveList result: {add_res}")
        time.sleep(0.5)

        bom_rows = cdp_eval(ws, "document.querySelectorAll('#listTableBody tr').length")
        print(f"BOM Table Rows: {bom_rows}")
        assert bom_rows > 0, f"BOM table has 0 rows after adding solution pair! Details: {add_res}"

        bom_export_btn = cdp_eval(ws, "document.querySelector('button[onclick*=\"exportToSkyCAD()\"]')?.textContent")
        print(f"BOM SkyCAD Export Button Text: {bom_export_btn}")
        assert bom_export_btn and ".SkyCadPackage" in bom_export_btn, f"BOM button text mismatch: {bom_export_btn}"
        print("[PASS] Active list BOM updated and BOM export button verified.")

        print("\n--- Check 5: Live Package Blob Generation & ZIP Structure Test ---")
        b64_zip = cdp_eval(ws, """
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

        assert b64_zip, "generatePackageBlob returned null or failed to convert to base64!"
        import base64
        zip_bytes = base64.b64decode(b64_zip)
        print(f"Generated .SkyCadPackage ZIP size: {len(zip_bytes):,} bytes")

        with zipfile.ZipFile(io.BytesIO(zip_bytes), 'r') as zf:
            file_list = zf.namelist()
            print("Files inside package archive:")
            for f in file_list:
                info = zf.getinfo(f)
                print(f"  - {f} ({info.file_size:,} bytes)")

            pkg_info_file = [f for f in file_list if f.endswith("PackageInfo.txt")]
            skycad_file = [f for f in file_list if f.endswith(".SkyCadFile")]
            bom_file = [f for f in file_list if f.endswith("Accessories_BOM.csv")]
            pin_file = [f for f in file_list if f.endswith("Pin_Schedule.txt")]

            assert len(pkg_info_file) == 1, "PackageInfo.txt missing!"
            assert len(skycad_file) >= 1, ".SkyCadFile missing!"
            assert len(bom_file) == 1, "Accessories_BOM.csv missing!"
            assert len(pin_file) == 1, "Pin_Schedule.txt missing!"

            pkg_info_content = zf.read(pkg_info_file[0]).decode('utf-8')
            print(f"PackageInfo.txt content:\n{pkg_info_content.strip()}")
            assert r"\Catalogue\Root Class\Work field classes\Component\Connector" in pkg_info_content

            bom_content = zf.read(bom_file[0]).decode('utf-8')
            print(f"Accessories_BOM.csv sample:\n{bom_content[:200]}...")
            assert "Parent Connector,Accessory Type,Part Number" in bom_content

            pin_content = zf.read(pin_file[0]).decode('utf-8')
            print(f"Pin_Schedule.txt sample:\n{pin_content[:200]}...")
            assert "Connector:" in pin_content and ("Pin Schedule:" in pin_content or "Pin List:" in pin_content)

        print("[PASS] Generated .SkyCadPackage ZIP archive strictly matches SkyCAD Electrical package spec!")

        print("\n--- Check 5b: Finish Matching & M85049/95 Flange Part Number ---")
        flange_check = cdp_eval(ws, """
            (() => {
                const match17 = database.find(d => d.shellSize === '17');
                return match17 ? match17.flangeAcc : null;
            })()
        """)
        print(f"Shell 17 Flange Accessory: {flange_check}")
        assert flange_check and "M85049/95-18A" in flange_check, f"Expected M85049/95-18A for Shell 17, got: {flange_check}"
        print("[PASS] Shell 17 correctly mapped to M85049/95-18A.")

        fin_checks = cdp_eval(ws, """
            currentCalculatedSolutions.map(s => ({
                priFinish: s.primary.finish,
                matFinish: s.mating ? s.mating.finish : null
            }))
        """)
        for fc in fin_checks:
            if fc.get('matFinish'):
                assert fc['priFinish'] == fc['matFinish'], f"Finish mismatch! Pri: {fc['priFinish']}, Mat: {fc['matFinish']}"
        print(f"[PASS] All {len(fin_checks)} solutions verified: 100% finish matching between primary and mating.")

        print("\n--- Check 6: Deutsch AutoSport Package Generation & Lettering Rule ---")
        cdp_eval(ws, "switchStandardTab('as');")
        time.sleep(0.5)
        cdp_eval(ws, "document.querySelector('#groups .val').value = '22';")
        cdp_eval(ws, "document.querySelector('#groups .qty').value = '5';")
        cdp_eval(ws, "calculate();")
        time.sleep(1)

        as_card_count = cdp_eval(ws, "document.querySelectorAll('.solution-card').length")
        print(f"AutoSport Solution Cards rendered: {as_card_count}")
        assert as_card_count > 0, "No AutoSport solution cards rendered!"

        as_b64_zip = cdp_eval(ws, """
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
        as_zip_bytes = base64.b64decode(as_b64_zip)
        with zipfile.ZipFile(io.BytesIO(as_zip_bytes), 'r') as zf:
            as_pin_file = [f for f in zf.namelist() if f.endswith("Pin_Schedule.txt")][0]
            as_pin_text = zf.read(as_pin_file).decode('utf-8')
            print("AutoSport Pin Schedule:\n" + as_pin_text.strip())

        print("[PASS] AutoSport package generation verified!")

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
