import { prisma } from "../../config/prisma.js";
import { INCLUDE_MOTORISTA_BASICO } from "../../shared/includes.js";

export async function gerarEscalaAutomatica(ano, motoristasIds) {
  const existing = await prisma.escalaAtribuicao.findFirst({ where: { ano } });
  if (existing) throw new Error(`Escala para ${ano} já existe.`);

  const rotas = await prisma.rota.findMany({
    where: { status: "ativo" },
    orderBy: { nome: "asc" },
  });
  if (rotas.length === 0) throw new Error("Nenhuma rota ativa encontrada.");

  // Distribuir motoristas entre as rotas (round-robin)
  const grupos = rotas.map(() => []);
  motoristasIds.forEach((id, i) => {
    grupos[i % rotas.length].push(id);
  });

  const inserts = [];
  for (let mes = 1; mes <= 12; mes++) {
    rotas.forEach((rota, idx) => {
      // Rotaciona: mês 1 → grupos originais, mês 2 → desloca, etc.
      const grupoIdx = (idx + mes - 1) % rotas.length;
      grupos[grupoIdx].forEach((motoristaId, ordem) => {
        inserts.push({ rotaId: rota.id, motoristaId, ano, mes, ordem: ordem + 1, status: "ativo" });
      });
    });
  }

  await prisma.escalaAtribuicao.createMany({ data: inserts });

  return { message: "Escala gerada com sucesso." };
}

export async function gerarEscalaManual(ano, distribuicao) {
  // distribuicao: [{ motoristasIds: string[] }] — um grupo por rota
  const existing = await prisma.escalaAtribuicao.findFirst({ where: { ano } });
  if (existing) throw new Error(`Escala para ${ano} já existe.`);

  const rotas = await prisma.rota.findMany({
    where: { status: "ativo" },
    orderBy: { nome: "asc" },
  });
  if (rotas.length === 0) throw new Error("Nenhuma rota ativa encontrada.");
  if (distribuicao.length !== rotas.length) {
    throw new Error(`Forneça ${rotas.length} grupos de motoristas (um por rota).`);
  }

  const inserts = [];
  for (let mes = 1; mes <= 12; mes++) {
    rotas.forEach((rota, idx) => {
      const grupoIdx = (idx + mes - 1) % rotas.length;
      distribuicao[grupoIdx].motoristasIds.forEach((motoristaId, ordem) => {
        inserts.push({ rotaId: rota.id, motoristaId, ano, mes, ordem: ordem + 1, status: "ativo" });
      });
    });
  }

  await prisma.escalaAtribuicao.createMany({ data: inserts });

  return { message: "Escala manual gerada com sucesso." };
}

export async function listarEscalasAno(ano) {
  const rows = await prisma.escalaAtribuicao.findMany({
    where: { ano, status: "ativo" },
    include: {
      motorista: INCLUDE_MOTORISTA_BASICO.motorista,
      rota: { select: { id: true, nome: true } },
    },
    orderBy: [{ mes: "asc" }, { rotaId: "asc" }, { ordem: "asc" }],
  });

  // Agrupar por mês
  const porMes = {};
  for (const row of rows) {
    if (!porMes[row.mes]) porMes[row.mes] = { ano, mes: row.mes, status: "ativo", rotas: {} };
    if (!porMes[row.mes].rotas[row.rotaId]) {
      porMes[row.mes].rotas[row.rotaId] = { rota: row.rota, motoristas: [] };
    }
    porMes[row.mes].rotas[row.rotaId].motoristas.push(row.motorista);
  }

  return Object.values(porMes).map((m) => ({
    ...m,
    rotas: Object.values(m.rotas),
  }));
}

export async function listarMotoristasDoMes(ano, mes) {
  const rows = await prisma.escalaAtribuicao.findMany({
    where: { ano, mes, status: "ativo" },
    include: {
      motorista: INCLUDE_MOTORISTA_BASICO.motorista,
      rota: { select: { id: true, nome: true } },
    },
    orderBy: [{ rotaId: "asc" }, { ordem: "asc" }],
  });

  return rows;
}

export async function desativarEscala(ano, mes) {
  await prisma.escalaAtribuicao.updateMany({
    where: { ano, mes },
    data: { status: "inativo" },
  });

  return { message: `Escala de ${mes}/${ano} desativada com sucesso.` };
}

export async function resetEscalasAno(ano) {
  const { count } = await prisma.escalaAtribuicao.deleteMany({ where: { ano } });

  return { message: `Escalas de ${ano} removidas com sucesso.`, removidos: count };
}
