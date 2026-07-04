import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://uyren.netlify.app",
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: "kk",
        locales: {
          en: "en",
          ru: "ru",
          kk: "kk"
        }
      }
    })
  ],
  output: "static",
  vite: {
    plugins: [tailwindcss()]
  }
});
