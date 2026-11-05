// Tipos de valor dos campos do SGD: cada tipo recebe o texto lido do documento e devolve o valor pronto
// para gravar (sem mascara, decimal com ponto, data ISO) ou corrige o que o OCR leu de errado naquele
// formato. Qual campo usa qual tipo e declarado em JSON (catalogs/sgd/tipos.json: `chave -> tipo`);
// o codigo da extracao nao conhece nenhum campo. Tipo novo: uma funcao aqui + uma linha no JSON.
//
// Valor que nao cabe no formato (ex.: CPF com 10 digitos, data 31/02) volta como foi lido — o erro fica
// visivel em vez de virar dado errado.

/** `string` = valor unico; objeto = valor principal + partes extras (chave do campo + `_` + sufixo). */
export type Normalized = string | { value: string; extra: Readonly<Record<string, string>> };

export type ValueNormalizer = (value: string) => Normalized;

// OCR costuma ler o `@` errado. E-mail sem `@` e todo em minusculo salvo uma letra: essa letra e o `@`.
// So troca se o resultado for um e-mail valido.
const email: ValueNormalizer = (value) => {
  if (value.includes('@')) return value;
  if ((value.match(/[A-Z]/g)?.length ?? 0) !== 1) return value;
  const repaired = value.replace(/[A-Z]/, '@');
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(repaired) ? repaired : value;
};

// Remove a mascara e fica so com os digitos, se a quantidade bater (CPF 11, CNPJ 14, CEP 8).
// O OCR le o zero como a letra "o" ("11.222.333/o001-81"): a letra vale zero nesses formatos so de digitos.
const digits =
  (length: number): ValueNormalizer =>
  (value) => {
    const only = value.replace(/[oO]/g, '0').replace(/\D/g, '');
    return only.length === length ? only : value;
  };

// Telefone so com digitos: DDD + numero (10 ou 11 digitos); o prefixo do pais (55) e descartado.
const phone: ValueNormalizer = (value) => {
  let only = value.replace(/\D/g, '');
  if ((only.length === 12 || only.length === 13) && only.startsWith('55')) only = only.slice(2);
  return only.length === 10 || only.length === 11 ? only : value;
};

// RG sem pontos, tracos e espacos: digitos com verificador opcional `X` (ex.: `12.345.678-X` -> `12345678X`).
// O RG varia por estado, entao nao se fixa o tamanho; com letras fora do verificador volta como foi lido.
const rg: ValueNormalizer = (value) => {
  const compact = value.replace(/[\s.-]/g, '').toUpperCase();
  return /^\d{5,10}X?$/.test(compact) ? compact : value;
};

// "R$ 8.500,00" -> "8500.00" (decimal com ponto, 2 casas, pronto para DECIMAL do banco).
const money: ValueNormalizer = (value) => {
  let amount = value.replace(/R\$|\s/gi, '');
  if (amount.includes(',')) amount = amount.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(amount)) amount = amount.replace(/\./g, '');
  return /^\d+(\.\d+)?$/.test(amount) ? Number(amount).toFixed(2) : value;
};

const pad = (n: string): string => n.padStart(2, '0');

// "12/12/2026" -> "2026-12-12"; com horario ("12/12/2026 14:30") o horario sai separado: "14:30:00".
const MONTHS = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// "2 de novembro de 2026" -> "2/11/2026" (segue para o tratamento numerico); mes desconhecido: null.
// Varios dias antes do mes ("10 e 11 de novembro de 2026", "10 a 12 de ...") valem pelo primeiro.
const spelledDate = (value: string): string | null => {
  const m = /^(\d{1,2})(?:\s*(?:e|a|à|,|-|–)\s*\d{1,2})*\s+de\s+(\p{L}+)\s+de\s+(\d{4})(?:,\s*[\p{L}-]+)?$/iu.exec(value.trim());
  const month = m?.[2] ? MONTHS.indexOf(m[2].normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()) : -1;
  return m && month >= 0 ? `${m[1] ?? ''}/${String(month + 1)}/${m[3] ?? ''}` : null;
};

const date: ValueNormalizer = (raw) => {
  const value = spelledDate(raw) ?? raw;
  const m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})(?:\s+(?:as\s+|às\s+)?(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/i.exec(value.trim());
  if (!m) return value;

  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const calendar = new Date(Date.UTC(year, month - 1, day));
  if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day) {
    return value;
  }
  const iso = `${String(year)}-${pad(String(month))}-${pad(String(day))}`;
  if (m[4] === undefined || m[5] === undefined) return iso;

  const [hour, minute, second] = [Number(m[4]), Number(m[5]), Number(m[6] ?? '0')];
  if (hour > 23 || minute > 59 || second > 59) return value;
  return { value: iso, extra: { time: `${pad(String(hour))}:${pad(String(minute))}:${pad(String(second))}` } };
};

// "Mariana Souza - Coordenadora de RH, Departamento de Pessoal" -> nome, `position` e `department`.
// O travessao que separa o nome do cargo pode sair do OCR como espaco duplo. Sem separador, volta cru.
const person: ValueNormalizer = (value) => {
  const [name, ...rest] = value.split(/\s+[–—-]\s+|\s{2,}/);
  const detail = rest.join(' ').trim();
  if (!name || !detail) return value;

  const [position, ...department] = detail.split(/\s*,\s*/);
  const extra: Record<string, string> = {};
  if (position) extra.position = position.trim();
  if (department.length > 0) extra.department = department.join(', ').trim();
  return { value: name.trim(), extra };
};

// "14h30 as 16h" -> inicio "14:30:00" e, em `end`, o fim "16:00:00"; um horario so, sem `end`.
const time: ValueNormalizer = (value) => {
  const stamps = [...value.matchAll(/(\d{1,2})\s*(?:h|:)\s*(\d{2})?/gi)].map((m) => {
    const [hour, minute] = [Number(m[1]), Number(m[2] ?? '0')];
    return hour <= 23 && minute <= 59 ? `${pad(String(hour))}:${pad(String(minute))}:00` : null;
  });
  const [start, end] = stamps;
  if (!start) return value;
  return end ? { value: start, extra: { end } } : start;
};

// "Eng. Sandro Moreira – CREA 123456-D" -> "Eng. Sandro Moreira" (so a parte antes do travessao, ou antes de
// "CPF"/"CNPJ"/"CREA" quando o OCR perde o travessao).
const beforeDash: ValueNormalizer = (value) => value.split(/\s+[–—-]\s+|\s+(?=(?:CPF|CNPJ|CREA)\b)/)[0]?.trim() || value;

// "SEl nº 0012298" ou "(SEI nº 0012298)" -> "(SEI nº 0012298)": sempre entre parenteses, e o "SEI" que o OCR le
// como "SEl"/"SE1" volta a "SEI".
const parenthesized: ValueNormalizer = (value) => {
  const inner = value
    .replace(/^\(\s*|\s*\)$/g, '')
    .replace(/\bSE[l1]\b/g, 'SEI')
    .replace(/\s+/g, ' ')
    .trim();
  return inner ? `(${inner})` : value;
};

/** Chave do campo extra: `<chave>_<sufixo>`; em chave `x_name` o sufixo vai na base (`x_position`, nao `x_name_position`). */
export const extraKey = (key: string, suffix: string): string => `${key.replace(/_name$/, '')}_${suffix}`;

export const valueTypes: Readonly<Record<string, ValueNormalizer>> = {
  email,
  cpf: digits(11),
  cnpj: digits(14),
  cep: digits(8),
  phone,
  rg,
  money,
  before_dash: beforeDash,
  parenthesized,
  date,
  person,
  time,
};
