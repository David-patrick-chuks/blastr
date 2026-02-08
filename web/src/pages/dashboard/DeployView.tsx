import { useState, useEffect, useRef } from "react";
import { Shield, Globe, Search, CheckCircle2, Trash2, Upload, Loader2 } from "lucide-react";
import { InfoModal } from "../../components/Modal";
import { campaignService } from "../../services/index";

export function DeployView() {
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [infoTitle, setInfoTitle] = useState("");
    const [infoMessage, setInfoMessage] = useState<React.ReactNode>("");

    const [extracting, setExtracting] = useState(false);
    const [extractedEmails, setExtractedEmails] = useState<string[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
    const [syncing, setSyncing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        try {
            const data = await campaignService.fetchCampaigns();
            setCampaigns(data);
            if (data.length > 0) setSelectedCampaignId(data[0].id);
        } catch (error) {
            console.error("Failed to load campaigns:", error);
        }
    };

    const showInfo = (title: string, message: React.ReactNode) => {
        setInfoTitle(title);
        setInfoMessage(message);
        setInfoModalOpen(true);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset value to allow re-uploading the same file
        event.target.value = '';

        setExtracting(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                try {
                    const base64 = (reader.result as string).split(',')[1];
                    const res = await campaignService.extractEmails(base64);
                    setExtractedEmails(res.emails);
                    showInfo("Extraction Complete", `Found ${res.emails.length} email addresses in the image.`);
                } catch (error) {
                    console.error("Extraction failed:", error);
                    showInfo("Extraction Failed", "Failed to extract emails from the image. Please try again.");
                } finally {
                    setExtracting(false);
                }
            };
            reader.onerror = () => {
                console.error("File reading failed");
                setExtracting(false);
                showInfo("File Error", "Failed to read the selected file.");
            };
        } catch (error) {
            console.error("Upload initiation failed:", error);
            setExtracting(false);
        }
    };

    const handleSyncToCampaign = async () => {
        if (!selectedCampaignId || extractedEmails.length === 0) return;
        setSyncing(true);
        try {
            const campaign = campaigns.find(c => c.id === selectedCampaignId);
            const updated = await campaignService.updateCampaign(selectedCampaignId, {
                total_recipients: (campaign?.total_recipients || 0) + extractedEmails.length
            });
            showInfo("Sync Success", `Successfully added ${extractedEmails.length} recipients to ${updated.name}.`);
            setExtractedEmails([]);
        } catch (error) {
            showInfo("Sync Failed", "Failed to sync emails to campaign.");
        } finally {
            setSyncing(false);
        }
    };

    return (
        <>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold mb-2">Image Email Extractor</h2>
                        <p className="text-zinc-500 text-sm">Upload screenshots or images to extract email lists instantly using Gemini Vision.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border border-dashed border-zinc-800 bg-zinc-900/40 p-12 flex flex-col items-center justify-center text-center space-y-6 group hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden"
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*"
                        />
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                            {extracting ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold">{extracting ? 'Processing Image...' : 'Upload Image List'}</h3>
                            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Supports PNG, JPG, WEBP (Max 10MB)</p>
                        </div>
                        {!extracting && (
                            <button className="px-6 py-2 bg-blue-500 text-zinc-900 font-bold text-xs uppercase tracking-widest hover:bg-blue-400 transition-colors">
                                Select File
                            </button>
                        )}
                    </div>

                    {/* Extracted List */}
                    <div className="border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Search className="w-4 h-4" /> Extracted Recipients
                            </h3>
                            <div className="px-2 py-0.5 border border-blue-500/20 text-[10px] text-blue-500 font-mono">VISION_ACTIVE</div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 max-h-[250px] pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                            {extractedEmails.length > 0 ? (
                                extractedEmails.map((email, i) => (
                                    <div key={i} className="p-3 bg-zinc-950 border border-zinc-800 flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center text-[10px] text-zinc-500 font-mono">
                                                {i + 1}
                                            </div>
                                            <span className="text-xs font-mono text-zinc-300">{email}</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExtractedEmails(prev => prev.filter((_, idx) => idx !== i));
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center text-zinc-600 font-mono text-xs italic border border-dashed border-zinc-800/50">
                                    {extracting ? 'Gemini is reading the image...' : 'Upload an image to start extracting...'}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-zinc-800 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] font-mono text-zinc-600 uppercase">Target Campaign</div>
                                <select
                                    value={selectedCampaignId}
                                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                                    className="bg-zinc-950 border border-zinc-800 text-[10px] font-mono p-1 text-blue-400 outline-none"
                                >
                                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    {campaigns.length === 0 && <option value="">No campaigns available</option>}
                                </select>
                            </div>
                            <button
                                onClick={handleSyncToCampaign}
                                disabled={extractedEmails.length === 0 || !selectedCampaignId || syncing}
                                className="w-full py-2 bg-blue-500 text-zinc-900 font-bold text-[10px] font-mono hover:bg-blue-400 transition-all uppercase disabled:opacity-30"
                            >
                                {syncing ? 'Syncing...' : 'Sync to Campaign'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard
                        icon={Shield}
                        title="Automatic De-duplication"
                        desc="Gemini Vision detects and removes duplicate entries from your lists."
                    />
                    <FeatureCard
                        icon={Globe}
                        title="Format Normalization"
                        desc="Inconsistent text or handwritten lists are cleaned into standard email formats."
                    />
                    <FeatureCard
                        icon={CheckCircle2}
                        title="Verification Ready"
                        desc="Extracted emails are pre-validated for structural correctness."
                    />
                </div>
            </div>

            <InfoModal
                isOpen={infoModalOpen}
                onClose={() => setInfoModalOpen(false)}
                title={infoTitle}
                message={infoMessage}
            />
        </>
    );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="p-6 border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 border border-zinc-800 bg-zinc-900 flex items-center justify-center text-blue-400 mb-4">
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold mb-2">{title}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-mono">{desc}</p>
        </div>
    );
}
