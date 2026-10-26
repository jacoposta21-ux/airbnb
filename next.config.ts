import type { NextConfig } from "next";

// Nota: Cache Components (`cacheComponents`) è volutamente disattivato.
// Quasi tutte le pagine leggono la sessione Supabase dai cookie e quindi sono
// dinamiche; la pagina pubblica /g/[slug] usa invece la revalidation classica.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Le guide degli ospiti non devono mai finire sui motori di ricerca.
  async headers() {
    return [{ source: "/g/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] }];
  },
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
    ],
  },
};

export default nextConfig;
