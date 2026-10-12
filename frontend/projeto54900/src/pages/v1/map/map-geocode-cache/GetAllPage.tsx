// Lista de cache de geocodificação (map-geocode-cache) — api/v1/map-geocode-cache-view. Wrapper do componente global
// ListBuild (slug 'map-geocode-cache'): colunas, ações e busca vêm do banco (list_manager).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="map-geocode-cache"
      backFallback={paths.v1.map.explorer}
      searchPlaceholder="Buscar pelo texto da consulta"
      emptyTitle="Nenhuma consulta em cache"
      emptyDescription="O cache é preenchido pelo proxy do mapa."
    />
  );
}
