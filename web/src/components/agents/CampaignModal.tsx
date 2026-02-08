import { useState, useEffect } from "react";
import { Modal } from "../Modal";
import type { Campaign } from "../../types/index";
import { apiClient } from "../../services/index";

export function CampaignModal({ isOpen, onClose, onSave, agent: campaign }: { isOpen: boolean, onClose: () => void, onSave: (campaign: Partial<Campaign>) => Promise<void>, agent: Campaign | null }) {
    const [formData, setFormData] = useState<Partial<Campaign>>({
        name: "",
        role: "",
        system_instruction: "",
        template: "",
        status: "Active",
        agent_id: ""
    });
    const [bots, setBots] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        apiClient.get('/agents').then((res: any) => {
            const activeBots = res.filter((bot: any) => bot.status === 'active');
            setBots(activeBots);
        });
    }, []);

    useEffect(() => {
        if (campaign) {
            setFormData({
                name: campaign.name,
                role: campaign.role,
                system_instruction: campaign.system_instruction || "",
                template: campaign.template || "",
                status: campaign.status,
                agent_id: campaign.agent_id || ""
            });
        } else {
            setFormData({
                name: "",
                role: "",
                system_instruction: "",
                template: "",
                status: "Active",
                agent_id: bots.length > 0 ? bots[0].id : ""
            });
        }
    }, [campaign, isOpen, bots]);

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
        <Modal isOpen={isOpen} onClose={onClose} title={campaign ? "Edit Campaign" : "Create New Campaign"} size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase">Campaign Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Q1 Newsletter"
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none px-4 py-2 text-sm transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase">Transmission Bot</label>
                        <select
                            required
                            value={formData.agent_id}
                            onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none px-4 py-2 text-sm transition-all text-blue-400"
                        >
                            <option value="" disabled>Select a Bot</option>
                            {bots.map(bot => (
                                <option key={bot.id} value={bot.id}>{bot.name} ({bot.email})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Subject Line / Purpose</label>
                    <input
                        required
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="e.g. Exclusive Product Update"
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none px-4 py-2 text-sm transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Email Template (Draft)</label>
                    <textarea
                        required
                        value={formData.system_instruction}
                        onChange={(e) => setFormData({ ...formData, system_instruction: e.target.value })}
                        placeholder="Hi, We have something special for you..."
                        className="w-full h-40 bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none p-4 text-sm resize-none transition-all font-mono"
                    />
                    <p className="text-[10px] text-zinc-600 italic">This will be the base for AI personalization. Use brackets like {'{{name}}'} for variables.</p>
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
                        {saving ? "Saving..." : "Save Campaign"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
