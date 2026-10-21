// Lista de locais (location_manager) -- api/v1/location-manager-view. Duas visoes: Arvore
// (LocationTree, sobre o TreeBuild global) e Tabela (ListBuild, slug 'location-manager': colunas,
// acoes e busca vem do banco). Cadastro pelo botao "Novo local" (CreatePage, build criar-local).
import { useState } from 'react';
import { Link } from 'react-router-dom';

import ListBuild from '@/components/global/ListBuild';
import PageHeader from '@/components/global/PageHeader';
import { paths } from '@/routes/paths';
import LocationTree from './LocationTree';

type View = 'tree' | 'table';

export default function GetAllPage() {
  const [view, setView] = useState<View>('tree');

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
          slug="location-manager"
          createPath={paths.v1.locationManager.create}
          createLabel="Novo local"
          searchPlaceholder="Buscar por nome, código ou caminho"
          emptyTitle="Nenhum local encontrado"
          emptyDescription="Cadastre o primeiro local."
        />
      </>
    );
  }

  return (
    <div className="container py-3">
      <PageHeader title="Locais" subtitle="Hierarquia de locais, do maior ao menor.">
        <Link className="btn btn-primary" to={paths.v1.locationManager.create}>
          Novo local
        </Link>
      </PageHeader>
      {toggle}
      <LocationTree />
    </div>
  );
}
