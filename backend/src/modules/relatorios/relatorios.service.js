import { prisma } from "../../config/prisma.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { daysBetween, drawSeparator, formatNumber } from "../../utils/functions.js";
import { INCLUDE_CURSO_FACULDADE } from "../../shared/includes.js";

export async function presencasPorRota(rotaId, dataInicial, dataFinal) {
  const whereClause = { rotaId, status: "ativo" };
  const dataFilter = {};
  if (dataInicial) dataFilter.gte = new Date(dataInicial);
  if (dataFinal) dataFilter.lte = new Date(dataFinal);
  if (Object.keys(dataFilter).length) whereClause.data = dataFilter;

  const [registros, totalPresencas, rota] = await Promise.all([
    prisma.presenca.findMany({
      where: whereClause,
      include: {
        aluno: {
          include: {
            usuario: { select: { nome: true } },
            curso: INCLUDE_CURSO_FACULDADE.curso,
          },
        },
      },
    }),
    prisma.presenca.count({ where: whereClause }),
    prisma.rota.findUnique({ where: { id: rotaId }, select: { nome: true } }),
  ]);

  const alunosUnicos = [...new Set(registros.map((p) => p.alunoId))].length;

  return {
    rotaId,
    nomeRota: rota?.nome || "(Rota sem nome)",
    periodo: { de: dataInicial, ate: dataFinal },
    totalPresencas,
    alunosUnicos,
    registros: registros.map((p) => ({
      id: p.id,
      data: p.data,
      aluno: {
        id: p.alunoId,
        nome: p.aluno?.usuario?.nome,
        curso: p.aluno?.curso?.nome,
        faculdade: p.aluno?.curso?.faculdade?.nome,
      },
    })),
  };
}

export async function presencasPorAluno(alunoId, dataInicial, dataFinal) {
  const whereClause = { alunoId, status: "ativo" };
  const dataFilter = {};
  if (dataInicial) dataFilter.gte = new Date(dataInicial);
  if (dataFinal) dataFilter.lte = new Date(dataFinal);
  if (Object.keys(dataFilter).length) whereClause.data = dataFilter;

  const [registros, totalPresencas] = await Promise.all([
    prisma.presenca.findMany({
      where: whereClause,
      include: {
        aluno: {
          include: {
            usuario: { select: { nome: true } },
          },
        },
        rota: { select: { nome: true } },
      },
    }),
    prisma.presenca.count({ where: whereClause }),
  ]);

  return {
    alunoId,
    nomeAluno: registros[0]?.aluno?.usuario?.nome || null,
    periodo: { de: dataInicial, ate: dataFinal },
    totalPresencas,
    registros: registros.map((p) => ({
      id: p.id,
      data: p.data,
      rota: {
        id: p.rotaId,
        nome: p.rota.nome,
      },
    })),
  };
}

export async function presencasPorMotorista(motoristaId, dataInicial, dataFinal) {
  const whereViagem = {};
  const dataFilter = {};
  if (dataInicial) dataFilter.gte = new Date(dataInicial);
  if (dataFinal) dataFilter.lte = new Date(dataFinal);
  if (Object.keys(dataFilter).length) whereViagem.data = dataFilter;

  const viagens = await prisma.viagem.findMany({
    where: whereViagem,
    include: {
      rota: { select: { nome: true } },
      presencas: { select: { id: true } },
    },
  });

  const rotaIds = [...new Set(viagens.map((v) => v.rotaId))];

  const rotaMotoristas = await prisma.rotaMotorista.findMany({
    where: {
      rotaId: { in: rotaIds },
      motoristaId,
      status: "ativo",
    },
    select: {
      rotaId: true,
      motoristaId: true,
      inicio: true,
      fim: true,
    },
  });

  const viagensDoMotorista = viagens.filter((viagem) => {
    return rotaMotoristas.some(
      (rm) =>
        rm.rotaId === viagem.rotaId &&
        new Date(viagem.data) >= new Date(rm.inicio) &&
        (!rm.fim || new Date(viagem.data) <= new Date(rm.fim))
    );
  });

  const totalPresencas = viagensDoMotorista.reduce(
    (sum, v) => sum + (v.presencas?.length || 0),
    0
  );

  const motorista = await prisma.motorista.findUnique({
    where: { id: motoristaId },
    select: { nome: true },
  });

  return {
    motoristaId,
    nomeMotorista: motorista?.nome || "Motorista sem nome",
    periodo: { de: dataInicial, ate: dataFinal },
    totalViagens: viagensDoMotorista.length,
    totalPresencas,
    viagens: viagensDoMotorista.map((v) => ({
      id: v.id,
      data: v.data,
      rota: {
        id: v.rotaId,
        nome: v.rota.nome,
      },
      presencas: v.presencas?.length || 0,
    })),
  };
}

export async function presencasPorFaculdade(faculdadeId, dataInicial, dataFinal) {
  const whereClause = { status: "ativo", aluno: { curso: { faculdadeId } } };
  const dataFilter = {};
  if (dataInicial) dataFilter.gte = new Date(dataInicial);
  if (dataFinal) dataFilter.lte = new Date(dataFinal);
  if (Object.keys(dataFilter).length) whereClause.data = dataFilter;

  const registros = await prisma.presenca.findMany({
    where: whereClause,
    include: {
      aluno: {
        include: {
          usuario: { select: { nome: true } },
            curso: INCLUDE_CURSO_FACULDADE.curso,
        },
      },
    },
  });

  return {
    faculdadeId,
    faculdadeNome: registros[0]?.aluno?.curso?.faculdade?.nome || "(Faculdade sem nome)",
    periodo: { de: dataInicial, ate: dataFinal },
    totalPresencas: registros.length,
    alunosUnicos: [...new Set(registros.map((p) => p.alunoId))].length,
    registros: registros.map((p) => ({
      id: p.id,
      data: p.data,
      aluno: {
        id: p.alunoId,
        nome: p.aluno?.usuario?.nome,
        curso: p.aluno?.curso?.nome,
        faculdade: p.aluno?.curso?.faculdade?.nome,
      },
    })),
  };
}

export async function presencasPorCurso(cursoId, dataInicial, dataFinal) {
  const whereClause = { status: "ativo", aluno: { cursoId } };
  const dataFilter = {};
  if (dataInicial) dataFilter.gte = new Date(dataInicial);
  if (dataFinal) dataFilter.lte = new Date(dataFinal);
  if (Object.keys(dataFilter).length) whereClause.data = dataFilter;

  const [registros, curso] = await Promise.all([
    prisma.presenca.findMany({
      where: whereClause,
      include: {
        aluno: {
          include: {
            usuario: { select: { nome: true } },
            curso: INCLUDE_CURSO_FACULDADE.curso,
          },
        },
      },
    }),
    prisma.curso.findUnique({
      where: { id: cursoId },
      select: { nome: true },
    }),
  ]);

  return {
    cursoId,
    cursoNome: curso?.nome || "(Curso sem nome)",
    periodo: { de: dataInicial, ate: dataFinal },
    totalPresencas: registros.length,
    alunosUnicos: [...new Set(registros.map((p) => p.alunoId))].length,
    registros: registros.map((p) => ({
      id: p.id,
      data: p.data,
      aluno: {
        id: p.alunoId,
        nome: p.aluno?.usuario?.nome,
        faculdade: p.aluno?.curso?.faculdade?.nome,
      },
    })),
  };
}

export async function relatorioGeral(dataInicial, dataFinal) {
  const [totalAlunos, totalMotoristas, totalRotas, totalFaculdades] = await Promise.all([
    prisma.aluno.count({ where: { statusCadastro: "ativo" } }),
    prisma.motorista.count({ where: { status: "ativo" } }),
    prisma.rota.count({ where: { status: "ativo" } }),
    prisma.faculdade.count({ where: { status: "ativo" } }),
  ]);

  if (dataInicial && dataFinal && daysBetween(dataInicial, dataFinal) > 31) {
    throw new Error("O intervalo entre as datas não pode ser maior que 31 dias.");
  }

  let inicioMes = new Date();
  let hoje = new Date();
  if (dataInicial && dataFinal) {
    inicioMes = new Date(dataInicial);
    hoje = new Date(dataFinal);
  } else {
    inicioMes.setDate(1);
  }

  const wherePresenca = {
    status: "ativo",
    data: {
      gte: inicioMes,
      lte: hoje,
    },
  };

  const [presencasMes, presFaculdades] = await Promise.all([
    prisma.presenca.count({ where: wherePresenca }),
    prisma.presenca.findMany({
      where: wherePresenca,
      include: {
        aluno: {
          include: {
            curso: INCLUDE_CURSO_FACULDADE.curso,
          },
        },
      },
    }),
  ]);

  const faculdadesCount = {};
  const cursoCount = {};

  presFaculdades.forEach((p) => {
    const faculdade = p.aluno?.curso?.faculdade?.nome;
    const curso = p.aluno?.curso?.nome;

    if (faculdade) faculdadesCount[faculdade] = (faculdadesCount[faculdade] || 0) + 1;
    if (curso) cursoCount[curso] = (cursoCount[curso] || 0) + 1;
  });

  const topFaculdades = Object.entries(faculdadesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nome, total]) => ({ nome, total }));

  const topCursos = Object.entries(cursoCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nome, total]) => ({ nome, total }));

  return {
    totals: {
      alunos: totalAlunos,
      motoristas: totalMotoristas,
      rotas: totalRotas,
      faculdades: totalFaculdades,
    },
    presencasMes,
    topFaculdades,
    topCursos,
  };
}

export async function gerarRelatorioGeralPDF() {
  const data = await relatorioGeral();

  const doc = new PDFDocument({ size: "A4", margin: 50 });

  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const endPromise = new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const MARGIN_LEFT = 50;
  const ROW_HEIGHT = 18;
  const FONT_SIZE_DATA = 10;

  const POS_X = {
    POS: MARGIN_LEFT + 20,
    NOME: MARGIN_LEFT + 60,
    PRESENCAS_COL: MARGIN_LEFT + 390,
  };

  const WIDTHS = {
    POS: 30,
    NOME: 350,
    PRESENCAS: 90,
  };

  const HEADER_HEIGHT = 50;
  const START_CONTENT_Y = HEADER_HEIGHT + 40;
  let currentY = START_CONTENT_Y;

  doc.fill("#003366")
    .rect(0, 0, doc.page.width, HEADER_HEIGHT)
    .fill();

  doc.fill("white")
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("RELATÓRIO GERAL DE TRANSPORTE UNIVERSITÁRIO", 0, 18, { align: "center" });

  doc.fill("#444444")
    .fontSize(9)
    .font("Helvetica")
    .text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, MARGIN_LEFT, HEADER_HEIGHT + 15, { align: "right" });

  doc.fontSize(14)
    .fill("#003366")
    .font("Helvetica-Bold")
    .text("RESUMO DE DADOS (KPIs)", MARGIN_LEFT, currentY);
  currentY += 20;

  const COL1_X = MARGIN_LEFT;
  const COL2_X = MARGIN_LEFT + 200;
  const TOTALS_BOX_WIDTH = 180;

  const totals = [
    { label: "Alunos Ativos", value: formatNumber(data.totals.alunos), color: "#3366CC" },
    { label: "Motoristas Ativos", value: formatNumber(data.totals.motoristas), color: "#3366CC" },
    { label: "Rotas Ativas", value: formatNumber(data.totals.rotas), color: "#3366CC" },
    { label: "Faculdades Ativas", value: formatNumber(data.totals.faculdades), color: "#3366CC" },
  ];

  const drawKpiBox = (label, value, x, y, color) => {
    doc.fill("#F0F0F0")
      .rect(x, y, TOTALS_BOX_WIDTH, 40)
      .fill();

    doc.fill(color)
      .rect(x, y, 5, 40)
      .fill();

    doc.fill("#555555")
      .fontSize(8)
      .font("Helvetica-Bold")
      .text(label.toUpperCase(), x + 15, y + 5);

    doc.fill("black")
      .fontSize(16)
      .font("Helvetica")
      .text(value, x + 15, y + 18);
  };

  currentY += 5;

  drawKpiBox(totals[0].label, totals[0].value, COL1_X, currentY, totals[0].color);
  drawKpiBox(totals[1].label, totals[1].value, COL2_X, currentY, totals[1].color);

  currentY += 50;

  drawKpiBox(totals[2].label, totals[2].value, COL1_X, currentY, totals[2].color);
  drawKpiBox(totals[3].label, totals[3].value, COL2_X, currentY, totals[3].color);

  currentY += 60;

  doc.fontSize(12).fill("#CC0000").font("Helvetica-Bold")
    .text(`TOTAL DE PRESENÇAS NO MÊS ATUAL: ${formatNumber(data.presencasMes)}`, COL1_X, currentY);

  currentY += 30;
  drawSeparator(doc, currentY);
  currentY += 15;

  doc.y = currentY;

  doc.fontSize(14)
    .fill("#003366")
    .font("Helvetica-Bold")
    .text("RANKING: TOP 10 FACULDADES POR PRESENÇA", MARGIN_LEFT, doc.y);
  doc.moveDown(0.8);

  let tableY = doc.y;

  doc.fill("#444444")
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("POS.", POS_X.POS, tableY, { width: WIDTHS.POS })
    .text("FACULDADE", POS_X.NOME, tableY, { width: WIDTHS.NOME })
    .text("PRESENÇAS", POS_X.PRESENCAS_COL, tableY, { width: WIDTHS.PRESENCAS, align: "right" });

  drawSeparator(doc, tableY + 12, "#003366");

  tableY += ROW_HEIGHT;

  data.topFaculdades.slice(0, 10).forEach((f, index) => {
    if (index % 2 !== 0) {
      doc.fill("#FAFAFA")
        .rect(50, tableY - 5, 500, ROW_HEIGHT)
        .fill();
    }

    doc.fill("black")
      .fontSize(FONT_SIZE_DATA)
      .font("Helvetica-Bold")
      .text(`${index + 1}.`, POS_X.POS, tableY, { width: WIDTHS.POS })
      .font("Helvetica")
      .text(f.nome, POS_X.NOME, tableY, { width: WIDTHS.NOME, ellipsis: true })
      .font("Helvetica-Bold")
      .text(formatNumber(f.total), POS_X.PRESENCAS_COL, tableY, { width: WIDTHS.PRESENCAS, align: "right" });

    tableY += ROW_HEIGHT;
  });

  currentY = tableY + 10;
  drawSeparator(doc, currentY);
  currentY += 15;

  doc.y = currentY;

  doc.fontSize(14)
    .fill("#003366")
    .font("Helvetica-Bold")
    .text("RANKING: TOP 10 CURSOS POR PRESENÇA", MARGIN_LEFT, doc.y);
  doc.moveDown(0.8);

  tableY = doc.y;

  doc.fill("#444444")
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("POS.", POS_X.POS, tableY, { width: WIDTHS.POS })
    .text("CURSO", POS_X.NOME, tableY, { width: WIDTHS.NOME })
    .text("PRESENÇAS", POS_X.PRESENCAS_COL, tableY, { width: WIDTHS.PRESENCAS, align: "right" });

  drawSeparator(doc, tableY + 12, "#003366");

  tableY += ROW_HEIGHT;

  data.topCursos.slice(0, 10).forEach((c, index) => {
    if (index % 2 !== 0) {
      doc.fill("#FAFAFA")
        .rect(50, tableY - 5, 500, ROW_HEIGHT)
        .fill();
    }

    doc.fill("black")
      .fontSize(FONT_SIZE_DATA)
      .font("Helvetica-Bold")
      .text(`${index + 1}.`, POS_X.POS, tableY, { width: WIDTHS.POS })
      .font("Helvetica")
      .text(c.nome, POS_X.NOME, tableY, { width: WIDTHS.NOME, ellipsis: true })
      .font("Helvetica-Bold")
      .text(formatNumber(c.total), POS_X.PRESENCAS_COL, tableY, { width: WIDTHS.PRESENCAS, align: "right" });

    tableY += ROW_HEIGHT;
  });

  doc.end();
  return await endPromise;
}

export async function gerarRelatorioGeralExcel() {
  const data = await relatorioGeral();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Relatório Geral");

  sheet.mergeCells("A1", "B1");
  sheet.getCell("A1").value = "Relatório Geral - Transporte Universitário";
  sheet.getCell("A1").font = { size: 16, bold: true };
  sheet.getCell("A1").alignment = { horizontal: "center" };

  sheet.addRow([]);
  sheet.addRow(["Gerado em:", new Date().toLocaleString("pt-BR")]);
  sheet.addRow([]);

  sheet.addRow(["Totais"]);
  sheet.addRow(["Alunos ativos", data.totals.alunos]);
  sheet.addRow(["Motoristas ativos", data.totals.motoristas]);
  sheet.addRow(["Rotas ativas", data.totals.rotas]);
  sheet.addRow(["Faculdades ativas", data.totals.faculdades]);
  sheet.addRow(["Presenças no mês atual", data.presencasMes]);
  sheet.addRow([]);

  sheet.addRow(["Top Faculdades"]);
  sheet.addRow(["Posição", "Faculdade", "Total de Presenças"]);
  data.topFaculdades.forEach((f, index) => {
    sheet.addRow([index + 1, f.nome, f.total]);
  });
  sheet.addRow([]);

  sheet.addRow(["Top Cursos"]);
  sheet.addRow(["Posição", "Curso", "Total de Presenças"]);
  data.topCursos.forEach((c, index) => {
    sheet.addRow([index + 1, c.nome, c.total]);
  });

  sheet.columns.forEach((column) => {
    column.width = 30;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

const MAX_RELATORIO_DIAS = 365;

export async function gerarRelatorioCompleto(dataInicial, dataFinal) {
  if (!dataInicial && !dataFinal) {
    dataFinal = new Date().toISOString().slice(0, 10);
    dataInicial = new Date(Date.now() - MAX_RELATORIO_DIAS * 86400000).toISOString().slice(0, 10);
  }
  const [geral, rotas, faculdades, cursos, alunos, motoristas] = await Promise.all([
    relatorioGeral(),
    prisma.rota.findMany({ where: { status: "ativo" }, select: { id: true, nome: true } }),
    prisma.faculdade.findMany({ where: { status: "ativo" }, select: { id: true, nome: true } }),
    prisma.curso.findMany({ where: { status: "ativo" }, select: { id: true, nome: true, faculdadeId: true } }),
    prisma.aluno.findMany({
      where: { statusCadastro: "aprovado" },
      select: { usuarioId: true, usuario: { select: { nome: true } } },
    }),
    prisma.motorista.findMany({ where: { status: "ativo" }, select: { id: true, nome: true } }),
  ]);

  const alunosValidos = (alunos || []).filter((a) => a?.usuarioId && a?.usuario);
  const motoristasValidos = (motoristas || []).filter((m) => m?.id);
  const rotasValidas = (rotas || []).filter((r) => r?.id && r?.nome);
  const faculdadesValidas = (faculdades || []).filter((f) => f?.id && f?.nome);
  const cursosValidos = (cursos || []).filter((c) => c?.id && c?.nome);

  if (alunosValidos.length === 0) throw new Error("Nenhum aluno ativo encontrado.");
  if (motoristasValidos.length === 0) throw new Error("Nenhum motorista ativo encontrado.");
  if (rotasValidas.length === 0) throw new Error("Nenhuma rota ativa encontrada.");
  if (faculdadesValidas.length === 0) throw new Error("Nenhuma faculdade ativa encontrada.");
  if (cursosValidos.length === 0) throw new Error("Nenhum curso ativo encontrado.");

  const dataFilter = {};
  if (dataInicial) dataFilter.gte = new Date(dataInicial);
  if (dataFinal) dataFilter.lte = new Date(dataFinal);

  const rotaIds = rotasValidas.map((r) => r.id);
  const faculdadeIds = faculdadesValidas.map((f) => f.id);
  const motoristaIds = motoristasValidos.map((m) => m.id);
  const alunoIds = alunosValidos.map((a) => a.usuarioId);

  const [presencasPorRotaRaw, presencasPorFaculdadeRaw, viagensPorMotoristaRaw, presencasPorAlunoRaw] = await Promise.all([
    prisma.presenca.findMany({
      where: { rotaId: { in: rotaIds }, status: "ativo", ...(Object.keys(dataFilter).length ? { data: dataFilter } : {}) },
      select: { id: true, data: true, alunoId: true, rotaId: true, aluno: { select: { usuario: { select: { nome: true } } } } },
    }),
    prisma.presenca.findMany({
      where: { status: "ativo", aluno: { curso: { faculdadeId: { in: faculdadeIds } } }, ...(Object.keys(dataFilter).length ? { data: dataFilter } : {}) },
      select: { id: true, data: true, alunoId: true, aluno: { select: { usuarioId: true, usuario: { select: { nome: true } }, curso: { select: { nome: true, faculdadeId: true, faculdade: { select: { nome: true } } } } } } },
    }),
    prisma.viagem.findMany({
      where: { ...(Object.keys(dataFilter).length ? { data: dataFilter } : {}) },
      include: { rota: { select: { nome: true } }, presencas: { select: { id: true } } },
    }),
    prisma.presenca.findMany({
      where: { alunoId: { in: alunoIds }, status: "ativo", ...(Object.keys(dataFilter).length ? { data: dataFilter } : {}) },
      include: { rota: { select: { nome: true } } },
    }),
  ]);

  const rotasMap = Object.fromEntries(rotasValidas.map((r) => [r.id, r.nome]));
  const faculdadesMap = Object.fromEntries(faculdadesValidas.map((f) => [f.id, f.nome]));
  const motoristasMap = Object.fromEntries(motoristasValidos.map((m) => [m.id, m.nome]));
  const alunosMap = Object.fromEntries(alunosValidos.map((a) => [a.usuarioId, a.usuario.nome]));

  const porRota = rotaIds.map((id) => {
    const registros = presencasPorRotaRaw.filter((p) => p.rotaId === id);
    const alunosUnicos = [...new Set(registros.map((p) => p.alunoId))].length;
    return {
      rotaId: id,
      nomeRota: rotasMap[id] || "(Rota sem nome)",
      periodo: { de: dataInicial, ate: dataFinal },
      totalPresencas: registros.length,
      alunosUnicos,
      registros: registros.map((p) => ({
        id: p.id,
        data: p.data,
        aluno: { id: p.alunoId, nome: p.aluno?.usuario?.nome },
      })),
    };
  });

  const porFaculdade = faculdadeIds.map((id) => {
    const registros = presencasPorFaculdadeRaw.filter((p) => p.aluno?.curso?.faculdadeId === id);
    const alunosUnicos = [...new Set(registros.map((p) => p.alunoId))].length;
    return {
      faculdadeId: id,
      faculdadeNome: faculdadesMap[id] || "(Faculdade sem nome)",
      periodo: { de: dataInicial, ate: dataFinal },
      totalPresencas: registros.length,
      alunosUnicos,
      registros: registros.map((p) => ({
        id: p.id,
        data: p.data,
        aluno: {
          id: p.alunoId,
          nome: p.aluno?.usuario?.nome,
          curso: p.aluno?.curso?.nome,
          faculdade: p.aluno?.curso?.faculdade?.nome,
        },
      })),
    };
  });

  const rotaMotoristas = await prisma.rotaMotorista.findMany({
    where: { rotaId: { in: rotaIds }, motoristaId: { in: motoristaIds }, status: "ativo" },
    select: { rotaId: true, motoristaId: true, inicio: true, fim: true },
  });

  const porMotorista = motoristaIds.map((id) => {
    const rmFilter = rotaMotoristas.filter((rm) => rm.motoristaId === id);
    const viagens = viagensPorMotoristaRaw.filter((v) =>
      rmFilter.some(
        (rm) =>
          rm.rotaId === v.rotaId &&
          new Date(v.data) >= new Date(rm.inicio) &&
          (!rm.fim || new Date(v.data) <= new Date(rm.fim))
      )
    );
    const totalPresencas = viagens.reduce((sum, v) => sum + (v.presencas?.length || 0), 0);
    return {
      motoristaId: id,
      nomeMotorista: motoristasMap[id] || "Motorista sem nome",
      periodo: { de: dataInicial, ate: dataFinal },
      totalViagens: viagens.length,
      totalPresencas,
      viagens: viagens.map((v) => ({
        id: v.id,
        data: v.data,
        rota: { id: v.rotaId, nome: v.rota.nome },
        presencas: v.presencas?.length || 0,
      })),
    };
  });

  const porAluno = alunoIds.map((id) => {
    const registros = presencasPorAlunoRaw.filter((p) => p.alunoId === id);
    return {
      alunoId: id,
      nomeAluno: alunosMap[id] || null,
      periodo: { de: dataInicial, ate: dataFinal },
      totalPresencas: registros.length,
      registros: registros.map((p) => ({
        id: p.id,
        data: p.data,
        rota: { id: p.rotaId, nome: p.rota.nome },
      })),
    };
  });

  const faculdadesCursos = await gerarRelatorioPorFaculdadeCurso(dataInicial, dataFinal);

  return {
    periodo: { de: dataInicial, ate: dataFinal },
    geral,
    detalhado: {
      porRota,
      porFaculdade,
      porMotorista,
      porAluno,
      porFaculdadeCurso: faculdadesCursos,
    },
  };
}

export async function gerarRelatorioPorFaculdadeCurso(dataInicial, dataFinal) {
  const whereClause = { status: "ativo" };
  const dataFilter = {};
  if (dataInicial) dataFilter.gte = new Date(dataInicial);
  if (dataFinal) dataFilter.lte = new Date(dataFinal);
  if (Object.keys(dataFilter).length) whereClause.data = dataFilter;

  const data = await prisma.presenca.findMany({
    where: whereClause,
    include: {
      aluno: {
        include: {
          curso: {
            include: {
              faculdade: { select: { nome: true } },
            },
          },
        },
      },
    },
  });

  const resultado = {};
  data.forEach((p) => {
    const faculdade = p.aluno?.curso?.faculdade?.nome;
    const curso = p.aluno?.curso?.nome;

    if (!faculdade || !curso) return;

    if (!resultado[faculdade]) resultado[faculdade] = {};
    resultado[faculdade][curso] = (resultado[faculdade][curso] || 0) + 1;
  });

  return Object.entries(resultado).map(([faculdade, cursos]) => ({
    faculdade,
    total_presencas: Object.values(cursos).reduce((a, b) => a + b, 0),
    cursos: Object.entries(cursos).map(([curso, total]) => ({ curso, total })),
  }));
}

export async function gerarRelatorioCompletoPDF(dataInicial, dataFinal) {
  const data = await gerarRelatorioCompleto(dataInicial, dataFinal);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const endPromise = new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fill("#003366")
    .rect(0, 0, doc.page.width, 50)
    .fill();
  doc.fill("white")
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("RELATÓRIO COMPLETO DE TRANSPORTE UNIVERSITÁRIO", 0, 18, { align: "center" });

  doc.moveDown(2);
  doc.font("Helvetica").fontSize(10).fill("#444")
    .text(`Período: ${data.periodo.de || "-"} até ${data.periodo.ate || "-"}`, { align: "center" });
  doc.moveDown();

  doc.addPage();
  doc.font("Helvetica-Bold").fontSize(14).fill("#003366").text("RESUMO GERAL");
  doc.moveDown();
  doc.fontSize(10).fill("black").text(`Alunos Ativos: ${data.geral.totals.alunos}`);
  doc.text(`Motoristas Ativos: ${data.geral.totals.motoristas}`);
  doc.text(`Rotas Ativas: ${data.geral.totals.rotas}`);
  doc.text(`Faculdades Ativas: ${data.geral.totals.faculdades}`);
  doc.moveDown();
  doc.font("Helvetica-Bold").text(`Presenças no mês atual: ${data.geral.presencasMes}`);

  const addSection = (titulo) => {
    doc.addPage();
    doc.fill("#003366")
      .font("Helvetica-Bold")
      .fontSize(14)
      .text(titulo, { align: "center" });
    doc.moveDown();
  };

  addSection("DETALHADO POR ROTA");
  data.detalhado.porRota.forEach((r) => {
    doc.font("Helvetica-Bold").fill("#000").text(r.nomeRota);
    doc.font("Helvetica").text(`Total presenças: ${r.totalPresencas}`);
    doc.moveDown(0.5);
  });

  addSection("DETALHADO POR FACULDADE E CURSO");
  data.detalhado.porFaculdadeCurso.forEach((f) => {
    doc.font("Helvetica-Bold").fill("#000").text(f.faculdade);
    f.cursos.forEach((c) => {
      doc.font("Helvetica").text(`• ${c.curso}: ${c.total}`);
    });
    doc.moveDown(0.5);
  });

  addSection("DETALHADO POR MOTORISTA");
  data.detalhado.porMotorista.forEach((m) => {
    doc.font("Helvetica-Bold").fill("#000").text(m.nomeMotorista);
    doc.font("Helvetica").text(`Total viagens: ${m.totalViagens}`);
    doc.text(`Total presenças: ${m.totalPresencas}`);
    doc.moveDown(0.5);
  });

  addSection("DETALHADO POR ALUNO");
  data.detalhado.porAluno.forEach((a) => {
    doc.font("Helvetica-Bold").text(a.nomeAluno);
    doc.font("Helvetica").text(`Total presenças: ${a.totalPresencas}`);
    doc.moveDown(0.5);
  });

  doc.end();
  return await endPromise;
}

export async function gerarRelatorioCompletoExcel(dataInicial, dataFinal) {
  const data = await gerarRelatorioCompleto(dataInicial, dataFinal);
  const workbook = new ExcelJS.Workbook();

  const geral = workbook.addWorksheet("Resumo Geral");
  geral.addRow(["Resumo do Transporte Universitário"]);
  geral.addRow([]);
  geral.addRow(["Alunos Ativos", data.geral.totals.alunos]);
  geral.addRow(["Motoristas Ativos", data.geral.totals.motoristas]);
  geral.addRow(["Rotas Ativas", data.geral.totals.rotas]);
  geral.addRow(["Faculdades Ativas", data.geral.totals.faculdades]);
  geral.addRow(["Presenças no mês", data.geral.presencasMes]);
  geral.addRow([]);

  const fac = workbook.addWorksheet("Faculdades e Cursos");
  fac.addRow(["Faculdade", "Curso", "Presenças"]);
  data.detalhado.porFaculdadeCurso.forEach((f) => {
    f.cursos.forEach((c) => {
      fac.addRow([f.faculdade, c.curso, c.total]);
    });
  });

  const rotas = workbook.addWorksheet("Rotas");
  rotas.addRow(["Rota", "Total Presenças"]);
  data.detalhado.porRota.forEach((r) => {
    rotas.addRow([r.nomeRota, r.totalPresencas]);
  });

  const mot = workbook.addWorksheet("Motoristas");
  mot.addRow(["Motorista", "Total Viagens", "Total Presenças"]);
  data.detalhado.porMotorista.forEach((m) => {
    mot.addRow([m.nomeMotorista, m.totalViagens, m.totalPresencas]);
  });

  const alunos = workbook.addWorksheet("Alunos");
  alunos.addRow(["Aluno", "Total Presenças"]);
  data.detalhado.porAluno.forEach((a) => {
    alunos.addRow([a.nomeAluno, a.totalPresencas]);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

function addHeaderRow(sheet, title) {
  sheet.mergeCells('A1', 'B1');
  const cell = sheet.getCell('A1');
  cell.value = title;
  cell.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003366' } };
  cell.alignment = { horizontal: 'center' };
  sheet.getRow(1).height = 30;
}

function addStyledRows(sheet, headers, rows) {
  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF444444' } };
  rows.forEach((r) => {
    const row = sheet.addRow(r);
    row.getCell(1).border = { top: { style: 'thin' }, bottom: { style: 'thin' } };
  });
  sheet.columns.forEach((c) => { c.width = 30; });
}

async function gerarExcelPresencas(data, entityName, _fileName) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(entityName);
  addHeaderRow(sheet, `Presenças - ${entityName} (${data.nome || entityName})`);

  sheet.addRow([]);
  sheet.addRow([`Período: ${data.dataInicio || '-'} até ${data.dataFim || '-'}`]);

  if (data.presencas?.length) {
    sheet.addRow([]);
    addStyledRows(sheet, ['Data', 'Status'], data.presencas.map((p) => [
      new Date(p.data).toLocaleDateString('pt-BR'),
      p.confirmado ? 'Confirmado' : 'Pendente',
    ]));
    sheet.addRow([]);
    sheet.addRow(['Total de Presenças', data.totalPresencas]);
  } else {
    sheet.addRow([]);
    sheet.addRow(['Nenhuma presença encontrada no período.']);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

export async function gerarExcelPresencasRota(rotaId, dataInicio, dataFim) {
  const data = await presencasPorRota(rotaId, dataInicio, dataFim);
  return gerarExcelPresencas(data, 'Rota', `presencas-rota-${rotaId}`);
}

export async function gerarExcelPresencasAluno(alunoId, dataInicio, dataFim) {
  const data = await presencasPorAluno(alunoId, dataInicio, dataFim);
  return gerarExcelPresencas(data, 'Aluno', `presencas-aluno-${alunoId}`);
}

export async function gerarExcelPresencasMotorista(motoristaId, dataInicio, dataFim) {
  const data = await presencasPorMotorista(motoristaId, dataInicio, dataFim);
  return gerarExcelPresencas(data, 'Motorista', `presencas-motorista-${motoristaId}`);
}

export async function gerarExcelPresencasFaculdade(faculdadeId, dataInicio, dataFim) {
  const data = await presencasPorFaculdade(faculdadeId, dataInicio, dataFim);
  return gerarExcelPresencas(data, 'Faculdade', `presencas-faculdade-${faculdadeId}`);
}

export async function gerarExcelPresencasCurso(cursoId, dataInicio, dataFim) {
  const data = await presencasPorCurso(cursoId, dataInicio, dataFim);
  return gerarExcelPresencas(data, 'Curso', `presencas-curso-${cursoId}`);
}
