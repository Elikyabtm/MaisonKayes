import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
  },
  // PGlite (base locale) charge des fichiers WebAssembly : ne pas l’embarquer dans le bundle serveur.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Les migrations SQL sont lues au démarrage : les inclure dans le déploiement.
  outputFileTracingIncludes: { "/**/*": ["./drizzle/**/*"] },
  experimental: {
    // Envoi de photos depuis le dashboard (converties ensuite en WebP ≤ 1 800 px).
    serverActions: { bodySizeLimit: "25mb" },
  },
  async redirects() {
    return [
      // Ancienne catégorie « Lingettes », désormais dans « Accessoires ».
      {
        source: "/creations",
        has: [{ type: "query", key: "categorie", value: "lingettes" }],
        destination: "/creations?categorie=accessoires",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
