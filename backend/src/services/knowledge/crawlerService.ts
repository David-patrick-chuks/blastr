import fetch from 'node-fetch';
import { logger } from '../../utils/logger.js';
import { storeDocument } from './vectorService.js';
import { chunkText } from './documentService.js';
import { generateContent } from '../ai/geminiService.js';

export class CrawlerService {
    /**
     * Crawls a website URL, extracts meaningful text, and stores it in the knowledge base.
     */
    async crawlUrl(campaignId: string, url: string, userId: string) {
        try {
            logger.info(`Crawling URL: ${url} for campaign: ${campaignId}`);

            // Fetch HTML content
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch URL: ${response.statusText}`);
            }

            const html = await response.text();

            // Use Gemini to extract the core content from raw HTML (avoiding nav, footers, ads)
            const prompt = `
                I am providing you with the raw HTML of a webpage. 
                Your task is to extract ONLY the main article content, meaningful headings, and useful text. 
                Ignore navigation menus, footers, advertisements, and sidebar clutter.
                Format the output in clean Markdown.
                URL: ${url}
                HTML Content:
                ${html.slice(0, 30000)} // Limit to avoid hitting token limits for raw HTML
            `;

            logger.info(`Analyzing website content with Gemini...`);
            const extractedContent = await generateContent(prompt, {
                systemInstruction: "You are a web scraping expert that extracts clean, structured knowledge from raw HTML."
            });

            if (!extractedContent || extractedContent.trim().length < 50) {
                throw new Error("Failed to extract meaningful content from the website.");
            }

            // Chunk and store
            const chunks = chunkText(extractedContent);
            for (const chunk of chunks) {
                await storeDocument(campaignId, chunk.text, {
                    source: 'website',
                    url: url,
                    ...chunk.metadata as any
                }, userId);
            }

            logger.info(`Successfully crawled website: ${url} into ${chunks.length} chunks`);
            return { success: true, chunks: chunks.length };
        } catch (error: any) {
            logger.error('Website crawling failed:', error.message || error);
            throw error;
        }
    }
}

export const crawlerService = new CrawlerService();
