/**
 * =========================================================================
 * FILE HEADER — components/global/MarkdownView.tsx
 * =========================================================================
 *
 * PROPOSITO: renderiza uma string markdown (GFM: tabelas, checklists, codigo)
 * dentro de um container, usando `react-markdown` + `remark-gfm`. Estilo pelas
 * classes do Bootstrap (tabela, blockquote) + `.markdown-view` em _custom.scss.
 *
 * LINKS:
 *   - `http(s)://...`            -> abre em nova aba.
 *   - relativo terminando em .md -> resolvido contra `baseDir` e entregue a
 *                                   `onOpenFile` (a pagina abre o collapse).
 *   - `#ancora` / outros         -> inertes (sem navegar para fora da SPA).
 *
 * DEPENDENCIAS: react-markdown, remark-gfm.
 * CONSUMIDORES: pages/v1/knowledge/KnowledgeBasePage.tsx.
 * -------------------------------------------------------------------------
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface MarkdownViewProps {
  markdown: string;
  /** Pasta do arquivo atual, relativa a raiz da base (ex.: `geral/modulos/timeline`). */
  baseDir?: string;
  /** Chamado ao clicar num link relativo para outro .md (caminho ja resolvido). */
  onOpenFile?: (path: string) => void;
}

/** Resolve `href` relativo contra `baseDir`, tratando `.` e `..`. */
function resolvePath(baseDir: string, href: string): string {
  const parts = baseDir ? baseDir.split('/') : [];
  for (const segment of href.split('/')) {
    if (segment === '..') parts.pop();
    else if (segment !== '.' && segment !== '') parts.push(segment);
  }
  return parts.join('/');
}

export default function MarkdownView({ markdown, baseDir = '', onOpenFile }: MarkdownViewProps) {
  return (
    <div className="markdown-view">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            if (href && /^https?:\/\//i.test(href)) {
              return (
                <a href={href} target="_blank" rel="noreferrer noopener">
                  {children}
                </a>
              );
            }
            const target = href?.split('#')[0];
            if (target && target.endsWith('.md') && onOpenFile) {
              const resolved = resolvePath(baseDir, target);
              return (
                <a
                  href={`#${resolved}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onOpenFile(resolved);
                  }}
                >
                  {children}
                </a>
              );
            }
            return <span className="text-body-secondary">{children}</span>;
          },
          table: ({ children }) => (
            <div className="table-responsive">
              <table className="table table-sm table-bordered">{children}</table>
            </div>
          ),
          blockquote: ({ children }) => <blockquote className="blockquote border-start ps-3 text-body-secondary">{children}</blockquote>,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
