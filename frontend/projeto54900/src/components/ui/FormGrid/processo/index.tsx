/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/processo/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'processo'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, defaultValue/value, required
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: <input type="hidden" name={field.name}> com
 *     os 20 digitos puros do numero unico CNJ (NNNNNNN+DD+AAAA+J+TT+OOOO)
 *   - A chave no FormData/payload e: field.name
 *   - O <input> visivel so exibe a mascara (0000000-00.0000.0.00.0000)
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

export interface ProcessoFieldSchema {
  type: 'processo'
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label?: string
  id?: string
  name?: string
  /** Padrão: "0000000-00.0000.0.00.0000" */
  placeholder?: string
  /**
   * Valor inicial em 20 dígitos puros (não-controlado).
   * Ordem: NNNNNNN + DD + AAAA + J + TT + OOOO
   */
  defaultValue?: string
  /** Valor controlado em 20 dígitos puros. */
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
  /** Texto de ajuda (fc_help_text) — exibido só no ícone de ajuda ao lado do campo (FieldTooltip), NUNCA como title deste elemento. */
  title?: string
  hidden?: boolean
  /**
   * Disparado a cada digitação.
   * `e.target.value` contém APENAS os 20 dígitos puros.
   */
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function soDigitos(v: string): string {
  return v.replace(/\D/g, '').slice(0, 20)
}

/**
 * Máscara CNJ: NNNNNNN-DD.AAAA.J.TT.OOOO
 */
function aplicarMascara(raw: string): string {
  const d = raw.slice(0, 20)
  const len = d.length
  if (len <= 7) return d
  if (len <= 9) return `${d.slice(0, 7)}-${d.slice(7)}`
  if (len <= 13) return `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9)}`
  if (len <= 14) return `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d.slice(13)}`
  if (len <= 16) return `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d.slice(13, 14)}.${d.slice(14)}`
  return `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d.slice(13, 14)}.${d.slice(14, 16)}.${d.slice(16)}`
}

/**
 * Valida dígitos verificadores CNJ usando módulo 97 (ISO 7064).
 * Fórmula: 98 - (NNNNNNNAAAAJTTOOOO * 100 mod 97) = DD
 */
function processoValido(raw: string): boolean {
  if (raw.length !== 20) return false
  const nnnnnnn = raw.slice(0, 7)
  const dd = raw.slice(7, 9)
  const aaaa = raw.slice(9, 13)
  const j = raw.slice(13, 14)
  const tt = raw.slice(14, 16)
  const oooo = raw.slice(16, 20)

  // Número sem os dígitos verificadores + "00" no final
  const numStr = nnnnnnn + aaaa + j + tt + oooo + '00'
  try {
    const remainder = BigInt(numStr) % 97n
    const expectedDd = (98n - remainder).toString().padStart(2, '0')
    return dd === expectedDd
  } catch {
    return false
  }
}

function validarBlur(field: ProcessoFieldSchema, raw: string): string | null {
  const nome = field.label ?? field.name ?? field.id ?? 'Processo'
  if (field.required && !raw) return `${nome} é obrigatório`
  if (!raw) return null
  if (raw.length < 20) return `${nome} incompleto`
  if (!processoValido(raw)) return `${nome} inválido`
  return null
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface ProcessoFieldProps { field: ProcessoFieldSchema }

export function ProcessoField({ field }: ProcessoFieldProps) {
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
    value: _v, defaultValue: _dv, onChange: _oc, onBlur: _ob, title: _title, ...restProps } = field

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
        placeholder={restProps.placeholder ?? '0000000-00.0000.0.00.0000'}
        inputMode="numeric"
        value={aplicarMascara(raw)}
        onChange={handleChange} onBlur={handleBlur}
      />
      {name && <input type="hidden" name={name} value={raw} />}
      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>{erro}</div>
    </>
  )
}

export default ProcessoField
