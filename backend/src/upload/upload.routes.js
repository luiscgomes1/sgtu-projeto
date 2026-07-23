import { Router } from 'express';
import multer from 'multer';
import { validate } from '../middleware/validate.js';
import { uuidParam } from '../shared/schemas.js';
import { z } from 'zod';
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

router.post('/:alunoId', validate(z.object({ alunoId: uuidParam }), 'params'), upload.array('files'), async (req, res, next) => {
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
