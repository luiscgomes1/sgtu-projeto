import path from 'path';
import { randomUUID } from 'crypto';
import { uploadFile, getSignedUrl } from '../config/storage.js';

export { getSignedUrl };

export async function uploadAndSaveFile(alunoId, file) {
  if (!file) throw new Error('Arquivo obrigatório.');
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (!allowed.includes(file.mimetype)) throw new Error('Tipo de arquivo não permitido.');

  const ext = path.extname(file.originalname) || '';
  const filename = `alunos/${alunoId}/${Date.now()}-${randomUUID()}${ext}`;

  await uploadFile(filename, file.buffer, file.mimetype);
  return { path: filename };
}
