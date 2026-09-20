// Formulario de criacao de item de menu — schema FormGrid escrito a mao
// (menu_manager nao tem build no form_manager). nav_manager_id e parent_id
// usam `src` remoto (nao `options` estatico): o select do FormGrid so lê
// `options` uma vez na montagem (nao resincroniza depois), entao qualquer
// lista carregada de forma assincrona via `options` fica vazia — `src` tem
// o proprio efeito reativo (recarrega sempre que a URL muda), por isso
// "Item pai" muda de `src` (com ?nav_manager_id=) sempre que o nav muda.
// roles usa o par toStringList/parseStringList (README_campo_json_montado.md).
// status nao entra aqui: nasce 'draft' pelo DEFAULT da coluna.

import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { menuManagerTable } from '@/services/v1';
import { normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { errorDetail } from '@/utils/formSubmit';
import { toStringList } from '@/utils/jsonList';
import { env } from '@/config/env';
import { paths } from '@/routes/paths';

const NAV_SRC = `${env.apiBaseUrl}/v1/nav-manager/get-no-pagination`;
const USER_ROLES_SRC = `${env.apiBaseUrl}/v1/user-roles/get-no-pagination`;
const parentSrc = (navManagerId: string): string =>
  `${env.apiBaseUrl}/v1/menu-manager/get-no-pagination?nav_manager_id=${navManagerId}`;

export default function CreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const initialNavId = searchParams.get('nav_manager_id') ?? '';

  const [navManagerId, setNavManagerId] = useState(initialNavId);
  const [parentId, setParentId] = useState('');
  const [title, setTitle] = useState('');
  const [reactRoute, setReactRoute] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState('0');
  const [submitting, setSubmitting] = useState(false);

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
            col: 8,
            label: 'Roles (opcional)',
            multiple: true,
            src: USER_ROLES_SRC,
            valueKey: 'slug',
            labelKey: 'name',
            values: roles,
            onChangeMultiple: (values) => setRoles(values),
          },
          {
            col: 4,
            label: 'Ordem (sort_order)',
            inputMode: 'numeric',
            value: sortOrder,
            onChange: (e) => setSortOrder(e.target.value.replace(/\D/g, '')),
          },
        ],
      },
    ],
  };

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!navManagerId || !title.trim()) {
        toast.error('Nav e titulo sao obrigatorios.', { title: 'Campos faltando' });
        return;
      }
      const payload: Record<string, unknown> = {
        nav_manager_id: Number(navManagerId),
        title: title.trim(),
      };
      if (parentId) payload.parent_id = Number(parentId);
      if (reactRoute.trim()) payload.react_route = reactRoute.trim();
      const rolesStr = toStringList(roles);
      if (rolesStr) payload.roles = rolesStr;
      if (sortOrder) payload.sort_order = Number(sortOrder);

      setSubmitting(true);
      try {
        const res = await menuManagerTable.create(payload);
        const row = normalizeItem<ApiRow>(res);
        toast.success('Item de menu criado.', { title: 'Novo item de menu' });
        void navigate(row?.id !== undefined ? paths.v1.menu.view(row.id as string | number) : paths.v1.menu.list);
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
    [navManagerId, title, parentId, reactRoute, roles, sortOrder, navigate, toast],
  );

  return (
    <>
      <PageHeader
        title={initialNavId ? `Novo item (nav #${initialNavId})` : 'Novo item de menu'}
        subtitle="POST api/v1/menu-manager/create"
      />
      <form onSubmit={(e) => void handleSubmit(e)} noValidate>
        <FormGrid schema={schema} />
        <div className="d-flex gap-2 mt-4 pt-3 border-top">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Criando...' : 'Criar'}
          </button>
        </div>
      </form>
    </>
  );
}
