/**
 * =========================================================================
 * FILE HEADER — utils/format.ts
 * =========================================================================
 *
 * PROPOSITO: formatadores de exibicao em pt-BR (data/hora, numero, bytes,
 * texto generico). Sem dependencia externa — usa so o Intl nativo do
 * browser.
 *
 * DEPENDENCIAS: nenhuma (arquivo autocontido).
 * CONSUMIDORES: paginas de detalhe/listagem que exibem valores vindos da
 * API (ex.: pages/v1/user/user-manager/GetPage.tsx, pages/v1/template/temp-menu/GetAllPage.tsx,
 * pages/v1/template/temp-menu/GetPage.tsx, pages/v1/template/temp-nav/GetPage.tsx,
 * pages/v1/upload/UploadViewPage.tsx) e utils/validation.ts (usa toText
 * para normalizar o valor antes de validar).
 *
 * COMO REAPROVEITAR: importar a funcao especifica (formatDate,
 * formatDateTime, formatNumber, formatBytes, toText, truncate) — todas
 * aceitam `unknown` e devolvem um fallback textual seguro em vez de lancar,
 * prontas para exibir direto em JSX.
 * -------------------------------------------------------------------------
 */

/*
CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:39:09
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\utils\format.ts
BLOCO ADICIONADO - 2 linhas (34 a 35 neste arquivo editado):
import { aplicarMascara } from '@/components/ui/FormGrid/phone/mask';

Antes de : (linha em branco)
Depois de : const dateTimeFmt = new Intl.DateTimeFormat('pt-BR', {
Motivo: importar a mascara de telefone ja usada no FormGrid.
*/
import { aplicarMascara } from '@/components/ui/FormGrid/phone/mask';

const dateTimeFmt = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});
const dateFmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });
const numberFmt = new Intl.NumberFormat('pt-BR');
/*
CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:39:09
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\utils\format.ts
BLOCO ADICIONADO - 17 linhas (67 a 83 neste arquivo editado):

// CPF com 11 digitos -> 000.000.000-00; outro tamanho devolve o texto cru. So exibicao: o banco guarda sem mascara.
export function formatCpf(value: unknown, fallback = ''): string {
const text = toText(value, '');
const d = text.replace(/\D/g, '');
if (d.length !== 11) return text === '' ? fallback : text;
return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

// Telefone com 10 ou 11 digitos -> (NN) NNNN-NNNN / (NN) NNNNN-NNNN; outro tamanho devolve o texto cru. So exibicao.
export function formatPhone(value: unknown, fallback = ''): string {
const text = toText(value, '');
const d = text.replace(/\D/g, '');
if (d.length !== 10 && d.length !== 11) return text === '' ? fallback : text;
return aplicarMascara(d);
}

Antes de : const numberFmt = new Intl.NumberFormat('pt-BR');
Depois de : (linha em branco)
Motivo: formatadores de exibicao de CPF e telefone (o dado no banco continua sem mascara).
*/

// CPF com 11 digitos -> 000.000.000-00; outro tamanho devolve o texto cru. So exibicao: o banco guarda sem mascara.
export function formatCpf(value: unknown, fallback = ''): string {
  const text = toText(value, '');
  const d = text.replace(/\D/g, '');
  if (d.length !== 11) return text === '' ? fallback : text;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

// Telefone com 10 ou 11 digitos -> (NN) NNNN-NNNN / (NN) NNNNN-NNNN; outro tamanho devolve o texto cru. So exibicao.
export function formatPhone(value: unknown, fallback = ''): string {
  const text = toText(value, '');
  const d = text.replace(/\D/g, '');
  if (d.length !== 10 && d.length !== 11) return text === '' ? fallback : text;
  return aplicarMascara(d);
}


function parseDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null;
  // Aceita "YYYY-MM-DD HH:MM:SS" (MySQL) alem de ISO.
  const iso =
    typeof value === 'string' && value.includes(' ') ? value.replace(' ', 'T') : value;
  const d = iso instanceof Date ? iso : new Date(iso as string | number);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Formata data+hora no padrao pt-BR curto (ex.: "17/09/2026 17:45"). @param value string/Date/numero aceito por parseDate */
export function formatDateTime(value: unknown, fallback = '-'): string {
  const d = parseDate(value);
  return d ? dateTimeFmt.format(d) : fallback;
}

/** Formata so a data no padrao pt-BR curto (ex.: "17/09/2026"). @param value string/Date/numero aceito por parseDate */
export function formatDate(value: unknown, fallback = '-'): string {
  const d = parseDate(value);
  return d ? dateFmt.format(d) : fallback;
}

/** Formata numero com separador de milhar/decimal pt-BR. @param value qualquer valor coercivel a Number */
export function formatNumber(value: unknown, fallback = '-'): string {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? numberFmt.format(n) : fallback;
}

/** Converte bytes para a unidade legivel mais proxima (ex.: 1234567 -> "1,2 MB"). @param bytes numero de bytes */
export function formatBytes(bytes: unknown, fallback = '-'): string {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n < 0) return fallback;
  if (n === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  const unit = units[i] ?? 'B';
  const val = n / 1024 ** i;
  return `${numberFmt.format(Number(val.toFixed(i === 0 ? 0 : 1)))} ${unit}`;
}

/**
 * Converte qualquer valor vindo da API em texto exibivel, sem cair no
 * "[object Object]" do String() nativo — objeto/array vira JSON.stringify.
 * @param value valor de qualquer tipo (string/numero/boolean/Date/objeto/etc.)
 */
export function toText(value: unknown, fallback = '-'): string {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

/** Corta texto longo com reticencia ("…") no limite `max`, via toText(). @param text qualquer valor aceito por toText */
export function truncate(text: unknown, max = 80): string {
  const s = toText(text, '');
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
