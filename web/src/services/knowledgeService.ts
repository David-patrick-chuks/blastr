import apiClient from './apiClient';
import type { Document, TrainingResult } from '../types/index.js';

export const knowledgeService = {
    async fetchDocuments(agentId: string): Promise<Document[]> {
        return apiClient.get<Document[]>(`/documents?agentId=${agentId}`);
    },

    async uploadDocument(agentId: string, file: File): Promise<TrainingResult> {
        const formData = new FormData();
        formData.append('agentId', agentId);
        formData.append('file', file);

        return apiClient.fetch<TrainingResult>('/documents/upload', {
            method: 'POST',
            body: formData,
        });
    },

    async deleteDocument(id: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/documents/${id}`);
    },

    async clearAgentKnowledge(agentId: string): Promise<{ success: boolean }> {
        return apiClient.post<{ success: boolean }>('/documents/clear', { agentId });
    },

    async trainFromYoutube(agentId: string, youtubeUrl: string): Promise<TrainingResult> {
        return apiClient.post<TrainingResult>('/documents/youtube', { agentId, youtubeUrl });
    },

    async crawlWebsite(agentId: string, url: string): Promise<TrainingResult> {
        return apiClient.post<TrainingResult>('/documents/website', { agentId, url });
    }
};
