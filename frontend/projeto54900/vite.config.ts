import { defineConfig, loadEnv, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Config do Vite.
// - `base`            -> prefixo publico do app. Default `/` (app na raiz). Um
//                        deploy em subpasta sobrescreve com VITE_BASE_PATH no build.
// - `build.outDir`    -> `dist/` local (padrao). O deploy publica o conteudo de dist/.
// - alias `@`         -> src/ (evita imports relativos profundos).
// - `__DEV_CLIPART_DIR__` -> caminho absoluto de doc/clipart_teste (imagens de
//                        TESTE do fake fill da Timeline) SO no `npm run dev`;
//                        no build vira '' — nenhuma imagem de teste entra no dist/.
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH || '/';
  const clipartDir = fileURLToPath(new URL('../../../doc/clipart_teste', import.meta.url));

  return {
    base,
    plugins: [react()],
    define: {
      __DEV_CLIPART_DIR__: JSON.stringify(command === 'serve' ? clipartDir.replace(/\\/g, '/') : ''),
    },
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
      // fs.allow: raiz padrao do Vite + a pasta de imagens de TESTE do
      // repositorio (doc/clipart_teste), lida via /@fs/ pelo fake fill
      // dev-only da Timeline (src/dev/fakeFill/timelinePost.ts). So o
      // dev-server usa isto; o build nao referencia essas imagens.
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd()), clipartDir],
      },
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
      // Saida direto em src/public/app/ (versionada no git) -> deploy KingHost
      // via `git pull` no servidor, sem precisar de SCP/FTP manual.
      outDir: fileURLToPath(new URL('../../public/app', import.meta.url)),
      emptyOutDir: true,
      sourcemap: mode !== 'production',
    },
  };
});
