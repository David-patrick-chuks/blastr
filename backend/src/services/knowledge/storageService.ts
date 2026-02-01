import { supabase } from '../../config/supabase.js';
import { logger } from '../../utils/logger.js';

let isInitialized = false;

export const initializeBucket = async (): Promise<boolean> => {
    try {
        logger.info('Checking Supabase buckets...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            logger.error({ listError }, 'Error listing Supabase buckets - check your SUPABASE_KEY permissions');
            return false;
        }

        const exists = buckets?.find(b => b.name === 'broadcast-media');
        if (!exists) {
            logger.info('Bucket "broadcast-media" not found. Attempting to create...');
            const { error: createError } = await supabase.storage.createBucket('broadcast-media', {
                public: true,
                fileSizeLimit: 52428800 // 50MB
            });

            if (createError) {
                logger.error({ createError }, 'Failed to auto-create Supabase bucket - check if your key has "service_role" permissions');
                return false;
            }
            logger.info('Successfully created public bucket: broadcast-media');
        } else {
            logger.info('Supabase bucket "broadcast-media" verified.');
        }
        isInitialized = true;
        return true;
    } catch (err) {
        logger.error({ err }, 'Unexpected error during bucket initialization');
        return false;
    }
};

import { UploadResult } from '../../types/index.js';

export const uploadMedia = async (file: Express.Multer.File): Promise<UploadResult> => {
    if (!isInitialized) {
        const ok = await initializeBucket();
        if (!ok) logger.warn('Proceeding with upload despite initialization failure (may fail)');
    }
    try {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `broadcasts/${fileName}`;

        const { error } = await supabase.storage
            .from('broadcast-media')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (error) {
            logger.error({ error }, 'Supabase Upload Error');
            throw new Error('Failed to upload media to storage');
        }

        const { data: { publicUrl } } = supabase.storage
            .from('broadcast-media')
            .getPublicUrl(filePath);

        return {
            url: publicUrl,
            type: file.mimetype.startsWith('video') ? 'video' : 'photo'
        };
    } catch (err) {
        logger.error({ err }, 'Storage Service Error');
        throw err;
    }
};
