import { Fragment, useState } from 'react'
import type {
  ChangeEvent,
  ChangeEventHandler,
  CSSProperties,
  FocusEvent,
  FocusEventHandler,
  InputHTMLAttributes,
} from 'react'
import { CpfField, type CpfFieldSchema } from '../cpf'
import { PhoneField, type PhoneFieldSchema } from '../phone'
import { CnpjField, type CnpjFieldSchema } from '../cnpj'
import { CepField, type CepFieldSchema } from '../cep'
import { MoedaField, type MoedaFieldSchema } from '../moeda'
import { DataField, type DataFieldSchema } from '../data'
import { HoraField, type HoraFieldSchema } from '../hora'
import { PisField, type PisFieldSchema } from '../pis'
import { PlacaField, type PlacaFieldSchema } from '../placa'
import { TituloField, type TituloFieldSchema } from '../titulo'
import { CnhField, type CnhFieldSchema } from '../cnh'
import { ProcessoField, type ProcessoFieldSchema } from '../processo'
import { RenavamField, type RenavamFieldSchema } from '../renavam'
import { SeiField, type SeiFieldSchema } from '../sei'
import { EmailField, type EmailFieldSchema } from '../email'
import { TextareaField, type TextareaFieldSchema } from '../textarea'
import { SenhaField, type SenhaFieldSchema } from '../senha'
import { RadioField, type RadioFieldSchema } from '../radio'
import { CheckboxField, type CheckboxFieldSchema } from '../checkbox'
import { SelectField, type SelectFieldSchema } from '../select'

// ─── Schema de campo texto ────────────────────────────────────────────────────

export interface TextFieldSchema {
  /** Discriminador — omitir ou definir como 'text' ou 'password' */
  type?: 'text' | 'password'

  /** Largura da coluna Bootstrap (1-12). Ex: 4 → col-md-4 */
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

  /** Texto do <label> acima do campo */
  label?: string

  /** Opções do datalist (gera <datalist> automaticamente vinculado ao campo) */
  datalist?: string[]

  // ── Validações em tempo real (mostram alerta ao digitar) ──────────────────
  /** Não aceita números (ex: campo Nome) */
  noNumbers?: boolean
  /** Não aceita letras (ex: campo Telefone) */
  noLetters?: boolean
  /** Não aceita caracteres especiais */
  noSpecialChars?: boolean

  // ── Atributos do input ────────────────────────────────────────────────────
  id?: string
  name?: string
  placeholder?: string
  defaultValue?: string
  value?: string
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  maxLength?: number
  minLength?: number
  size?: number
  pattern?: string
  autoComplete?: string
  autoFocus?: boolean
  spellCheck?: boolean
  inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel' | 'url' | 'search' | 'none'
  /** ID de um <datalist> externo (use `datalist` acima para gerar automaticamente) */
  list?: string

  // ── Atributos globais ─────────────────────────────────────────────────────
  className?: string
  style?: CSSProperties
  title?: string
  tabIndex?: number
  hidden?: boolean
  dir?: 'ltr' | 'rtl'
  lang?: string

  // ── Handlers ──────────────────────────────────────────────────────────────
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
}

/** Alias para compatibilidade com código existente */
export type FormFieldSchema = TextFieldSchema

// ─── Union de todos os tipos de campo ────────────────────────────────────────

export type AnyFieldSchema =
  | TextFieldSchema
  | CpfFieldSchema
  | PhoneFieldSchema
  | CnpjFieldSchema
  | CepFieldSchema
  | MoedaFieldSchema
  | DataFieldSchema
  | HoraFieldSchema
  | PisFieldSchema
  | PlacaFieldSchema
  | TituloFieldSchema
  | CnhFieldSchema
  | ProcessoFieldSchema
  | RenavamFieldSchema
  | SeiFieldSchema
  | EmailFieldSchema
  | TextareaFieldSchema
  | SenhaFieldSchema
  | RadioFieldSchema
  | CheckboxFieldSchema
  | SelectFieldSchema

export interface FormRowSchema {
  fields: AnyFieldSchema[]
  sectionTitle?: string
}

export interface FormGridSchema {
  rows: FormRowSchema[]
}

// ─── Validações de campo texto ────────────────────────────────────────────────

function validarBlur(field: TextFieldSchema, valor: string): string | null {
  const nome = field.label ?? field.name ?? field.id ?? 'Campo'

  if (field.required && !valor.trim())
    return `${nome} é obrigatório`

  if (field.minLength && valor.length > 0 && valor.length < field.minLength)
    return `${nome} deve ter no mínimo ${field.minLength} caractere${field.minLength > 1 ? 's' : ''}`

  if (field.maxLength && valor.length > field.maxLength)
    return `${nome} deve ter no máximo ${field.maxLength} caractere${field.maxLength > 1 ? 's' : ''}`

  if (field.pattern && valor.trim() && !new RegExp(`^(?:${field.pattern})$`).test(valor))
    return `${nome} está em formato inválido`

  return null
}

function validarDigitacao(field: TextFieldSchema, valor: string): string | null {
  const nome = field.label ?? field.name ?? field.id ?? 'Campo'

  if (field.noNumbers && /\d/.test(valor))
    return `${nome} não deve conter números`

  if (field.noLetters && /[a-zA-ZÀ-ÿ]/.test(valor))
    return `${nome} não deve conter letras`

  if (field.noSpecialChars && /[^a-zA-ZÀ-ÿ0-9\s]/.test(valor))
    return `${nome} não deve conter caracteres especiais`

  return null
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface FormGridProps {
  schema: FormGridSchema
}

function FormGrid({ schema }: FormGridProps) {
  // Erros gerenciados apenas para campos texto (CPF gerencia o próprio)
  const [erros, setErros] = useState<Record<string, string>>({})

  function setErro(chave: string, erro: string | null) {
    setErros(prev => {
      if (!erro) {
        const next = { ...prev }
        delete next[chave]
        return next
      }
      return { ...prev, [chave]: erro }
    })
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement>,
    field: TextFieldSchema,
    chave: string
  ) {
    setErro(chave, validarDigitacao(field, e.target.value))
    field.onChange?.(e)
  }

  function handleBlur(
    e: FocusEvent<HTMLInputElement>,
    field: TextFieldSchema,
    chave: string
  ) {
    const erroDigitacao = validarDigitacao(field, e.target.value)
    setErro(chave, erroDigitacao ?? validarBlur(field, e.target.value))
    field.onBlur?.(e)
  }

  return (
    <>
      {schema.rows.map((row, rowIndex) => (
        <Fragment key={rowIndex}>
          {row.sectionTitle && (
            <div className="col-12 mt-3 mb-1">
              <h6
                className="text-uppercase fw-bold pb-1 mb-0"
                style={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: '#0d6efd', borderBottom: '2px solid #0d6efd' }}
              >
                {row.sectionTitle}
              </h6>
            </div>
          )}
          <div className="row g-3">
          {row.fields.map((field, fieldIndex) => {
            const chave = field.id ?? `r${rowIndex}f${fieldIndex}`

            // ── CPF ───────────────────────────────────────────────────────
            if (field.type === 'cpf') {
              return (
                <div
                  key={fieldIndex}
                  className={`col-md-${field.col} mb-1`}
                  hidden={field.hidden}
                >
                  <CpfField field={field} />
                </div>
              )
            }

            // ── Telefone ──────────────────────────────────────────────────
            if (field.type === 'phone') {
              return (
                <div
                  key={fieldIndex}
                  className={`col-md-${field.col} mb-1`}
                  hidden={field.hidden}
                >
                  <PhoneField field={field} />
                </div>
              )
            }

            // ── CNPJ ──────────────────────────────────────────────────────
            if (field.type === 'cnpj') {
              return (
                <div
                  key={fieldIndex}
                  className={`col-md-${field.col} mb-1`}
                  hidden={field.hidden}
                >
                  <CnpjField field={field} />
                </div>
              )
            }

            // ── CEP ───────────────────────────────────────────────────────
            if (field.type === 'cep') {
              return (
                <div
                  key={fieldIndex}
                  className={`col-md-${field.col} mb-1`}
                  hidden={field.hidden}
                >
                  <CepField field={field} />
                </div>
              )
            }

            // ── Moeda ─────────────────────────────────────────────────────
            if (field.type === 'moeda') {
              return (
                <div key={fieldIndex} className={`col-md-${field.col} mb-1`} hidden={field.hidden}>
                  <MoedaField field={field} />
                </div>
              )
            }

            // ── Data ──────────────────────────────────────────────────────
            if (field.type === 'data') {
              return (
                <div key={fieldIndex} className={`col-md-${field.col} mb-1`} hidden={field.hidden}>
                  <DataField field={field} />
                </div>
              )
            }

            // ── Hora ──────────────────────────────────────────────────────
            if (field.type === 'hora') {
              return (
                <div key={fieldIndex} className={`col-md-${field.col} mb-1`} hidden={field.hidden}>
                  <HoraField field={field} />
                </div>
              )
            }

            // ── PIS / NIS / PASEP ─────────────────────────────────────────
            if (field.type === 'pis') {
              return (
                <div key={fieldIndex} className={`col-md-${field.col} mb-1`} hidden={field.hidden}>
                  <PisField field={field} />
                </div>
              )
            }

            // ── Placa de Veículo ──────────────────────────────────────────
            if (field.type === 'placa') {
              return (
                <div key={fieldIndex} className={`col-md-${field.col} mb-1`} hidden={field.hidden}>
                  <PlacaField field={field} />
                </div>
              )
            }

            // ── Título de Eleitor ─────────────────────────────────────────
            if (field.type === 'titulo') {
              return (
                <div key={fieldIndex} className={`col-md-${field.col} mb-1`} hidden={field.hidden}>
                  <TituloField field={field} />
                </div>
              )
            }

            // ── CNH ───────────────────────────────────────────────────────
            if (field.type === 'cnh') {
              return (
                <div key={fieldIndex} className={`col-md-${field.col} mb-1`} hidden={field.hidden}>
                  <CnhField field={field} />
                </div>
              )
            }

            // ── Processo Judicial ─────────────────────────────────────────
            if (field.type === 'processo') {
              return (
                <div key={fieldIndex} className={`col-md-${field.col} mb-1`} hidden={field.hidden}>
                  <ProcessoField field={field} />
                </div>
              )
            }

            // ── RENAVAM ───────────────────────────────────────────────────
            if (field.type === 'renavam') {
              return (
                <div key={fieldIndex} className={`col-md-${field.col} mb-1`} hidden={field.hidden}>
                  <RenavamField field={field} />
                </div>
              )
            }

            // ── SEI ───────────────────────────────────────────────────────
            if (field.type === 'sei') {
              return (
                <div key={fieldIndex} className={`col-md-${field.col} mb-1`} hidden={field.hidden}>
                  <SeiField field={field} />
                </div>
              )
            }

            // ── E-mail ────────────────────────────────────────────────────
            if (field.type === 'email') {
              return (
                <div key={fieldIndex} className={`col-md-${field.col} mb-1`} hidden={field.hidden}>
                  <EmailField field={field} />
                </div>
              )
            }

            // ── Textarea ──────────────────────────────────────────────────
            if (field.type === 'textarea') {
              return (
                <div key={fieldIndex} className={`col-md-${field.col} mb-1`} hidden={field.hidden}>
                  <TextareaField field={field} />
                </div>
              )
            }

            // ── Senha (com toggle + doubleField) ──────────────────────────
            if (field.type === 'senha') {
              return (
                <div key={fieldIndex} className={`col-md-${field.col} mb-1`} hidden={field.hidden}>
                  <SenhaField field={field} />
                </div>
              )
            }

            // ── Radio ─────────────────────────────────────────────────────
            if (field.type === 'radio') {
              return (
                <div key={fieldIndex} className={`col-md-${field.col} mb-1`} hidden={field.hidden}>
                  <RadioField field={field} />
                </div>
              )
            }

            // ── Checkbox ──────────────────────────────────────────────────
            if (field.type === 'checkbox') {
              return (
                <div key={fieldIndex} className={`col-md-${field.col} mb-1`} hidden={field.hidden}>
                  <CheckboxField field={field} />
                </div>
              )
            }

            // ── Select (combobox com busca) ───────────────────────────────
            if (field.type === 'select') {
              return (
                <div key={fieldIndex} className={`col-md-${field.col} mb-1`} hidden={field.hidden}>
                  <SelectField field={field} />
                </div>
              )
            }

            // ── Texto (padrão) ────────────────────────────────────────────
            const {
              type: _type,
              col,
              label,
              datalist,
              className,
              hidden,
              id,
              noNumbers: _n,
              noLetters: _l,
              noSpecialChars: _s,
              ...inputProps
            } = field

            const erro = erros[chave]

            const datalistId = datalist
              ? (id ? `${id}-list` : `datalist-${chave}`)
              : undefined

            const { value, onChange: _onChange, onBlur: _onBlur, ...restInputProps } = inputProps

            const controlProps: InputHTMLAttributes<HTMLInputElement> =
              value !== undefined
                ? _onChange !== undefined
                  ? { value }
                  : { defaultValue: value }
                : {}

            return (
              <div key={fieldIndex} className={`col-md-${col} mb-1`} hidden={hidden}>
                {label && (
                  <label htmlFor={id} className="form-label">
                    {label}
                    {restInputProps.required && (
                      <span className="text-danger ms-1">*</span>
                    )}
                  </label>
                )}
                <input
                  type={_type ?? 'text'}
                  id={id}
                  className={`form-control${erro ? ' is-invalid' : ''}${className ? ` ${className}` : ''}`}
                  list={datalist ? datalistId : restInputProps.list}
                  {...restInputProps}
                  {...controlProps}
                  onChange={e => handleChange(e, field, chave)}
                  onBlur={e => handleBlur(e, field, chave)}
                />
                {datalist && (
                  <datalist id={datalistId}>
                    {datalist.map((opt, i) => (
                      <option key={i} value={opt} />
                    ))}
                  </datalist>
                )}
                <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>
                  {erro}
                </div>
              </div>
            )
          })}
          </div>
        </Fragment>
      ))}
    </>
  )
}

export default FormGrid
