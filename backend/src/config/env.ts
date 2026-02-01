import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Env {
    PORT: number;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    GEMINI_API_KEY: string;
    DATABASE_URL: string;
    TELEGRAM_BOT_TOKEN?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
}

const getEnvInput = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        console.warn(`Missing environment variable: ${key}`);
        return '';
    }
    return value.trim();
};

export const env: Env = {
    PORT: parseInt(process.env.PORT || '3000', 10),
    SUPABASE_URL: getEnvInput('SUPABASE_URL').trim(),
    SUPABASE_KEY: getEnvInput('SUPABASE_KEY').trim(),
    GEMINI_API_KEY: getEnvInput('GEMINI_API_KEY').trim(),
    DATABASE_URL: getEnvInput('DATABASE_URL').trim(),
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
};

console.log('[ENV] Initialized');
console.log(`[ENV] Database URL length: ${env.DATABASE_URL.length}`);
console.log(`[ENV] Supabase URL: ${env.SUPABASE_URL}`);
console.log(`[ENV] Supabase Key length: ${env.SUPABASE_KEY.length}`);
