import { supabase } from "../../config/supabase.js";

export async function atribuirMotorista(rotaId, motoristaId, inicio = null, fim = null) {
    // Normalize dates to YYYY-MM-DD (DB column is date)
    const inicioIso = inicio ? new Date(inicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const fimIso = fim ? new Date(fim).toISOString().split('T')[0] : null;

    // Fetch existing links for this motorista+rota and check overlaps in JS
    const { data: existingList, error: fetchErr } = await supabase
        .from('rota_motoristas')
        .select('*')
        .eq('rota_id', rotaId)
        .eq('motorista_id', motoristaId);

    if (fetchErr) throw fetchErr;

    const overlaps = (existingList || []).filter((ex) => {
        const exInicio = ex.inicio ? ex.inicio.toString().split('T')[0] : null;
        const exFim = ex.fim ? ex.fim.toString().split('T')[0] : null;
        const aStart = exInicio;
        const aEnd = exFim || '9999-12-31';
        const bStart = inicioIso;
        const bEnd = fimIso || '9999-12-31';
        // overlap if not (aEnd < bStart || bEnd < aStart)
        return !(aEnd < bStart || bEnd < aStart);
    });

    if (overlaps.length) {
        const existing = overlaps[0];
        if (existing.status !== 'ativo') {
            // Reactivate / update existing
            await supabase
                .from('rota_motoristas')
                .update({ status: 'ativo', inicio: inicioIso, fim: fimIso })
                .eq('id', existing.id);
            return { message: 'Vínculo existente reativado com sucesso.' };
        }

        // If already active and overlaps, skip creating duplicate
        return { message: 'Existe um vínculo ativo que se sobrepõe ao período informado.' };
    }

    const { error } = await supabase
        .from('rota_motoristas')
        .insert([{ rota_id: rotaId, motorista_id: motoristaId, inicio: inicioIso, fim: fimIso }]);

    if (error) throw error;
    return { message: 'Motorista atribuído à rota com sucesso.' };
}

export async function desativarMotorista(rotaId, motoristaId) {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
        .from('rota_motoristas')
        .update({ status: 'inativo', fim: today })
        .eq('rota_id', rotaId)
        .eq('motorista_id', motoristaId)
        .eq('status', 'ativo');

    if (error) throw error;
    return { message: 'Motorista desativado da rota com sucesso.' };
}

export async function desativarVinculosPorPeriodo(ano, mes) {
    const inicioPeriodo = new Date(ano, mes - 1, 1).toISOString().split('T')[0];
    const fimPeriodo = new Date(ano, mes, 0).toISOString().split('T')[0];

    const { data: candidates, error: fetchErr } = await supabase
        .from('rota_motoristas')
        .select('id, inicio, fim, status');
    if (fetchErr) throw fetchErr;

    const toUpdateIds = (candidates || []).filter((r) => {
        const aStart = r.inicio ? r.inicio.toString().split('T')[0] : null;
        const aEnd = r.fim ? r.fim.toString().split('T')[0] : '9999-12-31';
        const bStart = inicioPeriodo;
        const bEnd = fimPeriodo;
        return !(aEnd < bStart || bEnd < aStart);
    }).map(r => r.id);

    if (toUpdateIds.length === 0) return { message: `Nenhum vínculo encontrado para o período ${mes}/${ano}.` };

    const { error } = await supabase
        .from('rota_motoristas')
        .update({ status: 'inativo' })
        .in('id', toUpdateIds);

    if (error) throw error;
    return { message: `Vínculos de ${mes}/${ano} desativados com sucesso.`, count: toUpdateIds.length };
}

export async function listarMotoristasDaRota(rotaId) {
    const { data, error } = await supabase
        .from('rota_motoristas')
        .select('id, inicio, fim, status, motoristas(id, nome, telefone, status)')
        .eq("rota_id", rotaId)
        .eq('status', 'ativo')
        .order('inicio', { ascending: true });
    if (error) throw error;
    
    return data;
}