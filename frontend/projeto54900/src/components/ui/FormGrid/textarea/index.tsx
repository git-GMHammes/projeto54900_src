import { useState } from 'react'
import type {
  ChangeEvent,
  ChangeEventHandler,
  CSSProperties,
  FocusEvent,
  FocusEventHandler,
} from 'react'

// ─── Interface ────────────────────────────────────────────────────────────────

export interface TextareaFieldSchema {
  type: 'textarea'
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label?: string
  id?: string
  name?: string
  placeholder?: string
  defaultValue?: string
  value?: string
  rows?: number
  cols?: number
  maxLength?: number
  minLength?: number
  /**
   * Exibe contador de caracteres abaixo do campo. Padrão: `true` quando
   * `maxLength` está definido (mostra `n / máx` + barra de progresso).
   * `showCounter: true` explícito também exibe sem `maxLength`, como
   * contagem simples (`N caracteres`).
   */
  showCounter?: boolean
  /** Bloqueia caracteres especiais */
  noSpecialChars?: boolean
  /** Bloqueia números */
  noNumbers?: boolean
  /** Bloqueia letras */
  noLetters?: boolean
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  className?: string
  style?: CSSProperties
  title?: string
  tabIndex?: number
  autoFocus?: boolean
  spellCheck?: boolean
  hidden?: boolean
  onChange?: ChangeEventHandler<HTMLTextAreaElement>
  onBlur?: FocusEventHandler<HTMLTextAreaElement>
  onFocus?: FocusEventHandler<HTMLTextAreaElement>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validarDigitacao(field: TextareaFieldSchema, valor: string): string | null {
  const nome = field.label ?? field.name ?? field.id ?? 'Campo'
  if (field.noSpecialChars && /[^\p{L}\p{N}\s]/u.test(valor))
    return `${nome} não aceita caracteres especiais`
  if (field.noNumbers && /\d/.test(valor))
    return `${nome} não aceita números`
  if (field.noLetters && /\p{L}/u.test(valor))
    return `${nome} não aceita letras`
  return null
}

function validarBlur(field: TextareaFieldSchema, valor: string): string | null {
  const nome = field.label ?? field.name ?? field.id ?? 'Campo'
  if (field.required && !valor.trim()) return `${nome} é obrigatório`
  if (field.minLength && valor.length > 0 && valor.length < field.minLength)
    return `${nome} deve ter no mínimo ${field.minLength} caractere${field.minLength > 1 ? 's' : ''}`
  return null
}

function progressClass(pct: number): string {
  if (pct < 70) return 'bg-success'
  if (pct < 90) return 'bg-warning'
  return 'bg-danger'
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface TextareaFieldProps { field: TextareaFieldSchema }

export function TextareaField({ field }: TextareaFieldProps) {
  const isControlled = field.value !== undefined && field.onChange !== undefined
  const [internalValue, setInternalValue] = useState(field.defaultValue ?? '')
  const [erro, setErro] = useState<string | null>(null)

  const valor = isControlled ? (field.value ?? '') : internalValue
  const temMax = !!field.maxLength
  const showCounter = field.showCounter === true || (field.showCounter !== false && temMax)
  const pct = field.maxLength ? Math.min((valor.length / field.maxLength) * 100, 100) : 0

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    if (!isControlled) setInternalValue(e.target.value)
    setErro(validarDigitacao(field, e.target.value))
    field.onChange?.(e)
  }

  function handleBlur(e: FocusEvent<HTMLTextAreaElement>) {
    const erroDigit = validarDigitacao(field, valor)
    setErro(erroDigit ?? validarBlur(field, valor))
    field.onBlur?.(e)
  }

  const inputClass = ['form-control', erro ? 'is-invalid' : '', field.className ?? '']
    .filter(Boolean).join(' ')

  return (
    <>
      {field.label && (
        <label htmlFor={field.id} className="form-label">
          {field.label}{field.required && <span className="text-danger ms-1">*</span>}
          {field.maxLength && (
            <small className="text-muted ms-1">(máx: {field.maxLength})</small>
          )}
          {field.minLength && (
            <small className="text-muted ms-1">(mín: {field.minLength})</small>
          )}
        </label>
      )}
      <textarea
        id={field.id}
        name={field.name}
        className={inputClass}
        placeholder={field.placeholder}
        rows={field.rows ?? 4}
        cols={field.cols}
        maxLength={field.maxLength}
        minLength={field.minLength}
        readOnly={field.readOnly}
        disabled={field.disabled}
        required={field.required}
        tabIndex={field.tabIndex}
        title={field.title}
        style={field.style}
        autoFocus={field.autoFocus}
        spellCheck={field.spellCheck}
        value={valor}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={field.onFocus}
      />
      {showCounter && (
        <div className="d-flex align-items-center gap-2 mt-1" style={{ fontSize: '0.85rem' }}>
          {temMax ? (
            <>
              <span>
                <span>{valor.length}</span> / <span>{field.maxLength}</span>
              </span>
              <div className="progress flex-grow-1" style={{ height: '4px' }}>
                <div
                  className={`progress-bar ${progressClass(pct)}`}
                  role="progressbar"
                  style={{ width: `${pct}%` }}
                  aria-valuenow={valor.length}
                  aria-valuemin={0}
                  aria-valuemax={field.maxLength}
                />
              </div>
            </>
          ) : (
            <span className="text-muted">
              {valor.length} {valor.length === 1 ? 'caractere' : 'caracteres'}
            </span>
          )}
        </div>
      )}
      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>{erro}</div>
    </>
  )
}

export default TextareaField
