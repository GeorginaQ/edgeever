import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://edgeever.org",
  integrations: [mdx(), sitemap(), icon(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
});