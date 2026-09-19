/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/cnpj/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'cnpj'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, defaultValue/value, required
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: <input type="hidden" name={field.name}> com
 *     os 14 caracteres limpos em maiusculas (aceita CNPJ alfanumerico 2026
 *     e o legado so-numerico)
 *   - A chave no FormData/payload e: field.name
 *   - O <input> visivel so exibe a mascara (00.000.000/0000-00)
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

export interface CnpjFieldSchema {
  /** Discriminador obrigatório — identifica o campo como CNPJ no grid unificado */
  type: 'cnpj'

  /** Largura da coluna Bootstrap (1-12) */
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

  /** Texto do <label> acima do campo */
  label?: string

  // ── Atributos do input ────────────────────────────────────────────────────
  id?: string
  /** Vinculado ao <input type="hidden"> que carrega o valor limpo (14 chars) */
  name?: string
  /** Padrão: "00.000.000/0000-00" */
  placeholder?: string
  /**
   * Valor inicial sem máscara (não-controlado).
   * Ex: "12ABC3450001AB" ou "12345678000195"
   */
  defaultValue?: string
  /**
   * Valor controlado sem máscara.
   * Ex: "12ABC3450001AB" ou "12345678000195"
   */
  value?: string
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  size?: number
  autoComplete?: string
  autoFocus?: boolean
  spellCheck?: boolean
  inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel' | 'url' | 'search' | 'none'
  list?: string

  // ── Atributos globais ─────────────────────────────────────────────────────
  className?: string
  style?: CSSProperties
  /** Texto de ajuda (fc_help_text) — exibido só no ícone de ajuda ao lado do campo (FieldTooltip), NUNCA como title deste elemento. */
  title?: string
  tabIndex?: number
  hidden?: boolean
  dir?: 'ltr' | 'rtl'
  lang?: string

  /**
   * Disparado a cada digitação.
   * `e.target.value` contém APENAS os 14 caracteres limpos em maiúsculas
   * (ex: "12ABC3450001AB" ou "12345678000195").
   */
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extrai apenas A-Z e 0-9, converte para maiúsculas e limita a 14 caracteres.
 * Suporta tanto CNPJ numérico (legacy) quanto alfanumérico (novo padrão 2026).
 */
function soCaracteres(v: string): string {
  return v.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 14)
}

/**
 * Formata os caracteres limpos com a máscara XX.XXX.XXX/XXXX-XX progressivamente.
 * Aceita qualquer combinação de letras maiúsculas e números nas 12 primeiras posições.
 */
function aplicarMascara(raw: string): string {
  const d = raw.slice(0, 14)
  const len = d.length

  if (len === 0) return ''
  if (len <= 2) return d
  if (len <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (len <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (len <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

/**
 * Valida CNPJ alfanumérico (novo padrão Receita Federal — vigente a partir de 2026).
 * Compatível com CNPJ numérico (legacy): dígitos têm valor charCode - 48.
 * Letras maiúsculas A-Z têm valor charCode - 48 (A=17, B=18, …, Z=42).
 *
 * Regras:
 *  - 14 caracteres A-Z / 0-9
 *  - Os dois últimos DEVEM ser dígitos numéricos (0-9)
 *  - Não pode ser sequência homogênea (ex: "00000000000000")
 *  - Dígitos verificadores calculados pela tabela ASCII
 */
function cnpjValido(cnpj: string): boolean {
  if (cnpj.length !== 14) return false

  // Rejeita sequências homogêneas
  if (/^(.)\1{13}$/.test(cnpj)) return false

  // Converte para array de valores (charCode - 48)
  const v = Array.from({ length: 14 }, (_, i) => cnpj.charCodeAt(i) - 48)
  const at = (i: number): number => v[i] ?? 0

  // Os dois últimos devem ser dígitos numéricos (0-9)
  if (at(12) > 9 || at(13) > 9) return false

  // Primeiro dígito verificador
  const p1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let soma = 0
  for (let i = 0; i < 12; i++) soma += at(i) * (p1[i] ?? 0)
  let resto = soma % 11
  const dv1 = resto < 2 ? 0 : 11 - resto
  if (dv1 !== at(12)) return false

  // Segundo dígito verificador
  const p2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  soma = 0
  for (let i = 0; i < 13; i++) soma += at(i) * (p2[i] ?? 0)
  resto = soma % 11
  const dv2 = resto < 2 ? 0 : 11 - resto
  return dv2 === at(13)
}

function validarBlur(field: CnpjFieldSchema, raw: string): string | null {
  const nome = field.label ?? field.name ?? field.id ?? 'CNPJ'

  if (field.required && !raw) return `${nome} é obrigatório`
  if (raw.length === 0) return null

  if (raw.length < 14) return `${nome} incompleto`
  if (!cnpjValido(raw)) return `${nome} inválido`

  return null
}

// ─── Componente de campo (sem wrapper de coluna — responsabilidade do FormGrid) ─

interface CnpjFieldProps {
  field: CnpjFieldSchema
}

export function CnpjField({ field }: CnpjFieldProps) {
  const isControlled = field.value !== undefined && field.onChange !== undefined

  const [internalRaw, setInternalRaw] = useState(() =>
    soCaracteres(field.defaultValue ?? '')
  )
  const [erro, setErro] = useState<string | null>(null)

  const raw = isControlled ? soCaracteres(field.value ?? '') : internalRaw
  const displayValue = aplicarMascara(raw)

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

  const {
    type: _type, col: _col, label, hidden: _hidden, id, name, className,
    value: _v, defaultValue: _dv,
    onChange: _oc, onBlur: _ob, title: _title,
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
        placeholder={restProps.placeholder ?? '00.000.000/0000-00'}
        inputMode={restProps.inputMode ?? 'text'}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
      />

      {/* Carrega o valor limpo (sem máscara) na serialização do formulário */}
      {name && <input type="hidden" name={name} value={raw} />}

      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>
        {erro}
      </div>
    </>
  )
}

export default CnpjField
