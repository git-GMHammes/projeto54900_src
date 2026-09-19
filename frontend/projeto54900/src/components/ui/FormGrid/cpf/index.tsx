/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/cpf/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'cpf'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, defaultValue/value,
 *     required, minLength/maxLength/pattern (aplicados aos digitos puros)
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: <input type="hidden" name={field.name}> com
 *     os 11 digitos puros (sem pontuacao)
 *   - A chave no FormData/payload e: field.name
 *   - O <input> visivel so exibe a mascara (000.000.000-00); nao vai no submit
 *
 * DEPENDENCIAS: ../emitValue (emitValue — reemite o onChange com os digitos
 * puros em vez do texto mascarado).
 * COMO CRIAR UM COMPONENTE DE CAMPO SIMILAR: ver README_comenta-codigo-didatico.md
 * secao 5 (Bloco C) — interface XxxFieldSchema, helpers de mascara/validacao
 * fora do componente, export function XxxField + export default.
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

export interface CpfFieldSchema {
  /** Discriminador obrigatório — identifica o campo como CPF no grid unificado */
  type: 'cpf'

  /** Largura da coluna Bootstrap (1-12) */
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

  /** Texto do <label> acima do campo */
  label?: string

  // ── Atributos do input ────────────────────────────────────────────────────
  id?: string
  /** Vinculado ao <input type="hidden"> que carrega os dígitos puros */
  name?: string
  /** Padrão: "000.000.000-00" */
  placeholder?: string
  /** Valor inicial em dígitos puros (não-controlado). Ex: "07633959789" */
  defaultValue?: string
  /** Valor controlado em dígitos puros. Ex: "07633959789" */
  value?: string
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  /** Aplicado aos dígitos puros. CPF tem 11 — use só para restringir abaixo. */
  maxLength?: number
  /** Aplicado aos dígitos puros. CPF tem 11 — use só para exigir mínimo abaixo. */
  minLength?: number
  size?: number
  /** Regex aplicado aos dígitos puros. */
  pattern?: string
  autoComplete?: string
  autoFocus?: boolean
  spellCheck?: boolean
  inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel' | 'url' | 'search' | 'none'
  list?: string

  // ── Atributos globais ─────────────────────────────────────────────────────
  className?: string
  style?: CSSProperties
  title?: string
  tabIndex?: number
  hidden?: boolean
  dir?: 'ltr' | 'rtl'
  lang?: string

  /**
   * Disparado a cada digitação.
   * `e.target.value` contém APENAS os dígitos puros (ex: "07633959789").
   */
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function soDigitos(v: string): string {
  return v.replace(/\D/g, '').slice(0, 11)
}

function aplicarMascara(raw: string): string {
  const d = raw.slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function cpfValido(cpf: string): boolean {
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  const dig = (i: number): number => Number(cpf[i] ?? 0)

  let soma = 0
  for (let i = 0; i < 9; i++) soma += dig(i) * (10 - i)
  let resto = soma % 11
  const d1 = resto < 2 ? 0 : 11 - resto
  if (dig(9) !== d1) return false

  soma = 0
  for (let i = 0; i < 10; i++) soma += dig(i) * (11 - i)
  resto = soma % 11
  const d2 = resto < 2 ? 0 : 11 - resto
  return dig(10) === d2
}

function validarBlur(field: CpfFieldSchema, raw: string): string | null {
  const nome = field.label ?? field.name ?? field.id ?? 'CPF'

  if (field.required && !raw) return `${nome} é obrigatório`
  if (raw.length === 0) return null

  if (field.minLength && raw.length < field.minLength)
    return `${nome} deve ter no mínimo ${field.minLength} dígito${field.minLength > 1 ? 's' : ''}`

  if (field.maxLength && raw.length > field.maxLength)
    return `${nome} deve ter no máximo ${field.maxLength} dígito${field.maxLength > 1 ? 's' : ''}`

  if (field.pattern && !new RegExp(`^(?:${field.pattern})$`).test(raw))
    return `${nome} está em formato inválido`

  if (raw.length < 11) return `${nome} incompleto`
  if (!cpfValido(raw)) return `${nome} inválido`

  return null
}

// ─── Componente de campo (sem wrapper de coluna — responsabilidade do FormGrid) ─

interface CpfFieldProps {
  field: CpfFieldSchema
}

export function CpfField({ field }: CpfFieldProps) {
  const isControlled = field.value !== undefined && field.onChange !== undefined

  const [internalRaw, setInternalRaw] = useState(() =>
    soDigitos(field.defaultValue ?? '')
  )
  const [erro, setErro] = useState<string | null>(null)

  const raw = isControlled ? soDigitos(field.value ?? '') : internalRaw
  const displayValue = aplicarMascara(raw)

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

  const {
    type: _type, col: _col, label, hidden: _hidden, id, name, className,
    value: _v, defaultValue: _dv,
    onChange: _oc, onBlur: _ob,
    maxLength: _mx, minLength: _mn, pattern: _pt, title: _title,
    ...restProps
  } = field

  return (
    <>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {field.required && <span className="text-danger ms-1">*</span>}
        </label>
      )}

      <input
        type="text"
        id={id}
        className={`form-control${erro ? ' is-invalid' : ''}${className ? ` ${className}` : ''}`}
        {...restProps}
        placeholder={restProps.placeholder ?? '000.000.000-00'}
        inputMode={restProps.inputMode ?? 'numeric'}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
      />

      {/* Carrega os dígitos puros na serialização do formulário */}
      {name && <input type="hidden" name={name} value={raw} />}

      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>
        {erro}
      </div>
    </>
  )
}

export default CpfField
