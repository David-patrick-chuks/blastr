import apiClient from './apiClient';
import type { Document, TrainingResult } from '../types/index.js';

export const knowledgeService = {
    async fetchDocuments(campaignId: string): Promise<Document[]> {
        return apiClient.get<Document[]>(`/documents?campaignId=${campaignId}`);
    },

    async uploadDocument(campaignId: string, file: File): Promise<TrainingResult> {
        const formData = new FormData();
        formData.append('campaignId', campaignId);
        formData.append('file', file);

        return apiClient.fetch<TrainingResult>('/documents/upload', {
            method: 'POST',
            body: formData,
        });
    },

    async deleteDocument(id: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/documents/${id}`);
    },

    async clearCampaignKnowledge(campaignId: string): Promise<{ success: boolean }> {
        return apiClient.post<{ success: boolean }>('/documents/clear', { campaignId });
    },

    async trainFromYoutube(campaignId: string, youtubeUrl: string): Promise<TrainingResult> {
        return apiClient.post<TrainingResult>('/documents/youtube', { campaignId, youtubeUrl });
    },

    async crawlWebsite(campaignId: string, url: string): Promise<TrainingResult> {
        return apiClient.post<TrainingResult>('/documents/website', { campaignId, url });
    }
};
