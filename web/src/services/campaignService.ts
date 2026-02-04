import apiClient from './apiClient';
import type { Campaign } from '../types/index.js';

export const campaignService = {
    async fetchCampaigns(): Promise<Campaign[]> {
        return apiClient.get<Campaign[]>('/campaigns');
    },

    async createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
        return apiClient.post<Campaign>('/campaigns', campaign);
    },

    async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<Campaign> {
        return apiClient.patch<Campaign>(`/campaigns/${id}`, campaign);
    },

    async deleteCampaign(id: string): Promise<{ success: boolean }> {
        return apiClient.delete<{ success: boolean }>(`/campaigns/${id}`);
    },

    async getCampaignHealth(id: string): Promise<any> {
        return apiClient.get(`/campaigns/${id}/health`);
    },

    async extractEmails(base64Image: string): Promise<{ emails: string[] }> {
        return apiClient.post('/ai/extract-emails', { image: base64Image });
    }
};
