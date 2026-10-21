// Componente global reutilizavel: pagina de listagem com DUAS visoes -- Arvore (qualquer conteudo
// passado em `tree`, normalmente um RecordTree) e Tabela (ListBuild, slug do list_manager) --, por
// PROPS. Nao conhece nenhum modulo: a GetAllPage de cada recurso e so um wrapper.
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import ListBuild from '@/components/global/ListBuild';
import PageHeader from '@/components/global/PageHeader';
import { useGoBack } from '@/hooks/useGoBack';

type View = 'tree' | 'table';

export interface TreeListPageProps {
  title: string;
  subtitle: string;
  /** Slug do list_manager usado na visao Tabela. */
  slug: string;
  createPath: string;
  createLabel: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  /** Conteudo da visao Arvore. */
  tree: ReactNode;
  /** Caminho de reserva do botao Voltar; sem ele, o botao nao aparece. */
  backFallback?: string;
}

export default function TreeListPage({
  title,
  subtitle,
  slug,
  createPath,
  createLabel,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  tree,
  backFallback,
}: TreeListPageProps) {
  const [view, setView] = useState<View>('tree');
  const goBack = useGoBack(backFallback ?? '/');

  const toggle = (
    <div className="btn-group btn-group-sm mb-3" role="group" aria-label="Visão">
      <button type="button" className={`btn btn-outline-primary${view === 'tree' ? ' active' : ''}`} onClick={() => setView('tree')}>
        <i className="bi bi-diagram-3 me-1" aria-hidden="true" />
        Árvore
      </button>
      <button type="button" className={`btn btn-outline-primary${view === 'table' ? ' active' : ''}`} onClick={() => setView('table')}>
        <i className="bi bi-table me-1" aria-hidden="true" />
        Tabela
      </button>
    </div>
  );

  if (view === 'table') {
    return (
      <>
        <div className="container pt-3">{toggle}</div>
        <ListBuild
          slug={slug}
          {...(backFallback !== undefined ? { backFallback } : {})}
          createPath={createPath}
          createLabel={createLabel}
          searchPlaceholder={searchPlaceholder}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
        />
      </>
    );
  }

  return (
    <div className="container py-3">
      <PageHeader title={title} subtitle={subtitle}>
        {backFallback !== undefined && (
          <button type="button" className="btn btn-outline-secondary me-2" onClick={goBack}>
            <i className="bi bi-arrow-left me-1" aria-hidden="true" />
            Voltar
          </button>
        )}
        <Link className="btn btn-primary" to={createPath}>
          {createLabel}
        </Link>
      </PageHeader>
      {toggle}
      {tree}
    </div>
  );
}
