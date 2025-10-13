import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';
import { generalLimiter } from './middleware/rateLimit.js';
import "./bot/bot.js";

const app = express();

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = 
  process.env.NODE_ENV === 'production'
    ? ['https://seu-dominio.com'] // Substitua pelo seu domínio de produção
    : ['http://localhost:5173', 'http://localhost:4000'];
// Middlewares globais
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(morgan('dev'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use('/api', generalLimiter, routes);

// Middleware de tratamento de erros
app.use(notFound);
app.use(errorHandler);


export default app;
