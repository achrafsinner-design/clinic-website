import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://dermatologie-oumakhir.ma',
  integrations: [],
  vite: {
    plugins: [tailwindcss()],
  },
});