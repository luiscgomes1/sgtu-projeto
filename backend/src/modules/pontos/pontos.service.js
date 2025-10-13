import { supabase } from "../../config/supabase.js";

export async function createPonto(payload) {
    const { data: ponto, error } = await supabase
        .from("pontos")
        .insert([{
            nome: payload.nome,
            endereco: payload.endereco
        }])
        .select()
        .single();

    if (error) throw error;

    const { data: rotas, error: rotaError } = await supabase
        .from("rotas")
        .select("id")

    if (rotaError) throw rotaError;

    const vinculos = rotas.map(rota => ({
        rota_id: rota.id,
        ponto_id: ponto.id,
        ordem: 999, // Ordem inicial alta para aparecer no final
        status: "ativo"
    }));

    const { error: vinculoError } = await supabase
        .from("rota_pontos")
        .insert(vinculos);

    if (vinculoError) throw vinculoError;

    return ponto;
}

export async function listPontos( { incluirInativos = false } = {}) {
    let query = supabase
        .from("pontos")
        .select("*")
        .order("created_at", { ascending: false });

    if (!incluirInativos) query = query.eq("status", "ativo");

    const { data, error } = await query;

    if (error) throw error;
    return data;
}

export async function getPontoById(id) {
    const { data, error } = await supabase
        .from("pontos")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function updatePonto(id, payload) {
    const { data, error } = await supabase
        .from("pontos")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function setPontoStatus(id, status) {
    const { data, error } = await supabase
        .from("pontos")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}