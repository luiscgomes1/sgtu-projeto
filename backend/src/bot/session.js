import { prisma } from '../config/prisma.js';
import * as BotTokenService from '../modules/auth/botToken.service.js';
import { logger } from '../config/logger.js';

const memorySessions = new Map();

function normalizeTelegramId(id) {
  return id != null ? String(id) : id;
}

export async function setSession(telegramId, data) {
    const tid = normalizeTelegramId(telegramId);
    memorySessions.set(tid, data);

    if (data.userId) {
        await prisma.usuario.update({
            where: { id: data.userId },
            data: { telegramId: tid },
        });

        if (data.tipo === "aluno") {
            await prisma.aluno.updateMany({
                where: { usuarioId: data.userId },
                data: { telegramId: tid },
            }).catch(() => {});
        }
    }
}

export async function getSession(telegramId) {
    const tid = normalizeTelegramId(telegramId);
    if (memorySessions.has(tid)) {
        return memorySessions.get(tid);
    }

    const data = await prisma.usuario.findFirst({
        where: { telegramId: tid },
        select: { id: true, nome: true, tipo: true, email: true },
    });

    if (data) {
        const session = {
            userId: data.id,
            tipo: data.tipo,
            nome: data.nome,
            email: data.email,
        };

        try {
            const result = await BotTokenService.generateBotTokenForUserId(data.id);
            if (result && result.token) {
                session.token = result.token;
            } else {
                logger.warn({ telegramId }, 'Nenhum token gerado pelo BotTokenService');
            }
        } catch (err) {
            logger.error({ err }, 'Erro ao gerar token via BotTokenService');
        }

        memorySessions.set(tid, session);
        return session;
    }

    return null;
}

export function clearSession(telegramId) {
    memorySessions.delete(normalizeTelegramId(telegramId));
}

const commandsByRole = {
    aluno: [
        { command: 'validade', description: 'Verificar validade da carteirinha' },
        { command: 'carteirinha', description: 'Baixar PDF da carteirinha' },
        { command: 'presenca', description: 'Marcar presença do dia' },
        { command: 'login', description: 'Login com email e senha' },
        { command: 'logout', description: 'Encerrar sessão' },
    ],
    admin: [
        { command: 'resumo', description: 'Resumo de presenças do dia' },
        { command: 'relatorio', description: 'Relatório detalhado de presenças' },
        { command: 'admin', description: 'Painel de controle' },
        { command: 'login', description: 'Login com email e senha' },
        { command: 'logout', description: 'Encerrar sessão' },
    ],
    motorista: [],
};

export async function setUserCommands(telegram, chatId, role) {
    const commands = commandsByRole[role];
    if (!commands) return;
    try {
        await telegram.setMyCommands(commands, { scope: { type: 'chat', chat_id: chatId } });
    } catch (err) {
        logger.warn({ chatId, role, err: err.message }, 'setUserCommands: falha ao definir comandos');
    }
}