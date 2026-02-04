import { geminiService } from './geminiService.js';
import { logger } from '../../utils/logger.js';
import { storeDocument } from '../knowledge/vectorService.js';
import { chunkText } from '../knowledge/documentService.js';
import { GEMINI_MODELS } from '../../constants/index.js';

export class YoutubeService {
    /**
     * Extracts content from a YouTube video and stores it in the knowledge base.
     */
    async processYoutubeUrl(campaignId: string, youtubeUrl: string, userId: string) {
        try {
            logger.info(`Processing YouTube URL: ${youtubeUrl} for campaign: ${campaignId}`);

            const systemPrompt = `You are an AI assistant tasked with creating a clean transcript and summary of YouTube video content for a RAG system. Extract spoken words and key visual details verbatim.`;

            // Using the geminiService to interact with the API
            const ai = (geminiService as any).getCurrentClient();

            // The user snippet uses ai.models.generateContent
            // We'll use gemini-2.5-flash which supports YouTube URLs in preview
            // Note: The user snippet mentions gemini-3-flash-preview, but 1.5-flash is widely available for this.

            const response = await ai.models.generateContent({
                model: GEMINI_MODELS.FLASH_3, // Sticking to known working model, or could use "gemini-2.0-flash-exp"
                contents: [
                    {
                        fileData: {
                            fileUri: youtubeUrl,
                            mimeType: 'video/*',
                        },
                    },
                    { text: "Extract a detailed transcript of the spoken words and on-screen text from this video. If transcript is not available, provide a very detailed scene-by-scene summary." }
                ],
                config: {
                    systemInstruction: systemPrompt,
                }
            });

            const content = response.text || '';
            if (!content) {
                throw new Error("Failed to extract content from YouTube video");
            }

            // Chunk and store
            const chunks = chunkText(content);
            for (const chunk of chunks) {
                await storeDocument(campaignId, chunk.text, {
                    source: 'youtube',
                    url: youtubeUrl,
                    ...chunk.metadata as any
                }, userId);
            }

            logger.info(`Successfully processed YouTube video into ${chunks.length} chunks`);
            return { success: true, chunks: chunks.length };
        } catch (error: any) {
            logger.error('YouTube processing failed:', error.message || error);
            throw error;
        }
    }
}

export const youtubeService = new YoutubeService();
