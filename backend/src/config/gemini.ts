import { GoogleGenAI } from '@google/genai';
import { env } from './env.js';

if (!env.GEMINI_API_KEY) {
    console.warn('Gemini API key missing. AI features may not work.');
}

// Pass a dummy key if missing to prevent crash on startup. 
// Real calls will fail, which is expected behavior without a key.
export const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY || 'dummy-key' });
