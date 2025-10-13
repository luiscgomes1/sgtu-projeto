import path from 'path';
import { randomUUID } from 'crypto';
import { supabase } from '../config/supabase.js';

export async function getSignedUrl(path, expiresIn = 60 * 60 * 24) {
  const bucket = process.env.BUCKET_NAME;

  const { data, error } = await supabase
    .storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

export async function uploadAndSaveFile(requestId, file) {
  if (!file) throw new Error('Arquivo obrigatório.');
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (!allowed.includes(file.mimetype)) throw new Error('Tipo de arquivo não permitido.');

  const ext = path.extname(file.originalname) || '';
  const filename = `${requestId}/${Date.now()}-${randomUUID()}${ext}`;
  const bucket = process.env.BUCKET_NAME;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filename, file.buffer, { contentType: file.mimetype });
  if (uploadError) throw uploadError;

  return { path: filename };
}