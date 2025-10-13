import { supabase } from "../../config/supabase.js";

export async function createMotorista(payload) {
    const { data, error } = await supabase
        .from("motoristas")
        .insert([{
            nome: payload.nome,
            cpf: payload.cpf,
            data_nascimento: payload.data_nascimento,
            telefone: payload.telefone,
            cnh: payload.cnh,
            validade_cnh: payload.validade_cnh
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

//listar todos os motoristas (por padrão apenas os ativos) com possibilidade de filtro por status
export async function listMotoristas({ incluirInativos = false } = {}) {
    let query = supabase
        .from("motoristas")
        .select("*")
        .order("created_at", { ascending: false });

    if (incluirInativos) query = query.eq("status", "ativo");

    
    const { data, error } = await query;
    
    if (error) throw error;

    return data;
}

export async function getMotoristaById(id) {
    const { data, error } = await supabase
        .from("motoristas")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;
    return data;
}

export async function updateMotorista(id, payload) {
    const { data, error } = await supabase
        .from("motoristas")
        .update({
            nome: payload.nome,
            cpf: payload.cpf,
            cnh: payload.cnh,
            validade_cnh: payload.validade_cnh,
            data_nascimento: payload.data_nascimento,
            telefone: payload.telefone
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function setMotoristaStatus(id, status) {
    const { data, error } = await supabase
        .from("motoristas")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}