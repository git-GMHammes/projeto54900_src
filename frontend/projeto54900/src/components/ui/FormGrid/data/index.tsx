/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/data/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'data'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, defaultValue/value,
 *     required, min/max (datas limite, em ISO)
 *
 * RENDERIZA SEMPRE <input type="date"> NATIVO — com o calendario do
 * navegador ao lado do campo. NUNCA <input type="text"> com mascara (regra
 * do projeto: schema 'data' = date nativo). O navegador exibe a data no
 * formato do idioma (DD/MM/AAAA em pt-BR); o valor e sempre ISO.
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: o proprio <input type="date" name={field.name}>,
 *     em formato ISO ("YYYY-MM-DD") quando completo, vazio enquanto
 *     incompleto/invalido
 *   - A chave no FormData/payload e: field.name
 *   - onChange recebe `e.target.value` = ISO ou '' (nunca data parcial)
 *
 * DEPENDENCIAS: nenhuma (input nativo).
 * COMO CRIAR UM COMPONENTE DE CAMPO SIMILAR: ver README_comenta-codigo-didatico.md
 * secao 5 (Bloco C).
 * -------------------------------------------------------------------------
 */

import { useEffect, useState } from 'react'
import type {
  ChangeEvent,
  ChangeEventHandler,
  CSSProperties,
  FocusEvent,
  FocusEventHandler,
} from 'react'

// ─── Interface ────────────────────────────────────────────────────────────────

export interface DataFieldSchema {
  type: 'data'
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label?: string
  id?: string
  name?: string
  placeholder?: string
  /**
   * Valor inicial em formato ISO (não-controlado). Ex: "2024-12-31"
   */
  defaultValue?: string
  /** Valor controlado em formato ISO. Ex: "2024-12-31" */
  value?: string
  /** Data mínima permitida (ISO). Ex: "2000-01-01" */
  min?: string
  /** Data máxima permitida (ISO). Ex: "2099-12-31" */
  max?: string
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  size?: number
  autoComplete?: string
  autoFocus?: boolean
  tabIndex?: number
  className?: string
  style?: CSSProperties
  /** Texto de ajuda (fc_help_text) — exibido só no ícone de ajuda ao lado do campo (FieldTooltip), NUNCA como title deste elemento. */
  title?: string
  hidden?: boolean
  /**
   * Disparado a cada alteração.
   * `e.target.value` contém a data em ISO quando completa ("YYYY-MM-DD"),
   * ou '' enquanto incompleta/inválida.
   */
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Só a parte de data de um ISO ("YYYY-MM-DD[...]"); outro formato vira ''. */
function soIsoData(v: string): string {
  const m = /^\d{4}-\d{2}-\d{2}/.exec(v)
  return m ? m[0] : ''
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface DataFieldProps { field: DataFieldSchema }

export function DataField({ field }: DataFieldProps) {
  const isControlled = field.value !== undefined && field.onChange !== undefined

  const [internalValue, setInternalValue] = useState(() =>
    soIsoData(field.value ?? field.defaultValue ?? '')
  )
  const [erro, setErro] = useState<string | null>(null)

  // Modo não-controlado com `value` vindo de carga assíncrona (ex.: modal de
  // edição): ressincroniza o estado interno quando o valor externo muda.
  useEffect(() => {
    if (!isControlled && field.value !== undefined) {
      setInternalValue(soIsoData(field.value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value])

  const value = isControlled ? soIsoData(field.value ?? '') : internalValue

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setInternalValue(e.target.value)
    setErro(null)
    field.onChange?.(e)
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    const nome = field.label ?? field.name ?? field.id ?? 'Data'
    const atual = e.target.value
    // badInput: o usuário digitou algo que o navegador não aceita como data (incompleta/inválida).
    if (e.target.validity.badInput) { setErro(`${nome} inválida ou incompleta`); field.onBlur?.(e); return }
    if (field.required && !atual) { setErro(`${nome} é obrigatória`); field.onBlur?.(e); return }
    if (atual && field.min && atual < field.min) { setErro(`${nome} deve ser a partir de ${field.min}`); field.onBlur?.(e); return }
    if (atual && field.max && atual > field.max) { setErro(`${nome} deve ser até ${field.max}`); field.onBlur?.(e); return }

    setErro(null)
    field.onBlur?.(e)
  }

  const { type: _, col: _c, label, hidden: _hidden, id, name, className,
    value: _v, defaultValue: _dv, min, max, placeholder: _ph,
    onChange: _oc, onBlur: _ob, title: _title, ...restProps } = field

  const inputClass = ['form-control', erro ? 'is-invalid' : '', className ?? '']
    .filter(Boolean).join(' ')

  return (
    <>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}{field.required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <input
        type="date"
        id={id}
        name={name}
        className={inputClass}
        {...restProps}
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>{erro}</div>
    </>
  )
}

export default DataField
