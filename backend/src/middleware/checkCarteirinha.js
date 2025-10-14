import { supabase } from '../config/supabase.js';

export default async function checkCarteirinha(req, res, next) {
    try {
        const user = req.user;
        if (!user || !user.id) return res.status(401).json({ error: 'Usuário não autenticado.' });

        const hoje = new Date().toISOString().split('T')[0];
        const { data: carteirinha, error } = await supabase
            .from('carteirinhas')
            .select('id, data_validade')
            .eq('aluno_id', user.id)
            .gte('data_validade', hoje)
            .order('data_validade', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) return next(error);

        if (!carteirinha) {
            const { error: updErr } = await supabase
                .from('alunos')
                .update({ status_cadastro: 'reprovado' })
                .eq('usuario_id', user.id);
            if (updErr) return next(updErr);
            return res.status(403).json({ error: 'Carteirinha inválida ou expirada. Aluno marcado como reprovado.' });
        }

        next();
    } catch (err) {
        next(err);
    }
}
