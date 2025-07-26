import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Menu, 
  X,
} from "lucide-react";


interface ScanResult {
  port: number;
  service: string;
  status: "open" | "closed" | "filtered";
  latency: number;
  protocol: "TCP" | "UDP";
  ttl?: number;
  banner?: string;
  detectionMethod: string;
}

interface ScanConfig {
  target: string;
  portRange: string;
  portPreset: "manual" | "common" | "full" | "web" | "iot";
  protocol: "TCP" | "UDP" | "Both";
  scanType: "Quick" | "Full" | "Stealth" | "Custom" | "UDP";
  verboseLevel: "None" | "Verbose" | "Very Verbose" | "Debug";
  timeout: number;
  threads: number;
  delay: number;
  aggressiveMode: boolean;
  osDetection: boolean;
  versionDetection: boolean;
  dnsResolution: boolean;
  traceroute: boolean;
  scanSpeed: "Slow" | "Medium" | "Fast";
}

interface LogEntry {
  timestamp: string;
  level: "INFO" | "OK" | "WARN" | "BANNER" | "DEBUG" | "ERROR";
  message: string;
}

interface ScanSummary {
  target: string;
  scanType: string;
  portsScanned: string;
  openPorts: number;
  duration: number;
  verboseLevel: string;
}

export default function Scanner() {
  const [config, setConfig] = useState<ScanConfig>({
    target: "",
    portRange: "1-1000",
    portPreset: "common",
    protocol: "TCP",
    scanType: "Quick",
    verboseLevel: "Verbose",
    timeout: 1000,
    threads: 50,
    delay: 0,
    aggressiveMode: false,
    osDetection: false,
    versionDetection: false,
    dnsResolution: true,
    traceroute: false,
    scanSpeed: "Medium"
  });

  const [isScanning, setIsScanning] = useState(false);
  const [cancelScan, setCancelScan] = useState(false); // NEW
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<LogEntry[]>([]);
  const [scanSummary, setScanSummary] = useState<ScanSummary | null>(null);
  const [scanStartTime, setScanStartTime] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [expandedPanels, setExpandedPanels] = useState({
    target: true,
    scan: true,
    advanced: false
  });

  const [filters, setFilters] = useState({
    openPorts: true,
    closedPorts: true,
    filteredPorts: true,
    tcpOnly: false,
    udpOnly: false,
    showBanner: true,
    showDebugLogs: true
  });

  const [sortConfig, setSortConfig] = useState({ key: 'port', direction: 'asc' });

  const scanTypeDescriptions = {
    "Quick": "Scans most common 1000 ports using SYN or TCP Connect",
    "Full": "Scans all 65535 ports on a given target",
    "Stealth": "Uses SYN scan with no full TCP handshake",
    "Custom": "Full user control (ports, method, delay, verbose, etc.)",
    "UDP": "Scans UDP ports (slower, fewer responses, more guesswork)"
  };

  const portPresets = {
    manual: "",
    common: "21,22,23,25,53,80,110,139,143,443,993,995,3389,5432,3306",
    full: "1-65535",
    web: "80,443,8080,8443,8000,8888,9000,3000,5000",
    iot: "23,80,81,443,554,7547,8080,8081,8443,9000"
  };

  const addConsoleLog = (level: LogEntry["level"], message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [...prev, { timestamp, level, message }]);
  };

  const getLogColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "INFO": return "text-muted-foreground";
      case "OK": return "text-neon-green";
      case "WARN": return "text-yellow-400";
      case "BANNER": return "text-neon-cyan";
      case "DEBUG": return "text-neon-blue";
      case "ERROR": return "text-destructive";
      default: return "text-foreground";
    }
  };

  const simulateScan = async () => {
    setIsScanning(true);
    setCancelScan(false); // Reset cancel flag
    setScanResults([]);
    setConsoleLogs([]);
    setScanSummary(null);
    setScanStartTime(Date.now());

    const currentPortRange = config.portPreset === "manual" ? config.portRange : portPresets[config.portPreset];

    addConsoleLog("INFO", `Starting ${config.scanType} scan on ${config.target}`);
    addConsoleLog("INFO", `Port range: ${currentPortRange}`);
    addConsoleLog("INFO", `Protocol: ${config.protocol}`);
    addConsoleLog("INFO", `Threads: ${config.threads}, Timeout: ${config.timeout}ms`);
    addConsoleLog("INFO", `Verbose Level: ${config.verboseLevel}`);

    if (config.aggressiveMode) {
      addConsoleLog("INFO", "Aggressive mode enabled - OS detection, version detection active");
    }

    try {
      // Prepare scan parameters for the backend
      const scanParams = {
        target: config.target,
        portRange: currentPortRange,
        protocol: config.protocol,
        scanType: config.scanType,
        verboseLevel: config.verboseLevel,
        timeout: config.timeout,
        threads: config.threads,
        delay: config.delay,
        aggressiveMode: config.aggressiveMode,
        osDetection: config.osDetection,
        versionDetection: config.versionDetection,
        dnsResolution: config.dnsResolution,
        traceroute: config.traceroute,
        scanSpeed: config.scanSpeed
      };

      addConsoleLog("INFO", "Sending scan request to backend...");

      // Make API call to backend
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...scanParams, cancelScan }), 
        signal: (window as any).scanAbortController?.signal 
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      addConsoleLog("INFO", "Received response from backend");

      // Process the backend response
      if (data.logs) {
        data.logs.forEach((log: any) => {
          addConsoleLog(log.level || "INFO", log.message);
        });
      }

      if (data.results) {
        // Convert backend results to our format
        const results: ScanResult[] = data.results.map((result: any) => ({
          port: result.port,
          service: result.service || "Unknown",
          status: result.status,
          latency: result.latency || 0,
          protocol: result.protocol || config.protocol,
          ttl: result.ttl,
          banner: result.banner,
          detectionMethod: result.detectionMethod || (config.scanType === "Stealth" ? "SYN" : "TCP Connect")
        }));

        setScanResults(results);

        // Count open ports
        const openCount = results.filter(r => r.status === "open").length;

        const duration = (Date.now() - scanStartTime) / 1000;
        addConsoleLog("INFO", "Scan completed!");

        setScanSummary({
          target: config.target,
          scanType: config.scanType,
          portsScanned: currentPortRange,
          openPorts: openCount,
          duration,
          verboseLevel: config.verboseLevel
        });
      }

    } catch (error) {
      addConsoleLog("ERROR", `Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const filteredResults = scanResults.filter(result => {
    if (!filters.openPorts && result.status === "open") return false;
    if (!filters.closedPorts && result.status === "closed") return false;
    if (!filters.filteredPorts && result.status === "filtered") return false;
    if (filters.tcpOnly && result.protocol !== "TCP") return false;
    if (filters.udpOnly && result.protocol !== "UDP") return false;
    return true;
  });

  const filteredLogs = consoleLogs.filter(log => {
    if (!filters.showDebugLogs && log.level === "DEBUG") return false;
    return true;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    const aVal = a[sortConfig.key as keyof ScanResult];
    const bVal = b[sortConfig.key as keyof ScanResult];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const togglePanel = (panel: keyof typeof expandedPanels) => {
    setExpandedPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  };

  const handlePortPresetChange = (preset: typeof config.portPreset) => {
    setConfig(prev => ({
      ...prev,
      portPreset: preset,
      portRange: preset === "manual" ? prev.portRange : portPresets[preset]
    }));
  };

  // Add this function to stop scan
  const handleStopScan = () => {
    setCancelScan(true);
    setIsScanning(false);
    // Optionally abort fetch (modern browsers)
    if ((window as any).scanAbortController) {
      (window as any).scanAbortController.abort();
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Scan Results for ${config.target}`, 14, 18);

    // Prepare table columns and rows
    const columns = [
      { header: "Port", dataKey: "port" },
      { header: "Service", dataKey: "service" },
      { header: "Status", dataKey: "status" },
      { header: "Protocol", dataKey: "protocol" },
      { header: "Latency (ms)", dataKey: "latency" },
      { header: "TTL", dataKey: "ttl" },
      { header: "Detection", dataKey: "detectionMethod" },
      { header: "Banner", dataKey: "banner" }
    ];

    const rows = scanResults.map(r => ({
      port: r.port,
      service: r.service,
      status: r.status,
      protocol: r.protocol,
      latency: r.latency,
      ttl: r.ttl ?? "-",
      detectionMethod: r.detectionMethod,
      banner: r.banner || "-"
    }));

    autoTable(doc, {
      startY: 24,
      head: [columns.map(col => col.header)],
      body: rows.map(row => columns.map(col => row[col.dataKey])),
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [0, 188, 212] }, // neon-cyan
      alternateRowStyles: { fillColor: [240, 248, 255] }
    });

    doc.save(`scan-results-${config.target}.pdf`);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scanResults, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `scan-results-${config.target || "export"}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportCSV = () => {
    if (scanResults.length === 0) return;
    const header = Object.keys(scanResults[0]).join(",");
    const rows = scanResults.map(r => Object.values(r).map(v => `"${v ?? ''}"`).join(","));
    const csvContent = [header, ...rows].join("\n");
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `scan-results-${config.target || "export"}.csv`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  useEffect(() => {
    if (config.protocol === "UDP" && config.timeout > 500) {
      setConfig(prev => ({ ...prev, timeout: 300 }));
      addConsoleLog("INFO", "Timeout automatically set to 300ms for UDP scans for faster results.");
    }
    if (config.protocol === "TCP" && config.timeout < 500) {
      setConfig(prev => ({ ...prev, timeout: 1000 }));
      addConsoleLog("INFO", "Timeout automatically set to 1000ms for TCP scans for better accuracy.");
    }
  }, [config.protocol]);

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Matrix background animation */}
      <div className="absolute inset-0 matrix-bg opacity-10"></div>

      {/* Animated circuit lines */}
      <div className="absolute inset-0">
        <svg className="w-full h-full opacity-20" viewBox="0 0 1200 800">
          <motion.path
            d="M0,200 L300,200 L300,400 L600,400 L600,100 L1200,100"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="text-neon-blue"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.path
            d="M0,600 L400,600 L400,300 L800,300 L800,700 L1200,700"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="text-neon-green"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, delay: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.path
            d="M0,400 L200,400 L200,150 L500,150 L500,600 L900,600 L900,200 L1200,200"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="text-neon-magenta"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 5, delay: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          />
        </svg>
      </div>

      {/* Floating data particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-neon-cyan/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Scanning radar effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 border border-neon-green/20 rounded-full"
          style={{ transform: 'translate(-50%, -50%)' }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 border border-neon-magenta/20 rounded-full"
          style={{ transform: 'translate(-50%, -50%)' }}
          animate={{
            scale: [1, 3, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeOut",
            delay: 2
          }}
        />
      </div>

      {/* Data stream lines */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`stream-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-neon-blue/40 to-transparent"
            style={{
              width: '200px',
              left: `${Math.random() * 100}%`,
              top: `${20 + i * 15}%`,
            }}
            animate={{
              x: [-200, window.innerWidth + 200],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <header className="border-b border-border/50 bg-card/20 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <svg width="32" height="32" viewBox="0 0 32 32" className="text-neon-cyan">
                  <motion.circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  />
                  <motion.path
                    d="M8 16 L16 8 L24 16 L16 24 Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="currentColor"
                    fillOpacity="0.2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  />
                  <motion.circle
                    cx="16"
                    cy="16"
                    r="3"
                    fill="currentColor"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </svg>
              </motion.div>
              <motion.span
                className="text-2xl font-bold text-neon-blue neon-text"
                animate={{
                  textShadow: [
                    "0 0 5px currentColor",
                    "0 0 20px currentColor, 0 0 30px currentColor",
                    "0 0 5px currentColor"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{
                  scale: 1.05,
                  textShadow: "0 0 25px currentColor, 0 0 35px currentColor"
                }}
              >
                Pentrax
              </motion.span>
            </Link>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6">
              <Link to="/about" className="text-sm hover:text-cyan-400 transition-colors">
                About
              </Link>
              <Link to="/privacy" className="text-sm hover:text-green-400 transition-colors">
                Privacy
              </Link>
              <Link to="/legal" className="text-sm hover:text-purple-400 transition-colors">
                Legal
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pt-4 border-t border-slate-700/50"
              >
                <div className="flex flex-col gap-4">
                  <Link 
                    to="/about" 
                    className="text-sm hover:text-cyan-400 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link 
                    to="/privacy" 
                    className="text-sm hover:text-green-400 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Privacy
                  </Link>
                  <Link 
                    to="/legal" 
                    className="text-sm hover:text-purple-400 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Legal
                  </Link>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="space-y-8">
          {/* Configuration Panel */}
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Scan Configuration Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-neon-blue mb-2">Scan Configuration</h2>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent mx-auto"></div>
            </div>

            {/* Target & Ports Module */}
            <motion.div className="glass-panel rounded-lg overflow-hidden border-2 border-neon-green/30 shadow-[0_0_15px_rgba(0,255,127,0.3)]">
              <div className="p-4 border-b-2 border-neon-green/40 bg-neon-green/5">
                <h3 className="text-lg font-semibold text-neon-green">Target & Ports</h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Target</label>
                      <input
                        type="text"
                        placeholder="192.168.1.1 or scan.example.com"
                        value={config.target}
                        onChange={(e) => setConfig(prev => ({ ...prev, target: e.target.value }))}
                        className="w-full p-3 bg-background border-2 border-neon-blue/40 rounded-lg focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/50 shadow-[0_0_5px_rgba(0,150,255,0.3)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Protocol</label>
                      <div className="flex gap-2">
                        {["TCP", "UDP"].map(protocol => (
                          <button
                            key={protocol}
                            onClick={() => setConfig(prev => ({ ...prev, protocol: protocol as any }))}
                            className={`px-4 py-2 rounded-lg border transition-all ${config.protocol === protocol
                              ? "border-neon-magenta bg-neon-magenta/20 text-neon-magenta"
                              : "border-border hover:border-neon-magenta/50"
                              }`}
                          >
                            {protocol}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Port Selection</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
                      {[
                        { key: "manual", label: "Manual" },
                        { key: "common", label: "Common" },
                        { key: "full", label: "Full" },
                        { key: "web", label: "Web Services" },
                        { key: "iot", label: "IoT Devices" }
                      ].map(preset => (
                        <button
                          key={preset.key}
                          onClick={() => handlePortPresetChange(preset.key as any)}
                          className={`px-3 py-2 rounded-lg border text-sm transition-all ${config.portPreset === preset.key
                            ? "border-neon-green bg-neon-green/20 text-neon-green"
                            : "border-border hover:border-neon-green/50"
                            }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {config.portPreset === "manual" && (
                      <input
                        type="text"
                        placeholder="1-1000 or 21,22,80-100,443"
                        value={config.portRange}
                        onChange={(e) => setConfig(prev => ({ ...prev, portRange: e.target.value }))}
                        className="w-full p-3 bg-background border-2 border-neon-green/40 rounded-lg focus:border-neon-green focus:ring-2 focus:ring-neon-green/50 shadow-[0_0_5px_rgba(0,255,127,0.3)]"
                      />
                    )}

                    {config.portPreset !== "manual" && (
                      <div className="p-3 bg-accent/10 rounded-lg border border-border/30">
                        <code className="text-sm font-mono text-neon-green break-all">
                          {portPresets[config.portPreset]}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Scan Type & Settings Module */}
            <motion.div className="glass-panel rounded-lg overflow-hidden border-2 border-neon-cyan/30 shadow-[0_0_15px_rgba(0,188,212,0.3)]">
              <div className="p-4 border-b-2 border-neon-cyan/40 bg-neon-cyan/5">
                <h3 className="text-lg font-semibold text-neon-cyan">Scan Type & Settings</h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Scan Type</label>
                      <div className="space-y-2">
                        {(Object.keys(scanTypeDescriptions) as Array<keyof typeof scanTypeDescriptions>).map(type => (
                          <div key={type}>
                            <button
                              onClick={() => setConfig(prev => ({ ...prev, scanType: type }))}
                              className={`w-full p-3 rounded-lg border text-left transition-all ${config.scanType === type
                                ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan"
                                : "border-border hover:border-neon-cyan/50"
                                }`}
                            >
                              <div className="font-semibold">{type}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {scanTypeDescriptions[type]}
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Verbose Level</label>
                        <div className="grid grid-cols-2 gap-2">
                          {["None", "Verbose", "Very Verbose", "Debug"].map(level => (
                            <button
                              key={level}
                              onClick={() => setConfig(prev => ({ ...prev, verboseLevel: level as any }))}
                              className={`px-3 py-2 rounded-lg border text-sm transition-all ${config.verboseLevel === level
                                ? "border-neon-blue bg-neon-blue/20 text-neon-blue"
                                : "border-border hover:border-neon-blue/50"
                                }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Timeout: {config.timeout}ms
                        </label>
                        <input
                          type="range"
                          min="100"
                          max="10000"
                          step="100"
                          value={config.timeout}
                          onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                          className="w-full accent-neon-blue"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Threads: {config.threads}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="500"
                          value={config.threads}
                          onChange={(e) => setConfig(prev => ({ ...prev, threads: parseInt(e.target.value) }))}
                          className="w-full accent-neon-green"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Scan Speed</label>
                        <div className="flex gap-2">
                          {["Slow", "Medium", "Fast"].map(speed => (
                            <button
                              key={speed}
                              onClick={() => setConfig(prev => ({ ...prev, scanSpeed: speed as any }))}
                              className={`px-4 py-2 rounded-lg border transition-all ${config.scanSpeed === speed
                                ? "border-neon-magenta bg-neon-magenta/20 text-neon-magenta"
                                : "border-border hover:border-neon-magenta/50"
                                }`}
                            >
                              {speed}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Advanced Settings Module */}
            <motion.div className="glass-panel rounded-lg overflow-hidden border-2 border-neon-magenta/30 shadow-[0_0_15px_rgba(255,0,255,0.3)]">
              <div className="p-4 border-b-2 border-neon-magenta/40 bg-neon-magenta/5">
                <h3 className="text-lg font-semibold text-neon-magenta">Advanced Settings</h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.aggressiveMode}
                          onChange={(e) => setConfig(prev => ({ ...prev, aggressiveMode: e.target.checked }))}
                          className="w-4 h-4 text-neon-magenta bg-transparent border-2 border-neon-magenta rounded focus:ring-neon-magenta"
                        />
                        <span className="font-semibold text-neon-magenta">Aggressive Mode</span>
                      </label>
                      <p className="text-xs text-muted-foreground ml-7">
                        Enables OS detection, version detection, DNS resolution, traceroute
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: "osDetection", label: "OS Detection" },
                        { key: "versionDetection", label: "Service Version Detection" },
                        { key: "dnsResolution", label: "DNS Resolution" },
                        { key: "traceroute", label: "Traceroute" }
                      ].map(setting => (
                        <label key={setting.key} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config[setting.key as keyof ScanConfig] as boolean}
                            onChange={(e) => setConfig(prev => ({ ...prev, [setting.key]: e.target.checked }))}
                            className="w-4 h-4 text-neon-cyan bg-transparent border-2 border-neon-cyan rounded focus:ring-neon-cyan"
                            disabled={config.aggressiveMode}
                          />
                          <span className={config.aggressiveMode ? "text-muted-foreground" : ""}>
                            {setting.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Start Scan Button */}
            <div className="flex justify-center">
              <button
                onClick={simulateScan}
                disabled={isScanning || !config.target}
                className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all ${!config.target || isScanning
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-neon-blue text-black hover:shadow-neon-blue animate-glow-pulse hover:scale-105"
                  }`}
              >
                {isScanning ? "Scanning..." : "Start Scan"}
              </button>
            </div>
          </div>

          {/* Results Section - Full Width Below */}
          <div className="space-y-6">
            {/* Console Log */}
            <div className="glass-panel rounded-lg border-2 border-neon-green/20 shadow-[0_0_10px_rgba(0,255,127,0.2)]">
              <h3 className="p-4 font-semibold text-neon-green border-b-2 border-neon-green/30 bg-neon-green/5">
                Console Output
              </h3>
              <div className="terminal h-64 overflow-y-auto">
                {filteredLogs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-sm font-mono ${getLogColor(log.level)}`}
                  >
                    [{log.level}] {log.message}
                  </motion.div>
                ))}
                {filteredLogs.length === 0 && (
                  <div className="text-muted-foreground text-sm">
                    Console output will appear here during scanning...
                  </div>
                )}
              </div>
            </div>



            {/* Results Table */}
            <div className="glass-panel rounded-lg overflow-hidden border-2 border-neon-blue/20 shadow-[0_0_10px_rgba(0,150,255,0.2)]">
              <div className="p-4 border-b-2 border-neon-blue/30 bg-neon-blue/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="font-semibold text-neon-blue">
                    Scan Results ({sortedResults.length})
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={filters.openPorts && filters.closedPorts && filters.filteredPorts ? "all" :
                          filters.openPorts && !filters.closedPorts && !filters.filteredPorts ? "open" :
                            !filters.openPorts && filters.closedPorts && !filters.filteredPorts ? "closed" :
                              !filters.openPorts && !filters.closedPorts && filters.filteredPorts ? "filtered" : "custom"}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "all") {
                            setFilters(prev => ({ ...prev, openPorts: true, closedPorts: true, filteredPorts: true }));
                          } else if (value === "open") {
                            setFilters(prev => ({ ...prev, openPorts: true, closedPorts: false, filteredPorts: false }));
                          } else if (value === "closed") {
                            setFilters(prev => ({ ...prev, openPorts: false, closedPorts: true, filteredPorts: false }));
                          } else if (value === "filtered") {
                            setFilters(prev => ({ ...prev, openPorts: false, closedPorts: false, filteredPorts: true }));
                          }
                        }}
                        className="px-3 py-1 bg-background border border-neon-blue/30 rounded text-sm focus:border-neon-blue"
                      >
                        <option value="all">All Status</option>
                        <option value="open">Open Only</option>
                        <option value="closed">Closed Only</option>
                        <option value="filtered">Filtered Only</option>
                      </select>

                      <select
                        value={filters.tcpOnly && !filters.udpOnly ? "tcp" :
                          !filters.tcpOnly && filters.udpOnly ? "udp" : "all"}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "all") {
                            setFilters(prev => ({ ...prev, tcpOnly: false, udpOnly: false }));
                          } else if (value === "tcp") {
                            setFilters(prev => ({ ...prev, tcpOnly: true, udpOnly: false }));
                          } else if (value === "udp") {
                            setFilters(prev => ({ ...prev, tcpOnly: false, udpOnly: true }));
                          }
                        }}
                        className="px-3 py-1 bg-background border border-neon-green/30 rounded text-sm focus:border-neon-green"
                      >
                        <option value="all">All Protocols</option>
                        <option value="tcp">TCP Only</option>
                        <option value="udp">UDP Only</option>
                      </select>

                      <select
                        value={filters.showBanner ? "show" : "hide"}
                        onChange={(e) => setFilters(prev => ({ ...prev, showBanner: e.target.value === "show" }))}
                        className="px-3 py-1 bg-background border border-neon-cyan/30 rounded text-sm focus:border-neon-cyan"
                      >
                        <option value="show">Show Banners</option>
                        <option value="hide">Hide Banners</option>
                      </select>
                    </div>

                    {/* Clear Filters Button */}
                    <button
                      onClick={() => {
                        setFilters({
                          openPorts: true,
                          closedPorts: true,
                          filteredPorts: true,
                          tcpOnly: false,
                          udpOnly: false,
                          showBanner: true,
                          showDebugLogs: true,
                        });
                      }}
                      className="px-3 py-1 bg-neon-magenta/20 text-neon-magenta border border-neon-magenta rounded text-sm hover:bg-neon-magenta/30 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
              {sortedResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-accent/20">
                      <tr>
                        {[
                          { key: "port", label: "Port" },
                          { key: "service", label: "Service" },
                          { key: "status", label: "Status" },
                          { key: "protocol", label: "Protocol" },
                          { key: "latency", label: "Response Time" },
                          { key: "ttl", label: "TTL" },
                          { key: "detectionMethod", label: "Detection Method" },
                          { key: "banner", label: "Banner" }
                        ].map(column => (
                          <th
                            key={column.key}
                            className="p-3 text-left text-sm font-semibold cursor-pointer hover:bg-accent/30 transition-colors"
                            onClick={() => handleSort(column.key)}
                          >
                            {column.label}
                            {sortConfig.key === column.key && (
                              <span className="ml-1">
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedResults.map((result, index) => (
                        <motion.tr
                          key={`${result.port}-${result.protocol}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-t border-border/30 hover:bg-accent/10"
                        >
                          <td className="p-3 font-mono">{result.port}</td>
                          <td className="p-3">{result.service}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${result.status === "open"
                              ? "bg-neon-green/20 text-neon-green"
                              : result.status === "filtered"
                                ? "bg-yellow-400/20 text-yellow-400"
                                : "bg-destructive/20 text-destructive"
                              }`}>
                              {result.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono">{result.protocol}</td>
                          <td className="p-3 font-mono">{result.latency}ms</td>
                          <td className="p-3 font-mono">{result.ttl || "-"}</td>
                          <td className="p-3 font-mono text-sm">{result.detectionMethod}</td>
                          <td className="p-3 font-mono text-sm text-neon-cyan">
                            {filters.showBanner && result.banner ? result.banner : "-"}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  {scanResults.length === 0
                    ? "No scan results yet. Start a scan to see results here."
                    : "No results match the current filters."
                  }
                </div>
              )}
            </div>

            {/* Scan Summary */}
            {scanSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-lg p-6 border-2 border-neon-magenta/20 shadow-[0_0_10px_rgba(255,0,255,0.2)]"
              >
                <h3 className="font-semibold text-neon-magenta mb-4">Scan Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Target:</span>
                    <div className="font-mono text-neon-blue">{scanSummary.target}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Scan Type:</span>
                    <div className="font-mono text-neon-green">{scanSummary.scanType}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ports Scanned:</span>
                    <div className="font-mono text-neon-cyan break-all">{scanSummary.portsScanned}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Open Ports:</span>
                    <div className="font-mono text-neon-magenta">{scanSummary.openPorts}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <div className="font-mono text-neon-blue">{scanSummary.duration.toFixed(1)}s</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Verbose Level:</span>
                    <div className="font-mono text-neon-green">{scanSummary.verboseLevel}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Export Results */}
            {scanResults.length > 0 && (
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <button
                  className="px-3 py-1.5 bg-neon-green text-black rounded-lg hover:shadow-neon-green transition-all"
                  onClick={handleExportJSON}
                >
                  Export JSON
                </button>
                <button
                  className="px-6 py-3 bg-neon-magenta text-black rounded-lg hover:shadow-neon-magenta transition-all"
                  onClick={handleExportCSV}
                >
                  Export CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all"
                >
                  Export PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
