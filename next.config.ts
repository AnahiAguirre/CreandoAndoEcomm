import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photos live in a public Supabase Storage bucket.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
};

export default nextConfig;
