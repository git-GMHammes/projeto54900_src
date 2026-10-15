/**
 * =========================================================================
 * FILE HEADER — services/knowledgeBase.ts
 * =========================================================================
 *
 * PROPOSITO: carrega a base de conhecimento (markdowns) do backend
 * (`src/app/markdown/`) e do frontend (`src/markdown/`) e monta o indice
 * consolidado lendo a TABELA DE INDICE do `README.md` de cada base — assim o
 * indice nunca fica defasado em relacao aos READMEs (regra do projeto: todo
 * markdown novo atualiza o README).
 *
 * COMO FUNCIONA:
 *   1. `import.meta.glob(..., { query: '?raw' })` cria um loader LAZY por .md
 *      (um chunk por arquivo no build; nada e baixado ate o collapse abrir).
 *   2. `loadKnowledgeIndex()` le o README de cada origem, extrai as linhas da
 *      tabela de indice (`| N | [`palavra`](#ancora) | assunto |`) e, no bloco
 *      "### `palavra`" correspondente, coleta SO os links para .md (o resumo
 *      em si e descartado).
 *   3. `loadMarkdown()` devolve o texto cru de um .md pelo caminho relativo.
 *
 * DEPENDENCIA DE AMBIENTE: os .md do backend ficam FORA da raiz do Vite; o
 * dev-server so le se `server.fs.allow` (vite.config.ts) liberar a pasta.
 * No build o rollup le direto do disco, sem restricao.
 * -------------------------------------------------------------------------
 */

export type KnowledgeOrigin = 'backend' | 'frontend';

export interface KnowledgeItem {
  /** Chave unica: `<origem>:<palavra-chave>`. */
  id: string;
  origin: KnowledgeOrigin;
  /** Titulo do grupo do indice (ex.: "1. Entender o sistema"). */
  group: string;
  number: number;
  keyword: string;
  subject: string;
  /** Caminhos relativos a raiz da base (ex.: `geral/README_migrate.md`). */
  files: string[];
}

export const ORIGIN_LABEL: Record<KnowledgeOrigin, string> = {
  backend: 'Backend (src/app/markdown)',
  frontend: 'Frontend (src/markdown)',
};

type Loader = () => Promise<string>;

// Caminhos relativos a ESTE arquivo (src/frontend/projeto54900/src/services/).
const backendFiles = import.meta.glob<string>('../../../../app/markdown/**/*.md', {
  query: '?raw',
  import: 'default',
});
const frontendFiles = import.meta.glob<string>('../markdown/**/*.md', {
  query: '?raw',
  import: 'default',
});

const BACKEND_PREFIX = '../../../../app/markdown/';
const FRONTEND_PREFIX = '../markdown/';

/** Mapa `origem:caminho-relativo` -> loader. */
const loaders = new Map<string, Loader>();

function register(files: Record<string, Loader>, prefix: string, origin: KnowledgeOrigin): void {
  for (const [key, loader] of Object.entries(files)) {
    if (key.startsWith(prefix)) loaders.set(`${origin}:${key.slice(prefix.length)}`, loader);
  }
}

register(backendFiles, BACKEND_PREFIX, 'backend');
register(frontendFiles, FRONTEND_PREFIX, 'frontend');

/** Le o texto cru de um .md; devolve `null` se o arquivo nao existir na base. */
export async function loadMarkdown(origin: KnowledgeOrigin, path: string): Promise<string | null> {
  const loader = loaders.get(`${origin}:${path}`);
  return loader ? loader() : null;
}

/** Existe esse .md na base? */
export function hasMarkdown(origin: KnowledgeOrigin, path: string): boolean {
  return loaders.has(`${origin}:${path}`);
}

// `| 1   | [`deepseek`](#deepseek)   | Analise de ...    |`
const INDEX_ROW = /^\|\s*(\d+)\s*\|\s*\[`([^`]+)`\]\(#[^)]*\)\s*\|\s*(.+?)\s*\|\s*$/;
// `**1. Entender o sistema**`
const GROUP_TITLE = /^\*\*(.+)\*\*\s*$/;
// `### `deepseek``
const SUMMARY_HEADING = /^###\s+`([^`]+)`\s*$/;
// `](geral/README_x.md)` — so .md (ignora .svg/.drawio/.ts)
const MD_LINK = /\]\(([^)#\s]+\.md)\)/g;

function parseReadme(text: string, origin: KnowledgeOrigin): KnowledgeItem[] {
  const lines = text.split(/\r?\n/);
  const items: KnowledgeItem[] = [];
  const filesByKeyword = new Map<string, string[]>();

  let group = '';
  let currentKeyword: string | null = null;
  let inSummaries = false;

  for (const line of lines) {
    if (line.startsWith('## Resumos')) {
      inSummaries = true;
      continue;
    }
    // `## Conteudo` encerra a area de resumos.
    if (inSummaries && line.startsWith('## ') && !line.startsWith('## Resumos')) {
      inSummaries = false;
      currentKeyword = null;
    }

    if (!inSummaries) {
      const groupMatch = GROUP_TITLE.exec(line);
      if (groupMatch?.[1]) group = groupMatch[1];

      const row = INDEX_ROW.exec(line);
      if (row?.[1] && row[2] && row[3]) {
        items.push({
          id: `${origin}:${row[2]}`,
          origin,
          group,
          number: Number(row[1]),
          keyword: row[2],
          subject: row[3],
          files: [],
        });
      }
      continue;
    }

    const heading = SUMMARY_HEADING.exec(line);
    if (heading?.[1]) {
      currentKeyword = heading[1];
      if (!filesByKeyword.has(currentKeyword)) filesByKeyword.set(currentKeyword, []);
      continue;
    }
    if (currentKeyword) {
      for (const match of line.matchAll(MD_LINK)) {
        const href = match[1];
        const list = filesByKeyword.get(currentKeyword);
        // Link do bloco de resumo e sempre relativo a raiz da base.
        if (href && list && !href.startsWith('http') && !list.includes(href)) list.push(href);
      }
    }
  }

  return items.map((item) => ({ ...item, files: filesByKeyword.get(item.keyword) ?? [] }));
}

/** Indice consolidado dos dois READMEs (backend primeiro, depois frontend). */
export async function loadKnowledgeIndex(): Promise<KnowledgeItem[]> {
  const origins: KnowledgeOrigin[] = ['backend', 'frontend'];
  const result: KnowledgeItem[] = [];
  for (const origin of origins) {
    const text = await loadMarkdown(origin, 'README.md');
    if (text) result.push(...parseReadme(text, origin));
  }
  return result;
}
