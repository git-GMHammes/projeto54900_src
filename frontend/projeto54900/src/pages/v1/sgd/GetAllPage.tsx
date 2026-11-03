// Lista de documentos do SGD (view_sgd) — api/v1/sgd-view. Wrapper do componente global ListBuild
// (slug 'sgd'): colunas, acoes (Visualizar, Editar, Excluir, Visualizador de Midias) e busca vem do
// banco (list_manager). Cadastro pelo botao "Novo documento" (CreatePage).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="sgd"
      createPath={paths.v1.sgd.create}
      createLabel="Novo documento"
      searchPlaceholder="Buscar por nome do arquivo"
      emptyTitle="Nenhum documento encontrado"
      emptyDescription="Envie o primeiro documento."
    />
  );
}
