import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:HH:MM:ss' },
    },
  }),
  redact: {
    paths: [
      'req.headers.authorization', 'req.headers.cookie', 'req.headers["x-bot-api-key"]',
      'req.headers["x-access-token"]',
      'body.password', 'body.senha', 'body.senhaAtual', 'body.novaSenha',
      'body.token', 'body.refreshToken', 'body.accessToken',
      'body.cpf', 'body.rg',
      'err.config.headers.Authorization',
      'req.query.token', 'req.query.accessToken',
    ],
    censor: '[REDACTED]',
  },
});
