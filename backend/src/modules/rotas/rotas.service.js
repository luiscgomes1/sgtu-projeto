import { supabase } from '../../config/supabase.js';

export async function createRota (nome) {
    const { data, error } = await supabase
        .from('rotas')
        .insert({ nome })
        .select()
        .single();

    if (error) throw error;
    return data;
}


// listar as rotas (somente ativas por padrão) com possibilidade de filtro por status
export async function listRotas({ incluirInativas = false } = {}) {
    let query = supabase
        .from('rotas')
        .select('*')
        .order('created_at', { ascending: false });

    if (!incluirInativas) query = query.eq('status', 'ativo');

    const { data, error } = await query;

    if (error) throw error;
    return data;
}

export async function getRotaById(id) {
    const { data, error } = await supabase
        .from('rotas')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function updateRota(id, updates) {
    const { data, error } = await supabase
        .from('rotas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function setRotaStatus(id, status) {
    const { data, error } = await supabase
        .from('rotas')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

