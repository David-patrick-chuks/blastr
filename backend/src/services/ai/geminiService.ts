import { GoogleGenAI, Content } from "@google/genai";
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { GEMINI_MODELS, MAX_RETRY_COUNT, DEFAULT_TEMPERATURE } from '../../constants/index.js';
import path from 'path';
import fs from 'fs';

class GeminiServiceClass {
    private apiKeys: string[];
    private currentApiKeyIndex: number = 0;
    private clients: GoogleGenAI[] = [];

    constructor() {
        this.apiKeys = [];
        if (env.GEMINI_API_KEY) this.apiKeys.push(env.GEMINI_API_KEY);

        for (let i = 1; i <= 10; i++) {
            const key = process.env[`GEMINI_API_KEY_${i}`];
            if (key && key !== env.GEMINI_API_KEY) {
                this.apiKeys.push(key);
            }
        }

        if (this.apiKeys.length === 0) {
            throw new Error('No Gemini API keys found in environment variables');
        }

        this.clients = this.apiKeys.map(key => new GoogleGenAI({ apiKey: key }));
        logger.info(`Initialized Gemini service with ${this.apiKeys.length} API keys`);
    }

    private switchApiKey(): void {
        this.currentApiKeyIndex = (this.currentApiKeyIndex + 1) % this.apiKeys.length;
        logger.info(`Switched to API key ${this.currentApiKeyIndex + 1}/${this.apiKeys.length}`);
    }

    private getCurrentClient(): GoogleGenAI {
        return this.clients[this.currentApiKeyIndex];
    }

    private formatContents(prompt: string, history: any[] = []): any[] {
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        // Remove assistant placeholders or empty messages from history to prevent SDK errors
        const validHistory = formattedHistory.filter(h => h.parts[0].text);

        return [...validHistory, { role: 'user', parts: [{ text: prompt }] }];
    }

    async generateContent(prompt: string, options: any = {}): Promise<string> {
        try {
            const ai = this.getCurrentClient();
            const contents = this.formatContents(prompt, options.history || []);

            const res = await ai.models.generateContent({
                model: GEMINI_MODELS.FLASH_1_5,
                contents: contents,
                config: {
                    systemInstruction: options.systemInstruction,
                    temperature: options.temperature || DEFAULT_TEMPERATURE,
                }
            });

            return res.text || '';
        } catch (error: any) {
            logger.error("Error generating content:", error);
            if (error.message?.includes("429")) {
                this.switchApiKey();
                return this.generateContent(prompt, options);
            }
            throw new Error("Failed to generate content");
        }
    }

    async *generateContentStream(prompt: string, options: any = {}) {
        try {
            const ai = this.getCurrentClient();
            const contents = this.formatContents(prompt, options.history || []);

            const stream = await (ai.models as any).generateContentStream({
                model: GEMINI_MODELS.FLASH_1_5,
                contents: contents,
                config: {
                    systemInstruction: options.systemInstruction,
                    temperature: options.temperature || DEFAULT_TEMPERATURE,
                }
            });

            for await (const chunk of stream.stream) {
                const chunkText = chunk.text();
                if (chunkText) {
                    yield chunkText;
                }
            }
        } catch (error: any) {
            logger.error("Error generating content stream:", error);
            if (error.message?.includes("429")) {
                this.switchApiKey();
                throw error;
            }
            throw new Error("Failed to generate content stream");
        }
    }

    async extractEmailsFromImage(base64Image: string): Promise<string[]> {
        const prompt = `Extract all email addresses from this image. Return them as a comma-separated list of ONLY the email addresses. If no emails are found, return an empty string.`;
        try {
            console.log(`[AI] Calling Gemini 3 Vision model (High Res) for extraction...`);
            const ai = this.getCurrentClient();
            const res = await ai.models.generateContent({
                model: GEMINI_MODELS.FLASH_3,
                contents: [{
                    role: 'user',
                    parts: [
                        { inlineData: { data: base64Image, mimeType: 'image/png' } },
                        { text: prompt }
                    ]
                }],
                config: {
                    mediaResolution: 'HIGH'
                } as any
            });

            const text = res.text || '';
            console.log(`[AI] Raw vision response: "${text}"`);
            return text.split(',').map(e => e.trim()).filter(e => e.includes('@'));
        } catch (error) {
            logger.error(`Email extraction from image failed: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }

    async generateEmailVariations(template: string, recipientData: any): Promise<string[]> {
        const prompt = `Generate 3 distinct, high-quality semantic variations of the following email template for a recipient named ${recipientData.name as string} who works at ${recipientData.company as string}. 
        Template: ${template}
        Ensure the tone is professional but human. Return the variations separated by "---VARIATION---".`;

        try {
            const content = await this.generateContent(prompt, { temperature: 0.8 });
            return content.split('---VARIATION---').map(v => v.trim()).filter(v => v.length > 10);
        } catch (error) {
            logger.error(`Email variation generation failed: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }

    async analyzeSpamRisk(subject: string, body: string): Promise<any> {
        const prompt = `Analyze the following email for spam risk and deliverability.
        Subject: ${subject}
        Body: ${body}
        
        Provide a risk score from 0-10, identify trigger words, and suggest safer rewrites. 
        Format as JSON: { "score": number, "triggerWords": string[], "suggestions": string }`;

        try {
            const content = await this.generateContent(prompt, { temperature: 0 });
            // Attempt to parse JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return { score: 0, triggerWords: [], suggestions: "Could not analyze" };
        } catch (error) {
            logger.error(`Spam risk analysis failed: ${error instanceof Error ? error.message : String(error)}`);
            return { score: 5, triggerWords: [], suggestions: "Analysis error" };
        }
    }
}

export const geminiService = new GeminiServiceClass();
export const generateContent = (prompt: string, options: any = {}) => geminiService.generateContent(prompt, options);
export const generateContentStream = (prompt: string, options: any = {}) => geminiService.generateContentStream(prompt, options);
