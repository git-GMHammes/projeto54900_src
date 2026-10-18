/**
 * =========================================================================
 * FILE HEADER — utils/slug.ts
 * =========================================================================
 *
 * PROPOSITO: geracao de slug kebab-case a partir de texto livre.
 *
 * DEPENDENCIAS: nenhuma (arquivo autocontido; usa String.prototype.normalize nativo).
 * CONSUMIDORES: pages/v1/form/FormBuilderPage.tsx (titulo -> slug automatico,
 * tanto no form_manager quanto no form_groups, enquanto o "slug automatico"
 * estiver ligado na UI) e pages/v1/list/ListBuilderPage.tsx (mesmo padrao
 * para list_manager).
 *
 * COMO REAPROVEITAR EM OUTRO CONSTRUTOR: chamar slugify(titulo) ao digitar,
 * mas so enquanto o usuario nao tiver editado o slug manualmente — desligar
 * o "auto" assim que o campo slug for tocado a mao (ver FormBuilderPage
 * para o padrao de toggle usado hoje).
 * -------------------------------------------------------------------------
 */

/**
 * `NFD` → remove diacríticos → lowercase → `[^a-z0-9]+` vira `-` → tira `-` das pontas.
 * "Cadastro de Funcionário" -> "cadastro-de-funcionario".
 */
export function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Carimbo AAAAMMDDHHMMSS (ano, mes, dia, hora, minuto, segundo) do horario local. */
export function slugStamp(date: Date = new Date()): string {
  const two = (n: number): string => String(n).padStart(2, '0');
  return (
    String(date.getFullYear()) +
    two(date.getMonth() + 1) +
    two(date.getDate()) +
    two(date.getHours()) +
    two(date.getMinutes()) +
    two(date.getSeconds())
  );
}

/**
 * Slug unico para cadastro: `slugify(texto)` + `_AAAAMMDDHHMMSS`.
 * "Engenho Novo" -> "engenho-novo_20261011173327". Texto vazio -> '' (sem carimbo).
 */
export function stampedSlug(texto: string, date: Date = new Date()): string {
  const base = slugify(texto).slice(0, 120);
  return base === '' ? '' : `${base}_${slugStamp(date)}`;
}

/** Sufixo aleatorio de 2 letras (A-Z) e 2 numeros (0-9): "KX42". */
export function randomSuffix(): string {
  const letter = (): string => String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const digit = (): string => String(Math.floor(Math.random() * 10));
  return letter() + letter() + digit() + digit();
}

/** Codigo curto para cadastro: `slugify(texto)-SUFIXO`; texto vazio -> so o sufixo. "Sala 3" + "KX42" -> "sala-3-KX42". */
export function codeWithSuffix(texto: string, suffix: string): string {
  const base = slugify(texto).slice(0, 40);
  return base === '' ? suffix : `${base}-${suffix}`;
}
