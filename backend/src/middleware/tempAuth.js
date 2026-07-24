const HORA_INICIO = parseInt(process.env.TEMP_AUTH_HORA_INICIO, 10) || 21;
const HORA_FIM = parseInt(process.env.TEMP_AUTH_HORA_FIM, 10) || 23;

export function requireTemporaryAccess(req, res, next) {
    const token = req.get('x-access-token') || req.query.token;
    if(!token || token !== process.env.WEB_VIEW_TOKEN) {
        return res.status(401).json({ error: "Token de acesso inválido ou ausente." });
    }

    const agora = new Date();
    const horaAtual = agora.getHours();

    if(horaAtual < HORA_INICIO || horaAtual >= HORA_FIM) {
        return res.status(403).json({ error: `Acesso permitido apenas entre ${HORA_INICIO}:00 e ${HORA_FIM}:00.` });
    }
    next();
}