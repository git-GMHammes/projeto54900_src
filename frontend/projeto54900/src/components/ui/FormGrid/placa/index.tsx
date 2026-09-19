/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/placa/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'placa'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, defaultValue/value, required
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: <input type="hidden" name={field.name}> com
 *     os 7 caracteres limpos em maiusculas (formato antigo ou Mercosul)
 *   - A chave no FormData/payload e: field.name
 *   - A mascara detecta o formato pelo 5o caractere (letra = Mercosul,
 *     sem traco; digito = antigo, com traco ABC-1234)
 *
 * DEPENDENCIAS: ../emitValue (emitValue).
 * COMO CRIAR UM COMPONENTE DE CAMPO SIMILAR: ver README_comenta-codigo-didatico.md
 * secao 5 (Bloco C).
 * -------------------------------------------------------------------------
 */

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

export interface PlacaFieldSchema {
  type: 'placa'
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label?: string
  id?: string
  name?: string
  /** Padrão: "AAA-0000 ou AAA0A00" */
  placeholder?: string
  /**
   * Valor inicial sem máscara, 7 chars maiúsculos (não-controlado).
   * Ex: "ABC1234" (antigo) ou "ABC1D23" (Mercosul)
   */
  defaultValue?: string
  /** Valor controlado sem máscara, 7 chars maiúsculos. */
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
   * `e.target.value` contém os 7 chars limpos em maiúsculas (sem traço).
   */
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function soCaracteres(v: string): string {
  return v.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 7)
}

/**
 * Máscara progressiva:
 *  - Antigo (pos 4 é dígito): ABC-1234
 *  - Mercosul (pos 4 é letra): ABC1D23  (sem traço)
 */
function aplicarMascara(raw: string): string {
  const d = raw.slice(0, 7)
  const len = d.length
  if (len <= 3) return d
  // Só sabe o formato a partir do 5º char (índice 4)
  if (len < 5) return `${d.slice(0, 3)}-${d.slice(3)}`
  const isMercosul = /[A-Z]/.test(d[4] ?? '')
  if (isMercosul) return d                          // ABC1D23
  return `${d.slice(0, 3)}-${d.slice(3)}`          // ABC-1234
}

function placaValida(raw: string): boolean {
  if (raw.length !== 7) return false
  return /^[A-Z]{3}\d{4}$/.test(raw) ||            // Antigo
         /^[A-Z]{3}\d[A-Z]\d{2}$/.test(raw)        // Mercosul
}

function validarBlur(field: PlacaFieldSchema, raw: string): string | null {
  const nome = field.label ?? field.name ?? field.id ?? 'Placa'
  if (field.required && !raw) return `${nome} é obrigatória`
  if (!raw) return null
  if (raw.length < 7) return `${nome} incompleta`
  if (!placaValida(raw)) return `${nome} inválida`
  return null
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface PlacaFieldProps { field: PlacaFieldSchema }

export function PlacaField({ field }: PlacaFieldProps) {
  const isControlled = field.value !== undefined && field.onChange !== undefined
  const [internalRaw, setInternalRaw] = useState(() => soCaracteres(field.defaultValue ?? ''))
  const [erro, setErro] = useState<string | null>(null)

  const raw = isControlled ? soCaracteres(field.value ?? '') : internalRaw

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const next = soCaracteres(e.target.value)
    if (!isControlled) setInternalRaw(next)
    setErro(null)
    emitValue(e, next, field.onChange)
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    setErro(validarBlur(field, raw))
    field.onBlur?.(e)
  }

  const { type: _, col: _c, label, hidden: _hidden, id, name, className,
    value: _v, defaultValue: _dv, onChange: _oc, onBlur: _ob, title: _title, ...restProps } = field

  const inputClass = ['form-control text-uppercase', erro ? 'is-invalid' : '', className ?? '']
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
        placeholder={restProps.placeholder ?? 'AAA-0000 ou AAA0A00'}
        inputMode="text"
        value={aplicarMascara(raw)}
        onChange={handleChange} onBlur={handleBlur}
      />
      {name && <input type="hidden" name={name} value={raw} />}
      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>{erro}</div>
    </>
  )
}

export default PlacaField
