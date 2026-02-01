import { Activity } from "lucide-react";

export function TechManifesto() {
    return (
        <section className="relative py-24 border-t border-zinc-900 bg-black overflow-hidden">
            <div className="max-w-5xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h3 className="text-xs font-mono text-blue-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Activity className="w-4 h-4" /> System Philosophy
                        </h3>
                        <h2 className="text-4xl font-bold text-white mb-8 leading-tight">
                            Agents aren't chatbots. <br />
                            <span className="text-zinc-600">They are kernels of execution.</span>
                        </h2>
                        <div className="space-y-6 text-zinc-400 font-mono text-sm leading-relaxed">
                            <p>
                                Most AI platforms build "wrappers". GAIA builds <span className="text-zinc-200">autonomous reasoning nodes</span>.
                                We prioritize low-latency execution and high-fidelity state management over generic chat interfaces.
                            </p>
                            <p>
                                By leveraging <span className="text-blue-500/80">Gemini 3 Flash</span> and <span className="text-blue-500/80">PGVector</span>,
                                we enable agents that can process documents, scan codebases, and interact across protocols—all while maintaining a
                                rigorous security posture via our proprietary auth architecture.
                            </p>
                            <div className="pt-4 flex flex-wrap gap-4">
                                <div className="px-3 py-1 border border-zinc-800 bg-zinc-900 text-[10px] text-zinc-500 uppercase tracking-widest">
                                    300 TPS / Sec
                                </div>
                                <div className="px-3 py-1 border border-zinc-800 bg-zinc-900 text-[10px] text-zinc-500 uppercase tracking-widest">
                                    1M Context Window
                                </div>
                                <div className="px-3 py-1 border border-zinc-800 bg-zinc-900 text-[10px] text-zinc-500 uppercase tracking-widest">
                                    Multi-Modal Native
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="p-8 border border-zinc-800 bg-zinc-950 rounded-lg overflow-x-auto">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                                <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500/50" />
                                <span className="ml-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">kernel_spec.json</span>
                            </div>
                            <pre className="text-xs font-mono leading-relaxed">
                                <code className="text-zinc-500">
                                    <span className="text-blue-500">{"{"}</span> <br />
                                    {"  "}<span className="text-cyan-400">"architecture"</span>: <span className="text-zinc-300">"Decentralized-Agentic"</span>, <br />
                                    {"  "}<span className="text-cyan-400">"model"</span>: <span className="text-zinc-300">"Gemini-3-Flash-Preview"</span>, <br />
                                    {"  "}<span className="text-cyan-400">"latency_target"</span>: <span className="text-zinc-300">"&lt; 500ms"</span>, <br />
                                    {"  "}<span className="text-cyan-400">"security"</span>: <span className="text-blue-500">{"{"}</span> <br />
                                    {"    "}<span className="text-cyan-400">"auth"</span>: <span className="text-zinc-300">"Cross-Protocol-Gating"</span>, <br />
                                    {"    "}<span className="text-cyan-400">"encryption"</span>: <span className="text-zinc-300">"AES-256-GCM"</span> <br />
                                    {"  "}<span className="text-blue-500">{"}"}</span>, <br />
                                    {"  "}<span className="text-cyan-400">"rag_engine"</span>: <span className="text-zinc-300">"Hybrid-Source-Citation"</span> <br />
                                    <span className="text-blue-500">{"}"}</span>
                                </code>
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
