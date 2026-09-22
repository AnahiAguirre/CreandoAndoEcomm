import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Bucket, FileStorage, SignedUpload } from '@/domain/storage/file-storage';

/**
 * Server-side storage access with the secret (service) key. This key bypasses
 * every bucket policy, so this class must never be imported from client code —
 * only `container.ts` instantiates it.
 */
export class SupabaseFileStorage implements FileStorage {
  private readonly client: SupabaseClient;

  constructor(supabaseUrl: string, secretKey: string) {
    this.client = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async createSignedUpload(bucket: Bucket, path: string): Promise<SignedUpload> {
    const { data, error } = await this.client.storage.from(bucket).createSignedUploadUrl(path);
    if (error || !data) throw new Error(`Supabase Storage: could not sign upload for ${bucket}/${path}: ${error?.message}`);
    return { path: data.path, token: data.token };
  }

  async exists(bucket: Bucket, path: string): Promise<boolean> {
    const { data, error } = await this.client.storage.from(bucket).exists(path);
    if (error) return false;
    return data;
  }

  async remove(bucket: Bucket, paths: string[]): Promise<void> {
    if (paths.length === 0) return;
    const { error } = await this.client.storage.from(bucket).remove(paths);
    if (error) throw new Error(`Supabase Storage: could not remove from ${bucket}: ${error.message}`);
  }
}
