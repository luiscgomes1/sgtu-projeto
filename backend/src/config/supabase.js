// usa SERVICE_ROLE_KEY no backend (⚠️ nunca expor no frontend)
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  throw new Error('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE no .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false }
});
