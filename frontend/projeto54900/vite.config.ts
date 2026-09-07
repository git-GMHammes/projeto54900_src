import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Config do Vite.
// - `base`            -> prefixo publico do app. Default `/` (app na raiz). Um
//                        deploy em subpasta sobrescreve com VITE_BASE_PATH no build.
// - `build.outDir`    -> `dist/` local (padrao). O deploy publica o conteudo de dist/.
// - alias `@`         -> src/ (evita imports relativos profundos).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH || '/';

  return {
    base,
    plugins: [react()],
    css: {
      preprocessorOptions: {
        scss: {
          // Bootstrap 5.3 ainda usa @import e APIs antigas do Sass.
          // Silencia o ruido de deprecacao sem afetar o resultado.
          quietDeps: true,
          silenceDeprecations: ['import', 'color-functions', 'global-builtin'],
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // `npm run dev` roda no host. host:true expoe em 0.0.0.0; porta fixa 54910.
      host: true,
      port: Number(env.VITE_DEV_PORT || 54910),
      strictPort: true,
      // Editando os arquivos no Windows: polling garante o HMR reagir.
      watch: { usePolling: true, interval: 100 },
      // Proxy do dev-server: encaminha /api e /ws para o backend (containers do
      // docker-compose publicados no host em :54900), evitando CORS no dev.
      proxy: {
        '/api': {
          target: env.VITE_DEV_BACKEND || 'http://localhost:54900',
          changeOrigin: true,
        },
        '/ws': {
          target: env.VITE_DEV_BACKEND || 'http://localhost:54900',
          ws: true,
          changeOrigin: true,
        },
      },
    },
    build: {
      // `dist/` dentro da propria pasta do frontend (padrao do Vite).
      outDir: 'dist',
      sourcemap: mode !== 'production',
    },
  };
});
