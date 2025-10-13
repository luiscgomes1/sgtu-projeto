import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../../config/supabase.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "8h"; // 8 horas

export async function login({ email, senha }) {
  // Tenta encontrar usuário aprovado
  const { data: user, error: uError } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (user) {
    if (user.status !== "ativo") {
      const unauthorized = new Error(
        "Usuário não encontrado ou senha inválida"
      );
      unauthorized.name = "UnauthorizedError";
      throw unauthorized;
    }

    const isValid = await bcrypt.compare(senha, user.senha_hash);
    if (!isValid) {
      const unauthorized = new Error(
        "Usuário não encontrado ou senha inválida"
      );
      unauthorized.name = "UnauthorizedError";
      throw unauthorized;
    }

    const { data: alunoData } = await supabase
      .from("alunos")
      .select("*, cursos(nome, faculdade_id, faculdades(nome))")
      .eq("usuario_id", user.id)
      .maybeSingle();

    const profileData = alunoData || {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      status: user.status,
    };

    const token = jwt.sign(
      {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        status: user.status,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        status: user.status,
        ...profileData,
      },
    };
  }

  // Se não achou em usuarios, tenta em signup_requests
  const { data: request, error: rError } = await supabase
    .from("signup_requests")
    .select("*, cursos(nome, faculdade_id, faculdades(nome))")
    .eq("email", email)
    .maybeSingle();

  // Não referenciar `user` aqui — quando chegamos neste ponto `user` é null.
  // Se não houver `request`, apenas use um objeto vazio como fallback.
  const requestData = request || {};

  if (request) {
    const isValid = await bcrypt.compare(senha, request.senha_hash);
    if (!isValid) {
      const unauthorized = new Error(
        "Usuário não encontrado ou senha inválida"
      );
      unauthorized.name = "UnauthorizedError";
      throw unauthorized;
    }

    const token = jwt.sign(
      {
        id: request.id,
        nome: request.nome,
        email: request.email,
        tipo: request.tipo,
        status: request.status,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: request.id,
        nome: request.nome,
        email: request.email,
        tipo: request.tipo,
        status: request.status,
        ...requestData,
      },
    };
  }

  const unauthorized = new Error("Usuário não encontrado ou senha inválida");
  unauthorized.name = "UnauthorizedError";
  throw unauthorized;
}
