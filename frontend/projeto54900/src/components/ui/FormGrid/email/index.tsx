/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/email/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'email'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, defaultValue/value,
 *     required, allowedDomains (lista de dominios aceitos)
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: o proprio <input type="email" name={field.name}>
 *     visivel (sem mascara, sem hidden — nao ha diferenca entre "cru" e exibido)
 *   - A chave no FormData/payload e: field.name
 *
 * DEPENDENCIAS: nenhuma (nao usa ../emitValue — o valor exibido e o mesmo
 * que vai no submit).
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

// ─── Interface ────────────────────────────────────────────────────────────────

export interface EmailFieldSchema {
  type: 'email'
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label?: string
  id?: string
  name?: string
  placeholder?: string
  defaultValue?: string
  value?: string
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  /**
   * Lista de domínios permitidos.
   * Ex: ['gov.br', 'rj.gov.br', 'com.br']
   * Se omitido, qualquer domínio é aceito.
   */
  allowedDomains?: string[]
  className?: string
  style?: CSSProperties
  title?: string
  tabIndex?: number
  autoFocus?: boolean
  autoComplete?: string
  hidden?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getDomain(email: string): string {
  const parts = email.split('@')
  return parts.length > 1 ? (parts[1] ?? '').toLowerCase() : ''
}

function isDomainAllowed(domain: string, allowed: string[]): boolean {
  return allowed.some(a =>
    domain === a.toLowerCase() || domain.endsWith('.' + a.toLowerCase())
  )
}

function validar(field: EmailFieldSchema, valor: string): string | null {
  const nome = field.label ?? field.name ?? field.id ?? 'E-mail'
  if (field.required && !valor.trim()) return `${nome} é obrigatório`
  if (!valor.trim()) return null
  if (!EMAIL_REGEX.test(valor)) return 'Formato de e-mail inválido'
  if (field.allowedDomains?.length) {
    const domain = getDomain(valor)
    if (!isDomainAllowed(domain, field.allowedDomains))
      return `Domínio "${domain}" não permitido. Permitidos: ${field.allowedDomains.join(', ')}`
  }
  return null
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface EmailFieldProps { field: EmailFieldSchema }

export function EmailField({ field }: EmailFieldProps) {
  const isControlled = field.value !== undefined && field.onChange !== undefined
  const [internalValue, setInternalValue] = useState(field.defaultValue ?? '')
  const [erro, setErro] = useState<string | null>(null)

  const valor = isControlled ? (field.value ?? '') : internalValue

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setInternalValue(e.target.value)
    setErro(null)
    field.onChange?.(e)
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    setErro(validar(field, valor))
    field.onBlur?.(e)
  }

  const { type: _, col: _c, label, hidden: _hidden, id, name, className,
    value: _v, defaultValue: _dv, onChange: _oc, onBlur: _ob,
    allowedDomains: _ad, title: _title, ...restProps } = field

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
        type="email"
        id={id}
        name={name}
        className={inputClass}
        placeholder={restProps.placeholder ?? 'usuario@dominio.com.br'}
        {...restProps}
        value={valor}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>{erro}</div>
    </>
  )
}

export default EmailField
