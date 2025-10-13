import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import * as RelatoriosController from './relatorios.controller.js';

const router = Router();

router.get('/presencas/rota/:rotaId', requireAuth, requireRole('admin'), RelatoriosController.presencasPorRotasController);

router.get('/presencas/aluno/:alunoId', requireAuth, requireRole('admin'), RelatoriosController.presencasPorAlunoController);

router.get('/presencas/motorista/:motoristaId', requireAuth, requireRole('admin'), RelatoriosController.presencasPorMotoristaController);

router.get('/presencas/faculdade/:faculdadeId', requireAuth, requireRole('admin'), RelatoriosController.presencasPorFaculdadeController);

router.get('/presencas/curso/:cursoId', requireAuth, requireRole('admin'), RelatoriosController.presencasPorCursoController);

router.get('/geral', requireAuth, requireRole('admin'), RelatoriosController.relatorioGeralController);

router.get('/geral/pdf', requireAuth, requireRole('admin'), RelatoriosController.relatorioGeralPDFController);

router.get('/geral/excel', requireAuth, requireRole('admin'), RelatoriosController.relatorioGeralExcelController);

router.get('/completo/pdf', requireAuth, requireRole('admin'), RelatoriosController.baixarRelatorioCompletoPDFController);

router.get('/completo/excel', requireAuth, requireRole('admin'), RelatoriosController.baixarRelatorioCompletoExcelController);

export default router;