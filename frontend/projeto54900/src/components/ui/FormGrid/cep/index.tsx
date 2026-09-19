/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/cep/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'cep'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, defaultValue/value, required
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: <input type="hidden" name={field.name}> com
 *     os 8 digitos puros do CEP
 *   - A chave no FormData/payload e: field.name
 *
 * ATENCAO ESPECIFICA — consulta automatica: ao completar 8 digitos, dispara
 * um GET a ViaCEP (consultarViaCep) para validar se o CEP existe; mostra
 * spinner enquanto carrega e "CEP valido"/mensagem de erro conforme o
 * resultado. Falha de rede vira mensagem de erro generica (nao bloqueia o
 * usuario de continuar preenchendo, so marca o campo como invalido).
 *
 * DEPENDENCIAS: ../emitValue (emitValue); fetch nativo para a API publica
 * ViaCEP (sem passar por services/http.ts — endpoint externo, nao da API
 * propria do projeto).
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
import { emitValue } from '../emitValue'

// ─── Interface ────────────────────────────────────────────────────────────────

export interface CepFieldSchema {
  /** Discriminador obrigatório — identifica o campo como CEP no grid unificado */
  type: 'cep'

  /** Largura da coluna Bootstrap (1-12) */
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

  /** Texto do <label> acima do campo */
  label?: string

  // ── Atributos do input ────────────────────────────────────────────────────
  id?: string
  /** Vinculado ao <input type="hidden"> que carrega os 8 dígitos puros */
  name?: string
  /** Padrão: "00000-000" */
  placeholder?: string
  /** Valor inicial em 8 dígitos puros (não-controlado). Ex: "01001000" */
  defaultValue?: string
  /** Valor controlado em 8 dígitos puros. Ex: "01001000" */
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
  title?: string
  tabIndex?: number
  hidden?: boolean
  dir?: 'ltr' | 'rtl'
  lang?: string

  /**
   * Disparado a cada digitação.
   * `e.target.value` contém APENAS os 8 dígitos puros (ex: "01001000").
   */
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function soDigitos(v: string): string {
  return v.replace(/\D/g, '').slice(0, 8)
}

function aplicarMascara(raw: string): string {
  const d = raw.slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

interface ViaCepResposta {
  erro?: boolean
}

/**
 * Consulta o CEP na API gratuita ViaCEP.
 * Retorna `true` quando o CEP existe; lança `Error` em falha de serviço.
 * Autocontido — não depende de contexto/serviço externo (ver README_FormGrid).
 */
async function consultarViaCep(cep8: string): Promise<boolean> {
  const resp = await fetch(`https://viacep.com.br/ws/${cep8}/json/`)
  if (!resp.ok) throw new Error('Falha ao consultar o serviço de CEP')
  const data = (await resp.json()) as ViaCepResposta
  return !data.erro
}

// ─── Componente de campo (sem wrapper de coluna — responsabilidade do FormGrid) ─

interface CepFieldProps {
  field: CepFieldSchema
}

export function CepField({ field }: CepFieldProps) {
  const isControlled = field.value !== undefined && field.onChange !== undefined

  const [internalRaw, setInternalRaw] = useState(() =>
    soDigitos(field.defaultValue ?? '')
  )
  const [erroLocal, setErroLocal] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [valido, setValido] = useState<boolean | null>(null)
  const [erroApi, setErroApi] = useState<string | null>(null)

  const raw = isControlled ? soDigitos(field.value ?? '') : internalRaw
  const displayValue = aplicarMascara(raw)

  // Evita disparar a consulta duas vezes para o mesmo CEP
  const ultimoRawConsultado = useRef<string>('')

  // Dispara a consulta automaticamente ao completar 8 dígitos
  useEffect(() => {
    if (raw.length === 8 && raw !== ultimoRawConsultado.current) {
      ultimoRawConsultado.current = raw
      setErroLocal(null)
      setErroApi(null)
      setValido(null)
      setCarregando(true)

      let ativo = true
      consultarViaCep(raw)
        .then((existe) => {
          if (!ativo) return
          setValido(existe)
          if (!existe) setErroApi('CEP não encontrado')
        })
        .catch((e: unknown) => {
          if (!ativo) return
          setValido(false)
          setErroApi(e instanceof Error ? e.message : 'Erro ao consultar CEP')
        })
        .finally(() => {
          if (ativo) setCarregando(false)
        })

      return () => {
        ativo = false
      }
    }

    if (raw.length < 8 && ultimoRawConsultado.current) {
      ultimoRawConsultado.current = ''
      setValido(null)
      setErroApi(null)
      setCarregando(false)
    }

    return undefined
  }, [raw])

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const next = soDigitos(e.target.value)
    if (!isControlled) setInternalRaw(next)
    setErroLocal(null)

    emitValue(e, next, field.onChange)
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    const nome = field.label ?? field.name ?? field.id ?? 'CEP'
    if (field.required && raw.length === 0) {
      setErroLocal(`${nome} é obrigatório`)
    } else if (raw.length > 0 && raw.length < 8) {
      setErroLocal(`${nome} incompleto`)
    }
    field.onBlur?.(e)
  }

  const {
    type: _type, col: _col, label, hidden: _hidden, id, name, className,
    value: _v, defaultValue: _dv,
    onChange: _oc, onBlur: _ob, title: _title,
    ...restProps
  } = field

  // ── Estado visual ─────────────────────────────────────────────────────────
  const erro = erroLocal ?? (raw.length === 8 && !carregando ? erroApi : null)
  const isValid = !carregando && valido === true && raw.length === 8 && !erro
  const isInvalid = !!erro

  const inputClass = [
    'form-control',
    isValid ? 'is-valid' : '',
    isInvalid ? 'is-invalid' : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  return (
    <>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {field.required && <span className="text-danger ms-1">*</span>}
        </label>
      )}

      {/* input-group para acomodar o spinner sem deslocar o layout */}
      <div className="input-group">
        <input
          type="text"
          id={id}
          className={inputClass}
          {...restProps}
          placeholder={restProps.placeholder ?? '00000-000'}
          inputMode={restProps.inputMode ?? 'numeric'}
          value={displayValue}
          disabled={restProps.disabled || carregando}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        {carregando && (
          <span className="input-group-text bg-white border-start-0">
            <span
              className="spinner-border spinner-border-sm text-secondary"
              role="status"
              aria-label="Consultando CEP…"
            />
          </span>
        )}
      </div>

      {/* Dígitos puros para serialização do formulário */}
      {name && <input type="hidden" name={name} value={raw} />}

      <div
        className={
          isInvalid ? 'text-danger small mt-1'
          : isValid ? 'text-success small mt-1'
          : 'small mt-1'
        }
        style={{ minHeight: '1.25rem' }}
      >
        {isInvalid && erro}
        {isValid && 'CEP válido'}
      </div>
    </>
  )
}

export default CepField
