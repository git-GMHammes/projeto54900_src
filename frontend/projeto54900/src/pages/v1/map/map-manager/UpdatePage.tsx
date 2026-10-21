// Edicao de mapa — build 'editar-mapa' (form_manager, tabela map_manager).
// Wrapper do componente global RecordFormBuild. Os perfis com acesso (roles, JSON) vem do registro
// e entram no select multiplo por `patches`; por isso a pagina espera o registro antes de montar o form.
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import LoadingOverlay from '@/components/global/LoadingOverlay';
import FormCenterPicker from '@/components/map/FormCenterPicker';
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { mapManagerTable } from '@/services/v1';
import { paths } from '@/routes/paths';
import type { ApiRow } from '@/types/api';
import { normalizeItem } from '@/utils/apiResult';
import { toText } from '@/utils/format';

const toValues = (record: ApiRow): Record<string, string> => ({
  title: toText(record.title, ''),
  slug: toText(record.slug, ''),
  description: toText(record.description, ''),
  center_lat: toText(record.center_lat, ''),
  center_lng: toText(record.center_lng, ''),
  zoom: toText(record.zoom, ''),
  min_zoom: toText(record.min_zoom, ''),
  max_zoom: toText(record.max_zoom, ''),
  tile_url: toText(record.tile_url, ''),
  status: toText(record.status, ''),
  attribution: toText(record.attribution, ''),
});

/** roles chega como string JSON ('["admin","user"]'), lista ou vazio. */
function parseRoles(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  if (typeof value !== 'string' || value === '') return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export default function UpdatePage() {
  const { id } = useParams();
  const [roles, setRoles] = useState<string[] | null>(null);

  useEffect(() => {
    let active = true;
    mapManagerTable
      .get(id ?? '')
      .then((payload) => {
        if (active) setRoles(parseRoles(normalizeItem<ApiRow>(payload)?.roles));
      })
      .catch(() => {
        if (active) setRoles([]);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (roles === null) return <LoadingOverlay />;

  return (
    <RecordFormBuild
      slug="editar-mapa"
      backPath={paths.v1.mapAdmin.manager.list}
      recordId={id ?? ''}
      loadRecord={(rid) => mapManagerTable.get(rid)}
      toValues={toValues}
      afterFields={<FormCenterPicker latName="center_lat" lngName="center_lng" zoomName="zoom" />}
      patches={{ 'roles[]': { values: roles, defaultValues: roles } }}
      successMessage="Registro atualizado."
      fallbackTitle={`Editar mapa #${id ?? ''}`}
    />
  );
}
