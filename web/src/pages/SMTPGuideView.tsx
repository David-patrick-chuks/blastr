import { ChevronLeft, Mail, Shield, Key, ExternalLink, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SMTPGuideView() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30">
            {/* Header */}
            <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-mono uppercase tracking-widest">Back to Home</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-blue-500 flex items-center justify-center text-blue-400 font-mono text-sm">
                            B
                        </div>
                        <span className="text-lg font-bold font-mono tracking-tighter">BLASTAGENT</span>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-16">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 uppercase">
                        SMTP App Passwords Guide
                    </h1>
                    <p className="text-zinc-500 text-lg">
                        Learn how to securely connect your email accounts to BlastAgent AI using App Passwords.
                    </p>
                </div>

                {/* Video Section */}
                <div className="relative mb-16 aspect-video bg-zinc-900 border border-zinc-800 group overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                    <iframe
                        className="w-full h-full relative z-0"
                        src="https://www.youtube.com/embed/wniM7sU0bmU"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                </div>

                <div className="space-y-12">
                    {/* Why Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-blue-400">
                            <Shield className="w-6 h-6" />
                            <h2 className="text-xl font-bold uppercase tracking-tight">Why use App Passwords?</h2>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 space-y-4 leading-relaxed text-zinc-300">
                            <p>
                                Modern email providers (Gmail, Outlook, iCloud) no longer allow signing in with your primary password for security reasons (MTAs/Bots).
                            </p>
                            <p>
                                <strong className="text-white">App Passwords</strong> are unique, 16-character codes that allow BlastAgent to send emails on your behalf without ever knowing your real password. They can be revoked at any time.
                            </p>
                        </div>
                    </section>

                    {/* Steps Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-blue-400">
                            <Key className="w-6 h-6" />
                            <h2 className="text-xl font-bold uppercase tracking-tight">Setup Instructions</h2>
                        </div>

                        <div className="grid gap-6">
                            {[
                                {
                                    provider: "Gmail / Google Workspace",
                                    steps: [
                                        "Go to your Google Account Settings.",
                                        "Navigate to 'Security' on the left sidebar.",
                                        "Enable '2-Step Verification' if it isn't already.",
                                        "Search for 'App Passwords' in the top search bar.",
                                        "Create a new app named 'BlastAgent' and copy the 16-character code."
                                    ],
                                    link: "https://myaccount.google.com/apppasswords"
                                },
                                {
                                    provider: "Outlook / Hotmail / Office 365",
                                    steps: [
                                        "Log in to your Microsoft Security Dashboard.",
                                        "Go to 'Advanced security options'.",
                                        "Look for the 'App passwords' section.",
                                        "Click 'Create a new app password'.",
                                        "Copy the generated code for your SMTP settings."
                                    ],
                                    link: "https://account.microsoft.com/security"
                                }
                            ].map((prov, i) => (prov &&
                                <div key={i} className="border border-zinc-800 bg-zinc-900/30 p-8 hover:border-blue-500/30 transition-colors">
                                    <div className="flex justify-between items-start mb-6">
                                        <h3 className="text-xl font-bold text-white tracking-tight">{prov.provider}</h3>
                                        <a
                                            href={prov.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 border border-zinc-800 hover:border-blue-500/50 text-zinc-500 hover:text-blue-400 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                    <ul className="space-y-4">
                                        {prov.steps.map((step, si) => (
                                            <li key={si} className="flex gap-4 items-start">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full border border-zinc-800 bg-zinc-950 flex items-center justify-center text-[10px] font-mono text-blue-500">
                                                    {si + 1}
                                                </span>
                                                <span className="text-sm text-zinc-400">{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Warning Section */}
                    <section className="bg-blue-500/5 border border-blue-500/20 p-6 flex gap-4 items-start">
                        <Info className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                        <div>
                            <h3 className="text-blue-400 font-bold uppercase text-sm mb-2 italic">Pro Tip</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Always ensure your SMTP Host and Port match your provider. For example, Gmail uses <code className="text-blue-300">smtp.gmail.com</code> on port <code className="text-blue-300">587</code>.
                            </p>
                        </div>
                    </section>
                </div>
            </main>

            {/* CTA */}
            <section className="border-t border-zinc-800 bg-zinc-900/30 py-24">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-6 tracking-tighter uppercase">Ready to launch?</h2>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-zinc-950 font-bold tracking-[0.2em] transition-all uppercase shadow-lg shadow-blue-500/10"
                    >
                        Enter Dashboard
                    </button>
                </div>
            </section>

            <footer className="py-12 border-t border-zinc-900 text-center">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest leading-relaxed">
                    BlastAgent AI — Secure Transmission Engine <br />
                    Powered by Google Gemini 2.0
                </p>
            </footer>
        </div>
    );
}
