import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

export default function Index() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Precision Scanning. No Boundaries.";

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

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
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,600 L400,600 L400,300 L800,300 L800,700 L1200,700"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="text-neon-green"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
          />
        </svg>
      </div>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center gap-6 mb-8"
            >
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
                <svg width="80" height="80" viewBox="0 0 80 80" className="text-neon-cyan">
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  />
                  <motion.path
                    d="M20 40 L40 20 L60 40 L40 60 Z"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="currentColor"
                    fillOpacity="0.2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  />
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="8"
                    fill="currentColor"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  {/* Radar sweep */}
                  <motion.line
                    x1="40"
                    y1="40"
                    x2="40"
                    y2="5"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.6"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "40px 40px" }}
                  />
                </svg>
              </motion.div>
              <motion.h1
                className="text-5xl md:text-7xl font-bold"
                animate={{
                  textShadow: [
                    "0 0 5px #00bcd4",
                    "0 0 20px #00bcd4, 0 0 30px #00bcd4",
                    "0 0 5px #00bcd4"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="text-neon-blue neon-text">Pentrax</span>
              </motion.h1>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="text-2xl md:text-3xl mb-12 h-16 flex items-center justify-center"
            >
              <span className="font-mono text-neon-green">
                {typedText}
                <span className="typing-cursor"></span>
              </span>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link
                to="/legal"
                className="inline-block px-8 py-4 bg-neon-blue text-black font-semibold rounded-lg text-lg
                         hover:shadow-neon-blue transition-all duration-300 transform hover:scale-105
                         animate-glow-pulse"
              >
                Start Advanced Scan
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-center mb-16 text-neon-green">
              Advanced Features
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Lightning Fast",
                  description: "Concurrent scanning with configurable threading for maximum speed",
                  color: "neon-blue"
                },
                {
                  title: "Stealth Mode",
                  description: "Advanced evasion techniques to avoid detection by security systems",
                  color: "neon-green"
                },
                {
                  title: "Visual Control",
                  description: "Scan, analyze, and control your network through an interactive visual interface",
                  color: "neon-magenta"
                },
                {
                  title: "Privacy First",
                  description: "No tracking, no data collection - everything runs locally",
                  color: "neon-cyan"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-panel p-6 rounded-lg hover:scale-105 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3 className={`text-xl font-semibold mb-4 text-${feature.color}`}>
                    {feature.title}
                  </h3>
                  <p className="text-foreground/80 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Additional Features */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-panel p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-neon-blue">
                  Custom Profiles
                </h3>
                <p className="text-foreground/80">
                  Save and reuse scan configurations for different scenarios
                </p>
              </div>
              
              <div className="glass-panel p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-neon-green">
                  Real-time Insights
                </h3>
                <p className="text-foreground/80">
                  Live console output and visual progress indicators
                </p>
              </div>
              
              <div className="glass-panel p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-neon-magenta">
                  Export Results
                </h3>
                <p className="text-foreground/80">
                  Download scan results in multiple formats (JSON, CSV)
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
