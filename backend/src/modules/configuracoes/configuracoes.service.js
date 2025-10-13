import { supabase } from "../../config/supabase.js";

export async function getConfiguracao() {
    const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function updateHoraLimite(hora) {
    const { data, error } = await supabase
        .from('configuracoes')
        .update({ hora_limite_presenca: hora })
        .eq('id', 1)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function gethoraLimitePresenca() {
    const config = await getConfiguracao();
    return config.hora_limite_presenca;
}