import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    from?: string;
}

class EmailServiceClass {
    private transporter: nodemailer.Transporter | null = null;

    constructor() {
        logger.info('Email service initialized (agent-based SMTP)');
    }

    createTransporter(config: { host: string; port: number; user: string; pass: string }) {
        return nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.port === 465,
            auth: {
                user: config.user,
                pass: config.pass,
            },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 15000,
        });
    }

    async verifyConnection(config: { host: string; port: number; user: string; pass: string }): Promise<boolean> {
        try {
            const transporter = this.createTransporter(config);
            await transporter.verify();
            return true;
        } catch (error: any) {
            logger.error(`SMTP Verification failed: ${error.message}`);
            return false;
        }
    }

    async sendEmail(options: EmailOptions, config?: { host: string; port: number; user: string; pass: string }): Promise<boolean> {
        const transporter = config ? this.createTransporter(config) : this.transporter;

        if (!transporter) {
            logger.error('Cannot send email: Transporter not initialized');
            return false;
        }

        const fromUser = config?.user || 'no-reply@blastr.ai';

        try {
            const info = await transporter.sendMail({
                from: options.from || `"BLASTR" <${fromUser}>`,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            });

            logger.info(`Email sent: ${info.messageId} to ${options.to}`);
            return true;
        } catch (error) {
            logger.error(`Failed to send email to ${options.to}: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }

    async sendBatch(emails: EmailOptions[], config?: { host: string; port: number; user: string; pass: string }): Promise<{ successful: number; failed: number }> {
        let successful = 0;
        let failed = 0;

        for (const email of emails) {
            const result = await this.sendEmail(email, config);
            if (result) {
                successful++;
            } else {
                failed++;
            }
            // Add a small delay between sends to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return { successful, failed };
    }
}

export const emailService = new EmailServiceClass();
