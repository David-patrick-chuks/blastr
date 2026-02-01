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
                <p className="text-zinc-500 text-sm">Deep insights into kernel performance and Gemini 3 utilization.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SmallStat icon={Activity} label="THROUGHPUT" value={`${((overview?.totalRequests || 0) / 86400).toFixed(4)} req/s`} trend="+0.5" />
                <SmallStat icon={Clock} label="LATENCY" value={overview?.apiLatency || "N/A"} trend="-20ms" />
                <SmallStat icon={Zap} label="TOKEN UTIL" value={((overview?.totalRequests || 0) * 1240).toLocaleString()} trend="+$1.2" />
                <SmallStat icon={BarChart3} label="ACCURACY" value="99.2%" trend="+0.1%" />
            </div>

            <div className="border border-zinc-800 bg-zinc-900/40 p-8 h-80 flex flex-col justify-end">
                <h3 className="text-[10px] font-mono text-zinc-500 mb-8 uppercase tracking-[0.3em]">REQUEST VOLUME (LAST 24H)</h3>
                <div className="flex-1 flex items-end gap-2 pr-8">
                    {realtimeData.map((v, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-blue-500/20 hover:bg-blue-500/50 transition-all relative group"
                            style={{ height: `${v}%` }}
                        >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 px-2 py-1 text-[10px] font-mono text-white opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                                {v} REQS
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-zinc-800 bg-zinc-900/40 p-6 font-mono">
                    <h3 className="text-[10px] text-zinc-500 mb-4 uppercase tracking-[0.3em]">SYSTEM OVERHEAD</h3>
                    <div className="space-y-4 text-xs">
                        <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                            <span className="text-white">Active Kernels</span>
                            <span className="text-blue-500">{overview?.totalAgents} NODES</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                            <span className="text-white">Knowledge Vectors</span>
                            <span className="text-blue-500">{overview?.totalDocuments.toLocaleString()} CHUNKS</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                            <span className="text-white">Total Processed</span>
                            <span className="text-blue-500">{overview?.totalRequests.toLocaleString()} TX</span>
                        </div>
                    </div>
                </div>
                <div className="border border-zinc-800 bg-zinc-900/40 p-6 font-mono">
                    <h3 className="text-[10px] text-zinc-500 mb-4 uppercase tracking-[0.3em]">RESOURCE DISTRIBUTION</h3>
                    <div className="space-y-4 text-xs">
                        <div className="flex items-center gap-4">
                            <div className="w-24 text-zinc-500">Multimodal</div>
                            <div className="flex-1 h-1 bg-zinc-800"><div className="w-[65%] h-full bg-blue-400" /></div>
                            <span className="w-10 text-right">65%</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-24 text-zinc-500">Reasoning</div>
                            <div className="flex-1 h-1 bg-zinc-800"><div className="w-[28%] h-full bg-blue-400" /></div>
                            <span className="w-10 text-right">28%</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-24 text-zinc-500">Security Layers</div>
                            <div className="flex-1 h-1 bg-zinc-800"><div className="w-[7%] h-full bg-blue-400" /></div>
                            <span className="w-10 text-right">7%</span>
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
