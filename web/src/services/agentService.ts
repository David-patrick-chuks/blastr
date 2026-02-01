import apiClient from './apiClient';
import type { Agent, AgentCredentials } from '../types/index.js';

export const agentService = {
    async fetchAgents(): Promise<Agent[]> {
        return apiClient.get<Agent[]>('/agents');
    },

    async createAgent(agent: Partial<Agent>): Promise<Agent> {
        return apiClient.post<Agent>('/agents', agent);
    },

    async updateAgent(id: string, agent: Partial<Agent>): Promise<Agent> {
        return apiClient.patch<Agent>(`/agents/${id}`, agent);
    },

    async deleteAgent(id: string): Promise<{ success: boolean }> {
        return apiClient.delete<{ success: boolean }>(`/agents/${id}`);
    },

    async connectPlatform(agentId: string, platform: string, creds?: AgentCredentials): Promise<any> {
        return apiClient.post(`/agents/connect/${platform}`, { agentId, ...creds });
    },

    async updateIntegrationConfig(agentId: string, platform: string, config: any): Promise<any> {
        return apiClient.post(`/agents/connect/config`, { agentId, platform, config });
    },

    async extractEmails(base64Image: string): Promise<{ emails: string[] }> {
        return apiClient.post('/ai/extract-emails', { image: base64Image });
    }
};
