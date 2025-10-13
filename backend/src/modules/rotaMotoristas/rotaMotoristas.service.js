import { supabase } from "../../config/supabase.js";

export async function atribuirMotorista(rotaId, motoristaId, inicio = null, fim = null) {
    const { data: existing } = await supabase
        .from('rota_motoristas')
        .select('*')
        .eq('rota_id', rotaId)
        .eq('motorista_id', motoristaId)
        .eq('inicio', inicio)
        .maybeSingle();

    if (existing) {
        await supabase
            .from('rota_motoristas')
            .update({ status: 'ativo', fim })
            .eq('id', existing.id);
        return { message: 'Vinculo existente reativado com sucesso.' };
    }

    const { error } = await supabase
        .from('rota_motoristas')
        .insert([{ rota_id: rotaId, motorista_id: motoristaId, inicio, fim }]);

    if (error) throw error;
    return { message: 'Motorista atribuído à rota com sucesso.' };
}

export async function desativarMotorista(rotaId, motoristaId) {
    const { error } = await supabase
        .from('rota_motoristas')
        .update({ status: 'inativo', fim: new Date().toISOString().split('T')[0] })
        .eq("rota_id", rotaId)
        .eq('motorista_id', motoristaId)
        .eq('status', 'ativo');

    if (error) throw error;
    return { message: 'Motorista desativado da rota com sucesso.' };
}

export async function desativarVinculosPorPeriodo(ano, mes) {
    const inicioMes = new Date(ano, mes - 1, 1).toISOString().split('T')[0];
    const fimMes = new Date(ano, mes, 0).toISOString().split('T')[0];

    const { error } = await supabase
        .from('rota_motoristas')
        .update({ status: 'inativo' })
        .lte('inicio', fimMes)
        .gte('fim', inicioMes)

    if (error) throw error;
    return { message: `Vínculos de ${mes}/${ano} desativados com sucesso.` };
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