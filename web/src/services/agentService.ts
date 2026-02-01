import apiClient from './apiClient';

export interface Agent {
    id: string;
    user_id: string;
    name: string;
    email: string;
    smtp_host: string;
    smtp_port: number;
    smtp_secure: boolean;
    smtp_user: string;
    from_name?: string;
    status: 'unverified' | 'active' | 'failed' | 'rate_limited';
    last_verified_at?: string;
    daily_sent_count: number;
    daily_limit: number;
    quota_remaining?: number;
    created_at: string;
    updated_at: string;
}

export interface AgentCreateData {
    name: string;
    email: string;
    smtp_host: string;
    smtp_port: number;
    smtp_secure: boolean;
    smtp_user: string;
    smtp_pass: string;
    from_name?: string;
}

export interface AgentStats {
    id: string;
    name: string;
    email: string;
    status: string;
    daily_sent_count: number;
    daily_limit: number;
    quota_remaining: number;
    quota_percentage: number;
    last_verified_at?: string;
    last_reset_at: string;
}

export const agentService = {
    async getAgents(): Promise<Agent[]> {
        return apiClient.get<Agent[]>('/agents');
    },

    async getAgent(id: string): Promise<Agent> {
        return apiClient.get<Agent>(`/agents/${id}`);
    },

    async createAgent(data: AgentCreateData): Promise<Agent> {
        return apiClient.post<Agent>('/agents', data);
    },

    async updateAgent(id: string, data: Partial<AgentCreateData>): Promise<Agent> {
        return apiClient.patch<Agent>(`/agents/${id}`, data);
    },

    async deleteAgent(id: string): Promise<void> {
        await apiClient.delete(`/agents/${id}`);
    },

    async verifyAgent(id: string): Promise<{ success: boolean; message: string; details?: string }> {
        return apiClient.post<{ success: boolean; message: string; details?: string }>(`/agents/${id}/verify`);
    },

    async getAgentStats(id: string): Promise<AgentStats> {
        return apiClient.get<AgentStats>(`/agents/${id}/stats`);
    },

    async checkAgentAvailability(id: string): Promise<{
        available: boolean;
        quota_remaining: number;
        status: string;
        reason?: string;
    }> {
        return apiClient.get(`/agents/${id}/availability`);
    }
};
