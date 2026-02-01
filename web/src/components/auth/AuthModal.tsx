import { useState } from 'react';
import { Mail, Lock, Shield, Info, Github, Chrome } from 'lucide-react';
import { authService } from '../../services/index';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isLogin) {
                await authService.login(email, password);
            } else {
                await authService.signup(email, password, fullName);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuth = async (provider: 'google' | 'github') => {
        try {
            await authService.signInWithOAuth(provider);
        } catch (err: any) {
            setError(err.message || `Failed to initiate ${provider} authentication`);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 flex items-center justify-center border border-blue-500/20 bg-blue-500/5 mb-4 rounded-full">
                        <Shield className="w-6 h-6 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight uppercase">{isLogin ? 'Welcome back' : 'Join BlastAgent AI'}</h2>
                    <p className="text-zinc-500 text-[10px] font-mono mt-2 tracking-widest uppercase">
                        {isLogin ? 'Login to your account' : 'Create your secure identity'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => handleOAuth('google')}
                        className="flex items-center justify-center gap-2 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors text-[10px] font-mono uppercase tracking-wider"
                    >
                        <Chrome className="w-4 h-4" />
                        Google
                    </button>
                    <button
                        onClick={() => handleOAuth('github')}
                        className="flex items-center justify-center gap-2 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors text-[10px] font-mono uppercase tracking-wider"
                    >
                        <Github className="w-4 h-4" />
                        GitHub
                    </button>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-800"></div>
                    </div>
                    <div className="relative flex justify-center text-[8px] font-mono uppercase">
                        <span className="bg-zinc-900 px-2 text-zinc-600 tracking-widest">or secure credentials</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-1">
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Full Name"
                                    required
                                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none pl-10 pr-4 py-3 text-sm transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                required
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none pl-10 pr-4 py-3 text-sm transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none pl-10 pr-4 py-3 text-sm transition-colors"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-mono leading-relaxed">
                            <Info className="w-3 h-3 mt-0.5 shrink-0" />
                            <span>{error.toUpperCase()}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-bold text-sm tracking-[0.2em] transition-all disabled:opacity-50 uppercase shadow-lg shadow-white/5"
                    >
                        {loading ? 'AUTHENTICATING...' : isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[10px] font-mono text-zinc-500 hover:text-blue-400 transition-colors uppercase tracking-[0.3em]"
                    >
                        {isLogin ? "Need an account? Sign up →" : "Already have an account? Log in →"}
                    </button>
                </div>
            </div>
        </div>
    );
}
