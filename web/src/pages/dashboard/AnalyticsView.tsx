import { Activity, BarChart3, Clock, Zap, Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import { analyticsService } from "../../services/index";
import type { SystemOverview } from "../../services/index";
import { Skeleton } from "../../components/shared/index";
import { DashboardChart } from "../../components/dashboard/index";

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

    if (loading) {
        return (
            <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                <div>
                    <Skeleton width={200} height={24} className="mb-2" />
                    <Skeleton width={400} height={14} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="p-4 border border-zinc-800 bg-zinc-900/40 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Skeleton width={14} height={14} circle />
                                <Skeleton width={80} height={10} />
                            </div>
                            <div className="flex items-baseline justify-between mt-4">
                                <Skeleton width={100} height={24} />
                                <Skeleton width={40} height={10} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="border border-zinc-800 bg-zinc-900/40 p-8 h-80 rounded-xl flex flex-col justify-end animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-bold mb-2">System Analytics</h2>
                    <p className="text-zinc-500 text-sm">Real-time performance metrics and neural throughput.</p>
                </div>
                <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-mono text-blue-500 animate-pulse">
                    TELEMETRY ACTIVE
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <ModernSmallStat icon={Activity} label="THROUGHPUT" value={`${((overview?.totalRequests || 0) / 86400).toFixed(4)}`} unit="eq/s" trend="LIVE" />
                <ModernSmallStat icon={Clock} label="LATENCY" value={overview?.apiLatency || "0ms"} unit="" trend="NOMINAL" />
                <ModernSmallStat icon={Zap} label="TOTAL AGENTS" value={overview?.totalBots || "0"} unit="u" trend="ACTIVE" />
                <ModernSmallStat icon={BarChart3} label="HEALTH" value={overview?.systemHealth || "N/A"} unit="" trend="STABLE" />
            </div>

            <div className="border border-zinc-800 bg-zinc-950/50 p-6 md:p-8 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.03] blur-[120px] pointer-events-none" />
                <DashboardChart
                    data={realtimeData}
                    label="Recipient Transmission Velocity (Last 24h)"
                    color="#3b82f6"
                    height={200}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="border border-zinc-800 bg-zinc-900/40 p-6 rounded-xl font-mono">
                    <div className="flex items-center gap-3 mb-6">
                        <Cpu className="w-4 h-4 text-blue-400" />
                        <h3 className="text-[10px] text-zinc-100 uppercase tracking-[0.3em]">Resource allocation</h3>
                    </div>
                    <div className="space-y-4 text-xs">
                        <SystemMetric label="Active Transmitters" value={`${overview?.totalBots} AGENTS`} />
                        <SystemMetric label="Recipients Synced" value={`${(overview?.totalRecipients || 0).toLocaleString()} ENTRIES`} />
                        <SystemMetric label="Total Transmissions" value={`${(overview?.totalRequests || 0).toLocaleString()} TX`} />
                    </div>
                </div>
                <div className="border border-zinc-800 bg-zinc-900/40 p-6 rounded-xl font-mono">
                    <div className="flex items-center gap-3 mb-6">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <h3 className="text-[10px] text-zinc-100 uppercase tracking-[0.3em]">MODEL INFRASTRUCTURE</h3>
                    </div>
                    <div className="space-y-4 text-xs">
                        <SystemMetric label="Model Tier" value="GEMINI 3.0 FLASH" color="text-purple-400" />
                        <SystemMetric label="Context Window" value="1,048,576 TOKENS" />
                        <SystemMetric label="Reasoning Level" value="SYNTHETIC-MAX" color="text-blue-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ModernSmallStat({ icon: Icon, label, value, unit, trend }: any) {
    return (
        <div className="p-5 border border-zinc-800 bg-zinc-900/40 rounded-xl group hover:border-blue-500/30 transition-all hover:bg-zinc-900/60">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-zinc-950 rounded border border-zinc-800 group-hover:border-blue-500/20 transition-all">
                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{label}</span>
            </div>
            <div className="flex items-baseline justify-between">
                <div>
                    <span className="text-2xl font-bold tracking-tighter">{value}</span>
                    <span className="text-[10px] text-zinc-600 ml-1 font-mono uppercase">{unit}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${trend === 'LIVE' || trend === 'ACTIVE' || trend === 'STABLE' ? 'text-blue-500' : 'text-zinc-500'}`}>
                    {trend}
                </span>
            </div>
        </div>
    );
}

function SystemMetric({ label, value, color = "text-blue-500" }: any) {
    return (
        <div className="flex justify-between items-center border-b border-zinc-800/50 pb-3 group">
            <span className="text-zinc-500 text-[10px] group-hover:text-zinc-300 transition-colors">{label}</span>
            <span className={`text-[10px] font-bold ${color}`}>{value}</span>
        </div>
    );
}
