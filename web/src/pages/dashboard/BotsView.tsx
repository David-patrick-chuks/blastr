import { useState, useEffect } from "react";
import { Cpu, Plus, Search, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { InfoModal, ConfirmModal } from "../../components/Modal";
import { apiClient } from "../../services/index";
import type { Agent } from "../../types/index";

export function BotsView() {
    const [bots, setBots] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentBot, setCurrentBot] = useState<Agent | null>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [infoTitle, setInfoTitle] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const [verifyingId, setVerifyingId] = useState<string | null>(null);

    useEffect(() => {
        loadBots();
    }, []);

    const loadBots = async () => {
        try {
            const data = await apiClient.get<Agent[]>('/agents');
            setBots(data);
        } catch (error) {
            console.error("Failed to load bots:", error);
        } finally {
            setLoading(false);
        }
    };

    const showInfo = (title: string, message: string) => {
        setInfoTitle(title);
        setInfoMessage(message);
        setInfoModalOpen(true);
    };

    const handleVerifySmtp = async (botId: string) => {
        setVerifyingId(botId);
        try {
            const res = await apiClient.post<any>(`/agents/${botId}/verify`, {});
            if (res.success) {
                showInfo("Verification Success", "SMTP connection verified! This bot is ready to send.");
                loadBots(); // Refresh status
            } else {
                showInfo("Verification Failed", res.error || "Could not connect to SMTP server.");
            }
        } catch (error: any) {
            showInfo("Error", error.response?.data?.error || "SMTP verification failed.");
        } finally {
            setVerifyingId(null);
        }
    };

    const handleDeleteClick = (bot: Agent) => {
        setCurrentBot(bot);
        setConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!currentBot) return;
        try {
            await apiClient.delete(`/agents/${currentBot.id}`);
            setBots(bots.filter(b => b.id !== currentBot.id));
            showInfo("Deleted", "Bot has been removed.");
        } catch (error) {
            showInfo("Error", "Failed to delete bot.");
        }
    };

    const filteredBots = bots.filter(bot =>
        bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bot.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">AI Transmission Bots</h2>
                    <p className="text-zinc-500 text-sm">Manage your SMTP identities and sending limits.</p>
                </div>
                <button
                    onClick={() => showInfo("Feature Coming", "Bot creation is currently optimized through the Campaign flow. Dedicated bot creation coming soon.")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-zinc-900 font-bold text-sm transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    CREATE BOT
                </button>
            </div>

            <div className="border border-zinc-800 bg-zinc-900/40">
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/60">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            type="text"
                            placeholder="Search bots..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 px-10 py-2 text-xs w-full outline-none focus:border-blue-500/50"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Identity</th>
                                <th className="px-6 py-4">SMTP Host</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Daily Usage</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-mono">Loading data engines...</td></tr>
                            ) : filteredBots.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-mono">No active bots found.</td></tr>
                            ) : (
                                filteredBots.map(bot => (
                                    <tr key={bot.id} className="hover:bg-zinc-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-900 text-blue-400">
                                                    <Cpu className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">{bot.name}</div>
                                                    <div className="text-[10px] text-zinc-500 font-mono">{bot.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-[11px] text-zinc-400">
                                            {bot.smtp_host}:{bot.smtp_port}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {bot.status === 'active' ? (
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                                                ) : (
                                                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                                )}
                                                <span className={`text-[10px] font-mono uppercase ${bot.status === 'active' ? 'text-blue-500' : 'text-amber-500'}`}>
                                                    {bot.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-full max-w-[100px] space-y-1">
                                                <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                                                    <span>{bot.daily_sent_count}</span>
                                                    <span>/ {bot.daily_limit}</span>
                                                </div>
                                                <div className="h-1 bg-zinc-800 w-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500"
                                                        style={{ width: `${Math.min(100, (bot.daily_sent_count / bot.daily_limit) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleVerifySmtp(bot.id)}
                                                    disabled={verifyingId === bot.id}
                                                    className="text-[10px] font-mono text-blue-500 hover:text-blue-400 uppercase transition-colors disabled:opacity-50"
                                                >
                                                    {verifyingId === bot.id ? "Verifying..." : "Verify Connection"}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(bot)}
                                                    className="p-1.5 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <InfoModal
                isOpen={infoModalOpen}
                onClose={() => setInfoModalOpen(false)}
                title={infoTitle}
                message={infoMessage}
            />

            <ConfirmModal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Decommission Bot"
                message={`Are you sure you want to decommission ${currentBot?.name}? This will stop any active broadcasts linked to this bot.`}
                confirmText="Decommission"
                variant="danger"
            />
        </div>
    );
}
