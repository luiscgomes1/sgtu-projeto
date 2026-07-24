import path from 'path';
import { randomUUID } from 'crypto';
import { uploadFile, getSignedUrl } from '../config/storage.js';

export { getSignedUrl };

const MAGIC_BYTES = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
};

function checkMagicBytes(buffer, mimeType) {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;
  return signatures.some(sig =>
    sig.every((byte, i) => buffer[i] === byte)
  );
}

export async function uploadAndSaveFile(alunoId, file) {
  if (!file) throw new Error('Arquivo obrigatório.');
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (!allowed.includes(file.mimetype)) throw new Error('Tipo de arquivo não permitido.');

  const normalizedMime = file.mimetype === 'image/jpg' ? 'image/jpeg' : file.mimetype;
  if (!checkMagicBytes(file.buffer, normalizedMime)) {
    throw new Error('Arquivo inválido ou corrompido.');
  }

  const ext = path.extname(file.originalname) || '';
  const filename = `alunos/${alunoId}/${Date.now()}-${randomUUID()}${ext}`;

  await uploadFile(filename, file.buffer, file.mimetype);
  return { path: filename };
}
