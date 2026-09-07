// Geração de slug kebab-case a partir de texto livre.
// Uso: slug automático no construtor de formulários (título -> slug, tanto no
// form_manager quanto no form_groups, enquanto o slugAuto estiver ligado).

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
