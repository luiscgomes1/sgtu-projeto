import { supabase } from "../../config/supabase.js";
import * as RotaMotoristaService from "../rotaMotoristas/rotaMotoristas.service.js";
import { addDays } from "date-fns";

export async function gerarEscalaAutomatica(ano, motoristasIds) {
  const { data: existing } = await supabase
    .from("escalas")
    .select("id")
    .eq("ano", ano)
    .limit(1)
    .maybeSingle();

  if (existing) {
    throw new Error(`Escala para o ano de ${ano} já existe.`);
  }

  if (motoristasIds.length % 2 !== 0) {
    throw new Error("Número de motoristas deve ser par para gerar a escala.");
  }

  const pares = [];

  for (let i = 0; i < motoristasIds.length; i += 2) {
    pares.push([motoristasIds[i], motoristasIds[i + 1]]);
  }

  const inserts = [];

  for (let mes = 1; mes <= 12; mes++) {
    const parIndex = (mes - 1) % pares.length;
    const par = pares[parIndex];
    inserts.push({
      mes,
      ano,
      motorista1_id: par[0],
      motorista2_id: par[1],
      status: "ativo",
    });

    await vincularMotoristasNasRotas(ano, mes, par[0], par[1]);
  }

  const { error } = await supabase.from("escalas").insert(inserts);
  if (error) throw error;

  return { message: "Escala gerada com sucesso.", pares };
}

export async function gerarEscalaManual(ano, pares) {
  if (pares.length === 0)
    throw new Error("Nenhum par de motoristas fornecido.");

  const inserts = [];

  for (let mes = 1; mes <= 12; mes++) {
    const parIndex = (mes - 1) % pares.length;
    const par = pares[parIndex];
    inserts.push({
      mes,
      ano,
      motorista1_id: par[0],
      motorista2_id: par[1],
      status: "ativo",
    });

    await vincularMotoristasNasRotas(ano, mes, par[0], par[1]);
  }

  const { error } = await supabase.from("escalas").insert(inserts);
  if (error) throw error;

  return { message: "Escala manual gerada com sucesso.", pares };
}

export async function desativarEscala(ano, mes) {
  const { error } = await supabase
    .from("escalas")
    .update({ status: "inativo" })
    .eq("ano", ano)
    .eq("mes", mes);

  if (error) throw error;

  await RotaMotoristaService.desativarVinculosPorPeriodo(ano, mes);

  return {
    message: `Escala e vínculos de ${mes}/${ano} desativados com sucesso.`,
  };
}

async function vincularMotoristasNasRotas(ano, mes, motorista1, motorista2) {
  const { data: rotas, error: rotaError } = await supabase
    .from("rotas")
    .select("id")
    .limit(2);

  if (rotaError) throw rotaError;

  if (!rotas || rotas.length < 2) {
    throw new Error("É necessário ter pelo menos duas rotas cadastradas.");
  }

  const [rota1, rota2] = rotas;

  const inicioMes = new Date(ano, mes - 1, -1);

  for (let semana = 1; semana <= 4; semana++) {
    const inicio = addDays(inicioMes, (semana - 1) * 7);
    const fim = addDays(inicio, 6);

    const invertido = semana % 2 === 0;

    const vinculos = invertido
      ? [
          { rota_id: rota1.id, motorista_id: motorista2, inicio, fim },
          { rota_id: rota2.id, motorista_id: motorista1, inicio, fim },
        ]
      : [
          { rota_id: rota1.id, motorista_id: motorista1, inicio, fim },
          { rota_id: rota2.id, motorista_id: motorista2, inicio, fim },
        ];

    for (const vinculo of vinculos) {
      await RotaMotoristaService.atribuirMotorista(
        vinculo.rota_id,
        vinculo.motorista_id,
        vinculo.inicio,
        vinculo.fim
      );
    }
  }
}



export async function definirEscalaManual(
  ano,
  mes,
  motorista1_id,
  motorista2_id
) {
  const { data, error } = await supabase
    .from("escalas")
    .upsert(
      {
        ano,
        mes,
        motorista1_id,
        motorista2_id,
        status: "ativo",
      },
      { onConflict: "ano, mes" }
    )
    .select()
    .single();

  if (error) throw error;

  return { message: "Escala definida com sucesso.", data };
}

export async function getEscalaMensal(ano, mes) {
  const { data, error } = await supabase
    .from("escalas")
    .select(
      `
  id, ano, mes, motorista1_id, motorista2_id, status,
  motorista1:motoristas!escalas_motorista1_id_fkey(id, nome, telefone, status),
  motorista2:motoristas!escalas_motorista2_id_fkey(id, nome, telefone, status)
`
    )
    .eq("ano", ano)
    .eq("mes", mes)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function motoristaDaSemana(ano, mes, semana) {
  const escala = await getEscalaMensal(ano, mes);
  if (!escala)
    throw new Error("Escala não encontrada para o mês/ano especificado.");

  const invertido = semana % 2 === 0;
  const rota1 = invertido ? escala.motorista2 : escala.motorista1;
  const rota2 = invertido ? escala.motorista1 : escala.motorista2;

  return {
    ano,
    mes,
    semana,
    rota1,
    rota2,
  };
}

export async function listarEscalasAnoComSemanas(ano) {
  const { data, error } = await supabase
    .from("escalas")
    .select(
      `
  id, ano, mes, motorista1_id, motorista2_id, status,
  motorista1:motoristas!escalas_motorista1_id_fkey(id, nome, telefone, status),
  motorista2:motoristas!escalas_motorista2_id_fkey(id, nome, telefone, status)
`
    )
    .eq("ano", ano)
    .order("mes", { ascending: true });
  if (error) throw error;

  // Para cada mês, monta as 4 semanas já invertendo os motoristas conforme a lógica
  return (data || []).map((escala) => ({
    ...escala,
    semanas: [1, 2, 3, 4].map((semana) => {
      const invertido = semana % 2 === 0;
      return {
        semana,
        rota1: invertido ? escala.motorista2 : escala.motorista1,
        rota2: invertido ? escala.motorista1 : escala.motorista2,
      };
    }),
  }));
}

export async function listarEscalasAno(ano) {
  const { data, error } = await supabase
    .from("escalas")
    .select(
      `
  id, ano, mes, motorista1_id, motorista2_id, status,
  motorista1:motoristas!escalas_motorista1_id_fkey(id, nome, telefone, status),
  motorista2:motoristas!escalas_motorista2_id_fkey(id, nome, telefone, status)
`
    )
    .eq("ano", ano)
    .order("mes", { ascending: true });
  if (error) throw error;
  return data;
}

export async function resetEscalasAno(ano) {
  // Busca todas as escalas do ano informado
  const { data: escalas, error: fetchError } = await supabase
    .from("escalas")
    .select("id, motorista1_id, motorista2_id")
    .eq("ano", ano);

  if (fetchError) throw fetchError;

  if (!escalas || escalas.length === 0) {
    return { message: `Nenhuma escala encontrada para o ano ${ano}.` };
  }

  // Deleta vínculos em rota_motoristas (que envolvam motoristas dessa escala)
  const motoristaIds = [
    ...new Set(
      escalas.flatMap((e) => [e.motorista1_id, e.motorista2_id]).filter(Boolean)
    ),
  ];

  if (motoristaIds.length > 0) {
    const { error: delVinculosError } = await supabase
      .from("rota_motoristas")
      .delete()
      .in("motorista_id", motoristaIds);

    if (delVinculosError) throw delVinculosError;
  }

  // Deleta as escalas do ano
  const { error: delEscalasError } = await supabase
    .from("escalas")
    .delete()
    .eq("ano", ano);

  if (delEscalasError) throw delEscalasError;

  return {
    message: `Escalas e vínculos referentes ao ano ${ano} foram removidos com sucesso.`,
    removidos: escalas.length,
  };
}

