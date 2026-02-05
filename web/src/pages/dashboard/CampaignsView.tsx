import { useState, useEffect } from "react";
import { Rocket, ExternalLink, Plus, Search, Trash2, Edit } from "lucide-react";
import { InfoModal, ConfirmModal } from "../../components/Modal";
import { CampaignModal } from "../../components/agents/CampaignModal";
import { campaignService } from "../../services/index";
import type { Campaign } from "../../types/index";

export function CampaignsView() {
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [infoTitle, setInfoTitle] = useState("");
    const [infoMessage, setInfoMessage] = useState("");

    const [agentModalOpen, setAgentModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        try {
            const data = await campaignService.fetchCampaigns() as Campaign[];
            setCampaigns(data);
        } catch (error) {
            console.error("Failed to load campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    const showInfo = (title: string, message: string) => {
        setInfoTitle(title);
        setInfoMessage(message);
        setInfoModalOpen(true);
    };

    const handleCreateClick = () => {
        setCurrentCampaign(null);
        setAgentModalOpen(true);
    };

    const handleEditClick = (campaign: Campaign) => {
        setCurrentCampaign(campaign);
        setAgentModalOpen(true);
    };

    const handleDeleteClick = (campaign: Campaign) => {
        setCurrentCampaign(campaign);
        setConfirmModalOpen(true);
    };

    const handleSaveAgent = async (formData: Partial<Campaign>) => {
        try {
            if (currentCampaign) {
                const updated = await campaignService.updateCampaign(currentCampaign.id, formData) as Campaign;
                setCampaigns(campaigns.map((c: Campaign) => c.id === updated.id ? updated : c));
                showInfo("Success", "Campaign updated successfully.");
            } else {
                const created = await campaignService.createCampaign(formData) as Campaign;
                setCampaigns([created, ...campaigns]);
                showInfo("Success", "New campaign created successfully.");
            }
        } catch (error) {
            showInfo("Error", "Failed to save campaign configuration.");
        }
    };

    const handleConfirmDelete = async () => {
        if (!currentCampaign) return;
        try {
            await campaignService.deleteCampaign(currentCampaign.id);
            setCampaigns(campaigns.filter((c: Campaign) => c.id !== currentCampaign.id));
            showInfo("Deleted", "Campaign has been removed from the platform.");
        } catch (error) {
            showInfo("Error", "Failed to delete campaign.");
        }
    };

    const filteredCampaigns = campaigns.filter((campaign: Campaign) =>
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewAgent = (campaign: Campaign) => {
        showInfo("Campaign Details", `Viewing ${campaign.name}. Template: ${campaign.template || 'N/A'}, Created: ${new Date(campaign.created_at || "").toLocaleDateString()}`);
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold">Campaigns</h2>
                    <button
                        onClick={handleCreateClick}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-zinc-900 font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-blue-500/20 w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4" />
                        CREATE CAMPAIGN
                    </button>
                </div>

                <div className="border border-zinc-800 bg-zinc-900/40 overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-900/60">
                        <div className="relative w-full lg:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search campaigns..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none pl-10 pr-4 py-2 text-xs w-full transition-colors cursor-text"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase mr-2 whitespace-nowrap">Sort by:</span>
                            <select className="bg-zinc-950 border border-zinc-800 text-[10px] font-mono p-1 outline-none text-zinc-400 cursor-pointer hover:border-zinc-700 transition-colors w-full md:w-auto">
                                <option>DATE CREATED</option>
                                <option>STATUS</option>
                                <option>ALPHABETICAL</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead>
                                <tr className="border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">Campaign Details</th>
                                    <th className="px-6 py-4 font-medium">Subject Line</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Recipients</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 font-mono">
                                            Loading campaigns...
                                        </td>
                                    </tr>
                                ) : filteredCampaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 font-mono">
                                            No campaigns found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCampaigns.map((campaign: Campaign) => (
                                        <tr key={campaign.id} className="hover:bg-zinc-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-900 text-blue-400">
                                                        <Rocket className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{campaign.name}</div>
                                                        <div className="text-[10px] text-zinc-500 font-mono uppercase">ID: {campaign.id.split('-')[0]}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs">{campaign.role.length > 30 ? campaign.role.substring(0, 30) + '...' : campaign.role}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1 h-1 rounded-full animate-pulse ${campaign.status === 'Active' ? 'bg-blue-400' : 'bg-amber-400'}`} />
                                                    <span className="font-mono text-xs uppercase tracking-tight">{campaign.status === 'Active' ? 'READY' : campaign.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                                                {campaign.sent_count || 0} / {campaign.total_recipients || 0}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewAgent(campaign)}
                                                        className="p-1.5 hover:text-blue-400 transition-colors cursor-pointer"
                                                        title="View campaign details"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditClick(campaign)}
                                                        className="p-1.5 hover:text-white transition-colors cursor-pointer"
                                                        title="Edit campaign"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(campaign)}
                                                        className="p-1.5 hover:text-red-400 transition-colors cursor-pointer"
                                                        title="Delete campaign"
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
            </div>

            <InfoModal
                isOpen={infoModalOpen}
                onClose={() => setInfoModalOpen(false)}
                title={infoTitle}
                message={infoMessage}
            />

            <CampaignModal
                isOpen={agentModalOpen}
                onClose={() => setAgentModalOpen(false)}
                onSave={handleSaveAgent}
                agent={currentCampaign as any}
            />

            <ConfirmModal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Campaign"
                message={`Are you sure you want to permanently delete ${currentCampaign?.name}? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </>
    );
}
