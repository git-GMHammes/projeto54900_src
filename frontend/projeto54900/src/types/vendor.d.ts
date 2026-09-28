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
 *   `bootstrap/dist/js/bootstrap.bundle.min.js` (Bootstrap 5) — ÚNICO arquivo
 *   físico do Bootstrap importado no projeto, dos dois jeitos:
 *     - por EFEITO COLATERAL em `src/bootstrap.ts` (liga ao DOM os componentes
 *       dirigidos por `data-attributes`: dropdown, modal, collapse);
 *     - por IMPORT NOMEADO em `hooks/useBootstrapTooltips.ts` (`Tooltip`).
 *   Sem esta declaração, nenhum dos dois imports compila.
 *
 * ARMADILHA JÁ CAÍDA NELA — NUNCA usar o especificador genérico `'bootstrap'`:
 *   até 2026-09-27 este arquivo tinha DUAS declarações separadas — uma pra
 *   este caminho (vazia) e outra pra `'bootstrap'` (só tipando `Tooltip`).
 *   O bundler resolve `'bootstrap'` pra `bootstrap/dist/js/bootstrap.esm.js`
 *   — um ARQUIVO DIFERENTE, que reexporta TODOS os componentes (Dropdown
 *   incluso) e se autorregistra num listener de clique no `document` só de
 *   ser carregado. Com as duas cópias do Bootstrap coexistindo (uma pelo
 *   bundle, outra só por causa do import do `Tooltip`), cada clique num
 *   dropdown da navbar acionava DOIS listeners independentes — um abria, o
 *   outro fechava de novo no mesmo clique, e o menu parecia travado (só em
 *   páginas que carregassem `useBootstrapTooltips`, ex.: Timeline/PostCard).
 *   Fix: os DOIS imports (efeito colateral E nomeado) usam sempre este MESMO
 *   caminho — nunca `'bootstrap'` puro.
 *
 * O QUE ESTA DECLARAÇÃO NÃO É (importante na manutenção):
 *   não é a tipagem completa da API JavaScript do Bootstrap — só o `Tooltip`
 *   (único componente acionado pela API JS; dropdown/collapse/offcanvas
 *   continuam só por `data-attributes`, sem tipo aqui).
 *
 * DEPENDÊNCIAS: nenhuma (é arquivo de declaração). Consumido por
 *   `import 'bootstrap/dist/js/bootstrap.bundle.min.js'` (`src/bootstrap.ts`,
 *   efeito colateral) e por
 *   `import { Tooltip } from 'bootstrap/dist/js/bootstrap.bundle.min.js'`
 *   (`hooks/useBootstrapTooltips.ts`, import nomeado).
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
 * A DECLARAÇÃO (efeito colateral + Tooltip, um único módulo/caminho)
 * =============================================================================
 *
 * O caminho tem de ser EXATAMENTE o mesmo usado nos dois imports reais —
 *   caminho diferente cria uma declaração que não vale para o import, e o
 *   erro só aparece na compilação.
 *
 * `Tooltip` é tipado (construir a instância e destruí-la via `dispose`) por
 *   ser a única chamada feita em `hooks/useBootstrapTooltips.ts`. Tudo mais
 *   exportado deste módulo (Dropdown, Modal, ...) continua sem tipo aqui —
 *   se outro componente da API JS passar a ser usado, amplie este bloco ou
 *   migre para `@types/bootstrap`.
 * -------------------------------------------------------------------------
 */
declare module 'bootstrap/dist/js/bootstrap.bundle.min.js' {
  export class Tooltip {
    constructor(element: Element, options?: Record<string, unknown>);
    dispose(): void;
  }
}
