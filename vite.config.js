import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html',
        player: 'player.html'
      }
    }
  },
  server: {
    port: 3010,
    open: '/login.html'
  }
});
