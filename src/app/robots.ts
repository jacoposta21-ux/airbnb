import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

// Le pagine /g/ restano raggiungibili dai crawler solo per leggere il "noindex".
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/guide/", "/api/", "/auth/"] },
    sitemap: undefined,
    host: SITE_URL,
  };
}
