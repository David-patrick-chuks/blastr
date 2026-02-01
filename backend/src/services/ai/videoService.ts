import { GoogleGenAI, createPartFromUri, createUserContent } from '@google/genai';
import { env } from '../../config/env.js';
import fs from 'fs';
import * as mime from 'mime-types';
import path from 'path';
import { logger } from '../../utils/logger.js';
import { GEMINI_MODELS } from '../../constants/index.js';

export class VideoProcessor {
    private apiKeys: string[];
    private currentApiKeyIndex: number = 0;
    private ai: GoogleGenAI;

    constructor() {
        this.apiKeys = [env.GEMINI_API_KEY as string];
        for (let i = 1; i <= 10; i++) {
            const key = process.env[`GEMINI_API_KEY_${i}`];
            if (key && key !== env.GEMINI_API_KEY) this.apiKeys.push(key);
        }
        if (this.apiKeys.length === 0 || !this.apiKeys[0]) throw new Error('No Gemini API keys found');
        this.ai = new GoogleGenAI({ apiKey: this.apiKeys[this.currentApiKeyIndex] });
    }

    private switchApiKey() {
        this.currentApiKeyIndex = (this.currentApiKeyIndex + 1) % this.apiKeys.length;
        this.ai = new GoogleGenAI({ apiKey: this.apiKeys[this.currentApiKeyIndex] });
        logger.info(`🔄 Switched to API key: ${this.currentApiKeyIndex + 1} for video processing`);
    }

    async processVideo(video: Buffer | string, originalName = 'video.mp4', clientMimeType?: string, retryCount = 0, maxRetries = 3): Promise<string> {
        let tempPath: string | null = null;
        let uploadedFile: any = null;
        try {
            if (Buffer.isBuffer(video)) {
                tempPath = path.join(process.cwd(), `temp-video-${Date.now()}-${Math.random().toString(36).slice(2)}.mp4`);
                fs.writeFileSync(tempPath, video);
            } else {
                tempPath = video;
                if (!fs.existsSync(tempPath)) throw new Error(`File not found: ${tempPath}`);
            }

            const mimeType = clientMimeType || (mime as any).lookup(originalName) || 'video/mp4';

            logger.info(`Uploading video ${originalName}...`);

            // Use the latest SDK upload method
            const myfile = await this.ai.files.upload({
                file: tempPath,
                config: { mimeType },
            });

            const systemPrompt = `You are an AI assistant tasked with creating a clean transcript of video content for a RAG system. Extract spoken words and on-screen text verbatim.`;

            const result = await this.ai.models.generateContent({
                model: GEMINI_MODELS.FLASH_3,
                contents: createUserContent([
                    createPartFromUri(myfile.uri!, myfile.mimeType!),
                    "Extract ONLY the spoken words and on-screen text from this video."
                ]),
                config: {
                    temperature: 0,
                    systemInstruction: systemPrompt
                }
            });

            return result.text || '';
        } catch (error: any) {
            if (retryCount < maxRetries && (error.message?.includes('429') || error.message?.includes('503'))) {
                this.switchApiKey();
                return this.processVideo(video, originalName, clientMimeType, retryCount + 1, maxRetries);
            }
            throw error;
        } finally {
            if (Buffer.isBuffer(video) && tempPath && fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        }
    }
}
