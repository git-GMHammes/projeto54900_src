// Lista de movimentos (movement_manager) -- api/v1/movement-manager-view. Wrapper do ListBuild (slug 'movement-manager':
// colunas, acoes e busca vem do banco).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="movement-manager"
      createPath={paths.v1.movementManager.create}
      createLabel="Novo movimento"
      searchPlaceholder="Buscar por produto, lote, referência ou usuário"
      emptyTitle="Nenhum movimento encontrado"
      emptyDescription="Registre o primeiro movimento."
    />
  );
}
