/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/senha/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'senha'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, defaultValue/value,
 *     required, minLength/maxLength, strongPassword, noSpecialChars/
 *     noNumbers/noLetters, doubleField (campo de confirmacao)
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: o proprio <input type="password" name={field.name}>
 *     (sem hidden — nao ha mascara, o valor exibido/oculto e o mesmo do submit)
 *   - Com doubleField, existe um 2o input de confirmacao com
 *     name={`${field.name}_confirm`} — usado so para validar igualdade
 *     (setCustomValidity), nao precisa ser lido no payload
 *   - A chave no FormData/payload e: field.name
 *
 * DEPENDENCIAS: nenhuma (nao usa ../emitValue — sem mascara).
 * COMO CRIAR UM COMPONENTE DE CAMPO SIMILAR: ver README_comenta-codigo-didatico.md
 * secao 5 (Bloco C).
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from 'react'
import type {
  ChangeEvent,
  ChangeEventHandler,
  CSSProperties,
  FocusEvent,
  FocusEventHandler,
} from 'react'

// ─── Interface ────────────────────────────────────────────────────────────────

export interface SenhaFieldSchema {
  type: 'senha'
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label?: string
  id?: string
  name?: string
  placeholder?: string
  defaultValue?: string
  value?: string
  minLength?: number
  maxLength?: number
  /** Exige letra + número + especial + comprimento mínimo */
  strongPassword?: boolean
  /** Bloqueia caracteres especiais */
  noSpecialChars?: boolean
  /** Bloqueia números */
  noNumbers?: boolean
  /** Bloqueia letras */
  noLetters?: boolean
  /** Exibe segundo campo de confirmação — sempre exige igualdade entre os dois */
  doubleField?: boolean
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  className?: string
  style?: CSSProperties
  title?: string
  tabIndex?: number
  autoComplete?: string
  autoFocus?: boolean
  hidden?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validarSenha(
  valor: string,
  field: SenhaFieldSchema
): string[] {
  const msgs: string[] = []
  const nome = field.label ?? 'Senha'

  if (!valor) return msgs

  if (field.strongPassword) {
    const min = field.minLength ?? 6
    if (valor.length < min) msgs.push(`${nome}: mínimo ${min} caracteres`)
    if (!/[a-zA-Z]/.test(valor)) msgs.push(`${nome}: deve conter letras`)
    if (!/\d/.test(valor)) msgs.push(`${nome}: deve conter números`)
    if (!/[^\w\s]/.test(valor)) msgs.push(`${nome}: deve conter caracteres especiais (@, #, $…)`)
  } else {
    if (field.noSpecialChars && /[^\p{L}\p{N}\s]/u.test(valor))
      msgs.push(`${nome}: não aceita caracteres especiais`)
    if (field.noNumbers && /\d/.test(valor))
      msgs.push(`${nome}: não aceita números`)
    if (field.noLetters && /\p{L}/u.test(valor))
      msgs.push(`${nome}: não aceita letras`)
  }

  return msgs
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface SenhaFieldProps { field: SenhaFieldSchema }

export function SenhaField({ field }: SenhaFieldProps) {
  const isControlled = field.value !== undefined && field.onChange !== undefined
  const [internalValue, setInternalValue] = useState(field.defaultValue ?? '')
  const [confirmValue, setConfirmValue] = useState('')
  const [show, setShow] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const confirmRef = useRef<HTMLInputElement>(null)

  const valor = isControlled ? (field.value ?? '') : internalValue
  const nome = field.label ?? 'Senha'

  // Liga a igualdade dos 2 campos a validacao nativa (checkValidity/reportValidity) —
  // sem isso o mismatch so aparecia como texto cosmetico e o form deixava enviar
  // com a confirmacao vazia ou diferente.
  useEffect(() => {
    if (!confirmRef.current) return
    const mismatch = field.doubleField && valor !== confirmValue
    confirmRef.current.setCustomValidity(mismatch ? 'As senhas não coincidem' : '')
  }, [valor, confirmValue, field.doubleField])

  function computeErro(v: string, c: string): string | null {
    if (field.required && !v.trim()) return `${nome} é obrigatório`
    const msgs = validarSenha(v, field)
    if (msgs.length) return msgs.join(' | ')
    if (field.doubleField && v && c && v !== c)
      return 'As senhas não coincidem'
    return null
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setInternalValue(e.target.value)
    setErro(null)
    field.onChange?.(e)
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    setErro(computeErro(valor, confirmValue))
    field.onBlur?.(e)
  }

  function handleConfirmChange(e: ChangeEvent<HTMLInputElement>) {
    setConfirmValue(e.target.value)
    setErro(null)
  }

  function handleConfirmBlur() {
    setErro(computeErro(valor, confirmValue))
  }

  const inputClass = ['form-control', erro ? 'is-invalid' : '', field.className ?? '']
    .filter(Boolean).join(' ')

  const confirmId = field.id ? `${field.id}_confirm` : undefined
  const confirmName = field.name ? `${field.name}_confirm` : undefined

  return (
    <>
      {field.label && (
        <label htmlFor={field.id} className="form-label">
          {field.label}{field.required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          id={field.id}
          name={field.name}
          className={inputClass}
          placeholder={field.placeholder}
          minLength={field.minLength}
          maxLength={field.maxLength}
          readOnly={field.readOnly}
          disabled={field.disabled}
          required={field.required}
          tabIndex={field.tabIndex}
          style={{ ...field.style, paddingRight: '2.5rem' }}
          autoComplete={field.autoComplete}
          autoFocus={field.autoFocus}
          value={valor}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={field.onFocus}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          tabIndex={-1}
          title={show ? 'Ocultar senha' : 'Mostrar senha'}
          style={{
            position: 'absolute', right: '0.6rem', top: '50%',
            transform: 'translateY(-50%)', background: 'none',
            border: 'none', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1,
            color: '#6c757d', padding: 0
          }}
        >
          {show ? '🔒' : '👁️'}
        </button>
      </div>

      {field.doubleField && (
        <>
          <label htmlFor={confirmId} className="form-label mt-2">
            Confirmar {nome}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              ref={confirmRef}
              type={showConfirm ? 'text' : 'password'}
              id={confirmId}
              name={confirmName}
              className={inputClass}
              minLength={field.minLength}
              maxLength={field.maxLength}
              readOnly={field.readOnly}
              disabled={field.disabled}
              required={field.required}
              style={{ paddingRight: '2.5rem' }}
              value={confirmValue}
              onChange={handleConfirmChange}
              onBlur={handleConfirmBlur}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(s => !s)}
              tabIndex={-1}
              title={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
              style={{
                position: 'absolute', right: '0.6rem', top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1,
                color: '#6c757d', padding: 0
              }}
            >
              {showConfirm ? '🔒' : '👁️'}
            </button>
          </div>
        </>
      )}

      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>{erro}</div>
    </>
  )
}

export default SenhaField
