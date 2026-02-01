import apiClient from './apiClient';
import type { ChatMessage, ChatResponse } from '../types/index.js';

export const chatService = {
    async chatWithAgent(agentId: string, message: string, history: ChatMessage[] = []): Promise<ChatResponse> {
        return apiClient.post<ChatResponse>('/chat', { agentId, message, history });
    }
};
