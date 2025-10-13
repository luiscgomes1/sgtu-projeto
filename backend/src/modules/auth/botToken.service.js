import jwt from 'jsonwebtoken';
import { supabase } from '../../config/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET;
const BOT_JWT_EXPIRES_IN = process.env.BOT_JWT_EXPIRES_IN || '1h';

export async function generateBotTokenForTelegramId(telegramId, options = {}) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET não está definido');

  // Busca o aluno pelo telegram_id
  const { data, error } = await supabase
    .from('alunos')
    .select('usuario_id, usuarios(nome, tipo, email, status)')
    .eq('telegram_id', telegramId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const payload = {
    id: data.usuario_id,
    nome: data.usuarios.nome,
    email: data.usuarios.email,
    tipo: data.usuarios.tipo,
    // default scope pode ser ajustado via options
    scope: options.scope || ['presenca', 'carteirinha'],
    aud: 'bot',
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: BOT_JWT_EXPIRES_IN });

  return { token, user: { id: data.usuario_id, nome: data.usuarios.nome, email: data.usuarios.email } };
}

export async function generateBotTokenForUserId(userId, options = {}) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET não está definido');

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const payload = {
    id: data.id,
    nome: data.nome,
    email: data.email,
    tipo: data.tipo,
    scope: options.scope || ['presenca', 'carteirinha'],
    aud: 'bot',
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: BOT_JWT_EXPIRES_IN });
  return { token, user: { id: data.id, nome: data.nome, email: data.email } };
}
