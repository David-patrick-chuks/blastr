import { useState, useEffect } from "react";
import { Modal } from "../Modal";
import type { Agent } from "../../types/index";

export function BotModal({ isOpen, onClose, onSave, bot }: { isOpen: boolean, onClose: () => void, onSave: (bot: Partial<Agent>) => Promise<void>, bot: Agent | null }) {
    const [formData, setFormData] = useState<Partial<Agent>>({
        name: "",
        email: "",
        smtp_host: "smtp.gmail.com",
        smtp_port: 587,
        smtp_user: "",
        smtp_pass: "",
        smtp_secure: true,
        daily_limit: 500
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (bot) {
            setFormData({
                name: bot.name,
                email: bot.email,
                smtp_host: bot.smtp_host,
                smtp_port: bot.smtp_port,
                smtp_user: bot.smtp_user,
                smtp_pass: bot.smtp_pass,
                smtp_secure: bot.smtp_secure,
                daily_limit: bot.daily_limit
            });
        } else {
            setFormData({
                name: "",
                email: "",
                smtp_host: "smtp.gmail.com",
                smtp_port: 587,
                smtp_user: "",
                smtp_pass: "",
                smtp_secure: true,
                daily_limit: 500
            });
        }
    }, [bot, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={bot ? "Edit Bot" : "Create New Bot"} size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase">Bot Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Sales Agent Alpha"
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none px-4 py-2 text-sm transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase">Email Address</label>
                        <input
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="agent@example.com"
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none px-4 py-2 text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase">SMTP Host</label>
                        <input
                            required
                            type="text"
                            value={formData.smtp_host}
                            onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none px-4 py-2 text-sm transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase">SMTP Port</label>
                        <input
                            required
                            type="number"
                            value={formData.smtp_port}
                            onChange={(e) => setFormData({ ...formData, smtp_port: parseInt(e.target.value) })}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none px-4 py-2 text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase">SMTP User</label>
                        <input
                            required
                            type="text"
                            value={formData.smtp_user}
                            onChange={(e) => setFormData({ ...formData, smtp_user: e.target.value.replace(/\s/g, "") })}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none px-4 py-2 text-sm transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase">App Password</label>
                        <input
                            required
                            type="password"
                            value={formData.smtp_pass}
                            placeholder="••••••••••••••••"
                            onChange={(e) => setFormData({ ...formData, smtp_pass: e.target.value.replace(/\s/g, "") })}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none px-4 py-2 text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Daily Sending Limit</label>
                    <input
                        required
                        type="number"
                        value={formData.daily_limit}
                        onChange={(e) => setFormData({ ...formData, daily_limit: parseInt(e.target.value) })}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none px-4 py-2 text-sm transition-all"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-zinc-800 text-zinc-400 hover:text-white transition-all font-mono text-xs uppercase"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-zinc-900 font-bold transition-all font-mono text-xs uppercase disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Bot"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
