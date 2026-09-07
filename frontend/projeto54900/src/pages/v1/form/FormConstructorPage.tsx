// Construtor de Formularios — renderiza a arvore do form-constructor vinda da
// view view_form_manager (JSON) e grava cada sub-formulario na API do modulo Form.
//
// Fluxo: get-grouped { fm_slug: ['form-constructor'] } -> buildConstructorSchemas
// -> 4 <FormGrid> (Formulario / Grupos / Linhas / Campos). Cada submit monta um
// objeto a partir do FormData e chama form-<x>/create; ao criar, os selects
// dependentes (parent_id) sao recarregados.

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import {
  formManagerView,
  formManagerTable,
  formGroupsTable,
  formRowsTable,
  formCamposTable,
} from '@/services/v1';
import { buildConstructorSchemas } from '@/services/formSchema';
import type { ConstructorGroup } from '@/services/formSchema';
import { normalizeList } from '@/utils/apiResult';
import type { ResourceWriter } from '@/services/resourceFactory';

const CONSTRUCTOR_SLUG = 'form-constructor';

// grupo do construtor -> service de escrita + grupo filho a recarregar apos criar.
const TARGET: Record<string, { writer: ResourceWriter; reload?: string }> = {
  formulario: { writer: formManagerTable, reload: 'grupos' },
  grupos: { writer: formGroupsTable, reload: 'linhas' },
  linhas: { writer: formRowsTable, reload: 'campos' },
  campos: { writer: formCamposTable },
};

function formDataToPayload(form: HTMLFormElement): Record<string, unknown> {
  const fd = new FormData(form);
  const payload: Record<string, unknown> = {};

  for (const [rawKey, value] of fd.entries()) {
    if (typeof value !== 'string') continue;

    if (rawKey.endsWith('[]')) {
      // No construtor todo campo name[] e um checkbox booleano unico.
      const key = rawKey.slice(0, -2);
      if (value === '1') payload[key] = 1;
      continue;
    }

    const trimmed = value.trim();
    if (trimmed !== '') payload[rawKey] = trimmed;
  }

  return payload;
}

export default function FormConstructorPage() {
  const toast = useToast();
  const [groups, setGroups] = useState<ConstructorGroup[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKeys, setReloadKeys] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await formManagerView.getGrouped(
        { fm_slug: [CONSTRUCTOR_SLUG] },
        { limit: 1000, sort: 'fc_sort_order', order: 'ASC' },
      );
      const { rows } = normalizeList(raw);
      const built = buildConstructorSchemas(rows);
      setGroups(built);
      if (built.length === 0) {
        setError(
          'A view nao retornou linhas para "form-constructor". Rode o seed: ' +
          'podman compose exec php php spark db:seed FormConstructorSeeder',
        );
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao carregar o construtor.';
      setError(msg);
      setGroups(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const bump = useCallback((slug: string | undefined) => {
    if (!slug) return;
    setReloadKeys((prev) => ({ ...prev, [slug]: (prev[slug] ?? 0) + 1 }));
  }, []);

  const handleSubmit = useCallback(
    (slug: string) => async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const target = TARGET[slug];
      if (!target) return;

      const form = event.currentTarget;
      const payload = formDataToPayload(form);

      setSubmitting(slug);
      try {
        const res: unknown = await target.writer.create(payload);
        const record: Record<string, unknown> =
          res && typeof res === 'object' ? (res as Record<string, unknown>) : {};
        const data: Record<string, unknown> =
          record.data && typeof record.data === 'object'
            ? (record.data as Record<string, unknown>)
            : {};
        const rawId = data.id;
        const id = typeof rawId === 'number' || typeof rawId === 'string' ? rawId : '?';
        toast.success(`${slug}: registro #${id} criado.`, { title: 'Construtor de formularios' });
        form.reset();
        bump(target.reload);
      } catch (err) {
        if (err instanceof ApiError) {
          const errorsBag =
            err.data && typeof err.data === 'object'
              ? (err.data as Record<string, unknown>).errors
              : null;
          const messages =
            errorsBag && typeof errorsBag === 'object'
              ? Object.values(errorsBag as Record<string, unknown>).filter(
                (v): v is string => typeof v === 'string',
              )
              : [];
          const extra = messages.length > 0 ? ` — ${messages.join(' | ')}` : '';
          toast.error(`${slug}: ${err.message}${extra}`, { title: 'Erro ao criar' });
        } else {
          toast.error(`${slug}: falha inesperada.`, { title: 'Erro ao criar' });
        }
      } finally {
        setSubmitting(null);
      }
    },
    [toast, bump],
  );

  return (
    <>
      <PageHeader
        title="Construtor de Formularios"
        subtitle="view_form_manager -> FormGrid -> API do modulo Form"
      >
        <button className="btn btn-outline-secondary" onClick={() => void load()} disabled={loading}>
          Recarregar
        </button>
      </PageHeader>

      {loading && <LoadingOverlay />}

      {error && !loading && (
        <EmptyState title="Construtor indisponivel" description={error} />
      )}

      {!loading &&
        !error &&
        groups?.map((group) => (
          <div className="card border-0 shadow-sm mb-4" key={group.slug}>
            <div className="card-body p-4">
              <form onSubmit={(e) => void handleSubmit(group.slug)(e)} noValidate>
                <FormGrid
                  key={`${group.slug}-${reloadKeys[group.slug] ?? 0}`}
                  schema={group.schema}
                />
                <div className="d-flex gap-2 mt-4 pt-3 border-top">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting === group.slug}
                  >
                    {submitting === group.slug ? 'Enviando...' : `Criar ${group.title}`}
                  </button>
                  <button type="reset" className="btn btn-outline-secondary">
                    Limpar
                  </button>
                </div>
              </form>
            </div>
          </div>
        ))}
    </>
  );
}
