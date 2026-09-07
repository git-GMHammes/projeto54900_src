import { useState } from 'react'

// ─── Interface ────────────────────────────────────────────────────────────────

export interface RadioOption {
  id: string
  value: string
  label: string
  checked?: boolean
}

export interface RadioFieldSchema {
  type: 'radio'
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label?: string
  id?: string
  name: string
  options: RadioOption[]
  /** Exibe os radios em linha (inline) */
  inline?: boolean
  /** Valor pré-selecionado (sobrepõe checked nas options) */
  value?: string
  defaultValue?: string
  disabled?: boolean
  required?: boolean
  hidden?: boolean
  className?: string
  tabIndex?: number
  /** Disparado quando o valor muda */
  onChange?: (value: string) => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface RadioFieldProps { field: RadioFieldSchema }

export function RadioField({ field }: RadioFieldProps) {
  const resolveInitial = (): string => {
    if (field.value !== undefined) return field.value
    if (field.defaultValue !== undefined) return field.defaultValue
    const preChecked = field.options.find(o => o.checked)
    return preChecked?.value ?? ''
  }

  const isControlled = field.value !== undefined && field.onChange !== undefined
  const [internalValue, setInternalValue] = useState(resolveInitial)
  const [erro, setErro] = useState<string | null>(null)

  const selected = isControlled ? (field.value ?? '') : internalValue

  function handleChange(value: string) {
    if (!isControlled) setInternalValue(value)
    setErro(null)
    field.onChange?.(value)
  }

  function handleBlur() {
    if (field.required && !selected) {
      const nome = field.label ?? field.name ?? 'Campo'
      setErro(`${nome} é obrigatório`)
    } else {
      setErro(null)
    }
  }

  const nome = field.label ?? field.name ?? 'Campo'

  return (
    <>
      {field.label && (
        <label className="form-label fw-semibold d-block">
          {field.label}{field.required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <div className={field.className}>
        {field.options.map((opt, idx) => (
          <div
            key={opt.id}
            className={`form-check${field.inline ? ' form-check-inline' : ''}`}
          >
            <input
              className={`form-check-input${erro ? ' is-invalid' : ''}`}
              type="radio"
              id={opt.id}
              name={field.name}
              value={opt.value}
              checked={selected === opt.value}
              disabled={field.disabled}
              required={field.required && idx === 0}
              tabIndex={field.tabIndex}
              onChange={() => handleChange(opt.value)}
              onBlur={handleBlur}
            />
            <label className="form-check-label" htmlFor={opt.id}>
              {opt.label}
            </label>
          </div>
        ))}
      </div>
      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>
        {erro ?? (field.required && !selected && field.options.length > 0
          ? <span className="text-muted" style={{ fontSize: '0.7rem', fontStyle: 'italic' }}>
              Selecione uma opção em &quot;{nome}&quot;
            </span>
          : null)}
      </div>
    </>
  )
}

export default RadioField
