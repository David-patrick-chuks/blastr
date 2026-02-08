export interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    circle?: boolean;
}

export function Skeleton({ className = "", width, height, circle = false }: SkeletonProps) {
    const style: React.CSSProperties = {
        width,
        height,
        borderRadius: circle ? '50%' : '2px',
    };

    return (
        <div
            style={style}
            className={`animate-pulse bg-zinc-800/50 border border-zinc-800/20 ${className}`}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="p-4 md:p-6 border border-zinc-800 bg-zinc-900/40 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <Skeleton width={20} height={20} />
                <Skeleton width={60} height={12} />
            </div>
            <Skeleton width="40%" height={14} className="mb-2" />
            <Skeleton width="80%" height={32} />
        </div>
    );
}

export function SkeletonActivity() {
    return (
        <div className="flex justify-between items-start p-4 border border-zinc-800/50 bg-zinc-950/30">
            <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                    <Skeleton width="30%" height={12} />
                </div>
                <Skeleton width="60%" height={10} />
                <Skeleton width="40%" height={10} />
            </div>
            <Skeleton width={40} height={10} />
        </div>
    );
}
