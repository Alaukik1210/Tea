import http from 'node:http'
import { createApp } from "./app.js";
import { prisma } from "./lib/db.js";
import { logger } from './lib/logger.js';
import { redisClient } from './config/redis.js';
import { connectRabbitMQ } from './queues/rabbitmq.js';
import { preloadGlobalFeed } from './modules/feed/feed.service.js';

async function bootstrap(){
    try {
        await prisma.$connect();
        await redisClient.connect();
        await connectRabbitMQ();
        
        // Preload global feed on startup
        await preloadGlobalFeed();
        
        const app = createApp();
        const server = http.createServer(app);
        const PORT = process.env.PORT || 5000;

        server.listen(PORT,()=>{
            logger.info(`Server is running on port ${PORT}`);
        }).on('error',(error)=>{
            console.error('Error starting server:', error);
            process.exit(1);
        })
    } catch (err) {
        logger.error('Error starting server:', `${(err as Error).message}`);
    }
}


bootstrap();