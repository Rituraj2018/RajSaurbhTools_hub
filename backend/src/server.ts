import mongoose from 'mongoose';
import app from './app';
import { config, validateEnv } from './config/env';
import { connectDB } from './config/database';
import { seedInitialTools } from './utils/seedTools';

// Validate environment variables before anything else
validateEnv();

const startServer = async (): Promise<void> => {
  // Connect to MongoDB before starting the HTTP server
  await connectDB();
  await seedInitialTools();

  const server = app.listen(config.port, () => {
    console.log('====================================================');
    console.log(`🚀 RajSaurbh Tools_Hub - Backend Server Running`);
    console.log(`📡 URL: http://localhost:${config.port}`);
    console.log(`🔍 Health Check: http://localhost:${config.port}/api/health`);
    console.log(`⚙️  Environment: ${config.nodeEnv}`);
    console.log('====================================================');
  });

  const shutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      try {
        await mongoose.connection.close();
        console.log('[Database] MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        console.error('[Database Error] Error during MongoDB connection close:', err);
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('[Server Error] Failed to start server:', err);
  process.exit(1);
});
