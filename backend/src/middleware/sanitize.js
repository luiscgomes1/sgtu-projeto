// backend/src/middleware/sanitize.js
import * as SanitizeFunctions from '../utils/functions.js'; 

/**
 * Middleware para limpar campos de máscara (CPF, Telefone) e normalizar strings (Nome, Email).
 * Deve ser aplicado ANTES do middleware de validação.
 */
export const sanitizeData = (req, res, next) => {
    const data = req.body || {};
    
    if (data.nome) {
        data.nome = SanitizeFunctions.cleanString(data.nome);
    }
    if (data.cpf) {
        data.cpf = SanitizeFunctions.cleanNumeric(data.cpf);
    }
    if (data.rg) {
        data.rg = data.rg.replace(/[<>]/g, '').trim();
    }
    if (data.telefone) {
        data.telefone = SanitizeFunctions.cleanNumeric(data.telefone);
    }
    if (data.email) {
        data.email = SanitizeFunctions.cleanString(data.email);
    }
    if (data.endereco) {
        data.endereco = SanitizeFunctions.cleanString(data.endereco);
    }

    next();
};