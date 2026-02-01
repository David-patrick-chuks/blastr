import { useState, useEffect, useRef } from "react";
import { Upload, FileText, Trash2, Search, Database, Eraser } from "lucide-react";
import { InfoModal, ConfirmModal } from "../../components/Modal";
import { agentService, knowledgeService } from "../../services/index";
import type { Agent, Document } from "../../types/index";

export function KnowledgeView() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [infoTitle, setInfoTitle] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const [activeTab, setActiveTab] = useState("documents");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");

    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedAgentId, setSelectedAgentId] = useState<string>("");
    const [documents, setDocuments] = useState<Document[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

    useEffect(() => {
        loadAgents();
    }, []);

    useEffect(() => {
        if (selectedAgentId) {
            loadDocuments();
        }
    }, [selectedAgentId]);

    const loadAgents = async () => {
        try {
            const data = await agentService.fetchAgents();
            setAgents(data);
            if (data.length > 0) setSelectedAgentId(data[0].id);
        } catch (error) {
            console.error("Failed to load agents:", error);
        }
    };

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const data = await knowledgeService.fetchDocuments(selectedAgentId);
            setDocuments(data);
        } catch (error) {
            console.error("Failed to load documents:", error);
        } finally {
            setLoading(false);
        }
    };

    const showInfo = (title: string, message: string) => {
        setInfoTitle(title);
        setInfoMessage(message);
        setInfoModalOpen(true);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedAgentId) return;

        setLoading(true);
        try {
            await knowledgeService.uploadDocument(selectedAgentId, file);
            showInfo("Success", "Document uploaded and indexed successfully.");
            loadDocuments();
        } catch (error) {
            showInfo("Error", "Failed to upload document.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await knowledgeService.deleteDocument(id);
            setDocuments(documents.filter((d: Document) => d.id !== id));
            showInfo("Deleted", "Document has been removed from the agent's memory.");
        } catch (error) {
            showInfo("Error", "Failed to delete document.");
        }
    };

    const handleClearKnowledge = async () => {
        if (!selectedAgentId) return;
        setLoading(true);
        try {
            await knowledgeService.clearAgentKnowledge(selectedAgentId);
            setDocuments([]);
            showInfo("Knowledge Cleared", "All documents have been removed for this agent.");
        } catch (error) {
            showInfo("Error", "Failed to clear knowledge base.");
        } finally {
            setLoading(false);
        }
    };

    const filteredDocuments = documents.filter((doc: Document) =>
        (doc.metadata?.filename || "Untitled").toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleYoutubeTrain = async () => {
        if (!youtubeUrl || !selectedAgentId) return;
        setLoading(true);
        try {
            await knowledgeService.trainFromYoutube(selectedAgentId, youtubeUrl);
            showInfo("Success", "YouTube video processed and indexed successfully.");
            setYoutubeUrl("");
            loadDocuments();
        } catch (error) {
            showInfo("Error", "Failed to process YouTube URL.");
        } finally {
            setLoading(false);
        }
    };

    const handleWebsiteCrawl = async () => {
        if (!websiteUrl || !selectedAgentId) return;
        setLoading(true);
        try {
            await knowledgeService.crawlWebsite(selectedAgentId, websiteUrl);
            showInfo("Success", "Website content crawled and indexed successfully.");
            setWebsiteUrl("");
            loadDocuments();
        } catch (error) {
            showInfo("Error", "Failed to crawl website.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold mb-1">Knowledge Base</h2>
                            <p className="text-zinc-500 text-sm">Manage the documents your agents use for context.</p>
                        </div>
                        <select
                            value={selectedAgentId}
                            onChange={(e) => setSelectedAgentId(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs py-2 px-3 outline-none focus:border-blue-500/50 transition-colors"
                        >
                            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".txt,.pdf,.docx,.doc,.csv,.mp3,.wav,.m4a,.ogg"
                        />
                        <button
                            disabled={loading || !selectedAgentId}
                            onClick={handleUploadClick}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-zinc-900 font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                            <Upload className="w-4 h-4" />
                            {loading ? 'PROCESSING...' : 'UPLOAD DOCUMENT'}
                        </button>
                        <button
                            disabled={loading || !selectedAgentId || documents.length === 0}
                            onClick={() => setClearConfirmOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/5 font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
                            title="Wipe everything"
                        >
                            <Eraser className="w-4 h-4" />
                            CLEAR BASE
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-zinc-800 flex gap-6">
                    <button
                        onClick={() => setActiveTab("documents")}
                        className={`pb-3 text-sm font-mono transition-colors ${activeTab === 'documents' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        DOCUMENTS
                    </button>
                    <button
                        onClick={() => setActiveTab("website")}
                        className={`pb-3 text-sm font-mono transition-colors ${activeTab === 'website' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        WEBSITE CRAWLER
                    </button>
                    <button
                        onClick={() => setActiveTab("youtube")}
                        className={`pb-3 text-sm font-mono transition-colors ${activeTab === 'youtube' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        YOUTUBE TRAINING
                    </button>
                </div>

                {activeTab === 'youtube' && (
                    <div className="border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-mono text-zinc-500 uppercase">YouTube Video URL</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none px-4 py-2 text-sm transition-colors"
                                />
                                <button
                                    onClick={handleYoutubeTrain}
                                    disabled={loading || !youtubeUrl}
                                    className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-zinc-900 font-bold text-sm transition-colors cursor-pointer disabled:opacity-50 font-mono"
                                >
                                    {loading ? 'TRAINING...' : 'START TRAINING'}
                                </button>
                            </div>
                            <p className="text-[10px] text-zinc-600 italic">Gemini will automatically transcribe and index the video content for RAG.</p>
                        </div>
                    </div>
                )}

                {activeTab === 'website' && (
                    <div className="border border-zinc-800 bg-zinc-900/40 p-6 space-y-4 mb-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-mono text-zinc-500 uppercase">Website URL</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    placeholder="https://example.com/about"
                                    className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none px-4 py-2 text-sm transition-colors"
                                />
                                <button
                                    onClick={handleWebsiteCrawl}
                                    disabled={loading || !websiteUrl}
                                    className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-zinc-900 font-bold text-sm transition-colors cursor-pointer disabled:opacity-50 font-mono"
                                >
                                    {loading ? 'CRAWLING...' : 'START CRAWL'}
                                </button>
                            </div>
                            <p className="text-[10px] text-zinc-600 italic">Gemini will intelligently extract and clean the content from this website for RAG.</p>
                        </div>
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="border border-zinc-800 bg-zinc-900/40">
                        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search indexed knowledge..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none pl-10 pr-4 py-2 text-xs w-80 transition-colors"
                                />
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                                <Database className="w-3 h-3" />
                                <span>{(documents.length * 1.5).toFixed(1)} MB USED</span>
                            </div>
                        </div>

                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">Name</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Date Uploaded</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50 text-sm">
                                {filteredDocuments.map((doc: Document) => (
                                    <tr key={doc.id} className="hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-900 text-zinc-400 group-hover:text-blue-400 transition-colors">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{doc.metadata?.filename || "Untitled"}</div>
                                                    <div className="text-[10px] text-zinc-500 font-mono">{doc.content.length} chars</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-mono px-2 py-0.5 border border-blue-500/30 text-blue-500 bg-blue-500/5`}>
                                                INDEXED
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-zinc-500">{new Date(doc.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="p-2 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <InfoModal
                isOpen={infoModalOpen}
                onClose={() => setInfoModalOpen(false)}
                title={infoTitle}
                message={infoMessage}
            />

            <ConfirmModal
                isOpen={clearConfirmOpen}
                onClose={() => setClearConfirmOpen(false)}
                onConfirm={handleClearKnowledge}
                title="Clear Knowledge Base"
                message={`Are you sure you want to permanently delete all ${documents.length} indexed documents for this agent? This action cannot be undone.`}
                confirmText="Clear Knowledge"
                variant="danger"
            />
        </>
    );
}
