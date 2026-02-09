

interface StatusRingProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    color?: string;
}

export function StatusRing({
    percentage,
    size = 120,
    strokeWidth = 8,
    label,
    color = "#3b82f6"
}: StatusRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-zinc-800"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                    style={{
                        filter: `drop-shadow(0 0 6px ${color}40)`
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold font-mono text-white">{percentage}%</span>
                {label && <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">{label}</span>}
            </div>
        </div>
    );
}
