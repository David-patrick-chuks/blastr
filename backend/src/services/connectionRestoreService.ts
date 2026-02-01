import { pool } from '../config/db.js';
import { logger } from '../utils/logger.js';
import { connectToWhatsApp } from './social/whatsappService.js';

export async function restoreConnections() {
    try {
        logger.info('Restoring platform connections from database...');

        // Query all agents with connected integrations
        const { rows } = await pool.query(`
            SELECT id, integrations 
            FROM agents 
            WHERE integrations IS NOT NULL
        `);

        for (const agent of rows) {
            const integrations = agent.integrations;

            // Restore WhatsApp connections
            if (integrations?.whatsapp?.status === 'Connected') {
                logger.info(`Restoring WhatsApp connection for agent ${agent.id}`);
                try {
                    await connectToWhatsApp(agent.id);
                    logger.info(`WhatsApp restored for agent ${agent.id}`);
                } catch (error: any) {
                    logger.error(`Failed to restore WhatsApp for agent ${agent.id}:`, error.message);
                }
            }

            // Add other platforms here as needed
            // if (integrations?.telegram?.status === 'Connected') { ... }
        }

        logger.info('Connection restoration complete');
    } catch (error: any) {
        logger.error('Failed to restore connections:', error.message);
    }
}
