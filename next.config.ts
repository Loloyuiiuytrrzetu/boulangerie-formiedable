import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Photos iPhone brutes font souvent 5-10 Mo — la limite Next.js 15
      // par défaut de 1 Mo cause un crash silencieux ("client-side exception")
      // avant même que la Server Action ne s'exécute.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
