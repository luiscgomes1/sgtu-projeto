import { supabase } from "../../config/supabase.js";

export async function listarAlunos() {
  const { data, error } = await supabase
    .from("alunos")
    .select(
      "*, usuarios(id, nome, email, tipo, status), cursos(nome, faculdade_id, faculdades(nome))"
    );

  if (error) throw error;
  return data;
}

export async function listAlunosPaginated({
  status_cadastro,
  limit = 10,
  offset = 0,
}) {
  let query = supabase
    .from("alunos")
    .select(
      "*, usuarios(id, nome, email, tipo, status), cursos(nome, faculdade_id, faculdades(nome))",
      { count: "exact" }
    )
    .eq("status_cadastro", status_cadastro)
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return { data, total: count };
}

export async function obterAluno(id) {
  const { data: aluno, error: alunoError } = await supabase
    .from("alunos")
    .select("*, usuarios(id, nome, email, tipo, status), cursos(nome, faculdade_id, faculdades(nome))")
    .eq("usuario_id", id)
    .maybeSingle();
    
  if (alunoError) throw alunoError;

  const bucket = process.env.BUCKET_NAME;

  if (aluno.comprovante_residencia_url) {
    const { data: signed } = await supabase.storage
      .from(bucket)
      .createSignedUrl(aluno.comprovante_residencia_url, 60 * 60); // 1 hora
    aluno.comprovante_residencia_url = signed?.signedUrl || null;
  }
  if (aluno.comprovante_matricula_url) {
    const { data: signed } = await supabase.storage
      .from(bucket)
      .createSignedUrl(aluno.comprovante_matricula_url, 60 * 60);
    aluno.comprovante_matricula_url = signed?.signedUrl || null;
  }
  if (aluno.foto_url) {
    const { data: signed } = await supabase.storage
      .from(bucket)
      .createSignedUrl(aluno.foto_url, 60 * 60);
    aluno.foto_url = signed?.signedUrl || null;
  }

  console.log("Aluno final:", aluno);
  return aluno;
}

export async function obterMeuPerfil(id) {
  // Tenta buscar como aluno aprovado
  const { data: aluno, error: errorAluno } = await supabase
    .from("alunos")
    .select(
      "*, usuarios(id, nome, email, tipo, status), cursos(nome, faculdade_id, faculdades(nome))"
    )
    .eq("usuario_id", id)
    .maybeSingle();

  if (errorAluno) throw errorAluno;
  if (aluno) {
    return aluno;
  }

  // Se não for aluno aprovado, busca na signup_requests
  const { data: request, error: errorRequest } = await supabase
    .from("signup_requests")
    .select("*, cursos(nome, faculdade_id, faculdades(nome))")
    .eq("id", id)
    .order("created_at", { ascending: false })
    .maybeSingle();

  if (errorRequest) throw errorRequest;
  if (request) {
    return request;
  }

  return null;
}

export async function atualizarAluno(id, dados) {
  const { nome, ...resto } = dados;

  const { data, error } = await supabase
    .from("alunos")
    .update(resto)
    .eq("usuario_id", id)
    .select()
    .single();

  if (error) throw error;

  if (nome && nome.trim() !== "") {
    const { error: usuarioError } = await supabase
      .from("usuarios")
      .update({ nome })
      .eq("id", id)
      .select()
      .single();

    if (usuarioError) throw usuarioError;
  }

  return data;
}

export async function inativarAluno(id) {
  const { data, error } = await supabase
    .from("usuarios")
    .update({ status: "inativo" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function reenviarDocumentos(usuarioId, payload) {
  const request = {
    usuario_id: usuarioId || null,
    reenvio: true,
    nome: payload.nome,
    email: payload.email,
    rg: payload.rg,
    cpf: payload.cpf,
    telefone: payload.telefone,
    data_nascimento: payload.data_nascimento,
    endereco: payload.endereco,
    tipo_sanguineo: payload.tipo_sanguineo,
    comprovante_residencia_url: payload.comprovante_residencia_url,
    comprovante_matricula_url: payload.comprovante_matricula_url,
    foto_url: payload.foto_url,
    curso_id: payload.curso_id,
    status: "pendente",
  };

  const { data, error } = await supabase
    .from("signup_requests")
    .insert(request)
    .select()
    .single();

  if (error) throw error;
  return data;
}
