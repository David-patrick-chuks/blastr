export interface Campaign {
    id: string;
    name: string;
    role: string;
    template: string;
    system_instruction: string;
    status: string;
    total_recipients?: number;
    sent_count?: number;
    created_at?: string;
    updated_at?: string;
    integrations?: any;
}

export type Agent = Campaign;

export interface AgentCredentials {
    token?: string;
    email?: string;
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    accessSecret?: string;
    signingSecret?: string;
    appToken?: string;
}
