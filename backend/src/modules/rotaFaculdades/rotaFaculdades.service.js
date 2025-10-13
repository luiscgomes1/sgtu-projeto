import { supabase } from '../../config/supabase.js';

export async function vincularFaculdade(rotaId, faculdadeId) {
    const { data: existing } = await supabase
        .from('rota_faculdades')
        .select('*')
        .eq('rota_id', rotaId)
        .eq('faculdade_id', faculdadeId)
        .single()
        .maybeSingle();

    if (existing) {
        await supabase
            .from('rota_faculdades')
            .update({ status: 'ativo' })
            .eq("rota_id", rotaId)
            .eq('faculdade_id', faculdadeId);
        return { message: 'Faculdade já vinculada. Status atualizado para ativo.' };
    }

    const { error } = await supabase
        .from('rota_faculdades')
        .insert([{ rota_id: rotaId, faculdade_id: faculdadeId }]);

    if (error) throw error;
    return { message: 'Faculdade vinculada com sucesso.' };    
}

export async function desvincularFaculdade(rotaId, faculdadeId) {
    const { error } = await supabase
        .from('rota_faculdades')
        .update({ status: 'inativo' })
        .eq("rota_id", rotaId)
        .eq('faculdade_id', faculdadeId);
    if (error) throw error;
    return { message: 'Faculdade desvinculada com sucesso.' };
}

export async function obterRotaPorFaculdade(faculdadeId) {
    const { data, error } = await supabase
        .from('rota_faculdades')
        .select('rota_id')
        .eq('faculdade_id', faculdadeId)
        .eq('status', 'ativo')
        .single();

    if (error) throw error;
    return data.rota_id;
}

export async function listarFaculdadesDaRota(rotaId) {
    const { data, error } = await supabase
        .from('rota_faculdades')
        .select('faculdade_id, status, faculdades(nome), rotas(id, nome)')
        .eq('rota_id', rotaId)
        .eq('status', 'ativo');
    if (error) throw error;
    return data.map(faculdade => ({
        id: faculdade.faculdade_id,
        nome: faculdade.faculdades.nome,
        status: faculdade.status,
        rota: faculdade.rotas.nome,
        rotaId: rotaId
    }));
}