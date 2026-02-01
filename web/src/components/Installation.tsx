export function Installation() {

  return (
    <section
      id="installation"
      className="relative py-24 border-t border-zinc-800"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Instant Provisioning
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Access the GAIA Neural Dashboard and orchestrate your agents in seconds.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -top-1 -left-1 w-3 h-3 border-l border-t border-blue-500/50" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-r border-t border-blue-500/50" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l border-b border-blue-500/50" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r border-b border-blue-500/50" />

          <div className="border border-zinc-800 bg-zinc-950">
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
              <span className="text-sm text-zinc-500 font-mono">CONNECTION_STATUS</span>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] text-blue-500/80 font-mono uppercase tracking-widest">Linked</span>
              </div>
            </div>
            <div className="p-8 font-mono text-center">
              <div className="text-zinc-500 mb-4 tracking-widest text-xs">// NO_DOWNLOAD_REQUIRED</div>
              <div className="text-2xl font-bold text-white tracking-tighter">CLOUD NATIVE INTERFACE</div>
              <div className="mt-4 text-[10px] text-zinc-600 uppercase tracking-[0.2em]">Ready for neural deployment</div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl font-semibold text-white">Quick Onboarding</h3>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>
          <div className="space-y-4 text-zinc-300">
            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-6 h-6 border border-zinc-700 text-blue-400 text-xs flex items-center justify-center font-mono">
                1
              </span>
              <div>
                <span className="text-blue-400 font-mono">INITIALIZE</span>
                <span className="text-zinc-500 ml-2">
                  — Setup your profile and connect your Gemini API keys
                </span>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-6 h-6 border border-zinc-700 text-blue-400 text-xs flex items-center justify-center font-mono">
                2
              </span>
              <div>
                <span className="text-blue-400 font-mono">ORCHESTRATE</span>
                <span className="text-zinc-500 ml-2">
                  — Create agents and define their neural heuristics
                </span>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-6 h-6 border border-zinc-700 text-blue-400 text-xs flex items-center justify-center font-mono">
                3
              </span>
              <div>
                <span className="text-blue-400 font-mono">SYNC_KNOWLEDGE</span>
                <span className="text-zinc-500 ml-2">
                  — Upload documents and stream resources into the vector layer
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
