import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 1000, // Limite de 10 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Muitas tentativas de login, por favor tente novamente após 10 minutos.",
  },
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutos
  max: 1000, // Limite de 100 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
});
