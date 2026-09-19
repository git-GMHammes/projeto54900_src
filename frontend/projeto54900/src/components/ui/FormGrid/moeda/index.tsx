/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/moeda/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'moeda'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, defaultValue/value, required
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: <input type="hidden" name={field.name}> em
 *     formato decimal ("1234.56")
 *   - A chave no FormData/payload e: field.name
 *   - Internamente trabalha com digitos inteiros (centavos) para a mascara
 *     ("R$ 1.234,56" exibido) e converte para/de decimal nas bordas
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

export interface MoedaFieldSchema {
  type: 'moeda'
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label?: string
  id?: string
  name?: string
  placeholder?: string
  /**
   * Valor inicial em formato decimal (não-controlado). Ex: "1234.56"
   * Zeros à esquerda do centavo são respeitados internamente.
   */
  defaultValue?: string
  /** Valor controlado em formato decimal. Ex: "1234.56" */
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
   * `e.target.value` contém o valor em formato decimal. Ex: "1234.56"
   */
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converte string decimal ("1234.56") para dígitos inteiros ("123456") */
function decimalParaDigitos(decimal: string): string {
  if (!decimal) return ''
  const num = parseFloat(decimal.replace(',', '.'))
  if (isNaN(num) || num === 0) return ''
  return Math.round(Math.abs(num) * 100).toString()
}

/** Formata dígitos inteiros para exibição: "123456" → "R$ 1.234,56" */
function formatarMoeda(digitos: string): string {
  if (!digitos) return ''
  const num = parseInt(digitos, 10)
  const reais = Math.floor(num / 100)
  const centavos = num % 100
  return `R$ ${reais.toLocaleString('pt-BR')},${String(centavos).padStart(2, '0')}`
}

/** Converte dígitos inteiros para decimal: "123456" → "1234.56" */
function digitosParaDecimal(digitos: string): string {
  if (!digitos) return '0.00'
  const num = parseInt(digitos, 10)
  return `${Math.floor(num / 100)}.${String(num % 100).padStart(2, '0')}`
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface MoedaFieldProps { field: MoedaFieldSchema }

export function MoedaField({ field }: MoedaFieldProps) {
  const isControlled = field.value !== undefined && field.onChange !== undefined

  const [internalDigits, setInternalDigits] = useState(() =>
    decimalParaDigitos(field.defaultValue ?? '')
  )
  const [erro, setErro] = useState<string | null>(null)

  const digits = isControlled
    ? decimalParaDigitos(field.value ?? '')
    : internalDigits

  const displayValue = formatarMoeda(digits)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    // Extrai somente dígitos do valor exibido (inclui os centavos)
    const raw = e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 13)
    if (!isControlled) setInternalDigits(raw)
    setErro(null)

    emitValue(e, digitosParaDecimal(raw), field.onChange)
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    const nome = field.label ?? field.name ?? field.id ?? 'Valor'
    if (field.required && !digits) setErro(`${nome} é obrigatório`)
    field.onBlur?.(e)
  }

  const { type: _, col: _c, label, hidden: _hidden, id, name, className,
    value: _v, defaultValue: _dv, onChange: _oc, onBlur: _ob, title: _title,
    ...restProps } = field

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
        type="text"
        id={id}
        className={inputClass}
        {...restProps}
        placeholder={restProps.placeholder ?? 'R$ 0,00'}
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {name && <input type="hidden" name={name} value={digitosParaDecimal(digits)} />}
      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>
        {erro}
      </div>
    </>
  )
}

export default MoedaField
