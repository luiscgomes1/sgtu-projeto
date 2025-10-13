import { supabase } from '../../config/supabase.js';

export async function createCurso(payload) {
    const existing = await supabase
        .from('cursos')
        .select('*')
        .eq('nome', payload.nome)
        .eq('faculdade_id', payload.faculdade_id)
        .maybeSingle();

    if(existing.data) throw new Error('Curso já existe para esta faculdade.');
    
    const { data, error } = await supabase
        .from('cursos')
        .insert([{
            nome: payload.nome,
            faculdade_id: payload.faculdade_id
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function listCursos({ incluirInativos = false } = {}) {
    let query = supabase
        .from('cursos')
        .select('*, faculdades(nome)')
        .order('faculdade_id', { ascending: true })
        .order('nome', { ascending: true });

    if (!incluirInativos) {
        query = query.eq('status', 'ativo');
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
}

export async function updateCurso(id, payload) {
    // Verifica duplicidade: existe outro curso com mesmo nome e faculdade_id?
    const existing = await supabase
        .from('cursos')
        .select('id')
        .eq('nome', payload.nome)
        .eq('faculdade_id', payload.faculdade_id)
        .neq('id', id)
        .maybeSingle();

    if (existing.data) throw new Error('Já existe um curso com esse nome para esta faculdade.');

    const { data, error } = await supabase
        .from('cursos')
        .update(payload)
        .eq('id', id)
        .select('*, faculdades(nome)')
        .single();
    
    if (error) throw error;
    return data;
}

export async function setCursoStatus(id, status) {
    const { data, error } = await supabase
        .from('cursos')
        .update({ status })
        .eq('id', id)
        .select('*, faculdades(nome)')
        .single();
    
    if (error) throw error;
    return data;
}

export async function getCursoById(id) {
    const { data, error } = await supabase
        .from('cursos')
        .select('*, faculdades(nome)')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function listCursosByFaculdade(faculdadeId, { incluirInativos = false } = {}) {
    let query = supabase
        .from('cursos')
        .select('*, faculdades(nome)')
        .eq('faculdade_id', faculdadeId)
        .order('nome', { ascending: true });
    
    if (!incluirInativos) {
        query = query.eq('status', 'ativo');
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
}
