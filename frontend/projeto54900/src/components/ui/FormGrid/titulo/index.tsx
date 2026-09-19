/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/titulo/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'titulo'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, defaultValue/value, required
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: <input type="hidden" name={field.name}> com
 *     os 12 digitos puros do Titulo de Eleitor
 *   - A chave no FormData/payload e: field.name
 *   - O <input> visivel exibe a mascara "0000 0000 0000"
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

export interface TituloFieldSchema {
  type: 'titulo'
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label?: string
  id?: string
  name?: string
  /** Padrão: "0000 0000 0000" */
  placeholder?: string
  /** Valor inicial em 12 dígitos puros (não-controlado). */
  defaultValue?: string
  /** Valor controlado em 12 dígitos puros. */
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
   * `e.target.value` contém APENAS os 12 dígitos puros.
   */
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function soDigitos(v: string): string {
  return v.replace(/\D/g, '').slice(0, 12)
}

function aplicarMascara(raw: string): string {
  const d = raw.slice(0, 12)
  const len = d.length
  if (len <= 4) return d
  if (len <= 8) return `${d.slice(0, 4)} ${d.slice(4)}`
  return `${d.slice(0, 4)} ${d.slice(4, 8)} ${d.slice(8)}`
}

function tituloValido(t: string): boolean {
  if (t.length !== 12) return false
  if (/^0+$/.test(t)) return false

  const dig = (i: number): number => Number(t[i] ?? 0)
  const estadoCod = parseInt(t.slice(8, 10))
  if (estadoCod < 1 || estadoCod > 28) return false

  // 1º dígito verificador
  const pesos1 = [2, 3, 4, 5, 6, 7, 8, 9]
  const soma1 = pesos1.reduce((acc, p, i) => acc + dig(i) * p, 0)
  const resto1 = soma1 % 11
  const spMg = estadoCod === 1 || estadoCod === 2
  let dv1: number
  if (spMg) dv1 = resto1 === 0 ? 1 : resto1 >= 10 ? 0 : resto1
  else dv1 = resto1 >= 10 ? 0 : resto1
  if (dig(10) !== dv1) return false

  // 2º dígito verificador
  const soma2 = dig(8) * 7 + dig(9) * 8 + dv1 * 9
  const resto2 = soma2 % 11
  let dv2: number
  if (spMg) dv2 = resto2 === 0 ? 1 : resto2 >= 10 ? 0 : resto2
  else dv2 = resto2 >= 10 ? 0 : resto2
  return dig(11) === dv2
}

function validarBlur(field: TituloFieldSchema, raw: string): string | null {
  const nome = field.label ?? field.name ?? field.id ?? 'Título de Eleitor'
  if (field.required && !raw) return `${nome} é obrigatório`
  if (!raw) return null
  if (raw.length < 12) return `${nome} incompleto`
  if (!tituloValido(raw)) return `${nome} inválido`
  return null
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface TituloFieldProps { field: TituloFieldSchema }

export function TituloField({ field }: TituloFieldProps) {
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
        placeholder={restProps.placeholder ?? '0000 0000 0000'}
        inputMode="numeric"
        value={aplicarMascara(raw)}
        onChange={handleChange} onBlur={handleBlur}
      />
      {name && <input type="hidden" name={name} value={raw} />}
      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>{erro}</div>
    </>
  )
}

export default TituloField
