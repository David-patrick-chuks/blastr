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
        if (env.SMTP_USER && env.SMTP_PASS) {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: env.SMTP_USER,
                    pass: env.SMTP_PASS,
                },
            });
            logger.info('Email service initialized with Gmail SMTP');
        } else {
            logger.warn('Email service NOT initialized: SMTP_USER or SMTP_PASS missing');
        }
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        if (!this.transporter) {
            logger.error('Cannot send email: Transporter not initialized');
            return false;
        }

        try {
            const info = await this.transporter.sendMail({
                from: options.from || `"BlastAgent AI" <${env.SMTP_USER || 'no-reply@blastagent.ai'}>`,
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

    async sendBatch(emails: EmailOptions[]): Promise<{ successful: number; failed: number }> {
        let successful = 0;
        let failed = 0;

        for (const email of emails) {
            const result = await this.sendEmail(email);
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
