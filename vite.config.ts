import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const host = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL;
  const site = new URL(
    env.VITE_SITE_URL || (host ? `https://${host}` : "http://localhost:5173"),
  );
  if (!["http:", "https:"].includes(site.protocol)) {
    throw new Error("VITE_SITE_URL must be an absolute HTTP or HTTPS URL.");
  }
  return {
    plugins: [
      react(),
      {
        name: "site-sharing-metadata",
        transformIndexHtml: {
          order: "pre",
          handler: (html) => html.replaceAll("__SITE_ORIGIN__", site.origin),
        },
      },
    ],
    server: { port: 5173, strictPort: true },
    build: { chunkSizeWarningLimit: 1100 },
  };
});
