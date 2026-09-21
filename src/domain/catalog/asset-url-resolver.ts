/**
 * Port: turns a storage path into a URL the browser can load.
 * Keeps Supabase Storage's URL layout out of the domain and the UI.
 */
export interface AssetUrlResolver {
  publicImageUrl(storagePath: string): string;
}
