import { useMemo } from 'react';

interface DashboardChartProps {
    data: number[];
    height?: number;
    color?: string;
    label?: string;
}

export function DashboardChart({
    data,
    height = 120,
    color = "#3b82f6",
    label
}: DashboardChartProps) {
    const points = useMemo(() => {
        if (data.length === 0) return "";
        const max = Math.max(...data, 1);
        const width = 400; // Fixed viewbox width
        const step = width / (data.length - 1);

        return data.map((val, i) => {
            const x = i * step;
            const y = height - (val / max) * height;
            return `${x},${y}`;
        }).join(" ");
    }, [data, height]);

    const areaPath = useMemo(() => {
        if (data.length === 0) return "";
        const max = Math.max(...data, 1);
        const width = 400;
        const step = width / (data.length - 1);

        const path = data.map((val, i) => {
            const x = i * step;
            const y = height - (val / max) * height;
            return `${x},${y}`;
        }).join(" L ");

        return `M 0,${height} L ${path} L 400,${height} Z`;
    }, [data, height]);

    return (
        <div className="relative w-full group">
            {label && (
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">{label}</span>
                    <span className="text-[10px] font-mono text-blue-500">LIVE FEED</span>
                </div>
            )}
            <div style={{ height }} className="w-full">
                <svg
                    viewBox={`0 0 400 ${height}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                >
                    {/* Subtle grid lines */}
                    <line x1="0" y1={height * 0.25} x2="400" y2={height * 0.25} stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1={height * 0.5} x2="400" y2={height * 0.5} stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1={height * 0.75} x2="400" y2={height * 0.75} stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />

                    {/* Area under the line */}
                    <path
                        d={areaPath}
                        fill={`url(#gradient-${color})`}
                        className="opacity-20 transition-all duration-700"
                    />

                    {/* The main line */}
                    <polyline
                        points={points}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-700 ease-in-out"
                        style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
                    />

                    <defs>
                        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
}
