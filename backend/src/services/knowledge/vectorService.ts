import { embedText } from '../ai/geminiService.js';
import { logger } from '../../utils/logger.js';
import { query } from '../../config/db.js';
import { DEFAULT_MATCH_THRESHOLD } from '../../constants/index.js';

/**
 * Generates an embedding for the given text using the configured Gemini model.
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
    return embedText(text);
};

/**
 * Stores a document with its embedding in the vector database.
 */
export const storeDocument = async (campaignId: string, content: string, metadata: any, userId?: string) => {
    try {
        const embedding = await generateEmbedding(content);
        const vectorStr = `[${embedding.join(',')}]`;

        const sql = `
            INSERT INTO documents (campaign_id, content, metadata, embedding, user_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `;

        const res = await query(sql, [campaignId, content, metadata, vectorStr, userId]);
        return res.rows[0];
    } catch (error: any) {
        logger.error('Failed to store document:', error.message || error);
        throw error;
    }
};

/**
 * Performs a similarity search using the match_documents stored procedure.
 */
export const searchSimilarDocuments = async (campaignId: string, queryText: string, limit = 3, userId?: string) => {
    try {
        const embedding = await generateEmbedding(queryText);
        const vectorStr = `[${embedding.join(',')}]`;

        const sql = `
            SELECT * FROM match_documents(
                $2::vector, 
                $3, 
                $4, 
                $1::uuid,
                $5::uuid
            );
        `;

        const res = await query(sql, [campaignId, vectorStr, DEFAULT_MATCH_THRESHOLD, limit, userId]);
        return res.rows;
    } catch (error: any) {
        logger.error('Vector search failed:', error.message || error);
        return [];
    }
};

/**
 * Performs a hybrid search (keyword + semantic) using the hybrid_search stored procedure.
 * This combines tsvector keyword search with pgvector semantic similarity using RRF fusion.
 */
export const hybridSearch = async (campaignId: string, queryText: string, limit = 3, userId?: string) => {
    try {
        const embedding = await generateEmbedding(queryText);
        const vectorStr = `[${embedding.join(',')}]`;

        const sql = `
            SELECT * FROM hybrid_search(
                $1, 
                $2::vector, 
                $3::uuid, 
                $4,
                $5::uuid
            );
        `;

        const res = await query(sql, [queryText, vectorStr, campaignId, limit, userId]);
        return res.rows;
    } catch (error: any) {
        logger.error('Hybrid search failed:', error.message || error);
        return [];
    }
};

/**
 * Retrieves all documents belonging to a campaign using the get_campaign_documents procedure.
 */
export const getCampaignDocuments = async (campaignId: string, userId?: string) => {
    try {
        const sql = `SELECT * FROM get_campaign_documents($1::uuid, $2::uuid);`;
        const res = await query(sql, [campaignId, userId]);
        return res.rows;
    } catch (error: any) {
        logger.error('Failed to get campaign documents:', error.message || error);
        throw error;
    }
};

/**
 * Deletes a specific document using the delete_document procedure.
 */
export const deleteDocument = async (id: string, userId?: string) => {
    try {
        const sql = `SELECT delete_document($1::uuid, $2::uuid);`;
        await query(sql, [id, userId]);
        return { success: true };
    } catch (error: any) {
        logger.error('Failed to delete document:', error.message || error);
        throw error;
    }
};

/**
 * Clears all knowledge associated with a campaign.
 */
export const clearCampaignKnowledge = async (campaignId: string, userId?: string) => {
    try {
        const sql = `DELETE FROM documents WHERE campaign_id = $1::uuid AND user_id = $2::uuid;`;
        await query(sql, [campaignId, userId]);
        return { success: true };
    } catch (error: any) {
        logger.error('Failed to clear campaign knowledge:', error.message || error);
        throw error;
    }
};
