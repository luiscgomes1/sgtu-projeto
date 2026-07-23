import { supabase } from './supabase.js'

const BUCKET = process.env.STORAGE_BUCKET
if (!BUCKET) throw new Error('Configure STORAGE_BUCKET no .env')

export async function uploadFile(filePath, buffer, mimeType) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, { contentType: mimeType, upsert: true })
  if (error) throw error
  return filePath
}

export async function getSignedUrl(path, expiresIn = 60 * 60) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}


