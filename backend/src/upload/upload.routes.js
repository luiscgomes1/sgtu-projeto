import { Router } from 'express';
import multer from 'multer';
import { uploadAndSaveFile } from './upload.service.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 15 * 1024 * 1024, 
    files: 3
  }
});
const router = Router();

router.post('/:requestId', upload.array('files'), async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const files = req.files;

    if (!files || files.length !== 3) {
      return res.status(400).json({ error: '3 (Três) arquivos são obrigatórios.\n Comprovante de Matrícula, Comprovante de Residência e Foto 3x4.' });
    }

    const results = [];
    for (const file of files) {
      const result = await uploadAndSaveFile(requestId, file);
      results.push(result);
    }
    return res.status(201).json({ files: results });
  } catch (error) {
    next(error);
  }
});

export default router;