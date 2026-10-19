// Componente global reutilizavel: RecordFormBuild + campo `roles` por registro, por PROPS -- nao le
// useParams() e nao conhece nenhum modulo. O campo do form (seed) chama-se `roles[]` (multi select
// de user_roles, valueKey slug): o payload sai como lista. Na edicao o estado vem do registro
// (`roles` JSON, par parseStringList/toStringList de README_campo_json_montado.md); sem nenhum perfil
// escolhido, o cadastro grava o padrao da coluna (todos) e a edicao grava lista vazia (= todos).
import { useCallback, useMemo, useState } from 'react';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import type { RecordFormBuildProps } from '@/components/global/RecordFormBuild';
import { normalizeItem } from '@/utils/apiResult';
import { parseStringList } from '@/utils/jsonList';
import type { ApiRow } from '@/types/api';

export default function RecordFormWithRoles(props: RecordFormBuildProps) {
  const { recordId, loadRecord, patches, transformPayload } = props;
  const editing = recordId !== undefined;
  const [roles, setRoles] = useState<string[]>([]);

  const loadWithRoles = useCallback(
    async (id: string) => {
      const raw = loadRecord ? await loadRecord(id) : null;
      const row = normalizeItem<ApiRow>(raw);
      setRoles(parseStringList(typeof row?.roles === 'string' ? row.roles : ''));
      return raw;
    },
    [loadRecord],
  );

  const mergedPatches = useMemo(
    () => ({
      ...patches,
      'roles[]': { ...(patches?.['roles[]'] ?? {}), values: roles, onChangeMultiple: (values: string[]) => setRoles(values) },
    }),
    [patches, roles],
  );

  const mergedTransform = useCallback(
    (payload: Record<string, unknown>) => {
      const base = transformPayload ? transformPayload(payload) : payload;
      return editing || roles.length > 0 ? { ...base, roles } : base;
    },
    [transformPayload, editing, roles],
  );

  return (
    <RecordFormBuild
      {...props}
      {...(editing && loadRecord ? { loadRecord: loadWithRoles } : {})}
      patches={mergedPatches}
      transformPayload={mergedTransform}
    />
  );
}
