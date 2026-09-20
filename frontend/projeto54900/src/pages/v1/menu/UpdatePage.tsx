// Formulario de edicao de item de menu — mesma base de CreatePage.tsx. nav_manager_id
// e parent_id usam `src` remoto (nao `options` estatico): o select do FormGrid
// so lê `options` uma vez na montagem (nao resincroniza depois), entao uma
// lista carregada de forma assincrona via `options` fica vazia — `src` tem o
// proprio efeito reativo (recarrega sempre que a URL muda), por isso "Item
// pai" muda de `src` (com ?nav_manager_id=) sempre que o nav muda. roles usa
// o par toStringList/parseStringList (README_campo_json_montado.md). Preload
// via menuManagerTable.get(id); status so entra no update.

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { menuManagerTable } from '@/services/v1';
import { normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { errorDetail } from '@/utils/formSubmit';
import { toText } from '@/utils/format';
import { toStringList, parseStringList } from '@/utils/jsonList';
import { env } from '@/config/env';
import { paths } from '@/routes/paths';

const NAV_SRC = `${env.apiBaseUrl}/v1/nav-manager/get-no-pagination`;
const USER_ROLES_SRC = `${env.apiBaseUrl}/v1/user-roles/get-no-pagination`;
const parentSrc = (navManagerId: string): string =>
  `${env.apiBaseUrl}/v1/menu-manager/get-no-pagination?nav_manager_id=${navManagerId}`;

export default function UpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [navManagerId, setNavManagerId] = useState('');
  const [parentId, setParentId] = useState('');
  const [title, setTitle] = useState('');
  const [reactRoute, setReactRoute] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState('0');
  const [status, setStatus] = useState('active');

  // Carrega o registro e popula o estado local (uma vez, ao montar/trocar id).
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const res = await menuManagerTable.get(id);
        const row = normalizeItem<ApiRow>(res);
        if (cancelled) return;
        if (!row) {
          setError('Item de menu nao encontrado.');
          return;
        }
        setNavManagerId(toText(row.nav_manager_id, ''));
        setParentId(row.parent_id !== null && row.parent_id !== undefined ? toText(row.parent_id, '') : '');
        setTitle(toText(row.title, ''));
        setReactRoute(toText(row.react_route, ''));
        setRoles(parseStringList(typeof row.roles === 'string' ? row.roles : ''));
        setSortOrder(toText(row.sort_order, '0'));
        setStatus(toText(row.status, 'active'));
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Falha ao carregar o item de menu.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const schema: FormGridSchema = {
    rows: [
      {
        fields: [
          {
            type: 'select',
            col: 6,
            label: 'Nav',
            required: true,
            value: navManagerId,
            src: NAV_SRC,
            valueKey: 'id',
            labelKey: 'title',
            onChange: (value) => {
              setNavManagerId(value);
              setParentId('');
            },
          },
          {
            type: 'select',
            col: 6,
            label: 'Item pai (opcional)',
            disabled: !navManagerId,
            value: parentId,
            src: parentSrc(navManagerId),
            valueKey: 'id',
            labelKey: 'title',
            onChange: (value) => setParentId(value),
          },
        ],
      },
      {
        fields: [
          {
            col: 6,
            label: 'Titulo',
            required: true,
            value: title,
            onChange: (e) => setTitle(e.target.value),
          },
          {
            col: 6,
            label: 'Rota (react_route)',
            value: reactRoute,
            onChange: (e) => setReactRoute(e.target.value),
            placeholder: '/v1/...',
          },
        ],
      },
      {
        fields: [
          {
            type: 'select',
            col: 6,
            label: 'Roles (opcional)',
            multiple: true,
            src: USER_ROLES_SRC,
            valueKey: 'slug',
            labelKey: 'name',
            values: roles,
            onChangeMultiple: (values) => setRoles(values),
          },
          {
            col: 3,
            label: 'Ordem (sort_order)',
            inputMode: 'numeric',
            value: sortOrder,
            onChange: (e) => setSortOrder(e.target.value.replace(/\D/g, '')),
          },
          {
            type: 'select',
            col: 3,
            label: 'Status',
            required: true,
            value: status,
            options: [
              { id: 'active', value: 'active', label: 'Ativo' },
              { id: 'draft', value: 'draft', label: 'Rascunho' },
              { id: 'inactive', value: 'inactive', label: 'Inativo' },
            ],
            valueKey: 'value',
            labelKey: 'label',
            onChange: (value) => setStatus(value),
          },
        ],
      },
    ],
  };

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!id || !navManagerId || !title.trim()) {
        toast.error('Nav e titulo sao obrigatorios.', { title: 'Campos faltando' });
        return;
      }
      const payload: Record<string, unknown> = {
        nav_manager_id: Number(navManagerId),
        title: title.trim(),
        react_route: reactRoute.trim() || null,
        roles: toStringList(roles) || null,
        sort_order: sortOrder ? Number(sortOrder) : 0,
        status,
      };
      payload.parent_id = parentId ? Number(parentId) : null;

      setSubmitting(true);
      try {
        await menuManagerTable.update(id, payload);
        toast.success('Item de menu atualizado.', { title: 'Editar item de menu' });
        void navigate(paths.v1.menu.view(id));
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(`${err.message}${errorDetail(err)}`, { title: 'Erro ao enviar' });
        } else {
          toast.error('Falha inesperada ao enviar.', { title: 'Erro ao enviar' });
        }
      } finally {
        setSubmitting(false);
      }
    },
    [id, navManagerId, title, parentId, reactRoute, roles, sortOrder, status, navigate, toast],
  );

  return (
    <>
      <PageHeader title={`Editar item de menu #${id ?? ''}`} subtitle="PUT api/v1/menu-manager/update" />

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Item indisponivel" description={error} variant="danger" />}

      {!loading && !error && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid schema={schema} />
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
