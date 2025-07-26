from flask import Flask, request, jsonify
from flask_cors import CORS
import socket
import threading
import time, os
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import uuid

app = Flask(__name__)
CORS(app)

scan_cancellations = {}

# -------- Service & Banner Helpers --------
def get_service(port, protocol):
    try:
        return socket.getservbyport(port, protocol.lower())
    except Exception:
        return ""

def grab_banner(target, port):
    try:
        s = socket.socket()
        s.settimeout(1)
        s.connect((target, port))
        banner = s.recv(1024)
        s.close()
        return banner.decode(errors="ignore").strip()
    except Exception:
        return ""

# -------- Port Scanner Function --------
def scan_port(target, port, timeout, results, logs, protocol="TCP"):
    start = time.time()
    try:
        if protocol == "TCP":
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(timeout)
        elif protocol == "UDP":
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            # Use a lower timeout for UDP (e.g., 0.3s)
            s.settimeout(min(timeout, 0.3))
        else:
            logs.append(("ERROR", port, f"Unsupported protocol: {protocol}"))
            results.append({
                "port": port,
                "status": "error",
                "latency": None,
                "protocol": protocol,
                "detectionMethod": "TCP Connect" if protocol == "TCP" else "UDP Send",
                "service": "",
                "banner": "",
                "ttl": None
            })
            return

        s.settimeout(timeout)
        if protocol == "TCP":
            result = s.connect_ex((target, port))
            latency = round((time.time() - start) * 1000, 2)
            if result == 0:
                service = get_service(port, "tcp")
                banner = grab_banner(target, port)
                logs.append(("OK", port, f"Port {port}/TCP is open. ({latency} ms)"))
                results.append({
                    "port": port,
                    "status": "open",
                    "latency": latency,
                    "protocol": "TCP",
                    "detectionMethod": "TCP Connect",
                    "service": service,
                    "banner": banner,
                    "ttl": None
                })
            else:
                logs.append(("INFO", port, f"Port {port}/TCP is closed. ({latency} ms)"))
                results.append({
                    "port": port,
                    "status": "closed",
                    "latency": latency,
                    "protocol": "TCP",
                    "detectionMethod": "TCP Connect",
                    "service": "",
                    "banner": "",
                    "ttl": None
                })
        elif protocol == "UDP":
            s.sendto(b"", (target, port))
            try:
                s.recvfrom(1024)
                status = "open"
            except socket.timeout:
                status = "filtered"
            latency = round((time.time() - start) * 1000, 2)
            logs.append(("INFO", port, f"Port {port}/UDP is {status}. ({latency} ms)"))
            results.append({
                "port": port,
                "status": status,
                "latency": latency,
                "protocol": "UDP",
                "detectionMethod": "UDP Send",
                "service": "",
                "banner": "",
                "ttl": None
            })
    except Exception as e:
        logs.append(("ERROR", port, f"Error scanning port {port}: {str(e)}"))
        results.append({
            "port": port,
            "status": "error",
            "latency": None,
            "protocol": protocol,
            "detectionMethod": "TCP Connect" if protocol == "TCP" else "UDP Send",
            "service": "",
            "banner": "",
            "ttl": None
        })
    finally:
        try:
            s.close()
        except:
            pass

# -------- Scan Endpoint --------
@app.route("/api/scan", methods=["POST"])
def api_scan():
    data = request.get_json()
    scan_id = data.get("scanId") or str(uuid.uuid4())
    scan_cancellations[scan_id] = False

    target = data.get("target")
    port_range = data.get("portRange", "")
    protocol = data.get("protocol", "TCP")
    timeout = float(data.get("timeout", 1))
    threads = int(data.get("threads", 50))
    scan_type = data.get("scanType", "Quick")
    aggressive_mode = data.get("aggressiveMode", False)
    verbose_level = data.get("verboseLevel", "Normal")

    # Log scan options
    logs = []
    logs.append(("INFO", 0, f"Scan type: {scan_type}"))
    logs.append(("INFO", 0, f"Aggressive mode: {'ON' if aggressive_mode else 'OFF'}"))
    logs.append(("INFO", 0, f"Verbose level: {verbose_level}"))

    # Handle scan type logic
    if scan_type == "Quick":
        # Use default/common ports if not specified
        if not port_range:
            port_range = "21,22,23,25,53,80,110,139,143,443,993,995,3389,5432,3306"
    elif scan_type == "Full":
        port_range = "1-65535"
    elif scan_type == "Stealth":
        logs.append(("WARN", 0, "Stealth scan requested, but only TCP connect scan is supported in this backend."))
        # You could return a 501 Not Implemented here if you want to block it:
        # return jsonify({"error": "Stealth scan not implemented in backend."}), 501
    elif scan_type == "Custom":
        # Use provided port_range and protocol
        pass

    # Parse port_range string to list of ints
    ports = []
    for part in str(port_range).split(","):
        part = part.strip()
        if "-" in part:
            start, end = part.split("-")
            ports.extend(range(int(start), int(end) + 1))
        elif part.isdigit():
            ports.append(int(part))

    results = []

    try:
        socket.gethostbyname(target)
    except socket.gaierror:
        return jsonify({"error": f"Could not resolve host: {target}"}), 400

    def worker(p):
        if scan_cancellations.get(scan_id):
            return  # Stop scanning if cancelled
        scan_port(target, p, timeout, results, logs, protocol)

    start_time = time.time()
    with ThreadPoolExecutor(max_workers=threads) as executor:
        futures = [executor.submit(worker, port) for port in ports]
        for _ in as_completed(futures):
            if scan_cancellations.get(scan_id):
                logs.append(("WARN", 0, "Scan cancelled by user."))
                break

    duration = round(time.time() - start_time, 2)

    # Clean up
    scan_cancellations.pop(scan_id, None)

    # Sort results and logs by port
    sorted_results = sorted(results, key=lambda x: x['port'])
    sorted_logs = sorted([
        {
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "level": lvl,
            "port": port,
            "message": msg
        }
        for lvl, port, msg in logs
    ], key=lambda x: x['port'])

    return jsonify({
        "results": sorted_results,
        "logs": sorted_logs,
        "summary": {
            "target": target,
            "duration": duration,
            "openPorts": sum(1 for r in results if r["status"] == "open"),
            "portsScanned": len(ports),
            "scanType": scan_type,
            "aggressiveMode": aggressive_mode,
            "verboseLevel": verbose_level
        }
    })

@app.route("/api/scan/cancel", methods=["POST"])
def cancel_scan():
    data = request.get_json()
    scan_id = data.get("scanId")
    scan_cancellations[scan_id] = True
    return jsonify({"status": "cancelled"})

# -------- Main --------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  
    app.run(host="0.0.0.0", port=port)