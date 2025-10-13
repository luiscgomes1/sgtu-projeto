import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import * as AlunoPontoController from './alunoPontos.controller.js';
import * as AlunoPontoSchema from './alunoPontos.schema.js';
import { validate } from '../../middleware/validate.js';
const router = Router();

router.post('/vincular', requireAuth, validate(AlunoPontoSchema.alunoPontoBodySchema), AlunoPontoController.vincularAlunoPontoController);
router.post('/desvincular', requireAuth, validate(AlunoPontoSchema.alunoPontoBodySchema), AlunoPontoController.desvincularAlunoPontoController);
router.get('/aluno/:alunoId', requireAuth, validate(AlunoPontoSchema.alunoIdParamSchema), AlunoPontoController.listarPontoDoAlunoController);
router.get('/ponto/:pontoId', requireAuth, validate(AlunoPontoSchema.pontoIdParamSchema), AlunoPontoController.listarAlunosDoPontoController);

export default router;