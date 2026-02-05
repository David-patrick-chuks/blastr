import { Activity, BarChart3, Clock, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { analyticsService } from "../../services/index";
import type { SystemOverview } from "../../services/index";

export function AnalyticsView() {
    const [overview, setOverview] = useState<SystemOverview | null>(null);
    const [realtimeData, setRealtimeData] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [ov, rt] = await Promise.all([
                    analyticsService.getSystemOverview(),
                    analyticsService.getRealtimeStats()
                ]);
                setOverview(ov);
                setRealtimeData(rt);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="p-8 font-mono text-zinc-500 uppercase tracking-widest">Syncing with GAIA Core...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold mb-2">System Analytics</h2>
                <p className="text-zinc-500 text-sm">Deep insights into kernel performance and Gemini 2.0 Flash utilization.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SmallStat icon={Activity} label="THROUGHPUT" value={`${((overview?.totalRequests || 0) / 86400).toFixed(4)} req/s`} trend="LIVE" />
                <SmallStat icon={Clock} label="LATENCY" value={overview?.apiLatency || "N/A"} trend="NOMINAL" />
                <SmallStat icon={Zap} label="TOTAL BOTS" value={overview?.totalBots || "0"} trend="ACTIVE" />
                <SmallStat icon={BarChart3} label="HEALTH" value={overview?.systemHealth || "N/A"} trend="STABLE" />
            </div>

            <div className="border border-zinc-800 bg-zinc-900/40 p-8 h-80 flex flex-col justify-end">
                <h3 className="text-[10px] font-mono text-zinc-500 mb-8 uppercase tracking-[0.3em]">RECIPIENT ACTIVITY (LAST 24H)</h3>
                <div className="flex-1 flex items-end gap-2 pr-8">
                    {realtimeData.map((v, i) => {
                        const max = Math.max(...realtimeData, 1);
                        const height = (v / max) * 100;
                        return (
                            <div
                                key={i}
                                className="flex-1 bg-blue-500/20 hover:bg-blue-500/50 transition-all relative group"
                                style={{ height: `${height}%` }}
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 px-2 py-1 text-[10px] font-mono text-white opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                                    {v} REQS
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-zinc-800 bg-zinc-900/40 p-6 font-mono">
                    <h3 className="text-[10px] text-zinc-500 mb-4 uppercase tracking-[0.3em]">SYSTEM OVERHEAD</h3>
                    <div className="space-y-4 text-xs">
                        <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                            <span className="text-white">Active Transmitters</span>
                            <span className="text-blue-500">{overview?.totalBots} BOTS</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                            <span className="text-white">Recipients Synced</span>
                            <span className="text-blue-500">{(overview?.totalRecipients || 0).toLocaleString()} ENTRIES</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                            <span className="text-white">Total Transmissions</span>
                            <span className="text-blue-500">{(overview?.totalRequests || 0).toLocaleString()} TX</span>
                        </div>
                    </div>
                </div>
                <div className="border border-zinc-800 bg-zinc-900/40 p-6 font-mono">
                    <h3 className="text-[10px] text-zinc-500 mb-4 uppercase tracking-[0.3em]">MODEL CONFIGURATION</h3>
                    <div className="space-y-4 text-xs">
                        <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                            <span className="text-white">Model Tier</span>
                            <span className="text-blue-500">GEMINI 2.0 FLASH</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                            <span className="text-white">Context Window</span>
                            <span className="text-blue-500">1M TOKENS</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                            <span className="text-white">Reasoning Level</span>
                            <span className="text-blue-500">ADVANCED</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SmallStat({ icon: Icon, label, value, trend }: any) {
    return (
        <div className="p-4 border border-zinc-800 bg-zinc-900/40 group hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{label}</span>
            </div>
            <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold">{value}</span>
                <span className={`text-[10px] font-mono ${trend.startsWith('+') ? 'text-blue-500' : 'text-zinc-500'}`}>{trend}</span>
            </div>
        </div>
    );
}
