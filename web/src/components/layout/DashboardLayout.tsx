import { Sidebar } from "./Sidebar.js";
import { Header } from "./Header.js";
import { LiveProgressIndicator } from "../shared/LiveProgressIndicator";
import { useEffect, useState } from "react";
import { authService } from "../../services/index";
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
    children: React.ReactNode;
    onLogout: () => void;
}

export function DashboardLayout({ children, onLogout }: DashboardLayoutProps) {
    const [userId, setUserId] = useState<string | undefined>();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        authService.getCurrentUser().then(user => {
            setUserId(user?.id);
        });
    }, []);

    return (
        <div className="h-screen bg-zinc-950 text-zinc-100 flex overflow-hidden relative">
            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar with Responsive Classes */}
            <div className={`
                fixed inset-y-0 left-0 z-[50] transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                <Sidebar onLogout={onLogout} onMobileClose={() => setIsMobileMenuOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Mobile Header Toggle */}
                <div className="lg:hidden h-16 border-b border-zinc-900 bg-zinc-950 flex items-center px-6 shrink-0">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-zinc-400 hover:text-blue-500 transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="ml-4 flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-sm flex items-center justify-center">
                            <span className="text-zinc-900 font-bold text-[10px]">G</span>
                        </div>
                        <span className="font-bold tracking-tight">GAIA</span>
                    </div>
                </div>

                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
                <LiveProgressIndicator userId={userId} />
            </div>
        </div>
    );
}
