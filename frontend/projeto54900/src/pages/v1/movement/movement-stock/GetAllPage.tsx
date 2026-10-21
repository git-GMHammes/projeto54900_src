// Lista de saldos de estoque (view_movement_stock) -- api/v1/movement-stock-view. Wrapper do ListBuild (slug 'movement-stock':
// colunas, acoes e busca vem do banco).
import ListBuild from '@/components/global/ListBuild';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="movement-stock"
      searchPlaceholder="Buscar por código ou nome do produto"
      emptyTitle="Nenhum produto com saldo"
      emptyDescription="Cadastre produtos e movimentos para ver o saldo."
    />
  );
}
