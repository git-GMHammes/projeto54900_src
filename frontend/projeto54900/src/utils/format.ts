// Formatadores pt-BR. Sem dependencia externa (Intl nativo).

const dateTimeFmt = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});
const dateFmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });
const numberFmt = new Intl.NumberFormat('pt-BR');

function parseDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null;
  // Aceita "YYYY-MM-DD HH:MM:SS" (MySQL) alem de ISO.
  const iso =
    typeof value === 'string' && value.includes(' ') ? value.replace(' ', 'T') : value;
  const d = iso instanceof Date ? iso : new Date(iso as string | number);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDateTime(value: unknown, fallback = '-'): string {
  const d = parseDate(value);
  return d ? dateTimeFmt.format(d) : fallback;
}

export function formatDate(value: unknown, fallback = '-'): string {
  const d = parseDate(value);
  return d ? dateFmt.format(d) : fallback;
}

export function formatNumber(value: unknown, fallback = '-'): string {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? numberFmt.format(n) : fallback;
}

// Bytes -> "1,2 MB"
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

// Converte qualquer valor vindo da API em texto exibivel, sem cair no
// "[object Object]" do String() nativo.
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

export function truncate(text: unknown, max = 80): string {
  const s = toText(text, '');
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
