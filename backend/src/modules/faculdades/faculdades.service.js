import { supabase } from "../../config/supabase.js";

export async function createFaculdade(payload) {
  const existing = await supabase
    .from("faculdades")
    .select("*")
    .or(`nome.eq.${payload.nome},endereco.eq.${payload.endereco}`)
    .maybeSingle();

  if (existing.data) {
    if (existing.data.nome === payload.nome) {
      throw new Error("Já existe uma faculdade com esse nome.");
    }
    if (existing.data.endereco === payload.endereco) {
      throw new Error("Já existe uma faculdade com esse endereço.");
    }
    throw new Error("Faculdade já cadastrada.");
  }

  const { data, error } = await supabase
    .from("faculdades")
    .insert([
      {
        nome: payload.nome,
        endereco: payload.endereco,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listFaculdades({ incluirInativas = false } = {}) {
  let query = supabase
    .from("faculdades")
    .select("*")
    .order("nome", { ascending: true });

  if (incluirInativas) {
    query = query.eq("status", "ativo");
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function updateFaculdade(id, payload) {
  const { data, error } = await supabase
    .from("faculdades")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function setFaculdadeStatus(id, status) {
  const { data, error } = await supabase
    .from("faculdades")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getFaculdadeById(id) {
  const { data, error } = await supabase
    .from("faculdades")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getFaculdadeByName(nome) {
  const { data, error } = await supabase
    .from("faculdades")
    .select("*")
    .eq("nome", nome)
    .single()
    .maybeSingle();

  if (error) throw error;
  return data;
}
