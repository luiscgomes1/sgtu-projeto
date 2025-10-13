import * as relatoriosService from "./relatorios.service.js";

export async function presencasPorRotasController(req, res, next) {
  try {
    const { rotaId } = req.params;
    const { dataInicio, dataFim } = req.query;

    const result = await relatoriosService.presencasPorRota(
      rotaId,
      dataInicio,
      dataFim
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function presencasPorAlunoController(req, res, next) {
  try {
    const { alunoId } = req.params;
    const { dataInicio, dataFim } = req.query;

    const result = await relatoriosService.presencasPorAluno(
      alunoId,
      dataInicio,
      dataFim
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function presencasPorMotoristaController(req, res, next) {
  try {
    const { motoristaId } = req.params;
    const { dataInicio, dataFim } = req.query;

    const result = await relatoriosService.presencasPorMotorista(
      motoristaId,
      dataInicio,
      dataFim
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function presencasPorFaculdadeController(req, res, next) {
  try {
    const { faculdadeId } = req.params;
    const { dataInicio, dataFim } = req.query;

    const result = await relatoriosService.presencasPorFaculdade(
      faculdadeId,
      dataInicio,
      dataFim
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function presencasPorCursoController(req, res, next) {
  try {
    const { cursoId } = req.params;
    const { dataInicio, dataFim } = req.query;

    const result = await relatoriosService.presencasPorCurso(
      cursoId,
      dataInicio,
      dataFim
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function relatorioGeralController(req, res, next) {
  try {
    const { dataInicial, dataFinal } = req.query;
    const data = await relatoriosService.relatorioGeral(
      dataInicial,
      dataFinal
    );
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function relatorioGeralPDFController(req, res, next) {
  try {
    const pdfBuffer = await relatoriosService.gerarRelatorioGeralPDF();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=relatorio_geral.pdf"
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

export async function relatorioGeralExcelController(req, res, next) {
  try {
    const excelBuffer = await relatoriosService.gerarRelatorioGeralExcel();
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=relatorio-geral.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(excelBuffer);
  } catch (error) {
    next(error);
  }
}

export async function baixarRelatorioCompletoPDFController(req, res, next) {
  try {
    const { dataInicial, dataFinal } = req.query;

    console.log("Data Inicial:", dataInicial);
    console.log("Data Final:", dataFinal);
    const buffer = await relatoriosService.gerarRelatorioCompletoPDF(
      dataInicial,
      dataFinal
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=relatorio_completo.pdf`
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
}

export async function baixarRelatorioCompletoExcelController(req, res, next) {
  try {
    const { dataInicial, dataFinal } = req.query;

    const buffer = await relatoriosService.gerarRelatorioCompletoExcel(
      dataInicial,
      dataFinal
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=relatorio_completo.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
}
