// Wrapper fino da rota /v1/form-constructor/:table/:id: le os params da URL
// e repassa para o componente global <FormBuild> (components/global/FormBuild.tsx),
// que concentra toda a logica de busca/render/submit e recebe table/id via
// props -- nao via useParams -- justamente para poder ser reaproveitado fora
// desta rota (modal, card, collapse de outra pagina). Ver comentario de
// FormBuild.tsx para o racional de {table_name}/id em vez de slug.
//
// Nao confundir com /v1/form-constructor/create ou /v1/form-constructor/update/:id
// (FormBuilderPage, arvore de construcao) nem com /v1/form/:slug
// (FormRendererPage, versao com modal -- essa ainda usa slug).

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import PageHeader from '@/components/global/PageHeader';
import FormBuild from '@/components/global/FormBuild';
import { paths } from '@/routes/paths';

export default function FormConstructorBuildPage() {
  const { table = '', id = '' } = useParams();
  const [reloadKey, setReloadKey] = useState(0);
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  return (
    <>
      <PageHeader title={title ?? 'Formulario'} subtitle={description ?? `form_manager #${id}`}>
        <Link className="btn btn-outline-secondary me-2" to={paths.v1.form.list}>
          Voltar
        </Link>
        <button className="btn btn-outline-secondary" onClick={() => setReloadKey((k) => k + 1)}>
          Recarregar
        </button>
      </PageHeader>

      <FormBuild
        key={reloadKey}
        table={table}
        id={id}
        onLoaded={(form) => {
          setTitle(form.meta.title);
          setDescription(form.meta.description ?? null);
        }}
      />
    </>
  );
}
