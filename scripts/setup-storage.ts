/**
 * Creates the Storage buckets the shop needs, if they're missing. Buckets that
 * already exist are left exactly as they are (it only reports them).
 *
 *   npm run storage:setup
 *
 * Limits mirror UPLOAD_POLICY in src/domain/catalog/use-cases/catalog-admin.ts.
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

import { UPLOAD_POLICY } from '../src/domain/catalog/use-cases/catalog-admin';

config({ path: '.env.local' });

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !secretKey) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY must be set');

const BUCKETS = [
  // Product photos: plain public URLs.
  { policy: UPLOAD_POLICY.image, public: true },
  // PDFs: private, only reachable through signed URLs after a grant.
  { policy: UPLOAD_POLICY.file, public: false },
];

async function main() {
  const supabase = createClient(url!, secretKey!, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: existing, error } = await supabase.storage.listBuckets();
  if (error) throw error;

  for (const { policy, public: isPublic } of BUCKETS) {
    const found = existing.find((b) => b.name === policy.bucket);
    if (found) {
      console.log(`• ${policy.bucket} ya existe (${found.public ? 'público' : 'privado'}): no se toca.`);
      if (found.public !== isPublic) {
        console.warn(`  ⚠ debería ser ${isPublic ? 'público' : 'PRIVADO'}. Revisalo en Supabase → Storage.`);
      }
      continue;
    }

    const { error: createError } = await supabase.storage.createBucket(policy.bucket, {
      public: isPublic,
      fileSizeLimit: policy.maxBytes,
      allowedMimeTypes: [...policy.mimeTypes],
    });
    if (createError) throw createError;
    console.log(`✔ ${policy.bucket} creado (${isPublic ? 'público' : 'privado'}, hasta ${policy.maxBytes / 1024 / 1024} MB).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
