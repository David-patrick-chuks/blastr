export function Hero({ onAuth }: { onAuth: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />

      <div className="absolute top-0 left-1/4 w-px h-48 bg-gradient-to-b from-blue-500/50 to-transparent" />
      <div className="absolute top-0 right-1/4 w-px h-32 bg-gradient-to-b from-blue-500/30 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20">
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 border border-zinc-700 bg-zinc-900/80 text-sm text-zinc-300">
            <span className="w-1.5 h-1.5 bg-blue-400 animate-pulse" />
            BlastAgent AI
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-center tracking-tighter leading-[1.1]">
          <span className="text-white">Blast High-Impact </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            AI Email
          </span>
          <br />
          <span className="text-white">Campaigns</span>
        </h1>

        <p className="mt-6 text-lg text-zinc-500 text-center max-w-3xl mx-auto font-mono uppercase tracking-[0.2em]">
          SMTP DELIVERY // LIST EXTRACTION // PERSONALIZED OUTREACH
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onAuth}
            className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-black font-mono text-xs font-black transition-all hover:scale-105 uppercase cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.2)]"
          >
            Start Blasting
          </button>
          <a
            href="#features"
            className="px-8 py-4 border border-zinc-800 hover:border-zinc-700 bg-zinc-100/5 text-zinc-400 font-mono text-xs uppercase transition-all"
          >
            How it works
          </a>
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href="/guide/smtp"
            className="text-zinc-500 hover:text-blue-400 text-sm font-mono transition-colors border-b border-transparent hover:border-blue-400"
          >
            SMTP App Password Guide -&gt;
          </a>
        </div>

        <div className="mt-20 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "CREATE", detail: "Email Templates" },
            { label: "EXTRACT", detail: "Verify Recipient Lists" },
            { label: "BLAST", detail: "High-Volume Delivery" }
          ].map((stat) => (
            <div key={stat.label} className="p-6 border border-zinc-800 bg-zinc-900/40 backdrop-blur text-center space-y-2">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{stat.label}</div>
              <div className="text-xl font-bold text-white tracking-tight">{stat.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
