/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/cnh/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'cnh'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, defaultValue/value, required
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: <input type="hidden" name={field.name}> com
 *     os 11 digitos puros da CNH
 *   - A chave no FormData/payload e: field.name
 *   - Sem mascara padrao — exibido como os 11 digitos sem separadores
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

export interface CnhFieldSchema {
  type: 'cnh'
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

/**
 * CNH não possui máscara padrão impresso em documento.
 * Exibimos os 11 dígitos sem separadores.
 */
function aplicarMascara(raw: string): string {
  return raw.slice(0, 11)
}

function cnhValida(cnh: string): boolean {
  if (cnh.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cnh)) return false

  const dig = (i: number): number => Number(cnh[i] ?? 0)

  let soma = 0
  let dsc = 0
  for (let i = 0; i < 9; i++) soma += dig(i) * (9 - i)
  let primeiro = soma % 11
  if (primeiro >= 10) { primeiro = 0; dsc = 2 }

  soma = 0
  for (let i = 0; i < 9; i++) soma += dig(i) * (1 + i)
  let segundo = (soma % 11 + dsc) % 11
  if (segundo >= 10) segundo = 0

  return dig(9) === primeiro && dig(10) === segundo
}

function validarBlur(field: CnhFieldSchema, raw: string): string | null {
  const nome = field.label ?? field.name ?? field.id ?? 'CNH'
  if (field.required && !raw) return `${nome} é obrigatória`
  if (!raw) return null
  if (raw.length < 11) return `${nome} incompleta`
  if (!cnhValida(raw)) return `${nome} inválida`
  return null
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface CnhFieldProps { field: CnhFieldSchema }

export function CnhField({ field }: CnhFieldProps) {
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

export default CnhField
