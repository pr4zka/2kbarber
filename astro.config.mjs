// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://2kbarber.pr4zka.online',
  server: { port: 3000, host: true },
  vite: {
    plugins: [tailwindcss()],
  },
});
