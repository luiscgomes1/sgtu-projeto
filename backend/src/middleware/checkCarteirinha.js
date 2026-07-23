import { ensureCarteirinhaValidaOuAtualizaStatus } from '../shared/validarCarteirinha.js'

export default async function checkCarteirinha(req, res, next) {
    try {
        const user = req.user;
        if (!user || !user.id) return res.status(401).json({ error: 'Usuário não autenticado.' });

        await ensureCarteirinhaValidaOuAtualizaStatus(user.id);

        next();
    } catch (err) {
        if (err.message && err.message.includes('Carteirinha')) {
            return res.status(403).json({ error: 'Carteirinha inválida ou expirada.' });
        }
        next(err);
    }
}
