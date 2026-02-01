export interface Campaign {
    id: string;
    name: string;
    role: string;
    template: string;
    system_instruction: string;
    status: string;
    total_recipients?: number;
    sent_count?: number;
    created_at?: Date;
    updated_at?: Date;
}
