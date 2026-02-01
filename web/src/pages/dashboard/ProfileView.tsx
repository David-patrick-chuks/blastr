import { useState, useEffect } from 'react';
import { User, Shield, Save, LogOut, Terminal, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/index';
import type { UserProfile } from '../../services/index';

export function ProfileView() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        avatar_url: '',
        preferences: {}
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await authService.getProfile();
            setProfile(data);
            setFormData({
                full_name: data.full_name || '',
                avatar_url: data.avatar_url || '',
                preferences: data.preferences || {}
            });
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await authService.updateProfile(formData);
            setMessage({ type: 'success', text: 'Identity metadata synchronized successfully.' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to sync identity.' });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) return <div className="p-8 font-mono text-zinc-500 uppercase tracking-widest">Accessing core identity services...</div>;

    return (
        <div className="max-w-2xl space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold mb-2">Subject Profile</h2>
                    <p className="text-zinc-500 text-sm">Identity metadata and system-wide configuration.</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 border border-red-500/20 text-red-500 hover:bg-red-500/5 text-xs font-bold transition-all uppercase tracking-widest"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Terminate session
                </button>
            </div>

            <div className="border border-zinc-800 bg-zinc-900/40 p-8 space-y-8">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 border border-zinc-800 bg-zinc-950 flex items-center justify-center relative group overflow-hidden">
                        {formData.avatar_url ? (
                            <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-8 h-8 text-zinc-700" />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                            <span className="text-[8px] font-mono uppercase tracking-tighter">Edit</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-mono text-blue-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Verified Identity
                        </div>
                        <h3 className="text-xl font-bold">{formData.full_name || 'Anonymous User'}</h3>
                        <p className="text-zinc-500 text-xs font-mono">{profile?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 pt-4 border-t border-zinc-800/50">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Full Name / Alias</label>
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-white/20 outline-none px-4 py-3 text-sm transition-all font-mono"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Avatar Resource URL</label>
                        <input
                            type="text"
                            value={formData.avatar_url}
                            onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-white/20 outline-none px-4 py-3 text-sm transition-all font-mono"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/50">
                    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Kernel Debugger</h4>
                    <div className="p-4 bg-zinc-950 border border-zinc-800 font-mono text-[10px] whitespace-pre text-blue-500/80">
                        {JSON.stringify({
                            id: profile?.id,
                            session_established: profile?.updated_at,
                            auth_provider: 'SUPABASE_CORE',
                            secure_enclave: true,
                            preferences: formData.preferences
                        }, null, 2)}
                    </div>
                </div>

                {message && (
                    <div className={`p-3 border flex items-center gap-2 text-[10px] font-mono ${message.type === 'success' ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                        {message.text.toUpperCase()}
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black font-bold text-sm tracking-[0.2em] hover:bg-zinc-200 transition-all uppercase disabled:opacity-50 shadow-xl shadow-white/5"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Synchronizing...' : 'Update Identity Metadata'}
                </button>
            </div>
        </div>
    );
}
