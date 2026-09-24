/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/select/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'select'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, options/src/findSrc/
 *     getSrc (3 canais de dados, ver abaixo), valueKey/labelKey/
 *     labelTemplate, multiple/values/defaultValues, disabledValues,
 *     required, colorKey (select de cor: opções pintadas + amostra)
 *
 * CONEXAO COM A PAGINA:
 *   - Single: <input type="hidden" name={field.name}> com o valor selecionado
 *   - Multiple: um <input type="hidden" name={field.name}> por valor
 *     selecionado (mesmo padrao do checkbox, serializa como lista)
 *   - A chave no FormData/payload e: field.name
 *
 * TRES CANAIS DE DADOS (o mais complexo do FormGrid):
 *   1. `options` — array inline, ja carregado (sem fetch).
 *   2. `src` — GET na montagem, popula o cache local (allData) inteiro.
 *   3. `findSrc`/`findColumn` — POST com debounce a cada busca (>= 2 chars),
 *      usado quando o dataset e grande demais para caber em `src`/`options`.
 *   `getSrc` (GET /{id}) e o fallback de REIDRATACAO: quando o valor
 *   pre-selecionado (edicao) nao esta no cache local, busca so aquele item
 *   por id para exibir o label correto.
 *
 * MODO single vs multiple: single usa value/onChange (um <select> disfarcado
 * de combobox com busca); multiple usa values/onChangeMultiple e mantem o
 * listbox sempre visivel (sem dropdown que fecha ao selecionar).
 *
 * DEPENDENCIAS: nenhuma (fetch nativo direto — nao usa services/http.ts,
 * pois `src`/`findSrc`/`getSrc` podem apontar para qualquer endpoint,
 * inclusive fora do grupo de recursos padrao).
 * COMO CRIAR UM COMPONENTE DE CAMPO SIMILAR: ver README_comenta-codigo-didatico.md
 * secao 5 (Bloco C) — mas para um combobox remoto novo, preferir copiar este
 * arquivo como base em vez de partir do zero, dada a complexidade dos 3
 * canais de dados.
 * -------------------------------------------------------------------------
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ChangeEvent, FocusEvent, FocusEventHandler, KeyboardEvent } from 'react'

// ─── Interface ────────────────────────────────────────────────────────────────

export type SelectOptionItem = Record<string, unknown>

export interface SelectFieldSchema {
  type: 'select'
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label?: string
  id?: string
  /** Texto de ajuda (fc_help_text) — exibido só no ícone de ajuda ao lado do campo (FieldTooltip), NUNCA como title deste elemento. */
  title?: string
  name?: string
  placeholder?: string
  /** Opções inline no formato { value: string, label: string } ou objeto genérico */
  options?: SelectOptionItem[]
  /** URL para carregar opções via GET (retorna { data: [...] } ou array direto) */
  src?: string
  /** Chave do objeto usada como value (padrão: 'id') */
  valueKey?: string
  /** Chave(s) exibida(s) como label — string simples ou array de chaves unidas por ' — ' (padrão: 'nome') */
  labelKey?: string | string[]
  /** Template de label: "{campo1} - {campo2}" (sobrepõe labelKey) */
  labelTemplate?: string
  /** Máximo de itens visíveis no dropdown (padrão: 150) */
  maxVisible?: number
  /** Linhas visíveis no select dropdown (padrão: 8) */
  rows?: number
  /** Valor pré-selecionado */
  value?: string
  defaultValue?: string
  disabled?: boolean
  required?: boolean
  hidden?: boolean
  className?: string
  tabIndex?: number
  /** Authorization header para requests autenticados (Bearer token) */
  authToken?: string
  /** URL do POST find — fallback quando filtro local retorna vazio: POST { [findColumn]: query } */
  findSrc?: string
  /** Coluna enviada no body do POST findSrc */
  findColumn?: string
  /** URL base do GET por ID: {getSrc}/{id} — usado quando o valor pré-selecionado não está no cache local */
  getSrc?: string
  /** Disparado quando o valor muda */
  onChange?: (value: string, item: SelectOptionItem | null) => void
  onBlur?: FocusEventHandler<HTMLInputElement>

  // ── Modo múltiplo (modelo Bootstrap: <select multiple size>) ──────────────
  /** Ativa seleção múltipla — o dropdown vira listbox multi, a busca continua */
  multiple?: boolean
  /** Modo controlado no múltiplo (par do `value`) */
  values?: string[]
  /** Pré-seleção no múltiplo (par do `defaultValue`) */
  defaultValues?: string[]
  /** Disparado quando a seleção múltipla muda */
  onChangeMultiple?: (values: string[], items: SelectOptionItem[]) => void

  /** Values renderizados como `<option disabled>` — cinza e não selecionáveis */
  disabledValues?: string[]

  /**
   * Chave do item com uma cor CSS (ex.: 'hexadecimal' de /api/v1/aux-cor).
   * Quando presente, cada opção é pintada com a própria cor e o campo mostra
   * uma amostra da cor escolhida. Valor gravado fora da lista (ex.: um hex
   * personalizado) continua exibido — o próprio valor vira o texto e a cor.
   */
  colorKey?: string

  /**
   * Ao escolher uma opção (modo single), copia valores do item para outros
   * campos do mesmo `<form>`: { name_do_campo_destino: chave_do_item }
   * (ex.: { email: 'uc_email', display_name: 'uc_name' }). Chave vazia no item
   * não sobrescreve o destino; limpar a seleção (✕) esvazia os destinos.
   * Configurável em `select_config_json.fillFields`.
   */
  fillFields?: Record<string, string>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converte um valor arbitrário do item em texto exibível (objeto/array viram ''). */
function asText(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

function getLabel(item: SelectOptionItem, field: SelectFieldSchema): string {
  const { labelTemplate, labelKey = 'nome' } = field
  if (labelTemplate) {
    return labelTemplate.replace(/\{(\w+)\}/g, (_: string, k: string) => asText(item[k]))
  }
  if (Array.isArray(labelKey)) {
    return labelKey.map(k => asText(item[k])).filter(Boolean).join(' — ')
  }
  return asText(item[labelKey])
}

function getValue(item: SelectOptionItem, field: SelectFieldSchema): string {
  return asText(item[field.valueKey ?? 'id'])
}

function filterData(
  data: SelectOptionItem[],
  query: string,
  field: SelectFieldSchema
): SelectOptionItem[] {
  if (!query.trim()) return data
  const q = query.trim().toLowerCase()
  return data.filter(item => {
    const lbl = getLabel(item, field).toLowerCase()
    const val = getValue(item, field).toLowerCase()
    return lbl.includes(q) || val.includes(q) ||
      Object.values(item).some(v => typeof v === 'string' && v.toLowerCase().includes(q))
  })
}

/** Cor de texto legível (preto/branco) sobre um fundo #RRGGBB; '' se não for hex. */
function contrastText(hex: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m?.[1]) return ''
  const n = parseInt(m[1], 16)
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return lum > 0.6 ? '#000' : '#fff'
}

function buildAuthHeaders(authToken?: string): Record<string, string> {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {}
}

/** Extrai uma lista de itens de uma resposta JSON (array direto ou { data|items: [...] }). */
function extrairLista(json: unknown): SelectOptionItem[] {
  if (Array.isArray(json)) return json as SelectOptionItem[]
  const rec = (json && typeof json === 'object' ? json : null) as Record<string, unknown> | null
  const cand = rec?.data ?? rec?.items
  return Array.isArray(cand) ? (cand as SelectOptionItem[]) : []
}

/** Extrai um único item de uma resposta JSON ({ data: {...} } ou objeto direto). */
function extrairItem(json: unknown): SelectOptionItem | null {
  if (Array.isArray(json)) return (json[0] as SelectOptionItem | undefined) ?? null
  const rec = (json && typeof json === 'object' ? json : null) as Record<string, unknown> | null
  const data = rec?.data
  if (Array.isArray(data)) return (data[0] as SelectOptionItem | undefined) ?? null
  if (data && typeof data === 'object') return data as SelectOptionItem
  return rec
}

/**
 * Escreve `value` no campo `name` do formulário que contém `origin` — pelo setter
 * nativo + evento 'input', para o onChange do React do campo destino (que guarda
 * o valor em estado interno) enxergar a mudança.
 */
function writeFormField(origin: HTMLElement | null, name: string, value: string): void {
  const form = origin?.closest('form')
  const el = form?.elements.namedItem(name)
  if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLTextAreaElement)) return
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface SelectFieldProps { field: SelectFieldSchema }

export function SelectField({ field }: SelectFieldProps) {
  const [allData, setAllData] = useState<SelectOptionItem[]>(field.options ?? [])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedValue, setSelectedValue] = useState(field.value ?? field.defaultValue ?? '')
  const [selectedLabel, setSelectedLabel] = useState('')
  const [selectedValues, setSelectedValues] = useState<string[]>(field.values ?? field.defaultValues ?? [])
  const [selectedItems, setSelectedItems] = useState<SelectOptionItem[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const isControlled = field.value !== undefined && field.onChange !== undefined
  const effectiveValue = isControlled ? (field.value ?? '') : selectedValue

  const isControlledMulti =
    field.multiple === true && field.values !== undefined && field.onChangeMultiple !== undefined
  const effectiveValues = isControlledMulti ? (field.values ?? []) : selectedValues
  const hasAnyValue = field.multiple ? effectiveValues.length > 0 : Boolean(effectiveValue)
  const isSelected = (val: string): boolean =>
    field.multiple ? effectiveValues.includes(val) : val === effectiveValue
  const isOptionDisabled = (val: string): boolean =>
    field.disabledValues?.includes(val) ?? false

  // Carrega dados do src na montagem
  useEffect(() => {
    const src = field.src
    if (!src) return
    setIsLoading(true)
    fetch(src, { headers: buildAuthHeaders(field.authToken) })
      .then(r => r.json() as Promise<unknown>)
      .then(json => setAllData(extrairLista(json)))
      .catch((e: unknown) => console.warn('[SelectField] Falha ao carregar src:', src, e))
      .finally(() => setIsLoading(false))
  }, [field.src, field.authToken])

  // Sincroniza label quando allData ou value mudam — com fallback getSrc (GET /id) ou,
  // na ausência dele, findSrc (POST exato pelo valueKey) quando valor não está no cache.
  // findSrc é o fallback necessário para PKs compostas (ex.: "2024.58017.15.4078"),
  // incompatíveis com rotas GET /get/{id} baseadas em (:num).
  useEffect(() => {
    if (!effectiveValue) { setSelectedLabel(''); return }
    const found = allData.find(item => getValue(item, field) === effectiveValue)
    if (found) {
      setSelectedLabel(getLabel(found, field))
      return
    }

    function applyFetchedItem(item: SelectOptionItem | null) {
      if (!item) return
      setAllData(prev => {
        const val = getValue(item, field)
        if (prev.some(d => getValue(d, field) === val)) return prev
        return [...prev, item]
      })
      setSelectedLabel(getLabel(item, field))
    }

    const getSrc = field.getSrc
    if (getSrc) {
      fetch(`${getSrc}/${encodeURIComponent(effectiveValue)}`, {
        headers: buildAuthHeaders(field.authToken),
      })
        .then(r => r.json() as Promise<unknown>)
        .then(json => applyFetchedItem(extrairItem(json)))
        .catch((e: unknown) => console.warn('[SelectField] getSrc falhou:', getSrc, e))
      return
    }

    const findSrc = field.findSrc
    if (findSrc) {
      fetch(findSrc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...buildAuthHeaders(field.authToken) },
        body: JSON.stringify({ [field.valueKey ?? 'id']: effectiveValue }),
      })
        .then(r => r.json() as Promise<unknown>)
        .then(json => applyFetchedItem(extrairItem(json)))
        .catch((e: unknown) => console.warn('[SelectField] findSrc (rehidratação) falhou:', findSrc, e))
    }
    // `field` é reconstruído a cada render; sincroniza só por valor/cache
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveValue, allData])

  // Modo múltiplo: sincroniza os itens (para os labels) e re-hidrata via getSrc
  // os valores que ainda não estão no cache local.
  useEffect(() => {
    if (!field.multiple) return
    const present = effectiveValues
      .map(v => allData.find(item => getValue(item, field) === v))
      .filter((x): x is SelectOptionItem => x != null)
    setSelectedItems(present)

    const getSrc = field.getSrc
    if (!getSrc) return
    const missing = effectiveValues.filter(
      v => !allData.some(item => getValue(item, field) === v),
    )
    if (missing.length === 0) return
    void Promise.all(
      missing.map(v =>
        fetch(`${getSrc}/${encodeURIComponent(v)}`, { headers: buildAuthHeaders(field.authToken) })
          .then(r => r.json() as Promise<unknown>)
          .then(json => extrairItem(json))
          .catch((e: unknown) => {
            console.warn('[SelectField] getSrc (múltiplo) falhou:', getSrc, e)
            return null
          }),
      ),
    ).then(fetched => {
      const novos = fetched.filter((x): x is SelectOptionItem => x != null)
      if (novos.length === 0) return
      setAllData(prev => {
        const next = [...prev]
        for (const item of novos) {
          const val = getValue(item, field)
          if (!next.some(d => getValue(d, field) === val)) next.push(item)
        }
        return next
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.multiple, effectiveValues.join(','), allData])

  // POST findSrc a cada busca (com debounce) — o cache local (allData) é limitado
  // por maxVisible/src para não estourar memória, então não pode ser a única fonte:
  // sempre consulta o banco, mesmo quando o filtro local já encontrou algum item,
  // pois pode haver candidatos fora do recorte inicial (ex.: fora dos mais votados).
  useEffect(() => {
    const query = searchText.trim()
    const findSrc = field.findSrc
    const findColumn = field.findColumn
    if (query.length < 2 || !findSrc || !findColumn) return
    if (effectiveValue) return

    const timer = setTimeout(() => {
      fetch(findSrc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...buildAuthHeaders(field.authToken) },
        body: JSON.stringify({ [findColumn]: query }),
      })
        .then(r => r.json() as Promise<unknown>)
        .then(json => {
          const items = extrairLista(json)
          if (items.length === 0) return
          setAllData(prev => {
            const next = [...prev]
            for (const item of items) {
              const val = getValue(item, field)
              if (!next.some(d => getValue(d, field) === val)) next.push(item)
            }
            return next
          })
        })
        .catch((e: unknown) => console.warn('[SelectField] findSrc falhou:', findSrc, e))
    }, 300)

    return () => clearTimeout(timer)
    // `field` (objeto) muda de identidade a cada render; deps são os campos usados
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, field.findSrc, field.findColumn, effectiveValue, field.authToken])

  const validarRequired = useCallback((preenchido: boolean) => {
    if (field.required && !preenchido) {
      const nome = field.label ?? field.name ?? field.id ?? 'Campo'
      setErro(`${nome} é obrigatório`)
    } else {
      setErro(null)
    }
  }, [field.required, field.label, field.name, field.id])

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: globalThis.MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        if (field.multiple) setSearchText('')
        else if (!effectiveValue) setSearchText('')
        else setSearchText(selectedLabel)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [effectiveValue, selectedLabel, field.multiple])

  function selectItem(item: SelectOptionItem) {
    const val = getValue(item, field)
    const lbl = getLabel(item, field)
    if (!isControlled) setSelectedValue(val)
    setSelectedLabel(lbl)
    setSearchText(lbl)
    setIsOpen(false)
    setErro(null)
    if (field.fillFields) {
      for (const [target, key] of Object.entries(field.fillFields)) {
        const fill = asText(item[key])
        if (fill) writeFormField(containerRef.current, target, fill)
      }
    }
    field.onChange?.(val, item)
  }

  /** Destinos de fillFields ficam órfãos sem a seleção (podem ser read_only) — esvazia. */
  function clearFillTargets() {
    if (!field.fillFields) return
    for (const target of Object.keys(field.fillFields)) writeFormField(containerRef.current, target, '')
  }

  function clearSelection() {
    if (field.multiple) {
      if (!isControlledMulti) setSelectedValues([])
      setSelectedItems([])
      setSearchText('')
      setIsOpen(true)
      setErro(null)
      field.onChangeMultiple?.([], [])
      setTimeout(() => searchRef.current?.focus(), 0)
      return
    }
    if (!isControlled) setSelectedValue('')
    setSelectedLabel('')
    setSearchText('')
    setIsOpen(true)
    setErro(null)
    clearFillTargets()
    field.onChange?.('', null)
    setTimeout(() => searchRef.current?.focus(), 0)
  }

  function handleMultiChange(e: ChangeEvent<HTMLSelectElement>) {
    // preserva os selecionados que a busca atual escondeu
    const shown = new Set(
      filterData(allData, searchText, field).map(it => getValue(it, field)),
    )
    const marcados = Array.from(e.target.selectedOptions, o => o.value)
    const mantidos = effectiveValues.filter(v => !shown.has(v))
    const next = Array.from(new Set([...mantidos, ...marcados]))
    const items = next
      .map(v => allData.find(it => getValue(it, field) === v))
      .filter((x): x is SelectOptionItem => x != null)
    if (!isControlledMulti) setSelectedValues(next)
    setSelectedItems(items)
    setErro(null)
    field.onChangeMultiple?.(next, items)
  }

  function handleSearchFocus() {
    if (field.disabled) return
    // Ao reabrir um campo já preenchido, o texto exibido é o label do item selecionado;
    // limpa para não filtrar a lista só por ele — mostra o restante das opções abaixo.
    if (hasAnyValue) setSearchText('')
    setIsOpen(true)
  }

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchText(e.target.value)
    // no modo múltiplo digitar só filtra — não mexe na seleção
    if (!field.multiple && effectiveValue) {
      if (!isControlled) setSelectedValue('')
      setSelectedLabel('')
      clearFillTargets()
      field.onChange?.('', null)
    }
    setIsOpen(true)
  }

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') { setIsOpen(false); searchRef.current?.blur() }
  }

  function handleSearchBlur(e: FocusEvent<HTMLInputElement>) {
    validarRequired(hasAnyValue)
    field.onBlur?.(e)
  }

  const maxVisible = field.maxVisible ?? 150
  const rows = field.rows ?? 8
  const filtered = filterData(allData, searchText, field)
  // Mantém o(s) item(ns) selecionado(s) no topo, com o restante da lista abaixo.
  // Só no single: no múltiplo a lista fica sempre aberta e reordenar faria os
  // itens pularem sob o cursor a cada clique.
  const ordered = hasAnyValue && !field.multiple
    ? [...filtered].sort((a, b) => {
        const aSel = isSelected(getValue(a, field))
        const bSel = isSelected(getValue(b, field))
        return aSel === bSel ? 0 : aSel ? -1 : 1
      })
    : filtered
  const visible = ordered.slice(0, maxVisible)
  const nm = field.name
  const displayText = field.multiple
    ? selectedItems.map(it => getLabel(it, field)).join(', ')
    : (effectiveValue ? (selectedLabel || (field.colorKey ? effectiveValue : '')) : '')
  // Amostra do campo de cor: cor do item selecionado ou, fora da lista, o próprio valor.
  const selectedColor = field.colorKey && !field.multiple && effectiveValue
    ? asText(allData.find(item => getValue(item, field) === effectiveValue)?.[field.colorKey]) || effectiveValue
    : ''
  const inputClass = ['form-control field-select-search', erro ? 'is-invalid' : '', field.className ?? '']
    .filter(Boolean).join(' ')

  // Lista de opções — reaproveitada no dropdown do single e no listbox sempre
  // aberto do múltiplo.
  const listBox = (
    <>
      <select
        multiple={field.multiple}
        value={field.multiple ? effectiveValues : undefined}
        size={rows}
        className="form-select border-0 rounded-0"
        style={{ overflowY: 'auto', cursor: 'pointer', width: '100%' }}
        onChange={e => {
          if (field.multiple) {
            handleMultiChange(e)
            return
          }
          const val = e.target.value
          if (isOptionDisabled(val)) return
          const found = allData.find(item => getValue(item, field) === val)
          if (found) selectItem(found)
        }}
      >
        {visible.map((item, idx) => {
          const val = getValue(item, field)
          const lbl = getLabel(item, field)
          const sel = isSelected(val)
          const dis = isOptionDisabled(val)
          const cor = field.colorKey ? asText(item[field.colorKey]) : ''
          return (
            <option
              key={idx}
              value={val}
              disabled={dis}
              style={
                dis
                  ? { color: '#adb5bd', cursor: 'not-allowed' }
                  : cor
                    ? { background: cor, color: contrastText(cor), fontWeight: sel ? 600 : undefined }
                    : sel
                      ? { background: '#dbeafe', fontWeight: 600 }
                      : undefined
              }
            >
              {sel && !field.multiple ? `✓ ${lbl}` : lbl}
            </option>
          )
        })}
      </select>
      <div className="px-2 py-1 border-top text-muted" style={{ fontSize: '0.68rem', fontStyle: 'italic' }}>
        {filtered.length > maxVisible
          ? `Exibindo ${maxVisible} de ${filtered.length} registros`
          : `${filtered.length} registro${filtered.length !== 1 ? 's' : ''}`}
      </div>
    </>
  )

  return (
    <>
      {field.label && (
        <label htmlFor={field.id} className="form-label fw-semibold">
          {field.label}{field.required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <div ref={containerRef} style={{ position: 'relative' }}>
        <input
          ref={searchRef}
          type="text"
          id={field.id}
          className={inputClass}
          placeholder={isLoading ? 'Carregando...' : (field.placeholder ?? 'Digite para pesquisar...')}
          autoComplete="off"
          spellCheck={false}
          disabled={field.disabled}
          tabIndex={field.tabIndex}
          value={searchText || displayText}
          style={
            hasAnyValue || field.colorKey
              ? {
                  paddingRight: hasAnyValue ? '2rem' : undefined,
                  paddingLeft: field.colorKey ? '2.25rem' : undefined,
                }
              : undefined
          }
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          onKeyDown={handleSearchKeyDown}
        />
        {field.colorKey && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute', left: '0.6rem', top: '50%',
              transform: 'translateY(-50%)', width: '1.1rem', height: '1.1rem',
              borderRadius: '0.2rem', border: '1px solid #ced4da',
              background: selectedColor || 'transparent', pointerEvents: 'none',
            }}
          />
        )}
        {hasAnyValue && !field.disabled && (
          <button
            type="button"
            onClick={clearSelection}
            title="Limpar seleção"
            style={{
              position: 'absolute', right: '0.5rem', top: '50%',
              transform: 'translateY(-50%)', background: 'none',
              border: 'none', color: '#999', fontSize: '1rem',
              lineHeight: 1, padding: 0, cursor: 'pointer'
            }}
          >
            ✕
          </button>
        )}
        {field.multiple
          ? !field.disabled && (
              <div className="mt-1 border rounded" style={{ overflow: 'hidden' }}>
                {listBox}
              </div>
            )
          : isOpen && !field.disabled && (
              <div style={{
                position: 'absolute', zIndex: 1050, width: '100%',
                background: '#fff', border: '1px solid #ced4da', borderTop: 'none',
                borderRadius: '0 0 0.375rem 0.375rem',
                boxShadow: '0 4px 12px rgba(0,0,0,.12)'
              }}>
                {listBox}
              </div>
            )}
      </div>
      {nm && !field.multiple && <input type="hidden" name={nm} value={effectiveValue} />}
      {nm && field.multiple && effectiveValues.map(v => (
        <input key={v} type="hidden" name={nm} value={v} />
      ))}
      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>{erro}</div>
    </>
  )
}

export default SelectField
