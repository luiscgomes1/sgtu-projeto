import Joi from 'joi';



/**
 * Middleware para validar o corpo (body), parâmetros (params) ou query (query) da requisição.
 * @param {Joi.ObjectSchema} schema - O schema Joi a ser usado.
 * @param {'body'|'params'|'query'} [location='body'] - Onde buscar os dados na requisição.
 */
export const validate = (schema, location = 'body') => (req, res, next) => {
  
  const data = req[location];
  
  // Valida o dado (data) contra o schema
  // Usamos stripUnknown:true para remover chaves extras do payload antes
  // que cheguem ao controller/serviço (evita erros como '"x" is not allowed').
  const { error } = schema.validate(data, { 
    abortEarly: false,
    stripUnknown: true // Remove campos não declarados no schema
  });

  if (error) {
    // Formata o erro para ser capturado pelo errorHandler
    const details = error.details.map(d => d.message.replace(/"/g, ''));
    
    // Sinaliza o erro para o errorHandler em error.js
    const validationError = new Error('Erro de validação');
    validationError.details = details;
    validationError.name = 'ValidationError'; 
    validationError.status = 400; // Define o status para 400 Bad Request

    return next(validationError);
  }
  
  next();
};