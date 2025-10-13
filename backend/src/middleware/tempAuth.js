const HORA_INICIO = 21;
const HORA_FIM = 23;

export function requireTemporaryAccess(req, res, next) {

    const token = req.query.token;
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