import cron from 'node-cron';
import Token from '../models/Token.js';
import { logger } from '../utils/logger.js';

export const startTokenCleanup = () => {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
        logger.info('Running automatic token cleanup job...');
        try {
            const result = await Token.deleteMany({ expiresAt: { $lt: new Date() } });
            if (result.deletedCount > 0) {
                logger.info(`Token cleanup complete. Deleted ${result.deletedCount} expired tokens.`);
            } else {
                logger.info('Token cleanup complete. No expired tokens found.');
            }
        } catch (error) {
            logger.error('Error running token cleanup:', error);
        }
    });
    logger.info('Token cleanup service started.');
};
