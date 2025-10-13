import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../config/supabase.js";
import { gerarCarteirinhaBuffer } from "./pdf.service.js";

export async function gerarCarteirinha(alunoId, criadoPor) {
  const { data: admin, error: adminError } = await supabase
    .from("usuarios")
    .select("nome")
    .eq("id", criadoPor)
    .eq("tipo", "admin")
    .single();

  if (adminError || !admin) throw new Error("Apenas administradores podem gerar carteirinhas.");
    
  const { data: usuarioData, error: usuarioError } = await supabase
    .from("usuarios")
    .select("id, nome, email")
    .eq("id", alunoId)
    .single();
  if (usuarioError || !usuarioData) throw new Error("Usuário não encontrado");

  const { data: alunoRow, error: alunoError } = await supabase
    .from("alunos")
    .select("*")
    .eq("usuario_id", alunoId)
    .single();
  if (alunoError || !alunoRow) throw new Error("Aluno não encontrado ou não aprovado.");

  let cursoData = null;
  if (alunoRow.curso_id) {
    const { data: cursoRow, error: cursoError } = await supabase
      .from("cursos")
      .select("id, nome, faculdade_id")
      .eq("id", alunoRow.curso_id)
      .single();
    if (!cursoError && cursoRow) {
      const { data: faculdadeRow } = await supabase
        .from("faculdades")
        .select("id, nome")
        .eq("id", cursoRow.faculdade_id)
        .single();
      cursoData = {
        nome: cursoRow.nome,
        faculdade_nome: faculdadeRow.nome,
      };
    }
  }

  const token = uuidv4();
  const validade = new Date();
  validade.setFullYear(validade.getFullYear() + 1);
  const validityStr = validade.toISOString().split("T")[0];

  const { data: created, error: insertError } = await supabase
    .from("carteirinhas")
    .insert([{
      aluno_id: alunoId,
      data_validade: validityStr,
      qrcode_token: token,
      criado_por: criadoPor
    }])
    .select()
    .single();
  if (insertError) throw new Error(insertError.message);

  const alunoData = {
    usuario_id: alunoId,
    nome: usuarioData.nome,
    rg: alunoRow.rg,
    cpf: alunoRow.cpf,
    data_nascimento: alunoRow.data_nascimento,
    telefone: alunoRow.telefone,
    tipo_sanguineo: alunoRow.tipo_sanguineo,
    foto_url: alunoRow.foto_url,
  };
  const carteirinhaData = {
    qrcode_token: token,
    data_validade: validityStr,
  };
  const pdfBuffer = await gerarCarteirinhaBuffer(alunoData, admin, cursoData, carteirinhaData);

  const bucket = "carteirinhas";
  const filePath = `carteirinhas/${alunoId}-${created.id}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (uploadError) throw new Error(uploadError.message);

  await supabase
    .from("carteirinhas")
    .update({ arquivo_url: filePath })
    .eq("id", created.id);

    const { data: signed } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 10); // 10 minutes

    return {
      signedUrl: signed?.signedUrl,
      validade: validityStr,
      message: "Carteirinha gerada com sucesso"
    }
}

export async function obterCarteirinhaAtiva(alunoId, requester) {
  if (requester.tipo !== "admin" && requester.id !== alunoId) {
    throw new Error("Acesso negado");
  }

  const hoje = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("carteirinhas")
    .select("*")
    .eq("aluno_id", alunoId)
    .gte("data_validade", hoje)
    .order("data_validade", { ascending: false })
    .limit(1)
    .single();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Nenhuma carteirinha válida encontrada");

  // Gera o signedUrl temporário para o arquivo da carteirinha
  let signedUrl = null;
  if (data.arquivo_url) {
    const { data: signed } = await supabase.storage
      .from("carteirinhas")
      .createSignedUrl(data.arquivo_url, 60 * 10);
    signedUrl = signed?.signedUrl || null;
  }

  return {
    ...data,
    signedUrl,
  };
}

export async function listarCarteirinhas(alunoId, requester) {
  if (requester.tipo !== "admin" && requester.id !== alunoId) {
    throw new Error("Acesso negado");
  }
  const hoje = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("carteirinhas")
    .select("*")
    .eq("aluno_id", alunoId)
    .gte("data_validade", hoje)
    .order("data_validade", { ascending: false });
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Nenhuma carteirinha válida encontrada");

  const signed = await Promise.all(
    data.map( async (carteirinha) => {
      const { data: s } = await supabase.storage
        .from("carteirinhas")
        .createSignedUrl(carteirinha.arquivo_url, 60 * 10);
        return { ...carteirinha, signedUrl: s?.signedUrl };
    })
  );

  data.arquivo_url = signed;
  
  return data;
}

export async function validarQRCode(token) {

  const hoje = new Date().toISOString().split("T")[0];
  const { data: carteirinha, error } = await supabase
    .from("carteirinhas")
    .select("id, aluno_id, data_validade, qrcode_token")
    .eq("qrcode_token", token)
    .maybeSingle();

  console.log("Validation token:", token);
  console.log("Carteirinha data:", carteirinha);

  if (error || !carteirinha) {
    const invalid = new Error("Qr Code ou carteirinha inválida.");
    invalid.name = "UnauthorizedError";
    throw invalid;
  }

  if (carteirinha.data_validade < hoje) throw new Error("Carteirinha está expirada.");

  return carteirinha.aluno_id;
}