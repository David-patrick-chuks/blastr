import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';

interface ProgressData {
    status: 'PARSING' | 'CHUNKING' | 'INDEXING' | 'COMPLETED' | 'FAILED';
    progress: number;
    message: string;
    total?: number;
    current?: number;
    error?: string;
}

interface LiveProgressIndicatorProps {
    userId?: string;
}

export function LiveProgressIndicator({ userId }: LiveProgressIndicatorProps) {
    const { on, connected } = useSocket(userId);
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const socketCleanup = on('TRAINING_PROGRESS', (data: ProgressData) => {
            setProgress(data);
            setVisible(true);

            if (data.status === 'COMPLETED') {
                setTimeout(() => setVisible(false), 5000); // Hide after 5 seconds on success
            }
        });
        return () => { socketCleanup?.(); };
    }, [on]);

    if (!visible || !progress) return null;

    const getStatusIcon = () => {
        switch (progress.status) {
            case 'COMPLETED': return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
            case 'FAILED': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
        }
    };

    const getStatusText = () => {
        if (progress.status === 'INDEXING' && progress.total) {
            return `INDEXING [${progress.current}/${progress.total}]`;
        }
        return progress.status;
    };

    return (
        <div className="fixed bottom-8 right-8 w-80 bg-zinc-900 border border-zinc-800 shadow-2xl p-6 space-y-4 z-50 overflow-hidden group">
            {/* Background Scanner Effect */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-blue-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-scan pointer-events-none" />

            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                    <Activity className={`w-4 h-4 ${connected ? 'text-blue-500' : 'text-zinc-600'}`} />
                    <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-zinc-400">
                        Transmission_Status
                    </span>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-blue-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`} />
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    {getStatusIcon()}
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-blue-500 mb-0.5 font-bold uppercase tracking-wider">
                            {getStatusText()}
                        </div>
                        <div className="text-[11px] text-zinc-300 font-medium truncate uppercase">
                            {progress.message}
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="h-1 w-full bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden p-[1px]">
                        <div
                            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500 ease-out"
                            style={{ width: `${progress.progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                        <span>ENGINE_PROC_LOAD</span>
                        <span>{progress.progress}%</span>
                    </div>
                </div>
            </div>

            {progress.status === 'FAILED' && (
                <div className="mt-2 text-[9px] font-mono text-red-500/80 bg-red-500/5 border border-red-500/10 p-2 leading-relaxed">
                    CRITICAL_ERROR: {progress.error?.toUpperCase()}
                </div>
            )}
        </div>
    );
}
