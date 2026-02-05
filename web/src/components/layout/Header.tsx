import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { authService } from "../../services/index";

export function Header() {
    const location = useLocation();
    const [initials, setInitials] = useState("??");

    useEffect(() => {
        authService.getProfile().then(profile => {
            if (profile?.full_name) {
                const parts = profile.full_name.split(' ');
                const ini = parts.map((n: string) => n[0]).join('').toUpperCase();
                setInitials(ini.substring(0, 2));
            }
        }).catch(() => { });
    }, []);

    const getActiveTab = () => {
        const path = location.pathname.split('/')[2] || 'overview';
        const nameMap: Record<string, string> = {
            'overview': 'OVERVIEW',
            'campaigns': 'CAMPAIGNS',
            'studio': 'COMPOSER',
            'deploy': 'EXTRACTOR',
            'bots': 'AGENT',
            'analytics': 'ANALYTICS',
            'profile': 'PROFILE',
            'settings': 'SETTINGS'
        };
        return nameMap[path] || path.toUpperCase();
    };

    return (
        <header className="h-16 md:h-20 border-b border-zinc-900 flex items-center justify-between px-4 md:px-8 bg-zinc-950/50 backdrop-blur flex-shrink-0">
            <div className="flex-1">
                <h1 className="text-lg md:text-xl font-bold tracking-tight truncate font-mono">
                    {getActiveTab()}
                </h1>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Quick Search..."
                        className="bg-zinc-900 border border-zinc-800 focus:border-blue-500/50 outline-none pl-10 pr-4 py-2 text-[10px] font-mono w-48 lg:w-64 transition-all cursor-text"
                    />
                </div>
                <div className="flex items-center gap-3 md:border-l md:border-zinc-900 md:pl-6 shrink-0">
                    <div className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-900 text-blue-500 text-[10px] font-mono font-bold cursor-pointer hover:bg-zinc-800 transition-colors">
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
}
