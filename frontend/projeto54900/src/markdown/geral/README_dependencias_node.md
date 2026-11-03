[◄ Índice da base de conhecimento](../README.md)

---

# Dependências Node do frontend

Fonte: `package.json` do frontend (`projeto54900-frontend` 1.0.0, Node `>=20.19.0`).
Comandos e build: [`README_node_comandos_modulos.md`](README_node_comandos_modulos.md).

> Hospedagem: **não há servidor Node em produção**. O `npm run build`
> (`tsc -b && vite build`) gera só estáticos (HTML/JS/CSS) em `dist/`, que são
> publicados no servidor web (Apache). Node é usado apenas para desenvolver e
> compilar.

## 1. `dependencies` (entram no bundle)

| Pacote             | Versão  | Finalidade                                                                                      |
| ------------------ | ------- | ----------------------------------------------------------------------------------------------- |
| `react`            | ^19.0.0 | Biblioteca de UI.                                                                               |
| `react-dom`        | ^19.0.0 | Renderização do React no navegador.                                                             |
| `react-router-dom` | ^7.1.1  | Rotas do frontend (`App.tsx`, `ListBuild`, `RecordDetail`).                                     |
| `bootstrap`        | ^5.3.3  | CSS (via SCSS) e JS (`bootstrap.bundle`) da UI; importado só em `src/bootstrap.ts`.             |
| `@popperjs/core`   | ^2.11.8 | Posicionamento de dropdown/tooltip do Bootstrap (dependência par; o bundle já embute o Popper). |
| `bootstrap-icons`  | ^1.13.1 | Fonte de ícones (`bi bi-*`), usada por `IconSelect`, `MediaPreview` e selects.                  |
| `leaflet`          | 1.9.4   | Mapa (`components/map/MapView.tsx`).                                                            |
| `react-leaflet`    | 5.0.0   | Componentes React do Leaflet.                                                                   |
| `@types/leaflet`   | 1.9.22  | Tipos TypeScript do Leaflet.                                                                    |
| `react-markdown`   | ^10.1.0 | Renderização de Markdown (`components/global/MarkdownView.tsx`).                                |
| `remark-gfm`       | ^4.0.1  | Plugin GFM (tabelas, listas de tarefas) do `react-markdown`.                                    |
| `bcryptjs`         | ^3.0.3  | Hash bcrypt no navegador (`PasswordHashPreviewButton.tsx`, pré-visualização de hash de senha).  |

## 2. `devDependencies` (só desenvolvimento/build)

| Pacote                        | Versão    | Finalidade                                                    |
| ----------------------------- | --------- | ------------------------------------------------------------- |
| `vite`                        | ^6.0.7    | Servidor de desenvolvimento e build (`dist/`).                |
| `@vitejs/plugin-react`        | ^4.3.4    | Plugin React do Vite.                                         |
| `typescript`                  | ~5.7.3    | Compilador/checagem de tipos (`tsc -b`).                      |
| `typescript-eslint`           | ^8.69.0   | ESLint para TypeScript.                                       |
| `eslint`                      | ^9.17.0   | Linter (`npm run lint`).                                      |
| `@eslint/js`                  | ^9.17.0   | Regras base do ESLint.                                        |
| `eslint-plugin-react`         | ^7.37.3   | Regras de React.                                              |
| `eslint-plugin-react-hooks`   | ^5.1.0    | Regras de hooks.                                              |
| `eslint-plugin-react-refresh` | ^0.4.16   | Regras do Fast Refresh.                                       |
| `globals`                     | ^15.14.0  | Globais de ambiente para o ESLint.                            |
| `sass`                        | ^1.83.0   | Compila o SCSS (`styles/index.scss`, que inclui o Bootstrap). |
| `@types/node`                 | ^20.19.43 | Tipos do Node (configs do Vite/TS).                           |
| `@types/react`                | ^19.2.18  | Tipos do React.                                               |
| `@types/react-dom`            | ^19.2.7   | Tipos do React DOM.                                           |

## 3. Scripts

| Script      | Comando                | Uso                                   |
| ----------- | ---------------------- | ------------------------------------- |
| `dev`       | `vite`                 | Servidor de desenvolvimento.          |
| `typecheck` | `tsc -b --noEmit`      | Checagem de tipos sem gerar arquivos. |
| `build`     | `tsc -b && vite build` | Gera `dist/` para o Apache.           |
| `preview`   | `vite preview`         | Serve o `dist/` localmente.           |
| `lint`      | `eslint .`             | Lint do projeto.                      |

## 4. OCR (SGD)

Motor em uso, instalado em `dependencies` (rodam no navegador, sem Node em produção):

| Pacote | Finalidade |
| --- | --- |
| `@paddleocr/paddleocr-js` | OCR PaddleOCR (PP-OCRv5): detecção + reconhecimento, modelo latino para português. |
| `onnxruntime-web` | Runtime ONNX/WASM que executa os modelos (dependência do PaddleOCR; o WASM é emitido pelo Vite). |
| `pdfjs-dist` | Renderiza as páginas do PDF em imagem antes do OCR (build `legacy`). |

Modelos (`.tar` ONNX) ficam em `public/ocr/paddle/`. Histórico: o `tesseract.js` foi removido por ler o `@` como `Q` mesmo com resolução maior e modelo `best`.
Detalhes em [`README_modulo_sgd.md`](../../../../../app/markdown/geral/README_modulo_sgd.md) (seção 7).
