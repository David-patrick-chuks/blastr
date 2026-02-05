import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout.js";
import { OverviewView } from "./dashboard/OverviewView";
import { CampaignsView } from "./dashboard/CampaignsView";
import { StudioView } from "./dashboard/StudioView";
import { DeployView } from "./dashboard/DeployView";
import { BotsView } from "./dashboard/BotsView";
import { AnalyticsView } from "./dashboard/AnalyticsView";
import { SettingsView } from "./dashboard/SettingsView";
import { ProfileView } from "./dashboard/ProfileView";

interface DashboardProps {
    onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
    return (
        <DashboardLayout onLogout={onLogout}>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
                <Route path="/overview" element={<OverviewView />} />
                <Route path="/campaigns" element={<CampaignsView />} />
                <Route path="/studio" element={<StudioView />} />
                <Route path="/deploy" element={<DeployView />} />
                <Route path="/bots" element={<BotsView />} />
                <Route path="/analytics" element={<AnalyticsView />} />
                <Route path="/settings" element={<SettingsView />} />
                <Route path="/profile" element={<ProfileView />} />
            </Routes>
        </DashboardLayout>
    );
}
