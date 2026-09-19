/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/sei/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'sei'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, defaultValue/value, required
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: <input type="hidden" name={field.name}> com
 *     o valor "cru" SEI15NNNNNNNNNN20NN (19 chars, sem separadores)
 *   - A chave no FormData/payload e: field.name
 *   - O <input> visivel exibe a mascara SEI-15NNNN/NNNNNN/20NN
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

export interface SeiFieldSchema {
  type: 'sei'
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label?: string
  id?: string
  name?: string
  /**
   * Valor raw: SEI15NNNNNNNNNN20NN (19 chars, sem separadores).
   * Usado em modo não-controlado.
   */
  defaultValue?: string
  /** Valor controlado em formato raw (19 chars). */
  value?: string
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  className?: string
  style?: CSSProperties
  /** Texto de ajuda (fc_help_text) — exibido só no ícone de ajuda ao lado do campo (FieldTooltip), NUNCA como title deste elemento. */
  title?: string
  tabIndex?: number
  hidden?: boolean
  /**
   * Disparado a cada digitação.
   * `e.target.value` contém o valor raw (19 chars, sem separadores).
   */
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** raw SEI15NNNNNNNNNN20NN → display SEI-15NNNN/NNNNNN/20NN */
function seiRawToMasked(raw: string): string {
  if (!raw || raw.length < 19) return ''
  const body = raw.replace(/^SEI15/i, '')
  if (body.length < 14) return ''
  const g1 = body.slice(0, 4)
  const g2 = body.slice(4, 10)
  const g3 = body.slice(12, 14)
  return 'SEI-15' + g1 + '/' + g2 + '/20' + g3
}

/** display SEI-15NNNN/NNNNNN/20NN → raw SEI15NNNNNNNNNN20NN */
function seiMaskedToRaw(masked: string): string {
  if (!masked) return ''
  const stripped = masked.replace(/^SEI-/i, '').replace(/\//g, '')
  return stripped.length > 0 ? 'SEI' + stripped : ''
}

/** Constrói a máscara progressiva a partir dos dígitos livres */
function applyMask(digits: string): string {
  const freeDigits = digits.startsWith('15')
    ? digits.slice(2, 14)
    : digits.slice(0, 12)
  const g1 = freeDigits.slice(0, 4)
  const g2 = freeDigits.slice(4, 10)
  const g3 = freeDigits.slice(10, 12)
  if (!digits.length) return ''
  let masked = 'SEI-15' + g1
  if (freeDigits.length > 4) masked += '/' + g2
  if (freeDigits.length > 10) masked += '/20' + g3
  return masked
}

function validarBlur(field: SeiFieldSchema, raw: string): string | null {
  const nome = field.label ?? field.name ?? field.id ?? 'SEI'
  if (field.required && !raw) return `${nome} é obrigatório`
  if (raw && raw.length < 19) return `${nome} incompleto`
  return null
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface SeiFieldProps { field: SeiFieldSchema }

export function SeiField({ field }: SeiFieldProps) {
  const isControlled = field.value !== undefined && field.onChange !== undefined
  const [internalRaw, setInternalRaw] = useState(() => field.defaultValue ?? '')
  const [erro, setErro] = useState<string | null>(null)

  const raw = isControlled ? (field.value ?? '') : internalRaw
  const displayValue = seiRawToMasked(raw) || (raw ? applyMask(raw.replace(/\D/g, '')) : '')

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    const newMasked = applyMask(digits)
    const newRaw = seiMaskedToRaw(newMasked)
    if (!isControlled) setInternalRaw(newRaw)
    setErro(null)
    emitValue(e, newRaw, field.onChange)
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    setErro(validarBlur(field, raw))
    field.onBlur?.(e)
  }

  const inputClass = ['form-control', erro ? 'is-invalid' : '', field.className ?? '']
    .filter(Boolean).join(' ')

  return (
    <>
      {field.label && (
        <label htmlFor={field.id} className="form-label">
          {field.label}{field.required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <input
        type="text"
        id={field.id}
        className={inputClass}
        placeholder="SEI-15____/______/20__"
        maxLength={22}
        autoComplete="off"
        inputMode="numeric"
        readOnly={field.readOnly}
        disabled={field.disabled}
        required={field.required}
        tabIndex={field.tabIndex}
        style={field.style}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={field.onFocus}
      />
      {field.name && <input type="hidden" name={field.name} value={raw} />}
      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>{erro}</div>
    </>
  )
}

export default SeiField
