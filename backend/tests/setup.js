import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import routes from '../src/routes/index.js';
import { notFound, errorHandler } from '../src/middleware/error.js';
import { sanitizeData } from '../src/middleware/sanitize.js';

export function createTestApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get('/api/health', async (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', sanitizeData, routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
