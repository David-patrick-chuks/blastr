import { PDFParse } from 'pdf-parse';
import csvParser from 'csv-parser';
import mammoth from 'mammoth';
import { Readable } from 'stream';
const textract = (await import('textract')).default as any;
import crypto from 'crypto';
import { query } from '../../config/db.js';
import { storeDocument, hybridSearch } from './vectorService.js';
import { logger } from '../../utils/logger.js';
import { uploadToFilesAPI, analyzeDocument } from '../ai/geminiService.js';
import { audioTranscriber } from '../ai/audioService.js';
import { CHUNK_CONFIG } from '../../constants/index.js';

import { ChunkMetadata, ChunkWithMetadata } from '../../types/index.js';
import { notifyRoom, SOCKET_EVENTS } from '../socketService.js';

export function generateContentHash(text: string): string {
    return crypto.createHash('sha256').update(text.trim()).digest('hex');
}

export async function getContentVersion(campaignId: string, contentHash: string, filename: string, userId?: string): Promise<number> {
    try {
        // Find existing content with same hash in documents table
        const existing = await query(
            'SELECT metadata FROM documents WHERE campaign_id = $1 AND metadata->>\'filename\' = $2 AND metadata->>\'contentHash\' = $3 AND user_id = $4 LIMIT 1',
            [campaignId, filename, contentHash, userId]
        );

        if (existing.rows.length > 0) {
            return (existing.rows[0].metadata as any).contentVersion || 1;
        }

        const highest = await query(
            'SELECT MAX((metadata->>\'contentVersion\')::int) as max_v FROM documents WHERE campaign_id = $1 AND metadata->>\'filename\' = $2 AND user_id = $3',
            [campaignId, filename, userId]
        );

        const maxV = (highest.rows[0] as any)?.max_v;
        return (maxV || 0) + 1;
    } catch (error: any) {
        logger.error('Error getting content version:', error.message || error);
        return 1;
    }
}

export function chunkText(text: string, maxLength: number = CHUNK_CONFIG.MAX_LENGTH, overlap: number = CHUNK_CONFIG.OVERLAP): ChunkWithMetadata[] {
    try {
        if (typeof text !== 'string' || text.trim().length === 0) return [];

        const paragraphs = text.split(/\n\s*\n/);
        let chunks: ChunkWithMetadata[] = [];
        let currentPosition = 0;
        let chunkIndex = 0;

        for (const paragraph of paragraphs) {
            if (paragraph.trim().length === 0) {
                currentPosition += paragraph.length + 2;
                continue;
            }

            if (paragraph.length <= maxLength) {
                const chunkText = paragraph.trim();
                chunks.push({
                    text: chunkText,
                    metadata: {
                        chunkIndex: chunkIndex++,
                        totalChunks: 0,
                        chunkSize: chunkText.length,
                        startPosition: currentPosition,
                        endPosition: currentPosition + chunkText.length,
                        section: `paragraph_${chunkIndex}`
                    }
                });
                currentPosition += paragraph.length + 2;
                continue;
            }

            const sentences = paragraph.split(/(?<=[.?!])\s+/);
            let current = '';
            let sentenceStartPosition = currentPosition;
            let i = 0;

            while (i < sentences.length) {
                current = '';
                let j = i;
                while (j < sentences.length && (current + sentences[j]).length <= maxLength) {
                    current += sentences[j] + ' ';
                    j++;
                }

                if (i === j) {
                    const chunkText = sentences[i].trim();
                    chunks.push({
                        text: chunkText,
                        metadata: {
                            chunkIndex: chunkIndex++,
                            totalChunks: 0,
                            chunkSize: chunkText.length,
                            startPosition: sentenceStartPosition,
                            endPosition: sentenceStartPosition + chunkText.length,
                            section: `sentence_${chunkIndex}`
                        }
                    });
                    sentenceStartPosition += sentences[i].length + 1;
                    i++;
                    continue;
                }

                const chunkText = current.trim();
                chunks.push({
                    text: chunkText,
                    metadata: {
                        chunkIndex: chunkIndex++,
                        totalChunks: 0,
                        chunkSize: chunkText.length,
                        startPosition: sentenceStartPosition,
                        endPosition: sentenceStartPosition + chunkText.length,
                        section: `paragraph_${chunkIndex}`
                    }
                });

                let overlapLen = 0;
                let k = j - 1;
                while (k > i && overlapLen < overlap) {
                    overlapLen += sentences[k].length + 1;
                    k--;
                }
                i = Math.max(i + 1, k);
                sentenceStartPosition += chunkText.length + 1;
            }
            currentPosition += paragraph.length + 2;
        }

        const finalChunks = chunks.filter(chunk => chunk.text.trim().length > 0);
        finalChunks.forEach(chunk => chunk.metadata.totalChunks = finalChunks.length);
        return finalChunks;
    } catch (err) {
        logger.error('chunkText error:', (err as any)?.message || err);
        return [];
    }
}

export async function parseFile(fileBuffer: Buffer, fileType: string, fileName: string): Promise<string> {
    const normalizedFileType = fileType.toLowerCase();

    if (normalizedFileType === 'application/pdf' || normalizedFileType === 'pdf') {
        try {
            logger.info(`Extracting PDF content natively via Gemini: ${fileName}`);
            const file = await uploadToFilesAPI(fileBuffer, 'application/pdf', fileName);
            const prompt = "Transcribe this PDF document into Markdown. Preserve logical sections, tables, and lists exactly as they appear. If there are charts, diagrams, or images with data, describe them in detail in their respective places. Provide ONLY the transcribed Markdown content without any other text or preamble.";
            const transcribedContent = await analyzeDocument(file.uri, 'application/pdf', prompt);

            if (transcribedContent && transcribedContent.trim().length > 10) {
                return transcribedContent;
            }
            logger.warn('Gemini native extraction returned empty or short result, falling back to pdf-parse');
        } catch (error) {
            logger.error('Gemini native PDF extraction failed, falling back to pdf-parse:', (error as any)?.message || error);
        }

        const pdfData = await (PDFParse as any)(fileBuffer);
        return pdfData.text;
    } else if (normalizedFileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || normalizedFileType === 'docx') {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        return result.value;
    } else if (normalizedFileType === 'text/csv' || normalizedFileType === 'csv') {
        return new Promise((resolve, reject) => {
            const results: string[] = [];
            Readable.from(fileBuffer)
                .pipe(csvParser())
                .on('data', (data) => results.push(JSON.stringify(data)))
                .on('end', () => resolve(results.join('\n')))
                .on('error', reject);
        });
    } else if (normalizedFileType.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'ogg'].includes(normalizedFileType)) {
        logger.info(`Transcribing audio content via Gemini: ${fileName}`);
        return await audioTranscriber.transcribeAudio(fileBuffer, fileName);
    } else if (normalizedFileType === 'text/plain' || normalizedFileType === 'txt') {
        return fileBuffer.toString('utf-8');
    }

    throw new Error(`Unsupported file type: ${fileType}`);
}

export const processUpload = async (campaignId: string, file: Express.Multer.File, userId?: string) => {
    const room = userId || campaignId;
    try {
        notifyRoom(room, SOCKET_EVENTS.TRAINING_PROGRESS, { status: 'PARSING', progress: 10, message: `Extracting knowledge from ${file.originalname}...` });

        const content = await parseFile(file.buffer, file.mimetype || file.originalname.split('.').pop() || '', file.originalname);
        const contentHash = generateContentHash(content);
        const contentVersion = await getContentVersion(campaignId, contentHash, file.originalname, userId);

        notifyRoom(room, SOCKET_EVENTS.TRAINING_PROGRESS, { status: 'CHUNKING', progress: 30, message: 'Optimizing knowledge for neural retrieval...' });
        const chunks = chunkText(content);

        notifyRoom(room, SOCKET_EVENTS.TRAINING_PROGRESS, { status: 'INDEXING', progress: 50, message: `Indexing ${chunks.length} neural fragments...`, total: chunks.length, current: 0 });

        let current = 0;
        for (const chunk of chunks) {
            await storeDocument(campaignId, chunk.text, {
                filename: file.originalname,
                contentHash,
                contentVersion,
                ...(chunk.metadata as any)
            }, userId);

            current++;
            if (current % 5 === 0 || current === chunks.length) {
                notifyRoom(room, SOCKET_EVENTS.TRAINING_PROGRESS, {
                    status: 'INDEXING',
                    progress: 50 + Math.floor((current / chunks.length) * 45),
                    message: `Indexed ${current}/${chunks.length} fragments`,
                    total: chunks.length,
                    current
                });
            }
        }

        notifyRoom(room, SOCKET_EVENTS.TRAINING_PROGRESS, { status: 'COMPLETED', progress: 100, message: 'Knowledge synchronized successfully.' });
        logger.info(`Processed ${file.originalname} (v${contentVersion}) into ${chunks.length} chunks`);
        return { success: true, chunks: chunks.length };
    } catch (error: any) {
        notifyRoom(room, SOCKET_EVENTS.TRAINING_PROGRESS, { status: 'FAILED', error: error.message || 'Processing failed' });
        logger.error('Document processing failed:', error.message || error);
        throw error;
    }
};

export const getContextForQuery = async (campaignId: string, queryText: string, userId?: string) => {
    const similarDocs = await hybridSearch(campaignId, queryText, 3, userId);
    return {
        text: similarDocs.map(d => d.content).join('\n\n---\n\n'),
        sources: Array.from(new Set(similarDocs.map(d => (d.metadata as any)?.filename).filter(Boolean)))
    };
};
