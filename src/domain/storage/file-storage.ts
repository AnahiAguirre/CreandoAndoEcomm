/**
 * Storage buckets. `product-images` is public (plain HTTPS URLs);
 * `product-files` is private and only ever served through short-lived signed URLs.
 */
export const BUCKETS = {
  images: 'product-images',
  files: 'product-files',
} as const;

export type Bucket = (typeof BUCKETS)[keyof typeof BUCKETS];

export interface SignedUpload {
  /** Object path inside the bucket. Persisted as `storagePath`. */
  path: string;
  /** One-shot token the browser uses to PUT the file directly to storage. */
  token: string;
}

/**
 * Port: object storage. Files never travel through our server (Vercel caps
 * request bodies at ~4.5 MB and a coloring PDF blows past that): the server
 * only hands out upload tokens and, later, download URLs.
 */
export interface FileStorage {
  createSignedUpload(bucket: Bucket, path: string): Promise<SignedUpload>;
  exists(bucket: Bucket, path: string): Promise<boolean>;
  remove(bucket: Bucket, paths: string[]): Promise<void>;
}
