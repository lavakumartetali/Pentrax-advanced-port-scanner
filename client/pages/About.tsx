import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 matrix-bg opacity-10"></div>
      
      <div className="absolute inset-0">
        <svg className="w-full h-full opacity-20" viewBox="0 0 1200 800">
          <motion.path
            d="M0,400 L200,400 L200,150 L500,150 L500,600 L900,600 L900,200 L1200,200"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="text-neon-green"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          />
        </svg>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 lg:py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-neon-green animate-fade-in-up">
              About Pentrax
            </h1>
            <Link
              to="/scanner"
              className="px-4 py-2 bg-neon-blue/20 text-neon-blue border border-neon-blue rounded-lg hover:bg-neon-blue/30 transition-all duration-200 flex items-center gap-2 w-fit"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8.5 2.5L15 8l-6.5 5.5v-3H1v-5h7.5v-3z"/>
              </svg>
              Launch Scanner
            </Link>
          </div>
          
          <div className="space-y-6 lg:space-y-8 text-foreground/90 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <section className="glass-panel p-4 lg:p-6 rounded-lg border-2 border-neon-green/20">
              <h2 className="text-lg lg:text-xl font-semibold text-neon-blue mb-4">What is Pentrax?</h2>
              <p className="leading-relaxed text-sm lg:text-base">
                Pentrax is an advanced port scanning tool designed for cybersecurity professionals, 
                penetration testers, and network administrators. Built with modern web technologies, 
                it provides a powerful yet intuitive interface for network reconnaissance and security assessment.
              </p>
            </section>

            <section className="glass-panel p-4 lg:p-6 rounded-lg border-2 border-neon-cyan/20">
              <h2 className="text-lg lg:text-xl font-semibold text-neon-cyan mb-4">Key Features</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-neon-green rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-neon-green text-sm lg:text-base">Multiple Scan Types</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground">Quick, Full, Stealth, Custom, and UDP scanning modes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-neon-blue rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-neon-blue text-sm lg:text-base">Real-time Results</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground">Live console output and dynamic result tables</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-neon-magenta rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-neon-magenta text-sm lg:text-base">Advanced Options</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground">OS detection, service fingerprinting, and custom configurations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-neon-cyan text-sm lg:text-base">Export Results</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground">Save scan results in JSON, CSV, or PDF formats</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="glass-panel p-4 lg:p-6 rounded-lg border-2 border-neon-magenta/20">
              <h2 className="text-lg lg:text-xl font-semibold text-neon-magenta mb-4">Technology Stack</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
                {[
                  { name: "React 18", desc: "Modern UI framework" },
                  { name: "TypeScript", desc: "Type-safe development" },
                  { name: "Tailwind CSS", desc: "Utility-first styling" },
                  { name: "Framer Motion", desc: "Smooth animations" },
                  { name: "Vite", desc: "Fast build tooling" },
                  { name: "REST API", desc: "Backend integration" }
                ].map((tech, index) => (
                  <div key={tech.name} className="text-center p-3 bg-accent/10 rounded-lg border border-border/30">
                    <div className="font-semibold text-xs lg:text-sm text-neon-blue">{tech.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{tech.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-panel p-4 lg:p-6 rounded-lg border-2 border-neon-blue/20">
              <h2 className="text-lg lg:text-xl font-semibold text-neon-blue mb-4">Security & Privacy</h2>
              <div className="space-y-4">
                <p className="leading-relaxed text-sm lg:text-base">
                  Pentrax is designed with security and privacy as core principles. All scanning operations 
                  can be performed locally, and we do not store or transmit your scan data without your explicit consent.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Link
                    to="/privacy"
                    className="inline-flex items-center gap-2 text-neon-green hover:text-neon-green/80 transition-colors text-sm"
                  >
                    Privacy Policy →
                  </Link>
                  <Link
                    to="/legal"
                    className="inline-flex items-center gap-2 text-neon-magenta hover:text-neon-magenta/80 transition-colors text-sm"
                  >
                    Legal Notice →
                  </Link>
                </div>
              </div>
            </section>

            <section className="glass-panel p-4 lg:p-6 rounded-lg border-2 border-neon-cyan/20">
              <h2 className="text-lg lg:text-xl font-semibold text-neon-cyan mb-4">Getting Started</h2>
              <div className="space-y-4">
                <p className="leading-relaxed text-sm lg:text-base">
                  Ready to start scanning? Click the "Launch Scanner" button above to access the full scanning interface. 
                  Make sure you have proper authorization before scanning any networks or systems.
                </p>
                <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3 lg:p-4">
                  <div className="flex gap-3">
                    <div className="text-yellow-400 flex-shrink-0">⚠️</div>
                    <div>
                      <div className="font-semibold text-yellow-400 text-sm lg:text-base">Important Notice</div>
                      <p className="text-xs lg:text-sm text-yellow-400/80 mt-1">
                        Only scan networks and systems you own or have explicit permission to test. 
                        Unauthorized scanning may violate local laws and regulations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
