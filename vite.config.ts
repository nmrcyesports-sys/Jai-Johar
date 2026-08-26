import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(() => {
  return {
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          about: resolve(__dirname, 'about.html'),
          contact: resolve(__dirname, 'contact.html'),
          gallery: resolve(__dirname, 'gallery.html'),
          reservations: resolve(__dirname, 'reservations.html'),
          menu: resolve(__dirname, 'menu.html'),
          admin: resolve(__dirname, 'admin.html')
        }
      }
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    }
  };
});
