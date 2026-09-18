/**
 * =============================================================================
 * FILE HEADER — CreatePage (menu) — PLACEHOLDER de criação de item de menu
 * =============================================================================
 *
 * O QUE FAZ (hoje):
 *   Renderiza a casca da tela de criação de item de `menu_manager`: cabeçalho
 *   (que já reflete o nav de origem, quando ele vem na querystring) e um
 *   `<EmptyState>` avisando que o formulário ainda não existe. NÃO cria nada.
 *
 * O QUE ESTA PÁGINA VAI SER (o "wiring" que o comentário original preservava):
 *   - CRIAR: `menuManagerTable.create(values)` -> POST
 *     `/{version}/menu-manager/create`;
 *   - `nav_manager_id` vem pré-preenchido do `?nav_manager_id=` da querystring
 *     quando a página é aberta a partir de UM nav;
 *   - CAMPOS: `nav_manager_id` (select ou campo oculto), `parent_id` (select
 *     opcional, restrito ao MESMO nav), `title`, `react_route`, `roles` (select
 *     múltiplo — ver `README_campo_json_montado.md`) e `sort_order`;
 *   - `status` NÃO entra no create: o registro nasce `draft`;
 *   - o formulário deve ser montado por `<FormGrid>` (schema), conforme
 *     `src/markdown/geral/README_FormGrid.md` — nada de `<input>` à mão.
 *
 * POR QUE ESTÁ ASSIM: a fábrica de formulários é o passo seguinte; enquanto ela
 *   não chega, a rota existe para os botões "Novo item" não terem link morto.
 *
 * DEPENDÊNCIAS (hoje): `react-router-dom` (`useSearchParams`) e
 *   `@/components/global` (`PageHeader`, `EmptyState`). Com o formulário:
 *   `@/services/v1` (`menuManagerTable`), `@/components/ui/FormGrid/Input` e
 *   `useToast`.
 *
 * CONSUMIDORES: `src/routes/v1/menu.routes.tsx` (rota `create`, lazy). Aberta
 *   pelos botões "Novo item" da lista/detalhe e pelo botão "Itens" do módulo
 *   nav (que passa o `nav_manager_id`).
 *
 * COMO COMPLETAR (quando a fábrica de formulários chegar):
 *   1. monte o schema com `<FormGrid>`, com `nav_manager_id` inicial vindo da
 *      querystring;
 *   2. no submit, `create(values)` com o payload do `FormData`;
 *   3. feedback por `useToast` e navegação de volta para a lista do nav.
 * =============================================================================
 */

import { useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';

/**
 * =============================================================================
 * BLOCO 1 — ORIGEM DO `nav_manager_id` (querystring)
 * =============================================================================
 *
 * O QUE FAZ: lê `?nav_manager_id=` da URL. É o ÚNICO dado que a tela conhece
 *   hoje — e o único ponto em que esta página difere do fluxo "item solto".
 *
 * POR QUE EXISTE: o módulo nav abre esta página a partir de um nav específico, e
 *   o item precisa nascer ligado a ele. Sem o parâmetro, `navManagerId` é `null`,
 *   o título cai no genérico e o nav continua a ser escolhido no formulário
 *   quando ele existir.
 * -------------------------------------------------------------------------
 */
export default function CreatePage() {
  const [searchParams] = useSearchParams();
  const navManagerId = searchParams.get('nav_manager_id');

  /**
   * =============================================================================
   * BLOCO 2 — RENDERIZAÇÃO (JSX)
   * =============================================================================
   *
   * O QUE FAZ: dois elementos, na ordem:
   *   1. `<PageHeader>` — o título MUDA conforme a origem: com
   *      `?nav_manager_id=` mostra "Novo item (nav #id)"; sem ele, o genérico
   *      "Novo item de menu". O subtítulo anuncia o endpoint de criação.
   *   2. `<EmptyState>` — o aviso de placeholder, que enumera os campos previstos
   *      (nav, item pai, título, rota, roles e ordem).
   *
   * COMO REAPROVEITAR: quando o `<FormGrid>` entrar, o `<EmptyState>` sai e o
   *   formulário toma o lugar dele; o título que reage à querystring continua
   *   valendo, porque é dali que sai o valor inicial de `nav_manager_id`.
   * -------------------------------------------------------------------------
   */
  return (
    <>
      {/* 1. Cabeçalho: título reage ao ?nav_manager_id= da querystring. */}
      <PageHeader
        title={navManagerId ? `Novo item (nav #${navManagerId})` : 'Novo item de menu'}
        subtitle="POST api/v1/menu-manager/create"
      />

      {/* 2. Placeholder: substituído pelo formulário quando a fábrica chegar. */}
      <EmptyState
        title="Formulario em branco"
        description="Aguardando a fabrica de formularios (FormGrid). Os campos nav, item pai, titulo, rota, roles e ordem serao montados por ela."
      />
    </>
  );
}
