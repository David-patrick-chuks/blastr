import { Modal } from "../Modal";
import { useState } from "react";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    platform: string;
    onConnect: (creds: any) => Promise<void>;
}

export function PlatformAuthModal({ isOpen, onClose, platform, onConnect }: AuthModalProps) {
    const [creds, setCreds] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const renderFields = () => {
        switch (platform.toLowerCase()) {
            case 'telegram':
                return (
                    <Field label="Bot Token" value={creds.token || ''} onChange={(v: string) => setCreds({ ...creds, token: v })} placeholder="123456:ABC..." />
                );
            case 'discord':
                return (
                    <Field label="Bot Token" value={creds.token || ''} onChange={(v: string) => setCreds({ ...creds, token: v })} placeholder="MTIz..." />
                );
            case 'twitter':
                return (
                    <div className="space-y-4">
                        <Field label="API Key" value={creds.apiKey || ''} onChange={(v: string) => setCreds({ ...creds, apiKey: v })} placeholder="Consumer Key" />
                        <Field label="API Secret" value={creds.apiSecret || ''} onChange={(v: string) => setCreds({ ...creds, apiSecret: v })} placeholder="Consumer Secret" />
                        <Field label="Access Token" value={creds.accessToken || ''} onChange={(v: string) => setCreds({ ...creds, accessToken: v })} placeholder="User Token" />
                        <Field label="Access Secret" value={creds.accessSecret || ''} onChange={(v: string) => setCreds({ ...creds, accessSecret: v })} placeholder="User Secret" />
                    </div>
                );
            case 'instagram':
                return (
                    <Field label="Access Token" value={creds.token || ''} onChange={(v: string) => setCreds({ ...creds, token: v })} placeholder="Meta Graph Token" />
                );
            case 'whatsapp':
                return <p className="text-zinc-400 text-sm leading-relaxed">WhatsApp integration uses QR code pairing. Click "Establish Connection" to generate your dynamic pairing code.</p>;
            case 'slack':
                return (
                    <div className="space-y-4">
                        <Field label="Bot Token" value={creds.token || ''} onChange={(v: string) => setCreds({ ...creds, token: v })} placeholder="xoxb-..." />
                        <Field label="Signing Secret" value={creds.signingSecret || ''} onChange={(v: string) => setCreds({ ...creds, signingSecret: v })} placeholder="secret..." />
                        <Field label="App Token" value={creds.appToken || ''} onChange={(v: string) => setCreds({ ...creds, appToken: v })} placeholder="xapp-..." />
                    </div>
                );
            case 'gmail':
                return (
                    <Field label="Target Email Address" value={creds.email || ''} onChange={(v: string) => setCreds({ ...creds, email: v })} placeholder="user@gmail.com" />
                );
            case 'notion':
                return (
                    <div className="space-y-4">
                        <Field label="Integration Secret" value={creds.token || ''} onChange={(v: string) => setCreds({ ...creds, token: v })} placeholder="secret_..." />
                        <Field label="Database ID" value={creds.databaseId || ''} onChange={(v: string) => setCreds({ ...creds, databaseId: v })} placeholder="Optional: 32-char ID" />
                    </div>
                );
            default:
                return <p className="text-zinc-500 italic">No specific configuration available for this platform yet.</p>;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onConnect(creds);
            onClose();
        } catch (error) {
            console.error("Connection failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Connect to ${platform}`} size="md">
            <form onSubmit={handleSubmit} className="space-y-6">
                {renderFields()}
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-zinc-800 text-zinc-400 font-mono text-xs uppercase hover:text-white transition-all cursor-pointer">Cancel</button>
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-zinc-900 font-bold font-mono text-xs uppercase transition-all disabled:opacity-50 cursor-pointer">
                        {loading ? 'Connecting...' : 'Establish Connection'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string, onChange: (v: string) => void, placeholder: string, type?: string }) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase">{label}</label>
            <input
                required
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none px-4 py-2 text-sm font-mono text-white transition-all"
            />
        </div>
    );
}
