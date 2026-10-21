/**
 * =========================================================================
 * FILE HEADER — pages/v1/knowledge/KnowledgeBasePage.tsx
 * =========================================================================
 *
 * PROPOSITO: pagina /v1/knowledge-base. Mostra o INDICE CONSOLIDADO dos dois
 * READMEs (backend e frontend) — so palavra-chave e assunto, sem os resumos —
 * e, abaixo de cada item, um collapse do Bootstrap com os markdowns completos
 * daquele topico renderizados por `MarkdownView`.
 *
 * COLLAPSE: estado React (`openIds`) + classes `collapse`/`show` do Bootstrap,
 * sem o JS do plugin (mesma regra do restante do projeto). O conteudo de cada
 * item e baixado so na PRIMEIRA abertura (`services/knowledgeBase.ts`).
 *
 * LINKS ENTRE .md: `MarkdownView` entrega o caminho resolvido; a pagina abre o
 * collapse do item que contem esse arquivo e rola ate ele.
 *
 * DEPENDENCIAS: services/knowledgeBase, components/global/MarkdownView,
 * components/global/PageHeader.
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import MarkdownView from '@/components/global/MarkdownView';
import PageHeader from '@/components/global/PageHeader';
import {
  loadKnowledgeIndex,
  loadMarkdown,
  ORIGIN_LABEL,
  type KnowledgeItem,
  type KnowledgeOrigin,
} from '@/services/knowledgeBase';

interface LoadedFile {
  path: string;
  /** `null` = o README cita o arquivo, mas ele nao existe na base. */
  text: string | null;
}

const ORIGINS: KnowledgeOrigin[] = ['backend', 'frontend'];

function dirOf(path: string): string {
  const index = path.lastIndexOf('/');
  return index === -1 ? '' : path.slice(0, index);
}

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(new Set());
  const [contents, setContents] = useState<ReadonlyMap<string, LoadedFile[]>>(new Map());

  useEffect(() => {
    let cancelled = false;
    loadKnowledgeIndex()
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar o indice da base de conhecimento.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ensureLoaded = useCallback(
    async (item: KnowledgeItem) => {
      if (contents.has(item.id)) return;
      const files = await Promise.all(
        item.files.map(async (path) => ({ path, text: await loadMarkdown(item.origin, path) })),
      );
      setContents((previous) => new Map(previous).set(item.id, files));
    },
    [contents],
  );

  const open = useCallback(
    (item: KnowledgeItem) => {
      setOpenIds((previous) => new Set(previous).add(item.id));
      void ensureLoaded(item);
    },
    [ensureLoaded],
  );

  const toggle = (item: KnowledgeItem) => {
    if (openIds.has(item.id)) {
      setOpenIds((previous) => {
        const next = new Set(previous);
        next.delete(item.id);
        return next;
      });
      return;
    }
    open(item);
  };

  // Link para outro .md dentro de um conteudo: abre o item dono do arquivo.
  const openFile = useCallback(
    (origin: KnowledgeOrigin, path: string) => {
      const owner =
        items.find((item) => item.origin === origin && item.files.includes(path)) ??
        items.find((item) => item.files.includes(path));
      if (!owner) return;
      open(owner);
      window.setTimeout(() => {
        document.getElementById(`kb-${owner.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    },
    [items, open],
  );

  // origem -> grupo -> itens (preserva a ordem do README).
  const tree = useMemo(() => {
    const byOrigin = new Map<KnowledgeOrigin, Map<string, KnowledgeItem[]>>();
    for (const item of items) {
      const groups = byOrigin.get(item.origin) ?? new Map<string, KnowledgeItem[]>();
      const list = groups.get(item.group) ?? [];
      list.push(item);
      groups.set(item.group, list);
      byOrigin.set(item.origin, groups);
    }
    return byOrigin;
  }, [items]);

  return (
    <>
      <PageHeader
        title="Base de conhecimento"
        subtitle="Indice consolidado do backend e do frontend. Clique num item para abrir o conteudo."
      />

      {loading && <p className="text-body-secondary">Carregando indice...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {ORIGINS.map((origin) => {
        const groups = tree.get(origin);
        if (!groups) return null;
        return (
          <section key={origin} className="mb-5">
            <h2 className="h5 border-bottom pb-2 mb-3">{ORIGIN_LABEL[origin]}</h2>
            {[...groups.entries()].map(([group, groupItems]) => (
              <div key={group} className="mb-4">
                <h3 className="h6 text-body-secondary text-uppercase mb-2">{group}</h3>
                <div className="d-flex flex-column gap-2">
                  {groupItems.map((item) => {
                    const isOpen = openIds.has(item.id);
                    const loaded = contents.get(item.id);
                    return (
                      <div key={item.id} id={`kb-${item.id}`} className="card">
                        <button
                          type="button"
                          className="btn btn-link text-start text-decoration-none d-flex align-items-center gap-2 p-3"
                          aria-expanded={isOpen}
                          aria-controls={`kb-body-${item.id}`}
                          onClick={() => toggle(item)}
                        >
                          <i className={`bi ${isOpen ? 'bi-chevron-down' : 'bi-chevron-right'}`} aria-hidden="true" />
                          <span className="text-body-secondary">{item.number}</span>
                          <code>{item.keyword}</code>
                          <span className="text-body">{item.subject}</span>
                        </button>
                        <div id={`kb-body-${item.id}`} className={`collapse${isOpen ? ' show' : ''}`}>
                          <div className="card-body border-top">
                            {item.files.length === 0 && (
                              <p className="text-body-secondary mb-0">Sem markdown vinculado a este topico.</p>
                            )}
                            {item.files.length > 0 && !loaded && (
                              <p className="text-body-secondary mb-0">Carregando...</p>
                            )}
                            {loaded?.map((file) => (
                              <article key={file.path} className="mb-4">
                                <p className="small text-body-secondary mb-2">
                                  <i className="bi bi-file-earmark-text me-1" aria-hidden="true" />
                                  {file.path}
                                </p>
                                {file.text === null ? (
                                  <div className="alert alert-warning mb-0">Arquivo nao encontrado na base.</div>
                                ) : (
                                  <MarkdownView
                                    markdown={file.text}
                                    baseDir={dirOf(file.path)}
                                    onOpenFile={(path) => openFile(item.origin, path)}
                                  />
                                )}
                              </article>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </>
  );
}
