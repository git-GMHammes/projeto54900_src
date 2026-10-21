// Formulario de local (cadastro e edicao) sobre o RecordFormBuild. Regra de tela: Latitude/Longitude
// e o card do mapa (FormCenterPicker, abaixo de Tipo/Local pai) so aparecem para os tipos que tem
// posicao fisica (COORD_TYPES). Fora deles, os campos ficam ocultos e, na edicao, as coordenadas
// antigas sao zeradas no envio. O tipo escolhido e observado pelo select controlado `location_type_id`.
import { useCallback, useEffect, useMemo, useState } from 'react';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import type { RecordFormBuildProps } from '@/components/global/RecordFormBuild';
import FormCenterPicker from '@/components/map/FormCenterPicker';
import { locationManagerTable, locationManagerView, locationTypesTable } from '@/services/v1';
import { normalizeItem, normalizeList } from '@/utils/apiResult';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

/** Codigos de location_types que mostram Latitude/Longitude e o mapa. */
const COORD_TYPES: ReadonlySet<string> = new Set(['street', 'number', 'condominium', 'building', 'warehouse', 'garage', 'aisle']);

type LocationFormProps = Pick<
  RecordFormBuildProps,
  'slug' | 'backPath' | 'recordId' | 'toValues' | 'defaults' | 'autoSlug' | 'successMessage' | 'fallbackTitle'
>;

export default function LocationForm(props: LocationFormProps) {
  const { recordId } = props;
  const editing = recordId !== undefined;
  const [typeCodes, setTypeCodes] = useState<Record<string, string>>({});
  const [blockedParents, setBlockedParents] = useState<string[]>([]);
  const [typeId, setTypeId] = useState(props.defaults?.location_type_id ?? '');

  useEffect(() => {
    let alive = true;
    locationTypesTable
      .getNoPagination()
      .then((raw) => {
        if (!alive) return;
        const map: Record<string, string> = {};
        for (const row of normalizeList(raw).rows) map[toText(row.id, '')] = toText(row.code, '');
        setTypeCodes(map);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  // Edicao: o proprio local e seus descendentes nao podem ser pai (a API recusaria com 422/409).
  useEffect(() => {
    if (!editing) return;
    let alive = true;
    locationManagerView
      .getNoPagination()
      .then((raw) => {
        if (!alive) return;
        const blocked = normalizeList(raw)
          .rows.filter((row) => toText(row.path_ids, '').split('/').includes(recordId))
          .map((row) => toText(row.id, ''));
        setBlockedParents(blocked);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [editing, recordId]);

  const showCoords = COORD_TYPES.has(typeCodes[typeId] ?? '');

  // Edicao: ao carregar o registro, o tipo atual alimenta o select controlado.
  const loadRecord = useCallback(
    async (id: string) => {
      const raw = await locationManagerTable.get(id);
      setTypeId(toText(normalizeItem<ApiRow>(raw)?.location_type_id, ''));
      return raw;
    },
    [],
  );

  const patches = useMemo(
    () => ({
      location_type_id: { value: typeId, onChange: (value: string) => setTypeId(value) },
      parent_id: { disabledValues: blockedParents },
      latitude: { hidden: !showCoords },
      longitude: { hidden: !showCoords },
    }),
    [typeId, showCoords, blockedParents],
  );

  const transformPayload = useCallback(
    (payload: Record<string, unknown>) => (showCoords || !editing ? payload : { ...payload, latitude: null, longitude: null }),
    [showCoords, editing],
  );

  return (
    <RecordFormBuild
      {...props}
      {...(editing ? { loadRecord } : {})}
      patches={patches}
      transformPayload={transformPayload}
      insertAfterField={{
        name: 'parent_id',
        node: showCoords ? (
          <div className="card mb-3">
            <div className="card-header">Posição no mapa</div>
            <div className="card-body">
              <FormCenterPicker latName="latitude" lngName="longitude" label="local" initialZoom={16} />
            </div>
          </div>
        ) : null,
      }}
    />
  );
}
