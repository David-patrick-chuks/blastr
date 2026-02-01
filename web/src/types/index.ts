export * from './agent.js';
export * from './knowledge.js';
export interface ChatMessage {
    role: "assistant" | "user";
    text: string;
    sources?: string[];
}
export * from './chat.js';
