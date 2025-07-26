import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 matrix-bg opacity-10"></div>

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
        </svg>
      </div>

      <main className="flex-1 container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-neon-blue animate-fade-in-up">
              Privacy Policy
            </h1>
            <Link
              to="/scanner"
              className="px-4 py-2 bg-neon-magenta/20 text-neon-magenta border border-neon-magenta rounded-lg hover:bg-neon-magenta/30 transition-all duration-200 flex items-center gap-2 w-fit"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8.5 2.5L15 8l-6.5 5.5v-3H1v-5h7.5v-3z"/>
              </svg>
              <span className="hidden sm:inline">Back to Scanner</span>
              <span className="sm:hidden">Scanner</span>
            </Link>
          </div>
          
          <div className="space-y-8 text-foreground/90 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <section>
              <h2 className="text-xl font-semibold text-neon-green mb-4">Data Collection</h2>
              <p className="leading-relaxed">
                Pentrax is committed to protecting your privacy. We do not store or transmit your IP addresses, 
                scan targets, or scan results to our servers. All scanning operations are performed client-side 
                in your browser.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neon-green mb-4">Local Storage</h2>
              <p className="leading-relaxed">
                Scan configurations and results are only stored locally in your browser's storage. 
                This data never leaves your device unless you explicitly choose to export it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neon-green mb-4">Third-Party Services</h2>
              <p className="leading-relaxed">
                Pentrax does not integrate with third-party analytics or tracking services. 
                Your scanning activities remain completely private.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neon-green mb-4">GDPR Compliance</h2>
              <p className="leading-relaxed">
                As we do not collect personal data, Pentrax is fully GDPR compliant. 
                All processing happens locally on your device.
              </p>
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
