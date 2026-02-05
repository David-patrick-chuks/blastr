import { SiGithub, SiNpm } from "react-icons/si";

export function Footer() {
  return (
    <footer className="relative py-12 border-t border-zinc-800">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-blue-500 flex items-center justify-center text-blue-400 font-mono text-sm">
              B
            </div>
            <span className="text-xl font-semibold text-white font-mono uppercase italic tracking-tighter">
              blastr
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-blue-500/50 transition-colors"
            >
              <SiGithub className="w-4 h-4" />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-blue-500/50 transition-colors"
            >
              <SiNpm className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-600">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="font-mono uppercase tracking-widest text-[10px]">
              © {new Date().getFullYear()} BLASTR — High-Impact AI Emailing
            </p>
            <a href="/guide/smtp" className="text-zinc-500 hover:text-blue-400 transition-colors uppercase font-mono text-[10px]">
              SMTP Setup Guide
            </a>
          </div>
          <p>
            Built for those who build the future
            <span className="text-blue-500 ml-1">_</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
