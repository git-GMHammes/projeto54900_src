// Escolha do template do proprio usuario (user_manager.temp_manager_id), usada em "Editar perfil".
// Carrega GET template-render/get (template efetivo, templates da empresa da sessao e a escolha gravada)
// e grava por PUT template-render/preference. "Automatico" = template de menor id ativo da empresa.
// Valores iguais ao backend (Services/V1/Template/TemplateRender): ver README_modulo_template.md.

import { useCallback, useEffect, useState } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/http';
import { templateRenderGet, templateRenderSetPreference } from '@/services/v1';
import { normalizeItem } from '@/utils/apiResult';
import { errorDetail } from '@/utils/formSubmit';
import { toText } from '@/utils/format';

interface TemplateOption {
  id: string;
  label: string;
}

const AUTO_VALUE = '';

/** `templates` da API (lista de { id, code, name }) -> opcoes do select, tolerante a formato inesperado. */
function toOptions(value: unknown): TemplateOption[] {
  if (!Array.isArray(value)) return [];
  const out: TemplateOption[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;
    const row = item as Record<string, unknown>;
    out.push({ id: toText(row.id, ''), label: `${toText(row.name, '')} (${toText(row.code, '')})` });
  }
  return out.filter((o) => o.id !== '');
}

export default function TemplatePreference() {
  const toast = useToast();
  const { refreshUser } = useAuth();
  const [options, setOptions] = useState<TemplateOption[]>([]);
  const [effective, setEffective] = useState('');
  const [selected, setSelected] = useState(AUTO_VALUE);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = normalizeItem<Record<string, unknown>>(await templateRenderGet());
      setOptions(toOptions(data?.templates));
      const template = data?.template;
      setEffective(typeof template === 'object' && template !== null ? toText((template as Record<string, unknown>).code, '') : '');
      setSelected(data?.preferred_id === null || data?.preferred_id === undefined ? AUTO_VALUE : toText(data.preferred_id, AUTO_VALUE));
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async () => {
    setSubmitting(true);
    try {
      await templateRenderSetPreference(selected === AUTO_VALUE ? null : Number(selected));
      await refreshUser();
      toast.success('Template atualizado.', { title: 'Template' });
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? `${err.message}${errorDetail(err)}` : 'Falha inesperada ao salvar.', {
        title: 'Erro ao enviar',
      });
    } finally {
      setSubmitting(false);
    }
  }, [selected, refreshUser, toast, load]);

  // Sem template cadastrado para a empresa: nada a escolher.
  if (!loading && options.length === 0) return null;

  const schema: FormGridSchema = {
    rows: [
      {
        fields: [
          {
            type: 'select',
            col: 8,
            label: 'Template',
            title: 'Automático usa o template de menor ID da empresa. A escolha vale em todo login.',
            value: selected,
            options: [{ id: 'auto', value: AUTO_VALUE, label: 'Automático (menor ID da empresa)' }, ...options.map((o) => ({ id: `t${o.id}`, value: o.id, label: o.label }))],
            valueKey: 'value',
            labelKey: 'label',
            onChange: (value) => setSelected(value),
          },
        ],
      },
    ],
  };

  return (
    <section className="mt-5 pt-4 border-top">
      <h2 className="h5 mb-1">Template</h2>
      <p className="text-body-secondary small mb-3">
        {effective ? `Em uso agora: ${effective}.` : 'Escolha o visual do sistema para os seus próximos acessos.'}
      </p>
      {loading ? (
        <LoadingOverlay />
      ) : (
        <>
          <FormGrid schema={schema} />
          <div className="d-flex gap-2 mt-3">
            <button type="button" className="btn btn-primary" disabled={submitting} onClick={() => void save()}>
              {submitting ? 'Salvando...' : 'Salvar template'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
