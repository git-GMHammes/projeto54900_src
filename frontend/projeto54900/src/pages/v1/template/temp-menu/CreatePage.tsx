// Formulario de criacao de item de menu — schema FormGrid escrito a mao
// (temp_menu nao tem build no form_manager). temp_nav_id e parent_id
// usam `src` remoto (nao `options` estatico): o select do FormGrid so lê
// `options` uma vez na montagem (nao resincroniza depois), entao qualquer
// lista carregada de forma assincrona via `options` fica vazia — `src` tem
// o proprio efeito reativo (recarrega sempre que a URL muda), por isso
// "Item pai" muda de `src` (com ?temp_nav_id=) sempre que o nav muda.
// roles usa o par toStringList/parseStringList (README_campo_json_montado.md).
// placement (Navbar/Offcanvas) nasce 'navbar'; so pesa no item de topo.
// status nao entra aqui: nasce 'draft' pelo DEFAULT da coluna.
// icon usa IconSelect (fora do FormGrid, mesmo padrao do FormBuilderPage/
// grupoSchema — nao e um tipo do FormGrid). is_bookmark e flag-unica via
// checkbox com 1 option (mesmo padrao de 'collapsed'/'required' no FormBuilderPage).

import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import IconSelect from '@/components/ui/IconSelect';
import PageHeader from '@/components/global/PageHeader';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { tempMenuTable } from '@/services/v1';
import { normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { errorDetail } from '@/utils/formSubmit';
import { toStringList } from '@/utils/jsonList';
import { env } from '@/config/env';
import { paths } from '@/routes/paths';
import type { MenuPlacement } from '@/types/menu';

const NAV_SRC = `${env.apiBaseUrl}/v1/temp-nav/get-no-pagination`;
const COMPANY_SRC = `${env.apiBaseUrl}/v1/company-manager/get-no-pagination`;
const USER_ROLES_SRC = `${env.apiBaseUrl}/v1/user-roles/get-no-pagination`;
const PLACEMENT_OPTIONS = [
  { id: 'placement_navbar', value: 'navbar', label: 'Navbar' },
  { id: 'placement_offcanvas', value: 'offcanvas', label: 'Offcanvas' },
];
const parentSrc = (tempNavId: string): string =>
  `${env.apiBaseUrl}/v1/temp-menu/get-no-pagination?temp_nav_id=${tempNavId}`;

export default function CreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const initialNavId = searchParams.get('temp_nav_id') ?? '';

  const [tempNavId, setTempNavId] = useState(initialNavId);
  const [parentId, setParentId] = useState('');
  const [title, setTitle] = useState('');
  const [reactRoute, setReactRoute] = useState('');
  const [icon, setIcon] = useState('');
  const [placement, setPlacement] = useState<MenuPlacement>('navbar');
  const [isBookmark, setIsBookmark] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
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
            value: tempNavId,
            src: NAV_SRC,
            valueKey: 'id',
            labelKey: 'title',
            onChange: (value) => {
              setTempNavId(value);
              setParentId('');
            },
          },
          {
            type: 'select',
            col: 6,
            label: 'Item pai (opcional)',
            disabled: !tempNavId,
            value: parentId,
            src: parentSrc(tempNavId),
            valueKey: 'id',
            labelKey: 'title',
            // Opcao no topo do dropdown para criar o item JA como item de TOPO
            // (equivalente a deixar o campo vazio).
            emptyLabel: '— Nenhum (item de topo) —',
            onChange: (value) => setParentId(value),
          },
        ],
      },
      {
        fields: [
          {
            col: 4,
            label: 'Título',
            required: true,
            value: title,
            onChange: (e) => setTitle(e.target.value),
          },
          {
            col: 4,
            label: 'Rota (react_route)',
            value: reactRoute,
            onChange: (e) => setReactRoute(e.target.value),
            placeholder: '/v1/...',
          },
          {
            type: 'radio',
            col: 4,
            label: 'Local',
            name: 'placement',
            title: 'Item de topo: onde ele (e seus filhos) aparece. Filhos seguem o pai.',
            inline: true,
            value: placement,
            options: PLACEMENT_OPTIONS,
            onChange: (value) => setPlacement(value === 'offcanvas' ? 'offcanvas' : 'navbar'),
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
            type: 'checkbox',
            col: 3,
            name: 'is_bookmark',
            title: 'Marca o item para aparecer na lista de favoritos do usuário.',
            options: [{ id: 'is_bookmark', value: '1', label: 'Favorito (bookmark)' }],
            value: isBookmark ? ['1'] : [],
            onChange: (values) => setIsBookmark(values.includes('1')),
          },
        ],
      },
      {
        fields: [
          {
            type: 'select',
            col: 12,
            label: 'Empresas (opcional)',
            title: 'Slugs das empresas que enxergam o item. Vazio = a empresa da sessão.',
            multiple: true,
            src: COMPANY_SRC,
            valueKey: 'slug',
            labelKey: 'name',
            values: companies,
            onChangeMultiple: (values) => setCompanies(values),
          },
        ],
      },
    ],
  };

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!tempNavId || !title.trim()) {
        toast.error('Nav e título são obrigatórios.', { title: 'Campos faltando' });
        return;
      }
      const payload: Record<string, unknown> = {
        temp_nav_id: Number(tempNavId),
        title: title.trim(),
        placement,
      };
      if (parentId) payload.parent_id = Number(parentId);
      if (reactRoute.trim()) payload.react_route = reactRoute.trim();
      if (icon) payload.icon = icon;
      payload.is_bookmark = isBookmark ? 1 : 0;
      const rolesStr = toStringList(roles);
      if (rolesStr) payload.roles = rolesStr;
      if (sortOrder) payload.sort_order = Number(sortOrder);
      // Sem empresas, o backend assume a empresa da sessao.
      if (companies.length > 0) payload.company_manager = companies;

      setSubmitting(true);
      try {
        const res = await tempMenuTable.create(payload);
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
    [tempNavId, title, parentId, reactRoute, icon, placement, isBookmark, roles, companies, sortOrder, navigate, toast],
  );

  return (
    <>
      <PageHeader
        title={initialNavId ? `Novo item (nav #${initialNavId})` : 'Novo item de menu'}
        subtitle="POST api/v1/temp-menu/create"
      />
      <form onSubmit={(e) => void handleSubmit(e)} noValidate>
        <FormGrid schema={schema} />
        <div className="row g-3">
          <div className="col-md-4 mb-1">
            <label className="form-label">Ícone</label>
            <IconSelect value={icon} onChange={setIcon} />
          </div>
        </div>
        <div className="d-flex gap-2 mt-4 pt-3 border-top">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Criando...' : 'Criar'}
          </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => void navigate(paths.v1.menu.list)}>
              Voltar
            </button>
        </div>
      </form>
    </>
  );
}
