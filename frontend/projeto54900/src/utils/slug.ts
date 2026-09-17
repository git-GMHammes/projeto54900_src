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
