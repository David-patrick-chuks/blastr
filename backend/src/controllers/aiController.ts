import { Request, Response } from 'express';
import { generateContent, geminiService } from '../services/ai/geminiService.js';

export const generate = async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            res.status(400).json({ error: 'Prompt is required' });
            return;
        }

        const result = await generateContent(prompt);
        res.json({ text: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const extractEmails = async (req: Request, res: Response) => {
    try {
        const { image } = req.body; // base64 image
        if (!image) {
            res.status(400).json({ error: 'Image is required' });
            return;
        }

        const emails = await geminiService.extractEmailsFromImage(image);
        res.json({ emails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to extract emails' });
    }
};
