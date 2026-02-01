import { Request, Response } from 'express';
import { generateContent, generateContentStream } from '../services/ai/geminiService.js';
import { pool } from '../config/db.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export const chatWithAgent = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { agentId, message, history, stream } = req.body;

    if (!agentId || !message) {
        res.status(400).json({ error: 'Agent ID and message are required' });
        return;
    }

    try {
        // Fetch agent system instruction and verify ownership
        const agentResult = await pool.query('SELECT system_instruction FROM agents WHERE id = $1 AND user_id = $2', [agentId, userId]);
        if (agentResult.rows.length === 0) {
            res.status(404).json({ error: 'Agent not found or unauthorized' });
            return;
        }

        const systemInstruction = agentResult.rows[0].system_instruction;

        // RAG: Fetch relevant context
        let context = { text: '', sources: [] as string[] };
        try {
            const { getContextForQuery } = await import('../services/knowledge/documentService.js');
            context = await getContextForQuery(agentId, message);
        } catch (e: any) {
            console.error('RAG context retrieval failed:', e.message);
        }

        const augmentedMessage = context.text
            ? `Context from knowledge base:\n${context.text}\n\nUser Question: ${message}`
            : message;

        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            let fullResponse = '';
            const streamer = generateContentStream(augmentedMessage, {
                history,
                systemInstruction
            });

            for await (const chunk of streamer) {
                fullResponse += chunk;
                res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
            }

            // Final message with sources
            res.write(`data: ${JSON.stringify({ done: true, sources: context.sources })}\n\n`);
            res.end();

            // Background: record activity
            recordChatActivity(agentId, userId!, message, fullResponse);
            return;
        }

        const responseText = await generateContent(augmentedMessage, {
            history,
            systemInstruction
        });

        // Record messages and activity
        await recordChatActivity(agentId, userId!, message, responseText);

        res.json({ role: 'assistant', text: responseText, sources: context.sources });
    } catch (error: any) {
        console.error('Chat error:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to generate chat response' });
        }
    }
};

async function recordChatActivity(agentId: string, userId: string, message: string, responseText: string) {
    try {
        const userTokens = Math.ceil(message.length / 4);
        const assistantTokens = Math.ceil(responseText.length / 4);

        await pool.query(
            'INSERT INTO messages (agent_id, role, content, tokens_used, user_id) VALUES ($1, $2, $3, $4, $5)',
            [agentId, 'user', message, userTokens, userId]
        );
        await pool.query(
            'INSERT INTO messages (agent_id, role, content, tokens_used, user_id) VALUES ($1, $2, $3, $4, $5)',
            [agentId, 'assistant', responseText, assistantTokens, userId]
        );

        await pool.query(
            'INSERT INTO activity_logs (agent_id, action, details, user_id) VALUES ($1, $2, $3, $4)',
            [agentId, 'Chat Interaction', `Processed user message (${userTokens + assistantTokens} total tokens)`, userId]
        );
    } catch (logError: any) {
        console.error('Failed to log chat activity:', logError.message);
    }
}
