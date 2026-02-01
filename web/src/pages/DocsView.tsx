import { Terminal, Rocket, Shield, Database, Zap, ArrowRight, ChevronRight, Copy, Check, Bot, MessageSquare, Activity, Key, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function DocsView() {
    const [copied, setCopied] = useState<string | null>(null);
    const navigate = useNavigate();

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
            {/* Public Navigation Header */}
            <header className="fixed top-0 left-0 right-0 h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md z-50 px-6 flex items-center justify-between">
                <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate('/')}
                >
                    <div className="w-8 h-8 bg-blue-500 rounded-sm flex items-center justify-center">
                        <Bot className="w-5 h-5 text-zinc-900" />
                    </div>
                    <span className="font-bold tracking-tight text-xl">GAIA</span>
                    {/* <span className="text-zinc-500 font-mono text-xs ml-2">/DOCS</span> */}
                </div>

                {/* <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        <span className="hidden sm:inline">Home</span>
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-1.5 rounded-full bg-blue-500 text-zinc-900 text-sm font-bold hover:bg-blue-400 transition-all flex items-center gap-2"
                    >
                        Dashboard
                        <ExternalLink className="w-3 h-3" />
                    </button>
                </div> */}
            </header>

            <main className="flex-1 pt-24 pb-20 px-6">
                <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Hero Section */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-8 md:p-12">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] -mr-48 -mt-48 rounded-full" />
                        <div className="relative z-10 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
                                <Terminal className="w-3 h-3" />
                                v1.0.0 STABLE
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                                Complete Terminal Reference <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                                    The GAIA Platform CLI
                                </span>
                            </h1>
                            <p className="text-zinc-400 max-w-2xl text-lg">
                                Master every command in the GAIA ecosystem. From real-time neural streaming to
                                declarative squad manifests, this is the definitive technical guide.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <CodeBlock
                                    code="npm install -g @gaia/cli"
                                    id="install"
                                    onCopy={() => copyToClipboard("npm install -g @gaia/cli", "install")}
                                    isCopied={copied === "install"}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12">
                        <div className="space-y-20">

                            {/* Authentication */}
                            <section id="auth" className="space-y-6 scroll-mt-24">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Authentication</h2>
                                </div>
                                <div className="space-y-4">
                                    <CommandBox
                                        title="Interactive Browser Flow"
                                        cmd="gaia auth --browser"
                                        description="Launches GAIA Studio to securely retrieve your CLI access token."
                                    />
                                    <CommandBox
                                        title="Token Link"
                                        cmd="gaia auth --token <STUDIO_TOKEN>"
                                        description="Quickly link your terminal session using a Dashboard token."
                                    />
                                    <CommandBox
                                        title="Revoke Session"
                                        cmd="gaia auth --revoke"
                                        description="Clears all local configuration, tokens, and identifies from your machine."
                                        danger
                                    />
                                </div>
                            </section>

                            {/* Agent Management */}
                            <section id="agents" className="space-y-6 scroll-mt-24">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <Rocket className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Agent Orchestration</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <CommandBox title="Active Squad List" cmd="gaia agent list" />
                                    <CommandBox title="Creation Wizard" cmd="gaia agent create" />
                                    <CommandBox title="Inspect Diagnostics" cmd="gaia agent inspect -a <id>" />
                                    <CommandBox title="Context Migration" cmd="gaia agent migrate -a <id>" />
                                    <CommandBox title="Batch Standby" cmd="gaia agent stop-all" danger />
                                    <CommandBox title="Decommission Agent" cmd="gaia agent delete -a <id>" danger />
                                </div>
                                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-blue-400" />
                                            Declarative: Squad Manifests (gaia.yaml)
                                        </h4>
                                        <div className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-mono">POWER FEATURE</div>
                                    </div>
                                    <p className="text-xs text-zinc-500">Provision complex research squads in seconds using YAML infrastructure-as-code.</p>
                                    <div className="space-y-3">
                                        <div className="p-2 bg-black/30 rounded border border-zinc-800 font-mono text-xs text-blue-400">
                                            gaia agent apply -f path/to/squad.yaml
                                        </div>
                                        <pre className="text-[10px] sm:text-xs font-mono text-zinc-400 bg-black/50 p-4 rounded-lg overflow-x-auto border border-zinc-800/50">
                                            {`squad:
  - name: "Analyst-Alpha"
    role: "Analyst"
    heuristics: "Focus on financial volatility metrics..."
  - name: "Dev-Bot"
    role: "Developer"
    heuristics: "Prioritize Rust performance optimizations..."`}
                                        </pre>
                                    </div>
                                </div>
                            </section>

                            {/* Knowledge & Sync */}
                            <section id="sync" className="space-y-6 scroll-mt-24">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                                        <Database className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Knowledge & Heuristics</h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <CommandBox title="Git-Style Diff" cmd="gaia sync diff -a <id>" description="Compare local gaia.json vs Cloud heuristics." />
                                        <CommandBox title="Sync Local Folder" cmd="gaia sync ./my-data -a <id>" description="Bulk vectorize local directories." />
                                        <CommandBox title="Web/YT Ingestion" cmd="gaia sync <url> -a <id>" description="Ingest YouTube videos or documentation URLs." />
                                        <CommandBox title="Heuristic Push" cmd="gaia sync push -a <id>" description="Deploy local heuristics to Cloud memory." />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <CommandBox title="Inventory Audit" cmd="gaia sync list -a <id>" description="List every document in agent's vector memory." />
                                        <CommandBox title="Granular Purge" cmd="gaia sync remove -a <doc-id>" description="Remove specific documents from the VDB." danger />
                                    </div>
                                </div>
                            </section>

                            {/* Neural Chat */}
                            <section id="chat" className="space-y-6 scroll-mt-24">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Neural Chat & Shell Mode</h2>
                                </div>
                                <p className="text-zinc-400">
                                    Interact with your agents via real-time SSE streaming or use them as functional shell filters.
                                </p>
                                <div className="space-y-4">
                                    <CommandBox
                                        title="Interactive REPL"
                                        cmd="gaia chat -a <id>"
                                        description="Start a high-fidelity streaming chat session in the terminal."
                                    />
                                    <CommandBox
                                        title="One-Off Execution"
                                        cmd='gaia chat "analyze my current repo structure"'
                                        description="Get an immediate AI response for a single instruction."
                                    />
                                    <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                                        <h4 className="text-xs font-bold text-zinc-400 uppercase">Power User: STDIN Piping</h4>
                                        <div className="p-3 bg-black/50 rounded font-mono text-sm text-purple-400 border border-purple-500/20">
                                            cat logs.txt | gaia chat "analyze the error spikes"
                                        </div>
                                        <p className="text-[10px] text-zinc-500 leading-relaxed">
                                            The CLI detects non-TTY input and automatically prepends it to your instruction.
                                            Perfect for log analysis, code reviews, and dataset processing.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Deployment & Monitoring */}
                            <section id="ops" className="space-y-6 scroll-mt-24">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <Activity className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Ops & Monitoring</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <CommandBox title="Live Activity Logs" cmd="gaia logs -a <id>" description="Stream real-time interaction and system events." />
                                    <CommandBox title="ASCII Performance" cmd="gaia metrics --history" description="7-day token consumption and latency trends." />
                                    <CommandBox title="Platform Linking" cmd="gaia deploy" description="Connect to Slack, Notion, or WhatsApp (QR code)." />
                                    <CommandBox title="API Governance" cmd="gaia keys list" description="Manage secondary persistent access tokens." />
                                </div>
                            </section>

                            {/* Identity & Shell */}
                            <section id="identity" className="space-y-6 scroll-mt-24">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                                        <User className="w-5 h-5 text-pink-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Identity & Shell Integration</h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <CommandBox title="Profile Inspection" cmd="gaia profile view" />
                                        <CommandBox title="Security Update" cmd="gaia profile update" />
                                    </div>
                                    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20">
                                        <h4 className="text-xs font-bold text-zinc-400 mb-2 uppercase">Tab Completion (ZSH/BASH)</h4>
                                        <p className="text-xs text-zinc-500 mb-3">Enable effortless CLI navigation by generating shell completion scripts.</p>
                                        <div className="p-2 bg-black/40 rounded font-mono text-sm text-pink-400 inline-block">
                                            gaia completion
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Sidebar Navigation */}
                        <div className="hidden lg:block space-y-8 sticky top-24 h-fit">
                            <div>
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 mb-4">Core Reference</h4>
                                <nav className="space-y-1">
                                    <NavItem label="Authentication" href="#auth" />
                                    <NavItem label="Agent Orchestration" href="#agents" />
                                    <NavItem label="Knowledge & Sync" href="#sync" />
                                    <NavItem label="Neural Chat" href="#chat" />
                                    <NavItem label="Ops & Metrics" href="#ops" />
                                    <NavItem label="Identity & Shell" href="#identity" />
                                </nav>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 space-y-3">
                                <h5 className="text-xs font-bold text-blue-400 flex items-center gap-2">
                                    <Key className="w-3 h-3" />
                                    Security First
                                </h5>
                                <p className="text-[10px] text-zinc-400 leading-relaxed">
                                    GAIA CLI sessions are encrypted locally using AES-256.
                                    Always keep your Studio tokens secret.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}



function CodeBlock({ code, onCopy, isCopied }: { code: string, id: string, onCopy: () => void, isCopied: boolean }) {
    return (
        <div className="flex items-center gap-3 bg-black/40 border border-zinc-800 rounded-xl pl-4 pr-2 py-2 font-mono text-sm group">
            <span className="text-blue-400">$</span>
            <span className="text-zinc-100">{code}</span>
            <button
                onClick={onCopy}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-blue-400"
            >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
        </div>
    );
}

function CommandBox({ title, cmd, description, danger }: { title: string, cmd: string, description?: string, danger?: boolean }) {
    return (
        <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50 space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{title}</span>
            </div>
            <div className={`p-2 rounded bg-black/30 font-mono text-[13px] flex items-center gap-2 ${danger ? 'text-red-400/80' : 'text-blue-400/90'}`}>
                <ChevronRight className="w-3 h-3" />
                {cmd}
            </div>
            {description && <p className="text-[11px] text-zinc-500 leading-relaxed">{description}</p>}
        </div>
    );
}

function NavItem({ label, href, isLink }: { label: string, href: string, isLink?: boolean }) {
    return (
        <a
            href={href}
            className="flex items-center justify-between px-4 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-900 hover:text-blue-400 transition-all group"
        >
            {label}
            {isLink ? <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /> : <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </a>
    );
}
