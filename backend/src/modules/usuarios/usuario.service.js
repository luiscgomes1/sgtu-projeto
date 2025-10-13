import { supabase } from "../../config/supabase.js";
import bcrypt from "bcryptjs";

export async function getUsuarioById(id) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nome, email, tipo, status, created_at")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getAlunoProfile(usuarioId) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nome, email, tipo, status, created_at, alunos(*)")
    .eq("id", usuarioId)
    .single();
  if (error) throw error;
  return data;
}

export async function atualizarPerfil(usuarioId, dados) {
  const updateData = {
    nome: dados.nome
  };

  if (!dados.nome) {
    throw new Error("Nome é obrigatório.");
  }

  const { data, error } = await supabase
    .from("usuarios")
    .update(updateData)
    .eq("id", usuarioId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function alterarSenha(usuarioId, senhaAtual, novaSenha) {

    if (!novaSenha) {
        throw new Error("Senha é obrigatória.");
    }

    if(novaSenha === senhaAtual) throw new Error("A nova senha deve ser diferente da atual.");

  const senha_hash = await bcrypt.hash(novaSenha, 10);

  const { data, error } = await supabase
    .from("usuarios")
    .update({ senha_hash })
    .eq("id", usuarioId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
