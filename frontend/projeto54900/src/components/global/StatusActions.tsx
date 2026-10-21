// Componente global reutilizavel: BOTOES DE TRANSICAO de status (fluxo de pedido, ações de movimento),
// por PROPS -- nao le useParams() e nao conhece nenhum modulo. Cada acao traz o `payload` fixo
// (ex.: `{ status: 'quoted' }`) e, se precisar, `fields` que o usuario preenche antes de confirmar
// (ex.: Orcar pede `quoted_price`). Campos pelo <FormGrid> (nao markup a mao). `onApply` recebe o
// payload final e a tela decide o que chamar (PUT update, recarregar...). Erros 409/422 da API
// aparecem como toast. O componente nao conhece o fluxo: quem o monta decide quais acoes mostrar.
import { useMemo, useState } from 'react';

import ConfirmModal from '@/components/global/ConfirmModal';
import FormGrid from '@/components/ui/FormGrid/Input';
import type { AnyFieldSchema, FormGridSchema } from '@/components/ui/FormGrid/Input';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';

export interface StatusActionField {
  name: string;
  label: string;
  /** text (padrao), decimal (so numero), textarea, datetime ou select (usa `options`). */
  kind?: 'text' | 'decimal' | 'textarea' | 'datetime' | 'select';
  options?: readonly { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
}

export interface StatusAction {
  key: string;
  label: string;
  /** Classe de icone do Bootstrap Icons, sem o prefixo `bi-`. */
  icon?: string;
  /** Variante do botao Bootstrap (padrao: primary). */
  variant?: string;
  /** Corpo fixo do PUT (ex.: `{ status: 'accepted' }`). */
  payload: Record<string, unknown>;
  /** Campos pedidos ao usuario antes de aplicar. */
  fields?: StatusActionField[];
  /** Mensagem de confirmacao (sem fields, pede so a confirmacao). */
  confirm?: string;
}

export interface StatusActionsProps {
  actions: StatusAction[];
  /** Aplica o payload (fixo + campos). Rejeitar com ApiError mostra a mensagem como toast. */
  onApply: (payload: Record<string, unknown>) => Promise<void>;
  /** Mensagem de sucesso. Padrao: 'Atualizado.'. */
  successMessage?: string;
}

function toFieldSchema(field: StatusActionField, value: string, set: (v: string) => void): AnyFieldSchema {
  const common = { col: 12 as const, label: field.label, name: field.name, required: field.required === true };
  switch (field.kind) {
    case 'textarea':
      return { type: 'textarea', ...common, rows: 3, value, onChange: (e) => set(e.target.value) };
    case 'datetime':
      return { type: 'datahora', ...common, value, onChange: (e) => set(e.target.value) };
    case 'select':
      return {
        type: 'select',
        ...common,
        options: [...(field.options ?? [])],
        valueKey: 'value',
        labelKey: 'label',
        value,
        onChange: (v) => set(v),
      };
    case 'decimal':
      return {
        ...common,
        inputMode: 'decimal',
        value,
        ...(field.placeholder ? { placeholder: field.placeholder } : {}),
        onChange: (e) => set(e.target.value.replace(',', '.')),
      };
    default:
      return {
        ...common,
        value,
        ...(field.placeholder ? { placeholder: field.placeholder } : {}),
        onChange: (e) => set(e.target.value),
      };
  }
}

export default function StatusActions({ actions, onApply, successMessage = 'Atualizado.' }: StatusActionsProps) {
  const toast = useToast();
  const [active, setActive] = useState<StatusAction | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const apply = async (action: StatusAction, input: Record<string, string>) => {
    const missing = (action.fields ?? []).find((f) => f.required === true && (input[f.name] ?? '').trim() === '');
    if (missing) {
      toast.error(`Informe ${missing.label}.`);
      return;
    }
    const payload: Record<string, unknown> = { ...action.payload };
    for (const [name, value] of Object.entries(input)) {
      if (value.trim() !== '') payload[name] = value.trim();
    }
    setBusy(true);
    try {
      await onApply(payload);
      toast.success(successMessage);
      setActive(null);
      setValues({});
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao atualizar.');
    } finally {
      setBusy(false);
    }
  };

  const open = (action: StatusAction) => {
    if ((action.fields?.length ?? 0) === 0 && !action.confirm) {
      void apply(action, {});
      return;
    }
    setValues({});
    setActive(action);
  };

  const schema = useMemo<FormGridSchema>(
    () => ({
      rows: [
        {
          fields: (active?.fields ?? []).map((field) =>
            toFieldSchema(field, values[field.name] ?? '', (v) => setValues((prev) => ({ ...prev, [field.name]: v }))),
          ),
        },
      ],
    }),
    [active, values],
  );

  if (actions.length === 0) return null;

  return (
    <>
      <div className="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Ações do status">
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            className={`btn btn-sm btn-${action.variant ?? 'primary'}`}
            disabled={busy}
            onClick={() => open(action)}
          >
            {action.icon ? <i className={`bi bi-${action.icon} me-1`} aria-hidden="true" /> : null}
            {action.label}
          </button>
        ))}
      </div>
      <ConfirmModal
        open={active !== null}
        title={active?.label ?? ''}
        message={
          <>
            {active?.confirm ? <p>{active.confirm}</p> : null}
            {(active?.fields?.length ?? 0) > 0 ? <FormGrid schema={schema} /> : null}
          </>
        }
        confirmLabel="Confirmar"
        {...(active?.variant ? { variant: active.variant } : {})}
        busy={busy}
        onConfirm={() => {
          if (active) void apply(active, values);
        }}
        onClose={() => setActive(null)}
      />
    </>
  );
}
