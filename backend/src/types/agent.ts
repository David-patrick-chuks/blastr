export interface Agent {
    id: string;
    user_id: string;
    name: string;
    email: string;
    smtp_host: string;
    smtp_port: number;
    smtp_secure: boolean;
    smtp_user: string;
    smtp_pass: string;
    from_name?: string;
    status: 'unverified' | 'active' | 'failed' | 'rate_limited';
    last_verified_at?: Date;
    daily_sent_count: number;
    daily_limit: number;
    last_reset_at: Date;
    created_at: Date;
    updated_at: Date;
}

export interface Campaign {
    id: string;
    user_id: string;
    agent_id?: string;
    name: string;
    subject: string;
    template: string;
    system_instruction?: string;
    status: string;
    total_recipients?: number;
    sent_count?: number;
    failed_count?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface AgentStats {
    id: string;
    name: string;
    email: string;
    status: string;
    daily_sent_count: number;
    daily_limit: number;
    quota_remaining: number;
    quota_percentage: number;
    last_verified_at?: Date;
}
