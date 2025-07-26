import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

export default function LegalNotice() {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 matrix-bg opacity-10"></div>

      <div className="absolute inset-0">
        <svg className="w-full h-full opacity-20" viewBox="0 0 1200 800">
          <motion.path
            d="M0,600 L400,600 L400,300 L800,300 L800,700 L1200,700"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="text-neon-magenta"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          />
        </svg>
      </div>

      <main className="flex-1 container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-neon-magenta animate-fade-in-up">
              Legal Notice
            </h1>
            <Link
              to="/"
              className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-all duration-200 flex items-center gap-2 w-fit"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8.5 2.5L15 8l-6.5 5.5v-3H1v-5h7.5v-3z"/>
              </svg>
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </div>
          
          <div className="space-y-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="glass-panel p-6 rounded-lg border-destructive/30">
              <h2 className="text-xl font-semibold text-destructive mb-4">
                ⚠️ Important Warning
              </h2>
              <p className="text-foreground/90 leading-relaxed mb-4">
                Unauthorized port scanning may violate local, state, federal, or international laws. 
                Users are solely responsible for ensuring their use of Pentrax complies with all 
                applicable laws and regulations.
              </p>
              <p className="text-foreground/90 leading-relaxed">
                Only scan networks and systems that you own or have explicit written permission to test. 
                Unauthorized scanning may be considered an attack and could result in legal consequences.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-neon-green mb-4">Responsible Use</h2>
              <ul className="space-y-2 text-foreground/90">
                <li>• Only scan your own networks and systems</li>
                <li>• Obtain explicit written permission before scanning third-party systems</li>
                <li>• Respect rate limits and avoid overwhelming target systems</li>
                <li>• Use scanning for legitimate security testing purposes only</li>
              </ul>
            </div>

            <div className="flex items-center space-x-3 p-4 glass-panel rounded-lg">
              <input
                type="checkbox"
                id="acknowledge"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="w-4 h-4 text-neon-green bg-transparent border-2 border-neon-green rounded focus:ring-neon-green focus:ring-2"
              />
              <label htmlFor="acknowledge" className="text-foreground cursor-pointer">
                I understand and take full responsibility for my use of this tool
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to="/"
                className="px-4 sm:px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-center"
              >
                Back to Home
              </Link>
              <Link
                to="/scanner"
                className={`px-4 sm:px-6 py-3 rounded-lg transition-all duration-200 text-center ${
                  acknowledged
                    ? "bg-neon-green text-black hover:shadow-neon-green"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
                onClick={(e) => {
                  if (!acknowledged) {
                    e.preventDefault();
                  }
                }}
              >
                Proceed to Scanner
              </Link>
            </div>
          </div>
        </div>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
