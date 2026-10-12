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

import { useState, useEffect, useRef } from 'react'
import { getAuthToken } from '@/services/http'

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
  /** Texto de ajuda (fc_help_text) — exibido só no ícone de ajuda ao lado do campo (FieldTooltip), NUNCA como title deste elemento. */
  title?: string
  /** Nome do grupo — o form submete como name[] */
  name: string
  options: CheckboxOption[]
  /** Opcoes remotas: GET (array ou { data: [...] }); cada item vira um checkbox (valueKey/labelKey). Sem `src`, vale `options`. */
  src?: string
  valueKey?: string
  labelKey?: string
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
  const [remoteOptions, setRemoteOptions] = useState<CheckboxOption[]>([])

  // Opcoes remotas (ex.: empresas do cadastro de usuario). O Bearer so vai para path relativo.
  useEffect(() => {
    const src = field.src
    if (!src) return
    const token = src.startsWith('/') ? getAuthToken() : null
    const valueKey = field.valueKey ?? 'id'
    const labelKey = field.labelKey ?? 'name'
    fetch(src, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json() as Promise<unknown>)
      .then(json => {
        const rec = (json && typeof json === 'object' ? json : null) as Record<string, unknown> | null
        const list = Array.isArray(json) ? json : (rec?.data ?? rec?.items)
        if (!Array.isArray(list)) return
        const loaded = list.map((item: Record<string, unknown>) => ({
          id: `${field.name}_${String(item[valueKey])}`,
          value: String(item[valueKey]),
          label: String(item[labelKey] ?? item[valueKey]),
        }))
        setRemoteOptions(loaded)
      })
      .catch((e: unknown) => console.warn('[CheckboxField] Falha ao carregar src:', src, e))
  }, [field.src, field.valueKey, field.labelKey, field.name])

  const options = field.src ? remoteOptions : field.options


  const selected = isControlled ? (field.value ?? []) : internalValues

  // Obrigatorio sem nenhuma marcacao: invalida o 1o checkbox, entao checkValidity()/submit do
  // <form> barra o envio (checkbox em grupo nao tem `required` nativo que valide o conjunto).
  const firstRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const nome = field.label ?? field.name ?? 'Campo'
    firstRef.current?.setCustomValidity(
      field.required && selected.length === 0 ? `Selecione ao menos uma opção em "${nome}"` : '',
    )
  }, [field.required, field.label, field.name, selected.length, options.length])

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
        {options.map((opt, idx) => (
          <div
            key={opt.id}
            className={`form-check${field.inline ? ' form-check-inline' : ''}`}
          >
            <input
              className={`form-check-input${erro ? ' is-invalid' : ''}`}
              type="checkbox"
              ref={idx === 0 ? firstRef : undefined}
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
