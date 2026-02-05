export interface Agent {
    id: string;
    user_id: string;
    name: string;
    email: string;
    smtp_host: string;
    smtp_port: number;
    smtp_secure: boolean;
    smtp_user: string;
    smtp_pass?: string;
    from_name?: string;
    status: string;
    daily_sent_count: number;
    daily_limit: number;
    created_at?: string;
    updated_at?: string;
}

export interface Campaign {
    id: string;
    user_id: string;
    agent_id?: string;
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
