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
 * POR QUE ESTE COMPONENTE EXISTE: ../data captura só DD/MM/AAAA. Colunas
 * DATETIME do banco (ex.: calendar_events.start_datetime) exigem o formato
 * 'Y-m-d H:i:s' na validação do backend (valid_date[Y-m-d H:i:s]) — enviar
 * só a data falha com 422. Este campo junta um sub-input de data + um
 * sub-input de hora (cada um com a própria máscara, copiada de ../data e
 * ../hora — self-contained, mesmo padrão dos outros tipos do FormGrid, sem
 * import cruzado entre pastas de campo) e só emite o valor combinado quando
 * os DOIS estão completos.
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: <input type="hidden" name={field.name}> em
 *     "YYYY-MM-DD HH:MM:00" (segundos sempre "00" — este campo não pede
 *     segundos ao usuário) quando data E hora estão completas, vazio
 *     enquanto qualquer uma das duas estiver incompleta
 *   - A chave no FormData/payload e: field.name
 *   - ids dos 2 sub-inputs visíveis: `${field.id}` (data) e
 *     `${field.id}-time` (hora) — importante pra script de fake-fill
 *     (dev/fakeFill/*.ts) que preencha este tipo de campo
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

// ─── Helpers — parte DATA (copiado de ../data, self-contained de propósito) ──

function soDigitosData(v: string): string {
  return v.replace(/\D/g, '').slice(0, 8)
}

function isoDataParaDigitos(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return soDigitosData(iso)
  const [, ano = '', mes = '', dia = ''] = m
  return `${dia}${mes}${ano}`
}

function digitosParaIsoData(d: string): string {
  if (d.length !== 8) return ''
  return `${d.slice(4)}-${d.slice(2, 4)}-${d.slice(0, 2)}`
}

function mascaraData(raw: string): string {
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

// ─── Helpers — parte HORA (copiado de ../hora, self-contained de propósito) ──

function soDigitosHora(v: string): string {
  return v.replace(/\D/g, '').slice(0, 4)
}

function isoHoraParaDigitos(iso: string): string {
  const m = /(\d{2}):(\d{2})/.exec(iso)
  if (!m) return soDigitosHora(iso)
  const [, hh = '', mm = ''] = m
  return `${hh}${mm}`
}

function mascaraHora(raw: string): string {
  const d = raw.slice(0, 4)
  if (d.length <= 2) return d
  return `${d.slice(0, 2)}:${d.slice(2)}`
}

function horaValida(raw: string): boolean {
  if (raw.length !== 4) return false
  const hh = parseInt(raw.slice(0, 2))
  const mm = parseInt(raw.slice(2, 4))
  return hh <= 23 && mm <= 59
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface DataHoraFieldProps { field: DataHoraFieldSchema }

export function DataHoraField({ field }: DataHoraFieldProps) {
  const isControlled = field.value !== undefined && field.onChange !== undefined
  const inicial = field.value ?? field.defaultValue ?? ''

  const [dataRaw, setDataRaw] = useState(() => soDigitosData(isoDataParaDigitos(inicial)))
  const [horaRaw, setHoraRaw] = useState(() => soDigitosHora(isoHoraParaDigitos(inicial)))
  const [erro, setErro] = useState<string | null>(null)

  const dataCompleta = dataRaw.length === 8
  const horaCompleta = horaRaw.length === 4
  const valorCombinado = dataCompleta && horaCompleta
    ? `${digitosParaIsoData(dataRaw)} ${mascaraHora(horaRaw)}:00`
    : ''

  /** Recalcula com os dígitos NOVOS (não os do state ainda não atualizado) — evita emitir valor desatualizado no mesmo evento que o alterou. */
  function combinar(dData: string, dHora: string): string {
    return dData.length === 8 && dHora.length === 4
      ? `${digitosParaIsoData(dData)} ${mascaraHora(dHora)}:00`
      : ''
  }

  function handleDataChange(e: ChangeEvent<HTMLInputElement>) {
    const next = soDigitosData(e.target.value)
    if (!isControlled) setDataRaw(next)
    setErro(null)
    emitValue(e, combinar(next, horaRaw), field.onChange)
  }

  function handleHoraChange(e: ChangeEvent<HTMLInputElement>) {
    const next = soDigitosHora(e.target.value)
    if (!isControlled) setHoraRaw(next)
    setErro(null)
    emitValue(e, combinar(dataRaw, next), field.onChange)
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    const nome = field.label ?? field.name ?? field.id ?? 'Data/hora'
    const algumPreenchido = dataRaw.length > 0 || horaRaw.length > 0

    if (field.required && !algumPreenchido) {
      setErro(`${nome} é obrigatória`)
    } else if (algumPreenchido && (!dataCompleta || !horaCompleta)) {
      setErro(`${nome}: preencha data E hora (ou deixe as duas em branco)`)
    } else if (dataCompleta && !dataValida(dataRaw)) {
      setErro(`${nome}: data inválida`)
    } else if (horaCompleta && !horaValida(horaRaw)) {
      setErro(`${nome}: hora inválida`)
    } else if (dataCompleta && field.min && digitosParaIsoData(dataRaw) < field.min) {
      setErro(`${nome} deve ser a partir de ${field.min}`)
    } else if (dataCompleta && field.max && digitosParaIsoData(dataRaw) > field.max) {
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
        <div className="col-8">
          <input
            type="text"
            id={dataId}
            className={inputClass}
            placeholder="DD/MM/AAAA"
            inputMode="numeric"
            value={mascaraData(dataRaw)}
            disabled={field.disabled}
            readOnly={field.readOnly}
            hidden={field.hidden}
            onChange={handleDataChange}
            onBlur={handleBlur}
          />
        </div>
        <div className="col-4">
          <input
            type="text"
            id={horaId}
            className={inputClass}
            placeholder="HH:MM"
            inputMode="numeric"
            value={mascaraHora(horaRaw)}
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
