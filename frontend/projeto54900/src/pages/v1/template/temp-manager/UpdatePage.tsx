// Edicao de template -- build 'editar-template' (form_manager, tabela temp_manager).
// As empresas (company_manager, lista JSON de slugs) vem do registro e entram no select multiplo
// por `patches`; por isso a pagina espera o registro antes de montar o form. O code nao muda.
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import LoadingOverlay from '@/components/global/LoadingOverlay';
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { tempManagerTable } from '@/services/v1';
import { paths } from '@/routes/paths';
import type { ApiRow } from '@/types/api';
import { normalizeItem } from '@/utils/apiResult';
import { toText } from '@/utils/format';
import { toStringArray } from '@/utils/jsonList';

const toValues = (record: ApiRow): Record<string, string> => ({
  code: toText(record.code, ''),
  name: toText(record.name, ''),
  description: toText(record.description, ''),
  status: toText(record.status, 'draft'),
});

export default function UpdatePage() {
  const { id } = useParams();
  const [companies, setCompanies] = useState<string[] | null>(null);

  useEffect(() => {
    let active = true;
    tempManagerTable
      .get(id ?? '')
      .then((payload) => {
        if (active) setCompanies(toStringArray(normalizeItem<ApiRow>(payload)?.company_manager));
      })
      .catch(() => {
        if (active) setCompanies([]);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (companies === null) return <LoadingOverlay />;

  return (
    <RecordFormBuild
      slug="editar-template"
      backPath={paths.v1.tempManager.list}
      recordId={id ?? ''}
      loadRecord={(rid) => tempManagerTable.get(rid)}
      toValues={toValues}
      patches={{ 'company_manager[]': { values: companies, defaultValues: companies } }}
      successMessage="Template atualizado."
      fallbackTitle={`Editar template #${id ?? ''}`}
    />
  );
}
