// Componente global reutilizavel: formulario de cadastro/edicao com TODAS as colunas -- o nucleo do registro (build do
// form_manager, via RecordFormWithRoles) mais todas as caracteristicas do catalogo (AttributeForm, um card por grupo) --
// por PROPS: nao le useParams() e nao conhece nenhum modulo. Serve produto e servico: quem monta informa o catalogo, a
// coluna do dono nas caracteristicas (`product_id`/`service_id`) e a view que lista as caracteristicas atuais.
// Tudo vai no MESMO envio: o corpo do registro leva `attributes` (lista completa) e a API grava registro e
// caracteristicas na mesma transacao (no update a lista substitui as atuais). Na edicao, `attributes` so segue depois
// de carregar as atuais (nunca apaga por engano).
import { useCallback, useEffect, useState } from 'react';

import AttributeForm from '@/components/global/AttributeForm';
import type { RecordFormBuildProps } from '@/components/global/RecordFormBuild';
import RecordFormWithRoles from '@/components/global/RecordFormWithRoles';
import type { ResourceReader } from '@/services/resourceFactory';
import { normalizeList } from '@/utils/apiResult';
import { filledRows } from '@/utils/attributeRows';
import type { AttributeRow } from '@/utils/attributeRows';
import { toText } from '@/utils/format';
import type { AttributeCatalog } from '@/types/attributeCatalog';

export type RecordFormWithAttributesProps = Pick<
  RecordFormBuildProps,
  'slug' | 'backPath' | 'recordId' | 'loadRecord' | 'toValues' | 'defaults' | 'successMessage' | 'fallbackTitle'
> & {
  catalog: AttributeCatalog;
  /** Coluna do dono nas linhas de caracteristica (ex.: 'product_id'). */
  ownerKey: string;
  /** View das caracteristicas (listar por dono). Deve ser estavel (modulo). */
  attributesView: Pick<ResourceReader, 'find'>;
  /** Titulo da secao de caracteristicas. */
  attributesTitle?: string;
};

export default function RecordFormWithAttributes({ catalog, ownerKey, attributesView, attributesTitle, ...formProps }: RecordFormWithAttributesProps) {
  const { recordId } = formProps;
  const editing = recordId !== undefined;
  const [rows, setRows] = useState<AttributeRow[]>([]);
  const [loaded, setLoaded] = useState(!editing);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!editing) return;
    let alive = true;
    attributesView
      .find({ [ownerKey]: recordId }, { limit: 500, sort: 'sort_order', order: 'ASC' })
      .then((raw) => {
        if (!alive) return;
        setRows(
          normalizeList(raw).rows.map((row) => {
            const unit = toText(row.unit, '');
            const label = toText(row.label, '');
            return {
              group_code: toText(row.group_code, ''),
              field_code: toText(row.field_code, ''),
              value: toText(row.value, ''),
              ...(unit ? { unit } : {}),
              ...(label ? { label } : {}),
            };
          }),
        );
        setLoaded(true);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [editing, recordId, attributesView, ownerKey]);

  const transformPayload = useCallback(
    (payload: Record<string, unknown>) => (loaded ? { ...payload, attributes: filledRows(rows) } : payload),
    [loaded, rows],
  );

  return (
    <RecordFormWithRoles
      {...formProps}
      transformPayload={transformPayload}
      afterFields={
        editing && !loaded ? (
          <p className={`mt-4 ${failed ? 'text-danger' : 'text-body-secondary'}`}>
            {failed ? 'Não foi possível carregar as características: elas não serão alteradas ao salvar.' : 'Carregando características...'}
          </p>
        ) : (
          <AttributeForm catalog={catalog} rows={rows} onChange={setRows} {...(attributesTitle ? { title: attributesTitle } : {})} />
        )
      }
    />
  );
}
