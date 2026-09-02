import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import path from 'path';
import { config } from './config/env';
import apiRouter from './routes';
import { notFoundHandler } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { globalRateLimiter } from './middlewares/rateLimiter';

const app: Application = express();

/* ════════════════════════════════════════════════════════════
   1. Security Headers — Helmet
   Sets CSP, X-Frame-Options, X-Content-Type-Options, HSTS,
   Referrer-Policy, Permissions-Policy, and more.
════════════════════════════════════════════════════════════ */
app.use(
  helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    // HTTP Strict Transport Security (1 year)
    hsts: config.isProduction
      ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
      : false,
    // Prevent MIME sniffing
    noSniff: true,
    // Prevent clickjacking
    frameguard: { action: 'deny' },
    // Remove X-Powered-By: Express header
    hidePoweredBy: true,
    // XSS filter for older browsers
    xssFilter: true,
    // Disable DNS prefetch
    dnsPrefetchControl: { allow: false },
    // Cross-Origin policies
    crossOriginEmbedderPolicy: false, // Required to be off for file downloads
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

/* ════════════════════════════════════════════════════════════
   2. CORS — tightly scoped in production
════════════════════════════════════════════════════════════ */
const ALLOWED_ORIGINS = config.isProduction
  ? [config.clientUrl].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server calls (no origin header) and allowed origins
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin "${origin}" is not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
    credentials: true,
    maxAge: 86_400, // Cache preflight for 24 hours
  })
);

/* ════════════════════════════════════════════════════════════
   3. Global Rate Limiter
   Applied before body parsing to reject overload early
════════════════════════════════════════════════════════════ */
app.use('/api', globalRateLimiter);

/* ════════════════════════════════════════════════════════════
   4. Request Body Parsing — with size limits
   10MB for JSON/urlencoded (generous for base64 embedded data)
   Actual file uploads use multipart/form-data via Multer
════════════════════════════════════════════════════════════ */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ════════════════════════════════════════════════════════════
   5. MongoDB Injection Protection
   Strips $ and . from request body, params, and query strings
   preventing NoSQL operator injection attacks
════════════════════════════════════════════════════════════ */
app.use(
  mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      if (!config.isProduction) {
        console.warn(`[Security] Sanitized suspicious input in req.${key} from ${req.ip}`);
      }
    },
  })
);

/* ════════════════════════════════════════════════════════════
   6. HTTP Parameter Pollution Prevention
   Protects against duplicate query parameters overriding each other
════════════════════════════════════════════════════════════ */
app.use(
  hpp({
    whitelist: ['sort', 'fields', 'type', 'status'], // Allow these to be arrays
  })
);

/* ════════════════════════════════════════════════════════════
   7. Static Files — local uploads (Cloudinary fallback)
════════════════════════════════════════════════════════════ */
app.use(
  '/uploads',
  express.static(path.resolve(process.cwd(), 'uploads'), {
    // Prevent directory listing
    index: false,
    // Cache for 1 day
    maxAge: '1d',
    // Deny dotfiles
    dotfiles: 'deny',
  })
);

/* ════════════════════════════════════════════════════════════
   8. API Routes
════════════════════════════════════════════════════════════ */
app.use('/api', apiRouter);

/* ════════════════════════════════════════════════════════════
   9. 404 Handler
════════════════════════════════════════════════════════════ */
app.use(notFoundHandler);

/* ════════════════════════════════════════════════════════════
   10. Centralized Error Handler (must be last)
════════════════════════════════════════════════════════════ */
app.use(errorHandler);

export default app;
