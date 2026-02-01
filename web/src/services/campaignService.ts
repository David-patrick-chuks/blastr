import apiClient from './apiClient';
import type { Campaign } from '../types/index.js';

export const campaignService = {
    async fetchCampaigns(): Promise<Campaign[]> {
        return apiClient.get<Campaign[]>('/agents');
    },

    async createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
        return apiClient.post<Campaign>('/agents', campaign);
    },

    async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<Campaign> {
        return apiClient.patch<Campaign>(`/agents/${id}`, campaign);
    },

    async deleteCampaign(id: string): Promise<{ success: boolean }> {
        return apiClient.delete<{ success: boolean }>(`/agents/${id}`);
    },

    async getCampaignHealth(id: string): Promise<any> {
        return apiClient.get(`/agents/${id}/health`);
    },

    async extractEmails(base64Image: string): Promise<{ emails: string[] }> {
        return apiClient.post('/ai/extract-emails', { image: base64Image });
    }
};
