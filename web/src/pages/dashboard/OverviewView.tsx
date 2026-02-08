import { Activity, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { analyticsService } from "../../services/index";
import type { SystemOverview, ActivityLog } from "../../services/index";
import { SkeletonCard, SkeletonActivity } from "../../components/shared/index";

export function OverviewView() {
    const [overview, setOverview] = useState<SystemOverview | null>(null);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [ov, logs] = await Promise.all([
                    analyticsService.getSystemOverview(),
                    analyticsService.getActivityLogs()
                ]);
                setOverview(ov);
                setActivities(logs);
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
            <div className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <div className="border border-zinc-800 bg-zinc-900/40 p-4 md:p-6 min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-24 h-3 bg-zinc-800 animate-pulse rounded" />
                            <div className="w-12 h-3 bg-zinc-800 animate-pulse rounded" />
                        </div>
                        <div className="space-y-4">
                            <SkeletonActivity />
                            <SkeletonActivity />
                            <SkeletonActivity />
                        </div>
                    </div>
                    <div className="border border-zinc-800 bg-zinc-900/40 p-4 md:p-6">
                        <div className="w-32 h-3 bg-zinc-800 animate-pulse rounded mb-8" />
                        <div className="space-y-10 py-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex justify-between items-center border-b border-zinc-800 pb-4">
                                    <div className="w-20 h-2 bg-zinc-800 animate-pulse rounded" />
                                    <div className="w-24 h-3 bg-zinc-800 animate-pulse rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <StatCard
                    icon={Activity}
                    label="TOTAL TRANSMISSIONS"
                    value={overview?.totalRequests.toLocaleString() || "0"}
                    change="AI GENERATED"
                />
                <StatCard
                    icon={Activity}
                    label="ACTIVE CAMPAIGNS"
                    value={overview?.totalCampaigns.toLocaleString() || "0"}
                    change={`${overview?.totalBots} LIVE BOTS`}
                    changeColor="text-blue-400"
                />
                <StatCard
                    icon={Users}
                    label="TOTAL RECIPIENTS"
                    value={overview?.totalRecipients.toLocaleString() || "0"}
                    change="SYNCED ENTRIES"
                    changeColor="text-zinc-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="border border-zinc-800 bg-zinc-900/40 p-4 md:p-6 min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Recent Activity</h3>
                        <div className="px-2 py-0.5 border border-blue-500/20 text-[10px] text-blue-500 font-mono">LIVE</div>
                    </div>
                    <div className="space-y-4">
                        {activities.length === 0 ? (
                            <div className="py-20 text-center text-zinc-600 font-mono text-xs italic">No activity recorded yet...</div>
                        ) : (
                            activities.map((log, i) => (
                                <ActivityItem
                                    key={i}
                                    title={log.agent_name || "System"}
                                    action={log.action}
                                    time={new Date(log.created_at).toLocaleTimeString()}
                                    details={log.details}
                                />
                            ))
                        )}
                    </div>
                </div>
                <div className="border border-zinc-800 bg-zinc-900/40 p-4 md:p-6">
                    <h3 className="text-sm font-mono text-zinc-500 mb-8 uppercase tracking-widest">Platform Status</h3>
                    <div className="space-y-10 py-4 font-mono">
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                            <span className="text-[10px] text-zinc-500 uppercase">Core Latency</span>
                            <span className="text-sm text-blue-500">{overview?.apiLatency}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                            <span className="text-[10px] text-zinc-500 uppercase">Model Version</span>
                            <span className="text-sm text-zinc-300">Gemini 3.0 Flash</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                            <span className="text-[10px] text-zinc-500 uppercase">Engine Health</span>
                            <span className="text-sm text-blue-500">{overview?.systemHealth}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, change, changeColor = "text-zinc-500" }: any) {
    return (
        <div className="p-4 md:p-6 border border-zinc-800 bg-zinc-900/40 relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-blue-500/20" />
            <div className="flex justify-between items-start mb-4">
                <Icon className="w-5 h-5 text-blue-400" />
                <span className={`text-[10px] font-mono ${changeColor}`}>{change}</span>
            </div>
            <h3 className="text-zinc-500 text-[10px] md:text-sm font-mono mb-1 uppercase tracking-widest">{label}</h3>
            <p className="text-2xl md:text-3xl font-bold">{value}</p>
        </div>
    );
}

function ActivityItem({ title, action, time, details }: any) {
    return (
        <div className="flex justify-between items-start p-4 border border-zinc-800/50 bg-zinc-950/30 group hover:border-zinc-700 transition-all">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">{title}</h4>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono">{action}</p>
                {details && <p className="text-[10px] text-zinc-600 font-mono italic">{details}</p>}
            </div>
            <span className="text-[10px] font-mono text-zinc-600">{time}</span>
        </div>
    );
}

