export interface ChatMessage {
    role: 'user' | 'assistant';
    text: string;
    sources?: string[];
}

export interface ChatResponse {
    role: 'assistant';
    text: string;
    sources?: string[];
}
