import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import * as RelatoriosController from './relatorios.controller.js';
import * as RelatoriosSchema from './relatorios.schema.js';

const router = Router();

router.get('/presencas/rota/:rotaId', requireAuth, requireRole('admin'), validate(RelatoriosSchema.rotaIdParamsSchema, 'params'), RelatoriosController.presencasPorRotasController);

router.get('/presencas/aluno/:alunoId', requireAuth, requireRole('admin'), validate(RelatoriosSchema.alunoIdParamsSchema, 'params'), RelatoriosController.presencasPorAlunoController);

router.get('/presencas/motorista/:motoristaId', requireAuth, requireRole('admin'), validate(RelatoriosSchema.motoristaIdParamsSchema, 'params'), RelatoriosController.presencasPorMotoristaController);

router.get('/presencas/faculdade/:faculdadeId', requireAuth, requireRole('admin'), validate(RelatoriosSchema.faculdadeIdParamsSchema, 'params'), RelatoriosController.presencasPorFaculdadeController);

router.get('/presencas/curso/:cursoId', requireAuth, requireRole('admin'), validate(RelatoriosSchema.cursoIdParamsSchema, 'params'), RelatoriosController.presencasPorCursoController);

router.get('/presencas/rota/:rotaId/excel', requireAuth, requireRole('admin'), validate(RelatoriosSchema.rotaIdParamsSchema, 'params'), RelatoriosController.presencasRotaExcelController);

router.get('/presencas/aluno/:alunoId/excel', requireAuth, requireRole('admin'), validate(RelatoriosSchema.alunoIdParamsSchema, 'params'), RelatoriosController.presencasAlunoExcelController);

router.get('/presencas/motorista/:motoristaId/excel', requireAuth, requireRole('admin'), validate(RelatoriosSchema.motoristaIdParamsSchema, 'params'), RelatoriosController.presencasMotoristaExcelController);

router.get('/presencas/faculdade/:faculdadeId/excel', requireAuth, requireRole('admin'), validate(RelatoriosSchema.faculdadeIdParamsSchema, 'params'), RelatoriosController.presencasFaculdadeExcelController);

router.get('/presencas/curso/:cursoId/excel', requireAuth, requireRole('admin'), validate(RelatoriosSchema.cursoIdParamsSchema, 'params'), RelatoriosController.presencasCursoExcelController);

router.get('/geral', requireAuth, requireRole('admin'), RelatoriosController.relatorioGeralController);

router.get('/geral/pdf', requireAuth, requireRole('admin'), RelatoriosController.relatorioGeralPDFController);

router.get('/geral/excel', requireAuth, requireRole('admin'), RelatoriosController.relatorioGeralExcelController);

router.get('/completo/pdf', requireAuth, requireRole('admin'), RelatoriosController.baixarRelatorioCompletoPDFController);

router.get('/completo/excel', requireAuth, requireRole('admin'), RelatoriosController.baixarRelatorioCompletoExcelController);

export default router;
