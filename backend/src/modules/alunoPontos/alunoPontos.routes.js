import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import * as AlunoPontoController from './alunoPontos.controller.js';
import * as AlunoPontoSchema from './alunoPontos.schema.js';
import { validate } from '../../middleware/validate.js';
import { sanitizeData } from '../../middleware/sanitize.js';
const router = Router();

router.post('/vincular', requireAuth, requireRole('admin'), sanitizeData, validate(AlunoPontoSchema.alunoPontoBodySchema), AlunoPontoController.vincularAlunoPontoController);
router.post('/desvincular', requireAuth, requireRole('admin'), sanitizeData, validate(AlunoPontoSchema.alunoPontoBodySchema), AlunoPontoController.desvincularAlunoPontoController);
router.get('/aluno/:alunoId', requireAuth, requireRole('admin'), validate(AlunoPontoSchema.alunoIdParamSchema, 'params'), AlunoPontoController.listarPontoDoAlunoController);
router.get('/ponto/:pontoId', requireAuth, requireRole('admin'), validate(AlunoPontoSchema.pontoIdParamSchema, 'params'), AlunoPontoController.listarAlunosDoPontoController);

export default router;