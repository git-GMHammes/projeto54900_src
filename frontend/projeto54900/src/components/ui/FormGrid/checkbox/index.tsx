/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/checkbox/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'checkbox'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, options
 *     (CheckboxOption[]), inline, value/defaultValue (arrays), required
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: os proprios <input type="checkbox"
 *     name={`${field.name}[]`}> — o form submete como array (name[])
 *   - A chave no FormData/payload e: field.name (o "[]" e removido/agrupado
 *     por utils/formSubmit.ts formDataToPayload)
 *   - onChange tem assinatura propria `(values: string[]) => void` — nao
 *     usa ../emitValue
 *
 * DEPENDENCIAS: nenhuma.
 * COMO CRIAR UM COMPONENTE DE CAMPO SIMILAR: ver README_comenta-codigo-didatico.md
 * secao 5 (Bloco C).
 * -------------------------------------------------------------------------
 */

import { useState } from 'react'

// ─── Interface ────────────────────────────────────────────────────────────────

export interface CheckboxOption {
  id: string
  value: string
  label: string
  checked?: boolean
}

export interface CheckboxFieldSchema {
  type: 'checkbox'
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label?: string
  id?: string
  /** Texto de ajuda — vira tooltip do campo (ver components/ui/FormGrid/Input) */
  title?: string
  /** Nome do grupo — o form submete como name[] */
  name: string
  options: CheckboxOption[]
  /** Exibe os checkboxes em linha (inline) */
  inline?: boolean
  /** Valores pré-selecionados (sobrepõe checked nas options) */
  value?: string[]
  defaultValue?: string[]
  disabled?: boolean
  /** Obriga ao menos uma opção marcada */
  required?: boolean
  hidden?: boolean
  className?: string
  tabIndex?: number
  /** Disparado quando a seleção muda; recebe array com os valores selecionados */
  onChange?: (values: string[]) => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface CheckboxFieldProps { field: CheckboxFieldSchema }

export function CheckboxField({ field }: CheckboxFieldProps) {
  const resolveInitial = (): string[] => {
    if (field.defaultValue !== undefined) return field.defaultValue
    if (field.value !== undefined) return field.value
    return field.options.filter(o => o.checked).map(o => o.value)
  }

  const isControlled = field.value !== undefined && field.onChange !== undefined
  const [internalValues, setInternalValues] = useState<string[]>(resolveInitial)
  const [erro, setErro] = useState<string | null>(null)

  const selected = isControlled ? (field.value ?? []) : internalValues

  function handleChange(optValue: string, checked: boolean) {
    const next = checked
      ? [...selected, optValue]
      : selected.filter(v => v !== optValue)
    if (!isControlled) setInternalValues(next)
    if (field.required && next.length === 0) {
      const nome = field.label ?? field.name ?? 'Campo'
      setErro(`Selecione ao menos uma opção em "${nome}"`)
    } else {
      setErro(null)
    }
    field.onChange?.(next)
  }

  function handleBlur() {
    if (field.required && selected.length === 0) {
      const nome = field.label ?? field.name ?? 'Campo'
      setErro(`Selecione ao menos uma opção em "${nome}"`)
    }
  }

  return (
    <>
      {field.label && (
        <label className="form-label fw-semibold d-block">
          {field.label}{field.required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <div className={field.className}>
        {field.options.map(opt => (
          <div
            key={opt.id}
            className={`form-check${field.inline ? ' form-check-inline' : ''}`}
          >
            <input
              className={`form-check-input${erro ? ' is-invalid' : ''}`}
              type="checkbox"
              id={opt.id}
              name={`${field.name}[]`}
              value={opt.value}
              checked={selected.includes(opt.value)}
              disabled={field.disabled}
              tabIndex={field.tabIndex}
              onChange={e => handleChange(opt.value, e.target.checked)}
              onBlur={handleBlur}
            />
            <label className="form-check-label" htmlFor={opt.id}>
              {opt.label}
            </label>
          </div>
        ))}
      </div>
      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>{erro}</div>
    </>
  )
}

export default CheckboxField
