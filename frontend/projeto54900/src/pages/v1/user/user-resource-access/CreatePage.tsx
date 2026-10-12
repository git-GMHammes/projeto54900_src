// Cadastro de permissao individual (user_resource_access): libera ou nega a UM usuario
// um form ou list, independente da empresa. So admin.
//
// O tipo (formulario/listagem) define de onde vem o select de recurso (form_manager ou
// list_manager), por isso os campos sao controlados por estado e o <FormGrid> recebe
// `key={tipo}` para recarregar as opcoes ao trocar o tipo. Aceita ?user_manager_id=
// (vem do botao "Acessos" da lista de usuarios).
// Precedencia no backend: admin > esta permissao > roles do form/list.

import { useCallback, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { userResourceAccessTable } from '@/services/v1';
import { errorDetail } from '@/utils/formSubmit';
import { env } from '@/config/env';
import { paths } from '@/routes/paths';

const USERS_SRC = `${env.apiBaseUrl}/v1/user-directory-view/get-no-pagination`;
const RESOURCE_SRC = {
  form: `${env.apiBaseUrl}/v1/form-manager/get-no-pagination`,
  list: `${env.apiBaseUrl}/v1/list-manager/get-no-pagination`,
} as const;

type ResourceType = keyof typeof RESOURCE_SRC;

export default function CreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [userId, setUserId] = useState(searchParams.get('user_manager_id') ?? '');
  const [type, setType] = useState<ResourceType>('form');
  const [resourceId, setResourceId] = useState('');
  const [allowed, setAllowed] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  const schema = useMemo<FormGridSchema>(
    () => ({
      rows: [
        {
          fields: [
            {
              type: 'select',
              col: 6,
              label: 'Usuário',
              name: 'user_manager_id',
              required: true,
              src: USERS_SRC,
              valueKey: 'id',
              labelTemplate: '{uc_name} ({um_username})',
              value: userId,
              onChange: (value) => setUserId(value),
            },
            {
              type: 'select',
              col: 6,
              label: 'Tipo',
              name: 'resource_type',
              required: true,
              labelKey: 'label',
              options: [
                { id: 'form', label: 'Formulário', value: 'form' },
                { id: 'list', label: 'Listagem', value: 'list' },
              ],
              value: type,
              onChange: (value) => {
                setType(value === 'list' ? 'list' : 'form');
                setResourceId('');
              },
            },
          ],
        },
        {
          fields: [
            {
              type: 'select',
              col: 8,
              label: type === 'form' ? 'Formulário' : 'Listagem',
              name: 'resource_id',
              required: true,
              src: RESOURCE_SRC[type],
              valueKey: 'id',
              labelTemplate: '{title} ({slug}) #{id}',
              value: resourceId,
              onChange: (value) => setResourceId(value),
            },
            {
              type: 'select',
              col: 4,
              label: 'Acesso',
              name: 'allowed',
              required: true,
              labelKey: 'label',
              options: [
                { id: 'allow', label: 'Permitir', value: '1' },
                { id: 'deny', label: 'Negar', value: '0' },
              ],
              value: allowed,
              onChange: (value) => setAllowed(value),
            },
          ],
        },
      ],
    }),
    [userId, type, resourceId, allowed],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (userId === '' || resourceId === '') {
        toast.error('Informe o usuário e o recurso.', { title: 'Campos obrigatórios' });
        return;
      }

      setSubmitting(true);
      try {
        await userResourceAccessTable.create({
          user_manager_id: Number(userId),
          resource_type: type,
          resource_id: Number(resourceId),
          allowed: Number(allowed),
        });
        toast.success('Permissão cadastrada.', { title: 'Acesso individual' });
        void navigate(paths.v1.userResourceAccess.list);
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
    [userId, resourceId, type, allowed, navigate, toast],
  );

  return (
    <>
      <PageHeader title="Nova permissão individual" subtitle="POST api/v1/user-resource-access/create" />

      <form onSubmit={(e) => void handleSubmit(e)} noValidate>
        <FormGrid key={type} schema={schema} />
        <div className="d-flex gap-2 mt-4 pt-3 border-top">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Enviando...' : 'Enviar'}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => void navigate(paths.v1.userResourceAccess.list)}
          >
            Voltar
          </button>
        </div>
      </form>
    </>
  );
}
