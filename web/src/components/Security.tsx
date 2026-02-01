import { Check, X } from "lucide-react";

export function Security() {
  return (
    <section className="relative py-24 border-t border-zinc-800 bg-zinc-900/30">
      <div className="absolute left-0 right-0 top-24 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
      <div className="absolute left-0 right-0 bottom-24 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tighter">
            Hardened & Private
          </h2>
          <p className="mt-4 text-xs font-mono text-zinc-500 max-w-2xl mx-auto uppercase tracking-widest">
            Encryption at rest. Isolation in execution. No telemetry.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-zinc-700">
          <div className="relative bg-zinc-950 p-6 border-l-2 border-l-blue-500">
            <div className="absolute -top-px -right-px w-4 h-4 border-r border-t border-blue-500/50" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 border border-blue-500/50 flex items-center justify-center">
                <Check className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-blue-400">
                Safety & Privacy
              </h3>
            </div>
            <ul className="space-y-3">
              {[
                "Your data is encrypted and strictly yours",
                "Isolated memory for every agent",
                "Automatic protection against harmful content",
                "Clear logs of every agent interaction",
                "Total control over agent boundaries",
                "Secure multi-platform connectivity",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-zinc-300">
                  <Check className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative bg-zinc-950 p-6 border-l-2 border-l-zinc-600">
            <div className="absolute -top-px -right-px w-4 h-4 border-r border-t border-zinc-600/50" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 border border-zinc-600 flex items-center justify-center">
                <X className="w-4 h-4 text-zinc-400" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-300">
                Current Status
              </h3>
            </div>
            <ul className="space-y-3">
              {[
                "Alpha: We are improving GAIA daily",
                "Standard AI rate limits apply",
                "Experimental autonomous reasoning",
                "External platform API constraints",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-zinc-400">
                  <X className="w-4 h-4 text-zinc-500 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative mt-12 border border-zinc-800 bg-zinc-950">
          <div className="absolute -top-px -left-px w-4 h-4 border-l border-t border-blue-500/50" />
          <div className="absolute -top-px -right-px w-4 h-4 border-r border-t border-blue-500/50" />
          <div className="absolute -bottom-px -left-px w-4 h-4 border-l border-b border-blue-500/50" />
          <div className="absolute -bottom-px -right-px w-4 h-4 border-r border-b border-blue-500/50" />

          <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900">
            <h3 className="text-lg font-semibold text-white font-mono uppercase tracking-widest">
              System Specs
            </h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-800">
            <div className="bg-zinc-950 p-4">
              <div className="text-[10px] text-zinc-600 mb-1 font-mono uppercase tracking-widest">
                AI Engine
              </div>
              <div className="text-zinc-200 font-mono text-sm">Gemini 3</div>
            </div>
            <div className="bg-zinc-950 p-4">
              <div className="text-[10px] text-zinc-600 mb-1 font-mono uppercase tracking-widest">
                Brain Memory
              </div>
              <div className="text-zinc-200 font-mono text-sm">Vector Indexing</div>
            </div>
            <div className="bg-zinc-950 p-4">
              <div className="text-[10px] text-zinc-600 mb-1 font-mono uppercase tracking-widest">
                Data Safety
              </div>
              <div className="text-zinc-200 font-mono text-sm">AES-256 Protected</div>
            </div>
            <div className="bg-zinc-950 p-4">
              <div className="text-[10px] text-zinc-600 mb-1 font-mono uppercase tracking-widest">
                Processing
              </div>
              <div className="text-zinc-200 font-mono text-sm">Real-time Sync</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
