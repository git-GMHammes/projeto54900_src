// Modal de empresas do usuario da lista de seguranca (user-manager/GetAllPage.tsx,
// acao data_action 'change-companies'). Define quais empresas o usuario pode acessar
// (user_manager.company_ids, JSON de ids de companies). Opcoes = companies (API, nada
// fixo no codigo); pre-seleciona as empresas atuais lidas do proprio registro.
//
// Campo JSON "montado": a UI e um select multiplo, o usuario nunca digita JSON
// (README_campo_json_montado.md). Salva PUT /api/v1/user-manager/update/{id} com
// { company_ids: ["1","2"] }; sem nenhuma empresa envia null (limpa o vinculo — string
// vazia seria descartada pelo backend). Empresa inexistente = 422.

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import Modal from '@/components/global/Modal';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { userManagerTable } from '@/services/v1';
import { normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { parseStringList } from '@/utils/jsonList';
import { toText } from '@/utils/format';
import { env } from '@/config/env';

const COMPANIES_SRC = `${env.apiBaseUrl}/v1/company-manager/get-no-pagination`;

/** company_ids chega do banco como JSON de numeros ("[1, 2]"); a UI trabalha com strings. */
function parseCompanyIds(raw: unknown): string[] {
  try {
    const parsed: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed.map((v) => String(v)) : [];
  } catch {
    return parseStringList(toText(raw, ''));
  }
}

export default function ChangeCompaniesModal({
  userId,
  username,
  onClose,
  onSaved,
}: {
  /** id do user_manager; null = modal fechado. */
  userId: string | null;
  username: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const [initial, setInitial] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userId === null) return;
    setLoadError(null);
    userManagerTable
      .get(userId)
      .then((raw) => {
        const ids = parseCompanyIds(normalizeItem<ApiRow>(raw)?.company_ids);
        setSelected(ids);
        setInitial(ids);
      })
      .catch((err) => {
        setSelected([]);
        setInitial([]);
        setLoadError(err instanceof ApiError ? err.message : 'Falha ao carregar o usuário.');
      });
  }, [userId]);

  const schema = useMemo<FormGridSchema>(
    () => ({
      rows: [
        {
          fields: [
            {
              type: 'select',
              col: 12,
              label: 'Empresas',
              name: 'company_ids',
              multiple: true,
              src: COMPANIES_SRC,
              valueKey: 'id',
              labelTemplate: '{name} ({slug})',
              values: selected,
              onChangeMultiple: (values) => setSelected(values),
            },
          ],
        },
      ],
    }),
    [selected],
  );

  const changed = selected.join(',') !== initial.join(',');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    try {
      await userManagerTable.update(userId, { company_ids: selected.length > 0 ? selected : null });
      toast.success('Empresas atualizadas.', { title: username || 'Empresas' });
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao atualizar as empresas.', { title: 'Empresas' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={userId !== null} title={`Empresas${username ? `: ${username}` : ''}`} onClose={onClose}>
      <form onSubmit={(e) => void submit(e)}>
        {loadError && <div className="alert alert-danger py-2">{loadError}</div>}
        <FormGrid key={userId ?? 'closed'} schema={schema} />
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={!changed || saving}>
            {saving ? 'Salvando…' : 'Salvar empresas'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
