import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { youtubeService } from '../services/ai/youtubeService.js';
import { crawlerService } from '../services/knowledge/crawlerService.js';

export const trainFromYoutube = async (req: AuthRequest, res: Response) => {
    const { campaignId, youtubeUrl } = req.body;
    const userId = req.user?.id as string;

    if (!campaignId || !youtubeUrl) {
        res.status(400).json({ error: 'Campaign ID and YouTube URL are required' });
        return;
    }

    try {
        const result = await youtubeService.processYoutubeUrl(campaignId, youtubeUrl, userId);
        res.json({ message: 'YouTube video processed and indexed', chunks: result.chunks });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to process YouTube video' });
    }
};

export const trainFromWebsite = async (req: AuthRequest, res: Response) => {
    const { campaignId, url } = req.body;
    const userId = req.user?.id as string;

    if (!campaignId || !url) {
        res.status(400).json({ error: 'Campaign ID and Website URL are required' });
        return;
    }

    try {
        const result = await crawlerService.crawlUrl(campaignId, url, userId);
        res.json({ message: 'Website content crawled and indexed', chunks: result.chunks });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to crawl website' });
    }
};
