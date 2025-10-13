import { supabase } from "../../config/supabase.js";
import bcrypt from "bcryptjs";
import {
  gerarCarteirinha,
  listarCarteirinhas,
} from "../carteirinhas/carteirinhas.service.js";

export async function createSignupRequest(payload) {
  const telefone = payload.telefone
    ? payload.telefone.replace(/\D/g, "")
    : null;
  const cpf = payload.cpf ? payload.cpf.replace(/\D/g, "") : null;

  const senha_hash = await bcrypt.hash(payload.senha, 10);
  const signup = {
    nome: payload.nome,
    email: payload.email,
    senha_hash,
    rg: payload.rg || null,
    cpf: cpf,
    telefone: telefone,
    data_nascimento: payload.data_nascimento || null,
    endereco: payload.endereco || null,
    tipo_sanguineo: payload.tipo_sanguineo || null,
    curso_id: payload.curso_id || null,
    comprovante_residencia_url: payload.comprovante_residencia_url || null,
    comprovante_matricula_url: payload.comprovante_matricula_url || null,
    foto_url: payload.foto_url || null,
  };
  const { data, error } = await supabase
    .from("signup_requests")
    .insert(signup)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSignupRequest(requestId, payload) {
  const { comprovante_matricula_url, comprovante_residencia_url, foto_url } =
    payload;

  const { data, error } = await supabase
    .from("signup_requests")
    .update({
      comprovante_matricula_url,
      comprovante_residencia_url,
      foto_url,
      status: "pendente",
    })
    .eq("id", requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listRequests(requester) {
  const { data, error } = await supabase
    .from("signup_requests")
    .select("*, cursos(nome)")
    .order("created_at", { ascending: false });
  if (error) throw error;

  await Promise.all(
    data.map(async (req) => {
      if (req.usuario_id) {
        try {
          const carteirinhas = await listarCarteirinhas(
            req.usuario_id,
            requester
          );
          req.carteirinha_url = carteirinhas[0]?.signedUrl || null;
        } catch (error) {
          req.carteirinha_url = null;
        }
      }
    })
  );

  return data;
}

export async function listPendingRequests() {
  const { data, error } = await supabase
    .from("signup_requests")
    .select("*")
    .eq("status", "pendente")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return data;
}

export async function approveSignupRequest(id, userId) {
  // Busca requisição
  const { data: reqData, error: reqError } = await supabase
    .from("signup_requests")
    .select("*")
    .eq("id", id)
    .single();
  if (reqError) throw reqError;
  if (!reqData) throw new Error("Requisição não encontrada");
  if (reqData.status !== "pendente")
    throw new Error("Requisição já foi processada");

  // Cria usuário
  const { data: createdUser, error: createdError } = await supabase
    .from("usuarios")
    .insert({
      nome: reqData.nome,
      email: reqData.email,
      senha_hash: reqData.senha_hash,
      tipo: "aluno",
      status: "ativo",
    })
    .select()
    .single();
  if (createdError) throw createdError;

  // Cria aluno
  const { data: createdAluno, error: alunoError } = await supabase
    .from("alunos")
    .insert({
      usuario_id: createdUser.id,
      rg: reqData.rg,
      cpf: reqData.cpf,
      telefone: reqData.telefone,
      data_nascimento: reqData.data_nascimento,
      endereco: reqData.endereco,
      tipo_sanguineo: reqData.tipo_sanguineo,
      comprovante_residencia_url: reqData.comprovante_residencia_url,
      comprovante_matricula_url: reqData.comprovante_matricula_url,
      foto_url: reqData.foto_url,
      status_cadastro: "aprovado",
      curso_id: reqData.curso_id,
    })
    .select()
    .single();
  if (alunoError) throw alunoError;

  // Atualiza status da requisição
  await supabase
    .from("signup_requests")
    .update({ status: "aprovado", usuario_id: createdUser.id })
    .eq("id", id);

  const carteirinha = await gerarCarteirinha(createdUser.id, userId);

  return { usuario: createdUser, aluno: createdAluno, carteirinha };
}

export async function reproveSignupRequest(id) {
  const { data: reqData, error: reqError } = await supabase
    .from("signup_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (reqError) throw reqError;
  if (!reqData) throw new Error("Requisição não encontrada");

  await supabase
    .from("signup_requests")
    .update({ status: "reprovado" })
    .eq("id", id);
}

export async function listRequestsPaginated({ status, limit = 10, offset = 0 }) {
  let query = supabase
    .from("signup_requests")
    .select("*, cursos(nome)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  // Supabase usa .range para paginação: .range(start, end)
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return {
    data,
    total: count
  };
}

export async function getRequestById(id) {
  const { data, error } = await supabase
    .from("signup_requests")
    .select("*, cursos(nome, faculdade_id, faculdades(nome))")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Requisição não encontrada");

  const bucket = "alunos_docs";

  if (data.comprovante_residencia_url) {
    const { data: signed } = await supabase.storage
      .from(bucket)
      .createSignedUrl(data.comprovante_residencia_url, 60 * 60); // 1 hora
    data.comprovante_residencia_url = signed?.signedUrl || null;
  }
  if (data.comprovante_matricula_url) {
    const { data: signed } = await supabase.storage
      .from(bucket)
      .createSignedUrl(data.comprovante_matricula_url, 60 * 60);
    data.comprovante_matricula_url = signed?.signedUrl || null;
  }
  if (data.foto_url) {
    const { data: signed } = await supabase.storage
      .from(bucket)
      .createSignedUrl(data.foto_url, 60 * 60);
    data.foto_url = signed?.signedUrl || null;
  }

  return data;
}

export async function approveReenvioRequest(id) {
  const { data: reqData, error: reqError } = await supabase
    .from("signup_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (reqError) throw reqError;
  if (!reqData) throw new Error("Reenvio não encontrado");
  if (reqData.status !== "pendente")
    throw new Error("Requisição já foi processada");
  if (!reqData.reenvio)
    throw new Error("Esta requisição não é um reenvio de documentos");

  

  const { data: aluno, error: alunoError } = await supabase
    .from("alunos")
    .update({
      comprovante_residencia_url: reqData.comprovante_residencia_url,
      comprovante_matricula_url: reqData.comprovante_matricula_url,
      foto_url: reqData.foto_url,
      status_cadastro: "ativo",
    })
    .eq("usuario_id", reqData.usuario_id)
    .select()
    .single();

  if (alunoError) throw alunoError;

  await supabase
    .from("signup_requests")
    .update({ status: "aprovado" })
    .eq("id", id);

  return { aluno };
}

export async function obterMeuPerfil(id) {
  const { data, error } = await supabase
    .from("signup_requests")
    .select("*, cursos(nome, faculdade_id, faculdades(nome))")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
