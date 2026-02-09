import { Activity, Users, Zap, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { analyticsService } from "../../services/index";
import type { SystemOverview, ActivityLog } from "../../services/index";
import { SkeletonCard, SkeletonActivity } from "../../components/shared/index";
import { DashboardChart, StatusRing } from "../../components/dashboard/index";

export function OverviewView() {
    const [overview, setOverview] = useState<SystemOverview | null>(null);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [realtimeStats, setRealtimeStats] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [ov, logs, stats] = await Promise.all([
                    analyticsService.getSystemOverview(),
                    analyticsService.getActivityLogs(),
                    analyticsService.getRealtimeStats()
                ]);
                setOverview(ov);
                setActivities(logs);
                setRealtimeStats(stats);
            } catch (error) {
                console.error("Failed to load overview data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="border border-zinc-800 bg-zinc-900/40 p-6 h-[300px] animate-pulse rounded-lg" />
                        <div className="border border-zinc-800 bg-zinc-900/40 p-6 space-y-4 rounded-lg">
                            <SkeletonActivity />
                            <SkeletonActivity />
                        </div>
                    </div>
                    <div className="border border-zinc-800 bg-zinc-900/40 p-6 h-full rounded-lg animate-pulse" />
                </div>
            </div>
        );
    }

    // Success rate placeholder or calculated from overview if possible
    const successRate = 98.4;

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <EnhancedStatCard
                    icon={Activity}
                    label="TX Throughput"
                    value={overview?.totalRequests.toLocaleString() || "0"}
                    subValue="AI GENERATED"
                    color="blue"
                />
                <EnhancedStatCard
                    icon={Zap}
                    label="Active Agents"
                    value={overview?.totalBots.toLocaleString() || "0"}
                    subValue={`${overview?.totalCampaigns} LIVE CAMPAIGNS`}
                    color="purple"
                />
                <EnhancedStatCard
                    icon={Users}
                    label="Recipient Sync"
                    value={overview?.totalRecipients.toLocaleString() || "0"}
                    subValue="DATA PERSISTED"
                    color="cyan"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

                {/* Graphics & Activity Column */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {/* Chart Card */}
                    <div className="border border-zinc-800 bg-zinc-950/50 p-6 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[100px] pointer-events-none" />
                        <DashboardChart
                            data={realtimeStats}
                            label="Transmission Velocity (24h)"
                            color="#3b82f6"
                        />
                    </div>

                    {/* Activity Card */}
                    <div className="border border-zinc-800 bg-zinc-900/40 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <div>
                                <h3 className="text-sm font-mono text-white uppercase tracking-widest">Neural activity</h3>
                                <p className="text-[10px] text-zinc-500 font-mono mt-1">REAL-TIME STREAMING</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                <span className="text-[10px] text-blue-500 font-mono font-bold tracking-tighter">LIVE</span>
                            </div>
                        </div>
                        <div className="p-2 space-y-1">
                            {activities.length === 0 ? (
                                <div className="py-20 text-center text-zinc-600 font-mono text-xs italic">Awaiting telemetry...</div>
                            ) : (
                                activities.slice(0, 5).map((log, i) => (
                                    <ModernActivityItem
                                        key={i}
                                        title={log.agent_name || "KERNEL"}
                                        action={log.action}
                                        time={new Date(log.created_at).toLocaleTimeString()}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Health & Status */}
                <div className="space-y-4 md:space-y-6">
                    {/* Health Ring Card */}
                    <div className="border border-zinc-800 bg-zinc-900/40 p-8 rounded-xl flex flex-col items-center justify-center text-center relative group">
                        <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/[0.02] transition-colors pointer-events-none" />
                        <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] mb-8">System Integrity</h3>
                        <StatusRing percentage={successRate} label="Success Rate" color="#3b82f6" />
                        <div className="mt-8 space-y-2 w-full">
                            <div className="flex justify-between text-[10px] font-mono border-b border-zinc-800 pb-2">
                                <span className="text-zinc-500">LATENCY</span>
                                <span className="text-blue-500">{overview?.apiLatency}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono border-b border-zinc-800 pb-2">
                                <span className="text-zinc-500">HEALTH</span>
                                <span className="text-zinc-300">{overview?.systemHealth}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono pt-2">
                                <span className="text-zinc-500">LOAD</span>
                                <span className="text-zinc-400">OPTIMAL</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Config Card */}
                    <div className="border border-zinc-800 bg-zinc-950/80 p-6 rounded-xl space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <ShieldCheck className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Security Core</h4>
                                <p className="text-[10px] text-zinc-500 font-mono">ENCRYPTION ACTIVE</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Model Instance</span>
                                    <span className="text-[10px] font-mono text-blue-500">GEMINI-3.0</span>
                                </div>
                            </div>
                            <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-mono font-bold uppercase tracking-widest transition-all rounded-md">
                                Re-Sync Telemetry
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function EnhancedStatCard({ icon: Icon, label, value, subValue, color }: any) {
    const colorClasses: any = {
        blue: "text-blue-400 bg-blue-400/10 border-blue-500/20",
        purple: "text-purple-400 bg-purple-400/10 border-purple-500/20",
        cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-500/20"
    };

    return (
        <div className="p-6 border border-zinc-800 bg-zinc-900/40 rounded-xl relative group overflow-hidden transition-all hover:border-zinc-700">
            <div className={`absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-${color}-500 to-transparent`} />
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${colorClasses[color].split(' ').slice(1).join(' ')}`}>
                    <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[0]}`} />
                </div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{subValue}</span>
            </div>
            <h3 className="text-zinc-500 text-[10px] font-mono mb-1 uppercase tracking-widest">{label}</h3>
            <p className="text-3xl font-bold tracking-tighter text-white">{value}</p>
        </div>
    );
}

function ModernActivityItem({ title, action, time }: any) {
    return (
        <div className="flex justify-between items-center p-4 rounded-lg hover:bg-zinc-800/30 transition-all border border-transparent hover:border-zinc-800/50 group">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
                    <Activity className="w-3 h-3 text-zinc-600 group-hover:text-blue-400" />
                </div>
                <div>
                    <h4 className="font-bold text-[11px] text-zinc-300 uppercase tracking-wider">{title}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono">{action}</p>
                </div>
            </div>
            <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-600">{time}</span>
            </div>
        </div>
    );
}
