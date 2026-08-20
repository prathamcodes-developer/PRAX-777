import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

function sanitizeUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let cleaned = rawUrl.trim().replace(/^["']|["']$/g, '');
  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

function sanitizeKey(rawKey: string): string {
  if (!rawKey) return '';
  return rawKey.trim().replace(/^["']|["']$/g, '');
}

const supabaseUrl = sanitizeUrl(process.env.SUPABASE_URL || '');
const supabaseAnonKey = sanitizeKey(process.env.SUPABASE_ANON_KEY || '');
const supabaseServiceKey = sanitizeKey(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_ANON_KEY environment variables are missing.');
}

// Client for public reads / client operations
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Client for server-side administrative writes
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

