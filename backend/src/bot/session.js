import { supabase } from '../config/supabase.js';

const memorySessions = new Map();

export async function setSession(telegramId, data) {
    memorySessions.set(telegramId, data);

    if(data.tipo === "aluno" && data.userId) {
        await supabase
            .from('alunos')
            .update({ telegram_id: telegramId })
            .eq('usuario_id', data.userId);
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
        memorySessions.set(telegramId, session);
        return session;
    }

    return null;
}

export function clearSession(telegramId) {
    memorySessions.delete(telegramId);
}