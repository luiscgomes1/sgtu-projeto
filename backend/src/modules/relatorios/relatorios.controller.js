import { ok } from '../../utils/response.js';
import * as relatoriosService from './relatorios.service.js';
import { logger } from '../../config/logger.js';

export async function presencasPorRotasController(req, res) {
    const { rotaId } = req.params;
    const { dataInicio, dataFim } = req.query;
    const result = await relatoriosService.presencasPorRota(rotaId, dataInicio, dataFim);
    ok(res, result);
}

export async function presencasPorAlunoController(req, res) {
    const { alunoId } = req.params;
    const { dataInicio, dataFim } = req.query;
    const result = await relatoriosService.presencasPorAluno(alunoId, dataInicio, dataFim);
    ok(res, result);
}

export async function presencasPorMotoristaController(req, res) {
    const { motoristaId } = req.params;
    const { dataInicio, dataFim } = req.query;
    const result = await relatoriosService.presencasPorMotorista(motoristaId, dataInicio, dataFim);
    ok(res, result);
}

export async function presencasPorFaculdadeController(req, res) {
    const { faculdadeId } = req.params;
    const { dataInicio, dataFim } = req.query;
    const result = await relatoriosService.presencasPorFaculdade(faculdadeId, dataInicio, dataFim);
    ok(res, result);
}

export async function presencasPorCursoController(req, res) {
    const { cursoId } = req.params;
    const { dataInicio, dataFim } = req.query;
    const result = await relatoriosService.presencasPorCurso(cursoId, dataInicio, dataFim);
    ok(res, result);
}

export async function relatorioGeralController(req, res) {
    const { dataInicial, dataFinal } = req.query;
    const data = await relatoriosService.relatorioGeral(dataInicial, dataFinal);
    ok(res, data);
}

export async function relatorioGeralPDFController(req, res) {
    const pdfBuffer = await relatoriosService.gerarRelatorioGeralPDF();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=relatorio_geral.pdf');
    res.send(pdfBuffer);
}

export async function relatorioGeralExcelController(req, res) {
    const excelBuffer = await relatoriosService.gerarRelatorioGeralExcel();
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio-geral.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(excelBuffer);
}

export async function baixarRelatorioCompletoPDFController(req, res) {
    const { dataInicial, dataFinal } = req.query;

    logger.debug({ dataInicial }, 'Data Inicial');
    logger.debug({ dataFinal }, 'Data Final');
    const buffer = await relatoriosService.gerarRelatorioCompletoPDF(dataInicial, dataFinal);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio_completo.pdf');
    res.send(buffer);
}

export async function baixarRelatorioCompletoExcelController(req, res) {
    const { dataInicial, dataFinal } = req.query;

    const buffer = await relatoriosService.gerarRelatorioCompletoExcel(dataInicial, dataFinal);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio_completo.xlsx');
    res.send(buffer);
}

function excelResponse(res, buffer, filename) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
}

export async function presencasRotaExcelController(req, res) {
    const { rotaId } = req.params;
    const { dataInicio, dataFim } = req.query;
    const buffer = await relatoriosService.gerarExcelPresencasRota(rotaId, dataInicio, dataFim);
    excelResponse(res, buffer, `presencas-rota-${rotaId}.xlsx`);
}

export async function presencasAlunoExcelController(req, res) {
    const { alunoId } = req.params;
    const { dataInicio, dataFim } = req.query;
    const buffer = await relatoriosService.gerarExcelPresencasAluno(alunoId, dataInicio, dataFim);
    excelResponse(res, buffer, `presencas-aluno-${alunoId}.xlsx`);
}

export async function presencasMotoristaExcelController(req, res) {
    const { motoristaId } = req.params;
    const { dataInicio, dataFim } = req.query;
    const buffer = await relatoriosService.gerarExcelPresencasMotorista(motoristaId, dataInicio, dataFim);
    excelResponse(res, buffer, `presencas-motorista-${motoristaId}.xlsx`);
}

export async function presencasFaculdadeExcelController(req, res) {
    const { faculdadeId } = req.params;
    const { dataInicio, dataFim } = req.query;
    const buffer = await relatoriosService.gerarExcelPresencasFaculdade(faculdadeId, dataInicio, dataFim);
    excelResponse(res, buffer, `presencas-faculdade-${faculdadeId}.xlsx`);
}

export async function presencasCursoExcelController(req, res) {
    const { cursoId } = req.params;
    const { dataInicio, dataFim } = req.query;
    const buffer = await relatoriosService.gerarExcelPresencasCurso(cursoId, dataInicio, dataFim);
    excelResponse(res, buffer, `presencas-curso-${cursoId}.xlsx`);
}
