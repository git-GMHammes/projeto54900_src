// Edicao de cabeçalho do template -- build 'editar-cabecalho' (form_manager, tabela temp_header).
// As empresas (company_manager, lista JSON de slugs) vem do registro e entram no select multiplo
// por `patches`; por isso a pagina espera o registro antes de montar o form.
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import LoadingOverlay from '@/components/global/LoadingOverlay';
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { tempHeaderTable } from '@/services/v1';
import { paths } from '@/routes/paths';
import type { ApiRow } from '@/types/api';
import { normalizeItem } from '@/utils/apiResult';
import { toText } from '@/utils/format';
import { toStringArray } from '@/utils/jsonList';

const toValues = (record: ApiRow): Record<string, string> => ({
  name: toText(record.name, ''),
  sort_order: toText(record.sort_order, ''),
  status: toText(record.status, 'draft'),
  background_image: toText(record.background_image, ''),
  background_alt: toText(record.background_alt, ''),
  logo_left_text: toText(record.logo_left_text, ''),
  logo_left_image: toText(record.logo_left_image, ''),
  logo_left_alt: toText(record.logo_left_alt, ''),
  logo_center_text: toText(record.logo_center_text, ''),
  logo_center_image: toText(record.logo_center_image, ''),
  logo_center_alt: toText(record.logo_center_alt, ''),
  logo_right_text: toText(record.logo_right_text, ''),
  logo_right_image: toText(record.logo_right_image, ''),
  logo_right_alt: toText(record.logo_right_alt, ''),
  company_name: toText(record.company_name, ''),
});

export default function UpdatePage() {
  const { id } = useParams();
  const [companies, setCompanies] = useState<string[] | null>(null);

  useEffect(() => {
    let active = true;
    tempHeaderTable
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
      slug="editar-cabecalho"
      backPath={paths.v1.tempHeader.list}
      recordId={id ?? ''}
      loadRecord={(rid) => tempHeaderTable.get(rid)}
      toValues={toValues}
      patches={{ 'company_manager[]': { values: companies, defaultValues: companies } }}
      successMessage="Cabeçalho atualizado."
      fallbackTitle={`Editar cabeçalho #${id ?? ''}`}
    />
  );
}
