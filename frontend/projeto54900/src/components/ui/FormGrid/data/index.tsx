/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/data/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'data'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, defaultValue/value,
 *     required, min/max (datas limite, em ISO)
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: <input type="hidden" name={field.name}> em
 *     formato ISO ("YYYY-MM-DD") quando completo, vazio enquanto incompleto
 *   - A chave no FormData/payload e: field.name
 *   - Internamente trabalha com digitos "DDMMYYYY" para a mascara
 *     (DD/MM/AAAA exibido) e converte para/de ISO nas bordas
 *
 * DEPENDENCIAS: ../emitValue (emitValue).
 * COMO CRIAR UM COMPONENTE DE CAMPO SIMILAR: ver README_comenta-codigo-didatico.md
 * secao 5 (Bloco C).
 * -------------------------------------------------------------------------
 */

import { useEffect, useState } from 'react'
import type {
  ChangeEvent,
  ChangeEventHandler,
  CSSProperties,
  FocusEvent,
  FocusEventHandler,
} from 'react'
import { emitValue } from '../emitValue'

// ─── Interface ────────────────────────────────────────────────────────────────

export interface DataFieldSchema {
  type: 'data'
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label?: string
  id?: string
  name?: string
  placeholder?: string
  /**
   * Valor inicial em formato ISO (não-controlado). Ex: "2024-12-31"
   */
  defaultValue?: string
  /** Valor controlado em formato ISO. Ex: "2024-12-31" */
  value?: string
  /** Data mínima permitida (ISO). Ex: "2000-01-01" */
  min?: string
  /** Data máxima permitida (ISO). Ex: "2099-12-31" */
  max?: string
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
   * `e.target.value` contém data em ISO quando completa ("YYYY-MM-DD"),
   * ou os dígitos parciais (ex: "2812") enquanto incompleta.
   */
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function soDigitos(v: string): string {
  return v.replace(/\D/g, '').slice(0, 8)
}

/** "YYYY-MM-DD" → "DDMMYYYY" (dígitos internos) */
function isoParaDigitos(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return soDigitos(iso)
  const [, ano = '', mes = '', dia = ''] = m
  return `${dia}${mes}${ano}`
}

/** "DDMMYYYY" → "YYYY-MM-DD" */
function digitosParaIso(d: string): string {
  if (d.length !== 8) return d
  return `${d.slice(4)}-${d.slice(2, 4)}-${d.slice(0, 2)}`
}

function aplicarMascara(raw: string): string {
  const d = raw.slice(0, 8)
  const len = d.length
  if (len <= 2) return d
  if (len <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

function dataValida(raw: string): boolean {
  if (raw.length !== 8) return false
  const day = parseInt(raw.slice(0, 2))
  const month = parseInt(raw.slice(2, 4))
  const year = parseInt(raw.slice(4, 8))
  if (month < 1 || month > 12 || day < 1 || year < 1) return false
  const d = new Date(year, month - 1, day)
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface DataFieldProps { field: DataFieldSchema }

export function DataField({ field }: DataFieldProps) {
  const isControlled = field.value !== undefined && field.onChange !== undefined

  const [internalRaw, setInternalRaw] = useState(() =>
    isoParaDigitos(field.value ?? field.defaultValue ?? '')
  )
  const [erro, setErro] = useState<string | null>(null)

  // Modo não-controlado com `value` vindo de carga assíncrona (ex.: modal de
  // edição): ressincroniza o estado interno quando o valor externo muda.
  useEffect(() => {
    if (!isControlled && field.value !== undefined) {
      setInternalRaw(isoParaDigitos(field.value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value])

  const raw = isControlled ? isoParaDigitos(field.value ?? '') : internalRaw
  const displayValue = aplicarMascara(raw)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const next = soDigitos(e.target.value)
    if (!isControlled) setInternalRaw(next)
    setErro(null)

    emitValue(e, next.length === 8 ? digitosParaIso(next) : next, field.onChange)
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    const nome = field.label ?? field.name ?? field.id ?? 'Data'
    if (field.required && !raw) { setErro(`${nome} é obrigatória`); field.onBlur?.(e); return }
    if (raw && raw.length < 8) { setErro(`${nome} incompleta`); field.onBlur?.(e); return }
    if (raw.length === 8 && !dataValida(raw)) { setErro(`${nome} inválida`); field.onBlur?.(e); return }

    if (raw.length === 8 && field.min) {
      const iso = digitosParaIso(raw)
      if (iso < field.min) { setErro(`${nome} deve ser a partir de ${field.min}`); field.onBlur?.(e); return }
    }
    if (raw.length === 8 && field.max) {
      const iso = digitosParaIso(raw)
      if (iso > field.max) { setErro(`${nome} deve ser até ${field.max}`); field.onBlur?.(e); return }
    }

    setErro(null)
    field.onBlur?.(e)
  }

  const { type: _, col: _c, label, hidden: _hidden, id, name, className,
    value: _v, defaultValue: _dv, min: _mn, max: _mx,
    onChange: _oc, onBlur: _ob, title: _title, ...restProps } = field

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
        placeholder={restProps.placeholder ?? 'DD/MM/AAAA'}
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {name && <input type="hidden" name={name} value={raw.length === 8 ? digitosParaIso(raw) : ''} />}
      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>{erro}</div>
    </>
  )
}

export default DataField
