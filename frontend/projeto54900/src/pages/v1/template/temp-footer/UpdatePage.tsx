// Edicao de rodapé do template -- build 'editar-rodape' (form_manager, tabela temp_footer).
// As empresas (company_manager, lista JSON de slugs) vem do registro e entram no select multiplo
// por `patches`; por isso a pagina espera o registro antes de montar o form.
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import LoadingOverlay from '@/components/global/LoadingOverlay';
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { tempFooterTable } from '@/services/v1';
import { paths } from '@/routes/paths';
import type { ApiRow } from '@/types/api';
import { normalizeItem } from '@/utils/apiResult';
import { toText } from '@/utils/format';
import { toStringArray } from '@/utils/jsonList';

const toValues = (record: ApiRow): Record<string, string> => ({
  name: toText(record.name, ''),
  sort_order: toText(record.sort_order, ''),
  status: toText(record.status, 'draft'),
  col1_title: toText(record.col1_title, ''),
  col1_text: toText(record.col1_text, ''),
  col1_image: toText(record.col1_image, ''),
  col1_alt: toText(record.col1_alt, ''),
  col2_title: toText(record.col2_title, ''),
  col2_text: toText(record.col2_text, ''),
  col2_image: toText(record.col2_image, ''),
  col2_alt: toText(record.col2_alt, ''),
  col3_title: toText(record.col3_title, ''),
  col3_text: toText(record.col3_text, ''),
  col3_image: toText(record.col3_image, ''),
  col3_alt: toText(record.col3_alt, ''),
  col4_title: toText(record.col4_title, ''),
  col4_text: toText(record.col4_text, ''),
  col4_image: toText(record.col4_image, ''),
  col4_alt: toText(record.col4_alt, ''),
});

export default function UpdatePage() {
  const { id } = useParams();
  const [companies, setCompanies] = useState<string[] | null>(null);

  useEffect(() => {
    let active = true;
    tempFooterTable
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
      slug="editar-rodape"
      backPath={paths.v1.tempFooter.list}
      recordId={id ?? ''}
      loadRecord={(rid) => tempFooterTable.get(rid)}
      toValues={toValues}
      patches={{ 'company_manager[]': { values: companies, defaultValues: companies } }}
      successMessage="Rodapé atualizado."
      fallbackTitle={`Editar rodapé #${id ?? ''}`}
    />
  );
}
