/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/datahora/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'datahora'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, defaultValue/value,
 *     required, min/max (data limite, em ISO — só a parte de DATA)
 *
 * POR QUE ESTE COMPONENTE EXISTE: ../data captura só a data. Colunas
 * DATETIME do banco (ex.: calendar_events.start_datetime) exigem o formato
 * 'Y-m-d H:i:s' na validação do backend (valid_date[Y-m-d H:i:s]) — enviar
 * só a data falha com 422. Este campo junta um sub-input de data + um
 * sub-input de hora e só emite o valor combinado quando os DOIS estão
 * completos.
 *
 * RENDERIZA SEMPRE INPUTS NATIVOS: <input type="date"> (com o calendario do
 * navegador) + <input type="time">. NUNCA <input type="text"> com mascara
 * (regra do projeto — mesma do ../data).
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: <input type="hidden" name={field.name}> em
 *     "YYYY-MM-DD HH:MM:00" (segundos sempre "00" — este campo não pede
 *     segundos ao usuário) quando data E hora estão completas, vazio
 *     enquanto qualquer uma das duas estiver incompleta
 *   - A chave no FormData/payload e: field.name
 *   - ids dos 2 sub-inputs visíveis: `${field.id}` (data, valor ISO
 *     'YYYY-MM-DD') e `${field.id}-time` (hora, valor 'HH:MM') — importante
 *     pra script de fake-fill (dev/fakeFill/*.ts) que preencha este campo
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

export interface DataHoraFieldSchema {
  type: 'datahora'
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label?: string
  id?: string
  name?: string
  placeholder?: string
  /** Valor inicial em "YYYY-MM-DD HH:MM:SS" (não-controlado). Segundos são ignorados na exibição. */
  defaultValue?: string
  /** Valor controlado em "YYYY-MM-DD HH:MM:SS". */
  value?: string
  /** Data mínima permitida (ISO, só a parte de data). Ex: "2000-01-01" */
  min?: string
  /** Data máxima permitida (ISO, só a parte de data). Ex: "2099-12-31" */
  max?: string
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  className?: string
  style?: CSSProperties
  /** Texto de ajuda (fc_help_text) — exibido só no ícone de ajuda ao lado do campo (FieldTooltip), NUNCA como title deste elemento. */
  title?: string
  hidden?: boolean
  /** Disparado quando data+hora ficam completas (ou deixam de estar). `e.target.value` = "YYYY-MM-DD HH:MM:00" ou "". */
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parte de data ('YYYY-MM-DD') de um "YYYY-MM-DD HH:MM[:SS]"; outro formato vira ''. */
function parteData(v: string): string {
  const m = /^\d{4}-\d{2}-\d{2}/.exec(v)
  return m ? m[0] : ''
}

/** Parte de hora ('HH:MM') de um "YYYY-MM-DD HH:MM[:SS]"; outro formato vira ''. */
function parteHora(v: string): string {
  const m = /(\d{2}):(\d{2})/.exec(v)
  return m ? `${m[1] ?? ''}:${m[2] ?? ''}` : ''
}

/** Valor combinado enviado ao backend — só quando data E hora estão completas. */
function combinar(data: string, hora: string): string {
  return data && hora ? `${data} ${hora}:00` : ''
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface DataHoraFieldProps { field: DataHoraFieldSchema }

export function DataHoraField({ field }: DataHoraFieldProps) {
  const isControlled = field.value !== undefined && field.onChange !== undefined
  const inicial = field.value ?? field.defaultValue ?? ''

  const [dataState, setDataState] = useState(() => parteData(inicial))
  const [horaState, setHoraState] = useState(() => parteHora(inicial))
  const [erro, setErro] = useState<string | null>(null)

  const data = isControlled ? parteData(field.value ?? '') : dataState
  const hora = isControlled ? parteHora(field.value ?? '') : horaState
  const valorCombinado = combinar(data, hora)

  function handleDataChange(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    if (!isControlled) setDataState(next)
    setErro(null)
    emitValue(e, combinar(next, hora), field.onChange)
  }

  function handleHoraChange(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    if (!isControlled) setHoraState(next)
    setErro(null)
    emitValue(e, combinar(data, next), field.onChange)
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    const nome = field.label ?? field.name ?? field.id ?? 'Data/hora'
    const algumPreenchido = data !== '' || hora !== ''

    if (e.target.validity.badInput) {
      setErro(`${nome}: data/hora inválida ou incompleta`)
    } else if (field.required && !algumPreenchido) {
      setErro(`${nome} é obrigatória`)
    } else if (algumPreenchido && (!data || !hora)) {
      setErro(`${nome}: preencha data E hora (ou deixe as duas em branco)`)
    } else if (data && field.min && data < field.min) {
      setErro(`${nome} deve ser a partir de ${field.min}`)
    } else if (data && field.max && data > field.max) {
      setErro(`${nome} deve ser até ${field.max}`)
    } else {
      setErro(null)
    }
    field.onBlur?.(e)
  }

  const inputClass = ['form-control', erro ? 'is-invalid' : '', field.className ?? ''].filter(Boolean).join(' ')
  const dataId = field.id
  const horaId = field.id ? `${field.id}-time` : undefined

  return (
    <>
      {field.label && (
        <label htmlFor={dataId} className="form-label">
          {field.label}{field.required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <div className="row g-2">
        <div className="col-7">
          <input
            type="date"
            id={dataId}
            className={inputClass}
            min={field.min}
            max={field.max}
            value={data}
            disabled={field.disabled}
            readOnly={field.readOnly}
            hidden={field.hidden}
            onChange={handleDataChange}
            onBlur={handleBlur}
          />
        </div>
        <div className="col-5">
          <input
            type="time"
            id={horaId}
            className={inputClass}
            value={hora}
            disabled={field.disabled}
            readOnly={field.readOnly}
            hidden={field.hidden}
            onChange={handleHoraChange}
            onBlur={handleBlur}
          />
        </div>
      </div>
      {field.name && <input type="hidden" name={field.name} value={valorCombinado} />}
      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>{erro}</div>
    </>
  )
}

export default DataHoraField
