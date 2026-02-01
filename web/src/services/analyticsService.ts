import apiClient from './apiClient';

export interface SystemOverview {
    totalAgents: number;
    totalDocuments: number;
    totalRequests: number;
    systemHealth: string;
    apiLatency: string;
}

export interface AgentStats {
    documentCount: number;
    messageCount: number;
    tokensUsed: number;
    status: string;
    activeSince: string;
    uptime: string;
}

export interface ActivityLog {
    agent_name: string | null;
    action: string;
    details: string;
    created_at: string;
}

export const analyticsService = {
    async getSystemOverview(): Promise<SystemOverview> {
        return apiClient.get<SystemOverview>('/stats/overview');
    },

    async getAgentStats(agentId: string): Promise<AgentStats> {
        return apiClient.get<AgentStats>(`/stats/agents/${agentId}`);
    },

    async getRealtimeStats(): Promise<number[]> {
        return apiClient.get<number[]>('/stats/realtime');
    },

    async getActivityLogs(): Promise<ActivityLog[]> {
        return apiClient.get<ActivityLog[]>('/stats/activity');
    },

    async getDocumentLogs(agentId: string): Promise<any[]> {
        return apiClient.get<any[]>(`/documents/logs?agentId=${agentId}`);
    }
};
