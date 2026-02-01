import { Request } from 'express';
import { URL } from 'url';

// Security configuration
export const SECURITY_CONFIG = {
    // File upload limits
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_FILES_PER_REQUEST: 10,
    MAX_TEXT_LENGTH: 10 * 1024 * 1024, // 10MB for large training data

    // Allowed file extensions (whitelist approach)
    ALLOWED_DOCUMENT_EXTENSIONS: ['.pdf', '.docx', '.doc', '.txt', '.csv', '.md'],
    ALLOWED_AUDIO_EXTENSIONS: ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'],
    ALLOWED_VIDEO_EXTENSIONS: ['.mp4', '.webm', '.mov', '.avi', '.mkv'],

    // Blocked file extensions (blacklist approach)
    BLOCKED_EXTENSIONS: [
        '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
        '.php', '.asp', '.aspx', '.jsp', '.py', '.pl', '.sh', '.ps1', '.psm1',
        '.dll', '.so', '.dylib', '.bin', '.msi', '.app', '.deb', '.rpm'
    ],

    // URL validation
    ALLOWED_PROTOCOLS: ['http:', 'https:'],
    BLOCKED_DOMAINS: ['localhost', '127.0.0.1', '0.0.0.0', '::1'],
    MAX_URL_LENGTH: 2048,

    // Input sanitization
    MAX_AGENT_ID_LENGTH: 100,
    MAX_QUESTION_LENGTH: 50000,
    MAX_SOURCE_URL_LENGTH: 500,
    MAX_METADATA_SIZE: 50000, // ~50KB
};

export function sanitizeAgentId(agentId: string): { isValid: boolean; sanitized?: string; error?: string } {
    if (!agentId || typeof agentId !== 'string') {
        return { isValid: false, error: 'Agent ID is required and must be a string' };
    }

    if (agentId.length > SECURITY_CONFIG.MAX_AGENT_ID_LENGTH) {
        return { isValid: false, error: `Agent ID too long (max ${SECURITY_CONFIG.MAX_AGENT_ID_LENGTH} characters)` };
    }

    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /data:/i,
        /vbscript:/i,
        /on\w+\s*=/i,
        /["'&<>]/,
        /[^\w\-_.]/
    ];

    for (const pattern of dangerousPatterns) {
        if (pattern.test(agentId)) {
            return { isValid: false, error: 'Agent ID contains invalid or dangerous characters' };
        }
    }

    const sanitized = agentId.trim();
    if (sanitized.length === 0) {
        return { isValid: false, error: 'Agent ID cannot be empty' };
    }

    return { isValid: true, sanitized };
}

export function sanitizeQuestion(question: string): { isValid: boolean; sanitized?: string; error?: string } {
    if (!question || typeof question !== 'string') {
        return { isValid: false, error: 'Question is required and must be a string' };
    }

    if (question.length > SECURITY_CONFIG.MAX_QUESTION_LENGTH) {
        return { isValid: false, error: `Question too long (max ${SECURITY_CONFIG.MAX_QUESTION_LENGTH} characters)` };
    }

    const sanitized = question
        .trim()
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .substring(0, SECURITY_CONFIG.MAX_QUESTION_LENGTH);

    if (sanitized.length === 0) {
        return { isValid: false, error: 'Question contains no valid content' };
    }

    return { isValid: true, sanitized };
}

export function sanitizeSourceUrl(sourceUrl: string): { isValid: boolean; sanitized?: string; error?: string } {
    if (!sourceUrl || typeof sourceUrl !== 'string') {
        return { isValid: false, error: 'Source URL is required and must be a string' };
    }

    if (sourceUrl.length > SECURITY_CONFIG.MAX_SOURCE_URL_LENGTH) {
        return { isValid: false, error: `Source URL too long (max ${SECURITY_CONFIG.MAX_SOURCE_URL_LENGTH} characters)` };
    }

    try {
        const url = new URL(sourceUrl);

        if (!SECURITY_CONFIG.ALLOWED_PROTOCOLS.includes(url.protocol)) {
            return { isValid: false, error: `Protocol not allowed: ${url.protocol}` };
        }

        const hostname = url.hostname.toLowerCase();
        if (SECURITY_CONFIG.BLOCKED_DOMAINS.includes(hostname)) {
            return { isValid: false, error: `Domain not allowed: ${hostname}` };
        }

        if (hostname.match(/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.|169\.254\.|::1$)/)) {
            return { isValid: false, error: 'Private/local IP addresses not allowed' };
        }

        const cleanUrl = new URL(url);
        const dangerousParams = ['javascript', 'data', 'vbscript', 'file'];
        dangerousParams.forEach(param => {
            cleanUrl.searchParams.delete(param);
        });

        return { isValid: true, sanitized: cleanUrl.toString() };
    } catch (error) {
        return { isValid: false, error: 'Invalid URL format' };
    }
}

export function validateFileUpload(file: any): { isValid: boolean; error?: string } {
    if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
        return { isValid: false, error: `File too large (max ${SECURITY_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB)` };
    }

    const extension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));

    if (SECURITY_CONFIG.BLOCKED_EXTENSIONS.includes(extension)) {
        return { isValid: false, error: `File type not allowed: ${extension}` };
    }

    const allAllowedExtensions = [
        ...SECURITY_CONFIG.ALLOWED_DOCUMENT_EXTENSIONS,
        ...SECURITY_CONFIG.ALLOWED_AUDIO_EXTENSIONS,
        ...SECURITY_CONFIG.ALLOWED_VIDEO_EXTENSIONS
    ];

    if (!allAllowedExtensions.includes(extension)) {
        return { isValid: false, error: `File type not allowed: ${extension}` };
    }

    const allowedMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'text/csv',
        'text/markdown',
        'audio/mpeg',
        'audio/wav',
        'audio/mp4',
        'audio/aac',
        'audio/ogg',
        'audio/flac',
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-matroska'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
        return { isValid: false, error: `MIME type not allowed: ${file.mimetype}` };
    }

    return { isValid: true };
}

export function sanitizeText(text: string, maxLength: number = SECURITY_CONFIG.MAX_TEXT_LENGTH): { isValid: boolean; sanitized?: string; error?: string } {
    if (!text || typeof text !== 'string') {
        return { isValid: false, error: 'Text is required and must be a string' };
    }

    if (text.length > maxLength) {
        return { isValid: false, error: `Text too long (max ${maxLength} characters)` };
    }

    const sanitized = text
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/<[^>]*>/g, '')
        .substring(0, maxLength);

    if (sanitized.length === 0) {
        return { isValid: false, error: 'Text contains no valid content' };
    }

    return { isValid: true, sanitized };
}

export function sanitizeMetadata(metadata: any): { isValid: boolean; sanitized?: any; error?: string } {
    if (!metadata || typeof metadata !== 'object') {
        return { isValid: true, sanitized: {} };
    }

    const metadataStr = JSON.stringify(metadata);
    if (metadataStr.length > SECURITY_CONFIG.MAX_METADATA_SIZE) {
        return { isValid: false, error: `Metadata too large (max ${SECURITY_CONFIG.MAX_METADATA_SIZE} characters)` };
    }

    const sanitized = sanitizeObject(metadata);
    return { isValid: true, sanitized };
}

function sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
            const sanitizedKey = key.replace(/[^\w\-_.]/g, '');
            if (sanitizedKey) {
                sanitized[sanitizedKey] = sanitizeObject(value);
            }
        }
        return sanitized;
    }

    if (typeof obj === 'string') {
        return obj.replace(/[<>\"'&]/g, '').substring(0, 1000);
    }

    return obj;
}

export function validateSource(source: string): { isValid: boolean; error?: string } {
    const allowedSources = ['audio', 'video', 'document', 'website', 'youtube'];
    if (!source || !allowedSources.includes(source)) {
        return { isValid: false, error: `Source must be one of: ${allowedSources.join(', ')}` };
    }
    return { isValid: true };
}

export function sanitizeRequest(req: Request): { isValid: boolean; sanitized?: any; error?: string } {
    const sanitized: any = {};

    if (req.body.agentId) {
        const agentIdResult = sanitizeAgentId(req.body.agentId);
        if (!agentIdResult.isValid) return { isValid: false, error: agentIdResult.error };
        sanitized.agentId = agentIdResult.sanitized;
    }

    if (req.body.question) {
        const questionResult = sanitizeQuestion(req.body.question);
        if (!questionResult.isValid) return { isValid: false, error: questionResult.error };
        sanitized.question = questionResult.sanitized;
    }

    if (req.body.text) {
        const textResult = sanitizeText(req.body.text);
        if (!textResult.isValid) return { isValid: false, error: textResult.error };
        sanitized.text = textResult.sanitized;
    }

    if (req.body.source) {
        const sourceResult = validateSource(req.body.source);
        if (!sourceResult.isValid) return { isValid: false, error: sourceResult.error };
        sanitized.source = req.body.source;
    }

    if (req.body.sourceUrl) {
        const urlResult = sanitizeSourceUrl(req.body.sourceUrl);
        if (!urlResult.isValid) return { isValid: false, error: urlResult.error };
        sanitized.sourceUrl = urlResult.sanitized;
    }

    if (req.body.sourceMetadata) {
        const metadataResult = sanitizeMetadata(req.body.sourceMetadata);
        if (!metadataResult.isValid) return { isValid: false, error: metadataResult.error };
        sanitized.sourceMetadata = metadataResult.sanitized;
    }

    if ((req as any).files && Array.isArray((req as any).files)) {
        if ((req as any).files.length > SECURITY_CONFIG.MAX_FILES_PER_REQUEST) {
            return { isValid: false, error: `Too many files (max ${SECURITY_CONFIG.MAX_FILES_PER_REQUEST})` };
        }
        for (const file of (req as any).files) {
            const fileResult = validateFileUpload(file);
            if (!fileResult.isValid) return { isValid: false, error: fileResult.error };
        }
        sanitized.files = (req as any).files;
    }

    return { isValid: true, sanitized };
}
