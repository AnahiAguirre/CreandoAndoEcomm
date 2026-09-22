/**
 * The only env vars the browser may see. Next.js inlines `process.env.NEXT_PUBLIC_*`
 * at build time, so they must be referenced literally (no dynamic keys).
 *
 * The publishable key grants nothing on its own: uploads still need a signed
 * token issued by the server (see CatalogAdmin.prepareUpload).
 */
function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing ${name}. Copy .env.example to .env.local and fill it in.`);
  return value;
}

export const publicEnv = {
  supabaseUrl: required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabasePublishableKey: required(
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
};
