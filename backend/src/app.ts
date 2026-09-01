import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config/env';
import apiRouter from './routes';
import { notFoundHandler } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';

const app: Application = express();

// Configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching client url
      if (!origin || origin === config.clientUrl || config.clientUrl === '*') {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev mode
      }
    },
    credentials: true,
  })
);

// Standard Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount API Routes
app.use('/api', apiRouter);

// 404 Catch-All Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
