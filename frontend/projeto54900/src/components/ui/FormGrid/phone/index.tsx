/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/phone/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'phone'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, defaultValue/value,
 *     required, minLength/maxLength/pattern (aplicados aos digitos puros)
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: <input type="hidden" name={field.name}> com
 *     os digitos puros (10 = fixo, 11 = celular com 9)
 *   - A chave no FormData/payload e: field.name
 *
 * ATENCAO ESPECIFICA: valida o DDD contra a lista real de DDDs brasileiros
 * (DDDS_VALIDOS) e exige "9" logo apos o DDD quando ha 11 digitos (regra do
 * celular).
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

export interface PhoneFieldSchema {
  /** Discriminador obrigatório — identifica o campo como Telefone no grid unificado */
  type: 'phone'

  /** Largura da coluna Bootstrap (1-12) */
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

  /** Texto do <label> acima do campo */
  label?: string

  // ── Atributos do input ────────────────────────────────────────────────────
  id?: string
  /** Vinculado ao <input type="hidden"> que carrega os dígitos puros */
  name?: string
  /**
   * Padrão: "(NN) NNNNN-NNNN"
   * O placeholder não reflete a máscara em tempo real — serve apenas de dica.
   */
  placeholder?: string
  /** Valor inicial em dígitos puros (não-controlado). Ex: "11987654321" */
  defaultValue?: string
  /** Valor controlado em dígitos puros. Ex: "11987654321" */
  value?: string
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  /** Aplicado aos dígitos puros (10 = fixo / 11 = celular). */
  maxLength?: number
  /** Aplicado aos dígitos puros. */
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
   * `e.target.value` contém APENAS os dígitos puros (ex: "11987654321").
   */
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
}

// ─── DDDs válidos do Brasil ───────────────────────────────────────────────────

const DDDS_VALIDOS = new Set([
  // São Paulo
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  // Rio de Janeiro
  21, 22, 24,
  // Espírito Santo
  27, 28,
  // Minas Gerais
  31, 32, 33, 34, 35, 37, 38,
  // Paraná
  41, 42, 43, 44, 45, 46,
  // Santa Catarina
  47, 48, 49,
  // Rio Grande do Sul
  51, 53, 54, 55,
  // Distrito Federal / Goiás
  61, 62, 64,
  // Tocantins
  63,
  // Mato Grosso
  65, 66,
  // Mato Grosso do Sul
  67,
  // Acre
  68,
  // Rondônia
  69,
  // Bahia
  71, 73, 74, 75, 77,
  // Sergipe
  79,
  // Pernambuco
  81, 87,
  // Alagoas
  82,
  // Paraíba
  83,
  // Rio Grande do Norte
  84,
  // Ceará
  85, 88,
  // Piauí
  86, 89,
  // Pará
  91, 93, 94,
  // Amazonas
  92, 97,
  // Roraima
  95,
  // Amapá
  96,
  // Maranhão
  98, 99,
])

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extrai somente dígitos e limita a 11 caracteres. */
function soDigitos(v: string): string {
  return v.replace(/\D/g, '').slice(0, 11)
}

/**
 * Formata os dígitos puros com máscara progressiva:
 *   10 dígitos → (NN) NNNN-NNNN   (fixo)
 *   11 dígitos → (NN) NNNNN-NNNN  (celular com 9)
 */
function aplicarMascara(raw: string): string {
  const d = raw.slice(0, 11)
  const len = d.length

  if (len === 0) return ''
  if (len <= 2) return `(${d}`
  if (len <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (len <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  // 11 dígitos: grupo antes do traço tem 5 dígitos (inclui o 9)
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function phoneValido(raw: string): string | null {
  const ddd = Number(raw.slice(0, 2))

  if (!DDDS_VALIDOS.has(ddd))
    return `DDD ${raw.slice(0, 2)} inválido`

  if (raw.length === 11 && raw[2] !== '9')
    return 'Celular deve começar com 9 após o DDD'

  return null
}

function validarBlur(field: PhoneFieldSchema, raw: string): string | null {
  const nome = field.label ?? field.name ?? field.id ?? 'Telefone'

  if (field.required && !raw) return `${nome} é obrigatório`
  if (raw.length === 0) return null

  if (field.minLength && raw.length < field.minLength)
    return `${nome} deve ter no mínimo ${field.minLength} dígito${field.minLength > 1 ? 's' : ''}`

  if (field.maxLength && raw.length > field.maxLength)
    return `${nome} deve ter no máximo ${field.maxLength} dígito${field.maxLength > 1 ? 's' : ''}`

  if (field.pattern && !new RegExp(`^(?:${field.pattern})$`).test(raw))
    return `${nome} está em formato inválido`

  if (raw.length < 10) return `${nome} incompleto`

  return phoneValido(raw)
}

// ─── Componente de campo (sem wrapper de coluna — responsabilidade do FormGrid) ─

interface PhoneFieldProps {
  field: PhoneFieldSchema
}

export function PhoneField({ field }: PhoneFieldProps) {
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
        placeholder={restProps.placeholder ?? '(NN) NNNNN-NNNN'}
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

export default PhoneField
