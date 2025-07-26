export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/20 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-neon-blue font-semibold">Pentrax</span>
            <span>© 2025 • All rights reserved.</span>
          </div>
          <div className="text-center text-foreground/60 text-sm">
            Crafted with precision by <span className="text-neon-blue font-medium">Lava Kumar</span>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <a
              href="mailto:lavakumartetali@gmail.com"
              className="hover:text-neon-green transition-colors duration-200"
            >
              Mail
            </a>
            <a
              href="https://github.com/lavakumartetali"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neon-magenta transition-colors duration-200"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/lava-kumar-reddy-tetali-30829b1a1/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neon-cyan transition-colors duration-200"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
