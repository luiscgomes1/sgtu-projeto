import { Router } from 'express';
import multer from 'multer';
import { validate } from '../middleware/validate.js';
import { uuidParam } from '../shared/schemas.js';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { uploadAndSaveFile } from './upload.service.js';
import { fail, created } from '../utils/response.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 3,
  },
});
const router = Router();

async function validateAlunoPendente(req, res, next) {
  const { alunoId } = req.params;
  const aluno = await prisma.aluno.findUnique({ where: { usuarioId: alunoId }, select: { statusCadastro: true } });
  if (!aluno) return fail(res, 404, 'Solicitação não encontrada.');
  if (aluno.statusCadastro !== 'pendente') return fail(res, 404, 'Solicitação não encontrada.');
  next();
}

router.post('/:alunoId', validate(z.object({ alunoId: uuidParam }), 'params'), validateAlunoPendente, (req, res, next) => {
  upload.array('files')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return fail(res, 400, 'Arquivo muito grande. Máximo 15MB por arquivo.');
      if (err.code === 'LIMIT_FILE_COUNT') return fail(res, 400, 'Máximo de 3 arquivos por upload.');
      return fail(res, 400, 'Erro no upload.');
    }
    if (err) return next(err);
    next();
  });
}, async (req, res, next) => {
  const { alunoId } = req.params;
  const files = req.files;

  if (!files || files.length !== 3) {
    return fail(res, 400, '3 arquivos são obrigatórios: Comprovante de Matrícula, Comprovante de Residência e Foto 3x4.');
  }

  const results = [];
  for (const file of files) {
    const result = await uploadAndSaveFile(alunoId, file);
    results.push(result);
  }
  created(res, { files: results });
});

export default router;
