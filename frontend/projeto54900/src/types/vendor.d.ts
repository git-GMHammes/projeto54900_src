/**
 * =============================================================================
 * FILE HEADER — vendor.d.ts (types) — declaração de módulo de terceiro
 * =============================================================================
 *
 * O QUE FAZ:
 *   Arquivo de DECLARAÇÃO de tipos (`.d.ts`): não gera JavaScript, só informa ao
 *   TypeScript que um módulo de TERCEIRO existe e pode ser importado, mesmo sem
 *   tipos próprios publicados no pacote.
 *
 * QUAL MÓDULO E POR QUÊ:
 *   `bootstrap/dist/js/bootstrap.bundle.min.js` (Bootstrap 5) — o bundle é
 *   importado APENAS por EFEITO COLATERAL em `src/bootstrap.ts`, e é esse import
 *   que liga ao DOM os componentes dirigidos por `data-attributes` (dropdown,
 *   modal, collapse). Sem esta declaração, esse import não compila.
 *
 * O QUE ESTA DECLARAÇÃO NÃO É (importante na manutenção):
 *   não é a tipagem da API JavaScript do Bootstrap. `declare module` SEM corpo
 *   diz apenas "este caminho existe": não há `Modal`, `Dropdown` nem qualquer
 *   export daqui. Por decisão do projeto, os componentes são acionados por
 *   `data-attributes` (e por helpers/refs próprios), não pela API JS.
 *
 * DEPENDÊNCIAS: nenhuma (é arquivo de declaração). Ele próprio é consumido pelo
 *   `import 'bootstrap/dist/js/bootstrap.bundle.min.js'` de `src/bootstrap.ts`.
 *
 * COMO DECLARAR OUTRA LIB SEM TIPOS:
 *   1. `declare module '<caminho-de-import>'` sem corpo, se o uso for só efeito
 *      colateral;
 *   2. se precisar de TIPOS, escreva o corpo do módulo (as assinaturas reais);
 *   3. alternativa mais completa: instalar o pacote de tipos (`@types/<lib>`) e
 *      apagar a declaração local. Prefira essa opção quando a lib tiver API em uso.
 * =============================================================================
 */

/**
 * =============================================================================
 * BLOCO 1 — A DECLARAÇÃO
 * =============================================================================
 *
 * `declare module '<caminho>'` SEM corpo libera o import de efeito colateral.
 *   O caminho tem de ser EXATAMENTE o mesmo usado no import de
 *   `src/bootstrap.ts` — caminho diferente cria uma declaração que não vale para
 *   o import real, e o erro só aparece na compilação.
 *
 * CONTRATO IMPLÍCITO: nada exportado deste módulo tem tipo (é `any`, quando
 *   existir). Se o projeto passar a usar a API JS do Bootstrap, este bloco deixa
 *   de bastar: será preciso tipar os exports de verdade.
 * -------------------------------------------------------------------------
 */
declare module 'bootstrap/dist/js/bootstrap.bundle.min.js';
