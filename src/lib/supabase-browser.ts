'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Bucket } from '@/domain/storage/file-storage';

import { publicEnv } from './public-env';

let client: SupabaseClient | undefined;

function supabaseBrowser(): SupabaseClient {
  client ??= createClient(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/**
 * Uploads straight from the browser to Storage using a token the server
 * issued (CatalogAdmin.prepareUpload). The file never touches our server.
 */
export async function uploadWithTicket(bucket: Bucket, path: string, token: string, file: File): Promise<void> {
  const { error } = await supabaseBrowser()
    .storage.from(bucket)
    .uploadToSignedUrl(path, token, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
}
