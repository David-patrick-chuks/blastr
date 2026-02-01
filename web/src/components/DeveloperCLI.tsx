import { Terminal } from "lucide-react";

export function DeveloperCLI() {
    const cliCommands = [
        { cmd: "gaia auth --token", desc: "Authenticate your session" },
        { cmd: "gaia agent create", desc: "Provision a new AI expert" },
        { cmd: "gaia sync ./docs", desc: "Sync to Cloud Vector DB" },
        { cmd: "gaia deploy --whatsapp", desc: "Instantly link to mobile" },
    ];

    return (
        <section className="relative py-24 border-t border-zinc-800 bg-black overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03),transparent_70%)]" />

            <div className="relative max-w-5xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h3 className="text-xs font-mono text-cyan-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Terminal className="w-4 h-4" /> Advanced Tooling
                        </h3>
                        <h2 className="text-4xl font-bold text-white mb-8 leading-tight">
                            Power your flow with the <br />
                            <span className="text-zinc-600 font-mono">GAIA CLI</span>
                        </h2>
                        <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                            Prefer the terminal? Our lightweight CLI allows you to authenticate via token and manage your entire AI workforce. Everything from provisioning to knowledge syncing happens directly in your terminal, with all data securely stored in the GAIA Cloud Vector DB.
                        </p>

                        <div className="space-y-4">
                            {cliCommands.map((command) => (
                                <div key={command.cmd} className="flex items-center gap-4 group">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-blue-500 transition-colors" />
                                    <div className="flex-1">
                                        <span className="text-blue-400 font-mono text-sm">{command.cmd}</span>
                                        <span className="text-zinc-600 text-sm ml-3">— {command.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 bg-zinc-900/50 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                                npm i -g @gaia/cli
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative p-1 border border-zinc-800 bg-zinc-950 rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/40" />
                                    <div className="w-2 h-2 rounded-full bg-amber-500/20 border border-amber-500/40" />
                                    <div className="w-2 h-2 rounded-full bg-blue-500/20 border border-blue-500/40" />
                                </div>
                                <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">terminal — gaia-sh</span>
                            </div>
                            <div className="p-6 font-mono text-xs leading-relaxed text-zinc-300">
                                <div className="flex gap-3 mb-2">
                                    <span className="text-blue-500">➜</span>
                                    <span className="text-zinc-100 font-bold">gaia auth --token GAIA_STK_...82xF</span>
                                </div>
                                <div className="text-zinc-500 mb-4">[INFO] Authenticated: mailquillofficial@gmail.com</div>

                                <div className="flex gap-3 mb-2">
                                    <span className="text-blue-500">➜</span>
                                    <span className="text-zinc-100 font-bold">gaia sync ./knowledge-base --agent researcher-01</span>
                                </div>
                                <div className="text-zinc-500 mb-2">[INFO] Processing 12 documents...</div>
                                <div className="text-blue-400 mb-4">&gt; 1,402 vectors pushed to GAIA Cloud Vector DB ... OK</div>

                                <div className="flex gap-3 mb-2">
                                    <span className="text-blue-500">➜</span>
                                    <span className="text-zinc-100 font-bold">gaia deploy --platform telegram</span>
                                </div>
                                <div className="text-zinc-500 animate-pulse">[WAIT] Establishing neural tunnel...</div>
                                <div className="text-blue-400">&gt; Live on Telegram: https://t.me/gaia_bot_382</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
