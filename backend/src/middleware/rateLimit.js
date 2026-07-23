import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === 'test';

export const authLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 10 * 60 * 1000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: "Muitas tentativas de login, tente novamente ap��s 10 minutos.",
      },
    });

export const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas requisições, tente novamente mais tarde.",
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas tentativas de upload, tente novamente após 15 minutos.",
  },
});

export const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas requisições, tente novamente em breve.",
  },
});

