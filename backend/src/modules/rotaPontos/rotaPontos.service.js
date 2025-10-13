import { supabase } from "../../config/supabase.js";

// Lista pontos de uma rota (join com tabela pontos)
export async function listByRota(rotaId, { incluirInativos = false } = {}) {
  let query = supabase
    .from("rota_pontos")
    .select(`
      ordem,
      status,
      pontos (
        id,
        nome,
        endereco,
        status
      )
    `)
    .eq("rota_id", rotaId)
    .order("ordem", { ascending: true });

  if (!incluirInativos) {
    query = query.eq("status", "ativo").eq("pontos.status", "ativo");
  }

  const { data, error } = await query;
  if (error) throw error;

  return data;
}

// Atualiza ordem em batch
export async function updateOrder(rotaId, ordens) {
  const updates = ordens.map(({ id, ordem }) => ({
    rota_id: rotaId,
    ponto_id: id,
    ordem,
  }));

  const { data, error } = await supabase
    .from("rota_pontos")
    .upsert(updates, { onConflict: "rota_id,ponto_id" })
    .select();

  if (error) throw error;
  return data;
}

// Atualiza status de um ponto em uma rota
export async function setStatus(rotaId, pontoId, status) {
  const { data, error } = await supabase
    .from("rota_pontos")
    .update({ status })
    .eq("rota_id", rotaId)
    .eq("ponto_id", pontoId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function isOrdered(rotaId) {
    const { data, error } = await supabase
      .from("rota_pontos")
      .select("ordem")
      .eq("rota_id", rotaId)
      .order("ordem", { ascending: true });

    if (error) throw error;

    // Verifica se a ordem está correta
    const isOrdered = data.every((item, index) => item.ordem === index + 1);
    return isOrdered;
}