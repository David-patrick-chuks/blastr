import { useState, useEffect } from 'react';
import { X, Save, MessageSquare } from 'lucide-react';
import { agentService } from '../../services/index';

interface WhatsAppConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    agentId: string;
    initialConfig: any;
}

export function WhatsAppConfigModal({ isOpen, onClose, agentId, initialConfig }: WhatsAppConfigModalProps) {
    const [replyToGroups, setReplyToGroups] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setReplyToGroups(initialConfig?.reply_to_groups === 'true' || initialConfig?.reply_to_groups === true);
        }
    }, [isOpen, initialConfig]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await agentService.updateIntegrationConfig(agentId, 'whatsapp', {
                reply_to_groups: replyToGroups
            });
            onClose();
        } catch (error) {
            console.error('Failed to save config:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        WhatsApp Configuration
                    </h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800">
                        <div>
                            <h3 className="text-sm font-bold text-zinc-200">Group Messages</h3>
                            <p className="text-xs text-zinc-500 mt-1">Allow agent to reply in group chats</p>
                        </div>
                        <button
                            onClick={() => setReplyToGroups(!replyToGroups)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${replyToGroups ? 'bg-blue-500' : 'bg-zinc-700'}`}
                        >
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${replyToGroups ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-black font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4" /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
