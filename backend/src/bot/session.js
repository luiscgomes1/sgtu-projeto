import { supabase } from '../config/supabase.js';
import * as BotTokenService from '../modules/auth/botToken.service.js';

const memorySessions = new Map();

export async function setSession(telegramId, data) {
    memorySessions.set(telegramId, data);

    if(data.tipo === "aluno" && data.userId && data.status === 'ativo') {
        await supabase
            .from('alunos')
            .update({ telegram_id: telegramId })
            .eq('usuario_id', data.userId);
    } else {
        console.warn(`setSession: Ignorando atualização de telegram_id para telegramId ${telegramId} com tipo ${data.tipo} e status ${data.status}`);
    }
}

export async function getSession(telegramId) {
    if(memorySessions.has(telegramId)) {
        return memorySessions.get(telegramId);
    }
    
    const { data, error } = await supabase
        .from('alunos')
        .select("usuario_id, usuarios(nome, tipo, email)")
        .eq('telegram_id', telegramId)
        .maybeSingle();

    if (error) {
        console.error("Erro ao buscar sessão no banco:", error);
        return null;
    }

    if(data) {
        const session = {
            userId: data.usuario_id,
            tipo: data.usuarios.tipo,
            nome: data.usuarios.nome,
            email: data.usuarios.email
        };

        // Gerar token via service centralizado (mantém segredo no backend)
        try {
            const result = await BotTokenService.generateBotTokenForTelegramId(telegramId);
            if (result && result.token) {
                session.token = result.token;
            } else {
                console.warn('Nenhum token gerado pelo BotTokenService para telegramId:', telegramId);
            }
        } catch (err) {
            console.error('Erro ao gerar token via BotTokenService:', err);
        }

        memorySessions.set(telegramId, session);
        return session;
    }

    return null;
}

export function clearSession(telegramId) {
    memorySessions.delete(telegramId);
}