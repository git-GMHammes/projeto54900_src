/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/arquivo/index.tsx
 * =========================================================================
 *
 * CONEXAO COM O FORMGRID:
 *   - field.type que ativa este componente: 'arquivo'
 *   - Despachado por components/ui/FormGrid/Input/index.tsx (<FormGrid>)
 *   - Props do schema lidas aqui: col, label, name, required, disabled,
 *     accept (lista de tipos aceitos pelo seletor do navegador — opcional,
 *     so filtro de UX; quem valida extensao/MIME/tamanho e o backend)
 *
 * CONEXAO COM A PAGINA:
 *   - O valor e coletado via: o proprio <input type="file" name={field.name}>
 *     (UM arquivo — sem `multiple`, de proposito: o anexo da Timeline aceita
 *     1 arquivo por publicacao)
 *   - A chave no FormData e: field.name, com valor `File`.
 *   - ATENCAO: `formDataToPayload` (utils/formSubmit.ts) IGNORA valores que
 *     nao sao string — o arquivo NAO entra no payload JSON. A pagina precisa
 *     ler o `File` do FormData por conta propria e envia-lo em multipart
 *     (ex.: pages/v1/timeline/home-feed/NewPostModal.tsx).
 *
 * DEPENDENCIAS: nenhuma (nao usa ../emitValue — o input de arquivo e nativo).
 * COMO CRIAR UM COMPONENTE DE CAMPO SIMILAR: ver README_comenta-codigo-didatico.md
 * secao 5 (Bloco C).
 * -------------------------------------------------------------------------
 */

import { useRef, useState } from 'react'
import type { ChangeEvent, ChangeEventHandler, CSSProperties } from 'react'

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ArquivoFieldSchema {
  type: 'arquivo'
  col: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label?: string
  id?: string
  name?: string
  /** Atributo `accept` do input (ex.: 'image/*,video/*,.pdf'). Omitido = qualquer arquivo. */
  accept?: string
  /** Tamanho máximo em MB. Omitido = MAX_UPLOAD_MB (teto de upload do sistema). */
  maxSizeMb?: number
  disabled?: boolean
  required?: boolean
  className?: string
  style?: CSSProperties
  /** Texto de ajuda (fc_help_text) — exibido só no ícone de ajuda ao lado do campo (FieldTooltip), NUNCA como title deste elemento. */
  title?: string
  hidden?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Teto de upload do sistema (2026-09-28): 20 MB. O mesmo valor está no nginx
 * (client_max_body_size), no PHP (upload_max_filesize/post_max_size) e em
 * app/Config/Upload.php — mudar aqui exige mudar nas quatro camadas.
 */
export const MAX_UPLOAD_MB = 20

/** Tamanho legível (B/KB/MB) para o resumo do arquivo escolhido. */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface ArquivoFieldProps { field: ArquivoFieldSchema }

/** Input de arquivo único + resumo (nome/tamanho) + botão para limpar a escolha. */
export function ArquivoField({ field }: ArquivoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const escolhido = e.target.files?.[0] ?? null
    const maxMb = field.maxSizeMb ?? MAX_UPLOAD_MB

    // Acima do teto: recusa já no campo (limpa o input — o arquivo não vai no envio).
    if (escolhido && escolhido.size > maxMb * 1024 * 1024) {
      e.target.value = ''
      setArquivo(null)
      setErro(`Arquivo muito grande (${formatSize(escolhido.size)}). O máximo é ${maxMb} MB.`)
      field.onChange?.(e)
      return
    }

    setArquivo(escolhido)
    setErro(field.required && !escolhido ? `${field.label ?? 'Arquivo'} é obrigatório` : null)
    field.onChange?.(e)
  }

  // Limpa o input nativo (value = '' é a única forma de "desescolher" um arquivo).
  function limpar() {
    if (inputRef.current) inputRef.current.value = ''
    setArquivo(null)
    setErro(null)
  }

  const inputClass = ['form-control', erro ? 'is-invalid' : '', field.className ?? '']
    .filter(Boolean).join(' ')

  return (
    <>
      {field.label && (
        <label htmlFor={field.id} className="form-label">
          {field.label}{field.required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        type="file"
        id={field.id}
        name={field.name}
        className={inputClass}
        style={field.style}
        accept={field.accept}
        disabled={field.disabled}
        required={field.required}
        onChange={handleChange}
      />
      {arquivo && (
        <div className="d-flex align-items-center gap-2 small text-body-secondary mt-1">
          <i className="bi bi-paperclip" />
          <span className="text-truncate">{arquivo.name}</span>
          <span>({formatSize(arquivo.size)})</span>
          <button type="button" className="btn btn-link btn-sm p-0 text-danger" onClick={limpar} disabled={field.disabled}>
            remover
          </button>
        </div>
      )}
      <div className="text-danger small mt-1" style={{ minHeight: '1.25rem' }}>{erro}</div>
    </>
  )
}

export default ArquivoField
