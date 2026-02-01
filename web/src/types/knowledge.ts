export interface ChunkMetadata {
    chunkIndex: number;
    totalChunks: number;
    chunkSize: number;
    startPosition?: number;
    endPosition?: number;
    section?: string;
    filename?: string;
    contentHash?: string;
    contentVersion?: number;
    source?: string;
    url?: string;
}

export interface Document {
    id: string;
    agent_id: string;
    content: string;
    metadata: ChunkMetadata;
    created_at: string;
}

export interface TrainingResult {
    success: boolean;
    chunks: number;
    message?: string;
}
