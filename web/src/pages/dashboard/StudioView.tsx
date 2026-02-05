import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles, Loader2, Info, LayoutDashboard, ChevronRight, ChevronDown } from "lucide-react";
import { campaignService, authService } from "../../services/index";
import { useSocket } from "../../hooks/useSocket";
import type { Campaign, ChatMessage } from "../../types/index";

export function StudioView() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', text: 'Hello! I am your BlastAgent AI composer. Select a campaign to start refining your email templates.' }
    ]);
    const [input, setInput] = useState('');
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [editableInstructions, setEditableInstructions] = useState('');
    const [loading, setLoading] = useState(false);
    const [savingInstructions, setSavingInstructions] = useState(false);
    const [userId, setUserId] = useState<string | undefined>();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { emit, on } = useSocket(userId);

    useEffect(() => {
        authService.getCurrentUser().then(user => setUserId(user?.id));
        loadCampaigns();
    }, []);

    useEffect(() => {
        const c1 = on('CHAT_CHUNK', (payload: { chunk: string }) => {
            setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'assistant') {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                        ...last,
                        text: last.text + payload.chunk
                    };
                    return newMessages;
                }
                return prev;
            });
        });

        const c2 = on('CHAT_COMPLETE', (payload: { sources?: string[] }) => {
            setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'assistant') {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                        ...last,
                        sources: payload.sources
                    };
                    return newMessages;
                }
                return prev;
            });
            setLoading(false);
        });

        const c3 = on('CHAT_ERROR', (payload: { error: string }) => {
            setMessages(prev => [...prev, { role: 'assistant', text: `ERROR: ${payload.error}` }]);
            setLoading(false);
        });

        return () => {
            c1?.();
            c2?.();
            c3?.();
        };
    }, [on]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadCampaigns = async () => {
        try {
            const data = await campaignService.fetchCampaigns() as Campaign[];
            setCampaigns(data);
            if (data.length > 0) {
                const first = data[0];
                setSelectedCampaign(first);
                setEditableInstructions(first.system_instruction || "");
            }
        } catch (error) {
            console.error("Failed to load campaigns:", error);
        }
    };

    const handleSend = async () => {
        if (!input || !selectedCampaign || !userId) return;

        const userMsg: ChatMessage = { role: 'user', text: input };
        const assistantPlaceholder: ChatMessage = { role: 'assistant', text: '' };

        setMessages(prev => [...prev, userMsg, assistantPlaceholder]);
        setInput('');
        setLoading(true);

        emit('CHAT_STREAM_REQUEST', {
            agentId: selectedCampaign.id,
            message: input,
            history: messages.slice(-10), // Send last 10 messages for context
            userId
        });
    };

    const handleUpdateInstructions = async () => {
        if (!selectedCampaign) return;
        setSavingInstructions(true);
        try {
            const updated = await campaignService.updateCampaign(selectedCampaign.id, {
                ...selectedCampaign,
                system_instruction: editableInstructions
            }) as Campaign;
            setSelectedCampaign(updated);
            // Updated successfully
        } catch (error) {
            console.error("Failed to update instructions:", error);
        } finally {
            setSavingInstructions(false);
        }
    };

    const onCampaignSelect = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setEditableInstructions(campaign.system_instruction || "");
    };

    return (
        <div className="h-full lg:h-[calc(100vh-160px)] flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <h2 className="text-xl font-bold">AI Email Composer</h2>
                    {campaigns.length > 0 ? (
                        <div className="relative group">
                            <div className="flex items-center gap-2 h-8 px-3 border border-zinc-800 bg-zinc-900/60 text-xs font-mono text-zinc-400 cursor-pointer hover:border-zinc-700 transition-all">
                                CAMPAIGN: <span className="text-blue-400">{selectedCampaign?.name || 'Select Campaign'}</span>
                                <ChevronDown className="w-3 h-3" />
                            </div>
                            <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] bg-zinc-950 border border-zinc-800 hidden group-hover:block z-50 shadow-2xl">
                                {campaigns.map(camp => (
                                    <div
                                        key={camp.id}
                                        onClick={() => onCampaignSelect(camp)}
                                        className={`px-4 py-2 hover:bg-zinc-900 cursor-pointer text-xs font-mono transition-colors ${selectedCampaign?.id === camp.id ? 'text-blue-400 bg-blue-500/5' : 'text-zinc-400 hover:text-blue-400'}`}
                                    >
                                        {camp.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-red-500 font-mono">No campaigns found. Create one first.</div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-600">ENGINE: GEMINI 2.0 FLASH</span>
                    <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-ping' : 'bg-blue-500'}`} />
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col border border-zinc-800 bg-zinc-900/20 backdrop-blur rounded-sm">
                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-4 ${msg.role === 'assistant' ? '' : 'flex-row-reverse text-right'}`}>
                                <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border ${msg.role === 'assistant' ? 'border-blue-500/30 bg-blue-500/5 text-blue-400' : 'border-zinc-700 bg-zinc-800 text-zinc-300'}`}>
                                    {msg.role === 'assistant' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                </div>
                                <div className="max-w-[80%]">
                                    <div className={`p-4 ${msg.role === 'assistant' ? 'bg-zinc-900/80 border border-zinc-800' : 'bg-blue-500 text-zinc-900 font-medium whitespace-pre-wrap'}`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                    <span className="text-[10px] font-mono text-zinc-600 mt-2 block uppercase">{msg.role === 'assistant' ? 'COMPOSER' : 'USER'}</span>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-blue-500/30 bg-blue-500/5 text-blue-400">
                                    <Sparkles className="w-4 h-4 animate-spin" />
                                </div>
                                <div className="p-4 bg-zinc-900/80 border border-zinc-800">
                                    <p className="text-sm text-zinc-500 animate-pulse">Generating variations...</p>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
                        <div className="relative">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
                                type="text"
                                placeholder={selectedCampaign ? `Refine email for ${selectedCampaign.name}...` : "Select a campaign to start composing..."}
                                disabled={!selectedCampaign || loading}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500/50 outline-none px-4 py-3 pr-12 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!selectedCampaign || loading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Side Controls */}
                <div className="w-80 space-y-4 overflow-y-auto pr-2">
                    <div className="p-4 border border-zinc-800 bg-zinc-900/40">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> Email Template
                            </h3>
                            <button
                                onClick={handleUpdateInstructions}
                                disabled={savingInstructions || !selectedCampaign || editableInstructions === selectedCampaign.system_instruction}
                                className="text-[10px] font-mono text-blue-500 hover:text-blue-400 disabled:opacity-30 transition-all uppercase cursor-pointer"
                            >
                                {savingInstructions ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                        <textarea
                            className="w-full h-40 lg:h-80 bg-zinc-950 border border-zinc-800 text-xs font-mono p-3 focus:border-blue-500/50 outline-none resize-none transition-all"
                            value={editableInstructions}
                            onChange={(e) => setEditableInstructions(e.target.value)}
                            placeholder="Draft your master template here..."
                            disabled={!selectedCampaign}
                        />
                        <p className="text-[10px] text-zinc-600 italic mt-2">Use {'{{name}}'} to insert recipient specifics automatically.</p>
                    </div>

                    <div className="p-4 border border-zinc-800 bg-zinc-900/40">
                        <h3 className="text-xs font-mono text-zinc-500 mb-4 uppercase tracking-wider">Parameters</h3>
                        <div className="space-y-4 text-zinc-500">
                            <ParameterSlider label="Temperature" value="0.7" />
                            <ParameterSlider label="Max Output Tokens" value="2048" />
                            <ParameterSlider label="Top P" value="0.95" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ParameterSlider({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-500 uppercase">{label}</span>
                <span className="text-blue-500">{value}</span>
            </div>
            <div className="h-1 bg-zinc-800 relative">
                <div className="absolute top-0 left-0 h-full bg-blue-500/40 w-[70%]" />
            </div>
        </div>
    );
}
