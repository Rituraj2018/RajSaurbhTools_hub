import mongoose from 'mongoose';
import dns from 'node:dns';
import { config } from './env';
// Fix DNS SRV lookup issues on some Windows/ISP networks
dns.setServers(['8.8.8.8', '8.8.4.4']);


/**
 * Sanitizes MongoDB connection URI to mask username and password from logs
 */
const sanitizeMongoUri = (uri: string): string => {
  try {
    const url = new URL(uri);
    if (url.password) {
      url.password = '****';
    }
    if (url.username) {
      url.username = '****';
    }
    return url.toString();
  } catch {
    // If not a standard URL format, replace credentials with regex
    return uri.replace(/\/\/[^:]+:[^@]+@/, '//****:****@');
  }
};

/**
 * Reusable MongoDB Connection Function
 */
export const connectDB = async (): Promise<typeof mongoose> => {
  const uri = config.mongoUri;

  if (!uri) {
    console.error('[Database Error] MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  const safeUri = sanitizeMongoUri(uri);

  try {
    // Configure Mongoose options
    const conn = await mongoose.connect(uri, {
      autoIndex: config.nodeEnv !== 'production',
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
    console.log(`[Database] Target Database: ${conn.connection.name}`);

    // Event Listeners for ongoing connection monitoring
    mongoose.connection.on('error', (err: Error) => {
      console.error(`[Database Error] Mongoose runtime error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database Warning] MongoDB disconnected.');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[Database] MongoDB reconnected.');
    });

    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB (${safeUri}):`);
    console.error(`[Database Error] ${(error as Error).message}`);
    console.error('[Database Error] Exiting process due to database connection failure.');
    process.exit(1);
  }
};

/**
 * Returns current connection status for health checks
 */
export const getDatabaseStatus = (): 'connected' | 'disconnected' => {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
};
