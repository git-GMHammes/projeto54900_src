import { useState } from 'react'
import type {
  ChangeEvent,
  ChangeEventHandler,
  CSSProperties,
  FocusEvent,
  FocusEventHandler,
} from 'react'
import { emitValue } from '../emitValue'

// ─── Interface ────────────────────────────────────────────────────────────────

export interface RenavamFieldSchema {
  type: 'renavam'
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label?: string
  id?: string
  name?: string
  /** Padrão: "00000000000" */
  placeholder?: string
  /** Valor inicial em 11 dígitos puros (não-controlado). */
  defaultValue?: string
  /** Valor controlado em 11 dígitos puros. */
  value?: string
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  size?: number
  autoComplete?: string
  autoFocus?: boolean
  tabIndex?: number
  className?: string
  style?: CSSProperties
  title?: string
  hidden?: boolean
  /**
   * Disparado a cada digitação.
   * `e.target.value` contém APENAS os 11 dígitos puros.
   */
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function soDigitos(v: string): string {
  return v.replace(/\D/g, '').slice(0, 11)
}

/** RENAVAM não possui máscara padrão — exibimos os 11 dígitos sem separadores. */
function aplicarMascara(raw: string): string {
  return raw.slice(0, 11)
}

function renavamValido(renavam: string): boolean {
  if (renavam.length !== 11) return false
  if (/^0+$/.test(renavam)) return false
  const dig = (i: number): number => Number(renavam[i] ?? 0)
  const pesos = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const soma = pesos.reduce((acc, p, i) => acc + dig(i) * p, 0)
  const resto = soma % 11
  const dv = resto < 2 ? 0 : 11 - resto
  return dig(10) === dv
}

function validarBlur(field: RenavamFieldSchema, raw: string): string | null {
  const nome = field.label ?? field.name ?? field.id ?? 'RENAVAM'
  if (field.required && !raw) return `${nome} é obrigatório`
  if (!raw) return null
  if (raw.length < 11) return `${nome} incompleto`
  if (!renavamValido(raw)) return `${nome} inválido`
  return null
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface RenavamFieldProps { field: RenavamFieldSchema }

export function RenavamField({ field }: RenavamFieldProps) {
  const isControlled = field.value !== undefined && field.onChange !== undefined
  const [internalRaw, setInternalRaw] = useState(() => soDigitos(field.defaultValue ?? ''))
  const [erro, setErro] = useState<string | null>(null)

  const raw = isControlled ? soDigitos(field.value ?? '') : internalRaw

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const next = soDigitos(e.target.value)
    if (!isControlled) setInternalRaw(next)
    setErro(null)
    emitValue(e, next, field.onChange)
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    setErro(validarBlur(field, raw))
    field.onBlur?.(e)
  }

  const { type: _, col: _c, label, hidden: _hidden, id, name, className,
    value: _v, defaultValue: _dv, onChange: _oc, onBlur: _ob, ...restProps } = field

  const inputClass = ['form-control', erro ? 'is-invalid' : '', className ?? '']
    .filter(Boolean).join(' ')

  return (
    <>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}{field.required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <input type="text" id={id} className={inputClass}
        {...restProps}
        placeholder={restProps.placeholder ?? '00000000000'}
        inputMode="numeric"
        value={aplicarMascara(raw)}
        onChange={handleChange} onBlur={handleBlur}
      />
      {name && <input type="hidden" name={name} value={raw} />}
      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>{erro}</div>
    </>
  )
}

export default RenavamField
