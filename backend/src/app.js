import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { logger } from './config/logger.js';
import pinoHttp from 'pino-http';
import { healthController } from './modules/health/health.controller.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { sanitizeData } from './middleware/sanitize.js';
import rateLimit from 'express-rate-limit';

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Rejeição não tratada');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Exceção não capturada');
  process.exit(1);
});

const app = express();

// Request ID + nonce
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  }
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('Defina CORS_ORIGIN no .env em produção'); })()
    : ['http://localhost:5173', 'http://localhost:4000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Unified HTTP request logging via Pino (replaces Morgan)
app.use(pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/api/health',
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
    }),
  },
}));

const swaggerEnabled = process.env.SWAGGER_ENABLED === 'true' || process.env.NODE_ENV !== 'production';
if (swaggerEnabled) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

const healthLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Muitas requisições' } });
app.get('/api/health', healthLimiter, healthController);
app.use('/api', generalLimiter, sanitizeData, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
