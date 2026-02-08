import { useState, useEffect } from "react";
import { Shield, Key, Bell, Loader2 } from "lucide-react";
import { InfoModal } from "../../components/Modal";
import { authService, apiClient } from "../../services/index";
import { Skeleton } from "../../components/shared/index";

export function SettingsView() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [preferences, setPreferences] = useState({
        trackingEnabled: true,
        deduplicateEmails: true,
        smartRateLimit: true,
        emailSummaries: true,
        retryFailedSends: false
    });

    const [smtpSettings, setSmtpSettings] = useState({
        host: "smtp.gmail.com",
        port: "587",
        user: "",
        pass: "",
        secure: true
    });

    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [infoMessage, setInfoMessage] = useState("");

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await authService.getProfile();
            setProfile(data);
            if (data.preferences && Object.keys(data.preferences).length > 0) {
                setPreferences(prev => ({ ...prev, ...data.preferences }));
                if (data.preferences.smtp) {
                    setSmtpSettings(prev => ({ ...prev, ...data.preferences.smtp }));
                }
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const showInfo = (message: string) => {
        setInfoMessage(message);
        setInfoModalOpen(true);
    };

    const handleUpdateKey = (keyType: string) => {
        showInfo(`Update ${keyType} key is managed via environment variables for maximum security.`);
    };

    const testConnection = async () => {
        if (!smtpSettings.host || !smtpSettings.user || !smtpSettings.pass) {
            showInfo("Please fill in SMTP details first.");
            return;
        }

        setTesting(true);
        try {
            await authService.updateProfile({ preferences: { ...profile?.preferences, smtp: smtpSettings } });

            const response = await apiClient.post<any>('/settings/test-smtp', smtpSettings);
            if (response.success) {
                showInfo("SUCCESS: SMTP connection verified. Your broadcast engine is ready.");
            } else {
                showInfo(`FAILED: ${response.error || "Connection refused."}`);
            }
        } catch (e: any) {
            showInfo(`ERROR: ${e.response?.data?.error || "Failed to initiate test sequence."}`);
        } finally {
            setTesting(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await authService.updateProfile({ preferences });
            showInfo("Settings updated successfully.");
        } catch (error) {
            showInfo("Failed to synchronize settings.");
        } finally {
            setSaving(false);
        }
    };



    const togglePref = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) {
        return (
            <div className="max-w-4xl space-y-12">
                <div>
                    <Skeleton width={120} height={24} className="mb-2" />
                    <Skeleton width={400} height={14} />
                </div>
                <div className="space-y-12">
                    {[1, 2].map(i => (
                        <div key={i} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8 border-b border-zinc-900/50">
                            <div className="lg:col-span-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <Skeleton width={32} height={32} />
                                    <Skeleton width={150} height={18} />
                                </div>
                                <Skeleton width="100%" height={12} />
                            </div>
                            <div className="lg:col-span-2 space-y-4">
                                <Skeleton width="100%" height={40} />
                                <Skeleton width="100%" height={40} />
                                <Skeleton width="100%" height={40} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-4xl space-y-12">
                <div>
                    <h2 className="text-xl font-bold mb-2">Settings</h2>
                    <p className="text-zinc-500 text-sm">Manage your platform configuration, deliverability and team access.</p>
                </div>

                <div className="space-y-6">
                    <SettingsSection
                        icon={Shield}
                        title="Blast Engine Preferences"
                        desc="Control how your campaigns are processed and delivered."
                    >
                        <div className="space-y-4">
                            <ToggleOption label="Track email opens and clicks" enabled={preferences.trackingEnabled} onToggle={() => togglePref('trackingEnabled')} />
                            <ToggleOption label="Automatically deduplicate recipient lists" enabled={preferences.deduplicateEmails} onToggle={() => togglePref('deduplicateEmails')} />
                            <ToggleOption label="Enable Smart Rate Limiting" enabled={preferences.smartRateLimit} onToggle={() => togglePref('smartRateLimit')} />
                            <ToggleOption label="Retry failed transmissions automatically" enabled={preferences.retryFailedSends} onToggle={() => togglePref('retryFailedSends')} />
                        </div>
                    </SettingsSection>

                    <SettingsSection
                        icon={Key}
                        title="SMTP Configuration"
                        desc="Settings for your outbound mail server (Gmail/SendGrid/etc)."
                    >
                        <div className="space-y-4 p-4 bg-zinc-950/30 border border-zinc-800/50">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">SMTP Host</label>
                                    <input
                                        type="text"
                                        value={smtpSettings.host}
                                        onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs focus:border-blue-500/50 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Port</label>
                                    <input
                                        type="text"
                                        value={smtpSettings.port}
                                        onChange={(e) => setSmtpSettings({ ...smtpSettings, port: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs focus:border-blue-500/50 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Username</label>
                                <input
                                    type="text"
                                    placeholder="your-email@gmail.com"
                                    value={smtpSettings.user}
                                    onChange={(e) => setSmtpSettings({ ...smtpSettings, user: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs focus:border-blue-500/50 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">App Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••••••••••"
                                    value={smtpSettings.pass}
                                    onChange={(e) => setSmtpSettings({ ...smtpSettings, pass: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs focus:border-blue-500/50 outline-none"
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    onClick={testConnection}
                                    disabled={testing || saving}
                                    className="w-full py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono hover:bg-blue-500/20 transition-all uppercase disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {(testing || saving) && <Loader2 className="w-3 h-3 animate-spin" />}
                                    {testing ? "Testing..." : (saving ? "Saving..." : "Save & Test Connection")}
                                </button>
                            </div>
                        </div>
                    </SettingsSection>

                    <SettingsSection
                        icon={Bell}
                        title="API Credentials"
                        desc="Configuration for Gemini and deliverability data keys."
                    >
                        <div className="space-y-4 p-4 bg-zinc-950/30 border border-zinc-800/50">
                            <div className="flex justify-between items-center text-xs">
                                <div>
                                    <div className="font-bold text-white">Gemini 3.0 Flash Key</div>
                                    <div className="text-[10px] font-mono text-zinc-500">Primary reasoning engine</div>
                                </div>
                                <button
                                    onClick={() => handleUpdateKey('Gemini')}
                                    className="px-4 py-1.5 border border-zinc-800 text-zinc-500 text-[10px] font-mono hover:border-zinc-700 transition-all"
                                >
                                    MANAGED
                                </button>
                            </div>
                        </div>
                    </SettingsSection>

                    <div className="pt-8 border-t border-zinc-900 flex justify-end gap-4">
                        <button
                            onClick={handleSaveSettings}
                            disabled={saving}
                            className="px-8 py-3 bg-blue-500 text-zinc-900 font-bold font-mono text-xs hover:bg-blue-400 transition-all uppercase cursor-pointer flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Engine Preferences'}
                        </button>
                    </div>
                </div>
            </div>

            <InfoModal
                isOpen={infoModalOpen}
                onClose={() => setInfoModalOpen(false)}
                title="Settings"
                message={infoMessage}
            />
        </>
    );
}

function SettingsSection({ icon: Icon, title, desc, children }: any) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8 border-b border-zinc-900/50 last:border-0">
            <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 border border-zinc-800 bg-zinc-900 flex items-center justify-center text-blue-400">
                        <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-white">{title}</h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed font-mono uppercase tracking-tight">{desc}</p>
            </div>
            <div className="lg:col-span-2">
                {children}
            </div>
        </div>
    );
}

function ToggleOption({ label, enabled = false, onToggle }: { label: string, enabled?: boolean, onToggle: () => void }) {
    return (
        <div className="flex justify-between items-center p-4 border border-zinc-800/50 bg-zinc-950/30">
            <span className="text-sm text-zinc-400">{label}</span>
            <div
                onClick={onToggle}
                className={`w-10 h-5 relative cursor-pointer transition-colors ${enabled ? 'bg-blue-500/20' : 'bg-zinc-800'}`}
            >
                <div className={`absolute top-1 w-3 h-3 transition-all ${enabled ? 'right-1 bg-blue-500' : 'left-1 bg-zinc-500'}`} />
            </div>
        </div>
    );
}
