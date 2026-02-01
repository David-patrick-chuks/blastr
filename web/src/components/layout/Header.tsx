import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";

export function Header() {
    const location = useLocation();

    const getActiveTab = () => {
        const path = location.pathname.split('/')[2];
        return path || 'overview';
    };

    return (
        <header className="h-20 border-b border-zinc-900 flex items-center justify-between px-4 md:px-8 bg-zinc-950/50 backdrop-blur flex-shrink-0">
            <div className="flex-1">
                <h1 className="text-lg md:text-xl font-bold tracking-tight truncate">
                    {getActiveTab().charAt(0).toUpperCase() + getActiveTab().slice(1)}
                </h1>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search agents..."
                        className="bg-zinc-900 border border-zinc-800 focus:border-blue-500/50 outline-none pl-10 pr-4 py-2 text-sm w-48 lg:w-64 transition-all cursor-text"
                    />
                </div>
                <div className="flex items-center gap-3 md:border-l md:border-zinc-900 md:pl-6 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 text-xs font-bold cursor-pointer hover:bg-blue-500/20 transition-colors">
                        JD
                    </div>
                </div>
            </div>
        </header>
    );
}
