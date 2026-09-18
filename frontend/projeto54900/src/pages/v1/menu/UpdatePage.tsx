/**
 * =============================================================================
 * FILE HEADER — UpdatePage (menu) — PLACEHOLDER de edição de item de menu
 * =============================================================================
 *
 * O QUE FAZ (hoje):
 *   Renderiza a casca da tela de edição de um item de `menu_manager`: cabeçalho
 *   com o id vindo da rota e um `<EmptyState>` avisando que o formulário ainda
 *   não existe. NÃO busca o registro e NÃO salva nada.
 *
 * O QUE ESTA PÁGINA VAI SER (o "wiring" que o comentário original preservava):
 *   - PRELOAD: `menuManagerTable.get(id)` + `normalizeItem` — o mesmo caminho
 *     que o `GetPage.tsx` já usa para ler UM item;
 *   - EDIÇÃO: `menuManagerTable.update(id, values)` -> PUT
 *     `/{version}/menu-manager/update/{id}`;
 *   - CAMPOS: `nav_manager_id`, `parent_id`, `title`, `react_route`, `roles`
 *     (select múltiplo — ver `README_campo_json_montado.md`), `sort_order` e
 *     `status` (`active` | `draft` | `inactive`);
 *   - o formulário deve ser montado por `<FormGrid>` (schema), conforme
 *     `src/markdown/geral/README_FormGrid.md` — nada de `<input>` à mão.
 *
 * POR QUE ESTÁ ASSIM: a fábrica de formulários é o passo seguinte; enquanto ela
 *   não chega, a rota existe para o menu de navegação não ter link morto.
 *
 * DEPENDÊNCIAS (hoje): `react-router-dom` (`useParams`) e
 *   `@/components/global` (`PageHeader`, `EmptyState`). Quando o formulário
 *   entrar, somam-se `@/services/v1` (`menuManagerTable`), `@/utils/apiResult`
 *   (`normalizeItem`) e `@/components/ui/FormGrid/Input`.
 *
 * CONSUMIDORES: `src/routes/v1/menu.routes.tsx` (rota `update/:id`, lazy). Os
 *   botões "Editar" do `GetPage.tsx` e do `GetAllPage.tsx` apontam para cá.
 *
 * COMO COMPLETAR (quando a fábrica de formulários chegar):
 *   1. carregue o registro (`useApi` + `normalizeItem`), como no `GetPage`;
 *   2. monte o schema com `<FormGrid>`;
 *   3. no submit, `update(id, values)` com o payload do `FormData`;
 *   4. feedback por `useToast` e navegação de volta para a lista/detalhe.
 * =============================================================================
 */

import { useParams } from 'react-router-dom';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';

/**
 * =============================================================================
 * BLOCO 1 — ROTA (de onde vem o `id`)
 * =============================================================================
 *
 * O QUE FAZ: lê o `id` do item direto do parâmetro de rota (`update/:id`). É a
 *   ÚNICA entrada de dado da página hoje — não há fetch.
 *
 * POR QUE IMPORTA: quando o formulário entrar, este `id` é o que vai em
 *   `menuManagerTable.get(id)` (preload) e em `update(id, values)`. O fallback
 *   `?? ''` evita imprimir "undefined" no título enquanto a rota é montada.
 * -------------------------------------------------------------------------
 */
export default function UpdatePage() {
  const { id } = useParams();

  /**
   * =============================================================================
   * BLOCO 2 — RENDERIZAÇÃO (JSX)
   * =============================================================================
   *
   * O QUE FAZ: dois elementos, na ordem:
   *   1. `<PageHeader>` — título com o id da rota e subtítulo anunciando o
   *      endpoint que esta tela vai usar (PUT `api/v1/menu-manager/update`).
   *   2. `<EmptyState>` — o aviso de placeholder, que enumera os campos
   *      previstos (nav, item pai, título, rota, roles, ordem e status).
   *
   * COMO REAPROVEITAR: quando o `<FormGrid>` entrar, o `<EmptyState>` sai e o
   *   formulário toma o lugar dele; cabeçalho + toast + volta para a lista
   *   seguem o padrão das outras telas de edição (ver `ListBuilderPage.tsx`).
   * -------------------------------------------------------------------------
   */
  return (
    <>
      {/* 1. Cabeçalho: id da rota no título, endpoint previsto no subtítulo. */}
      <PageHeader title={`Editar item de menu #${id ?? ''}`} subtitle="PUT api/v1/menu-manager/update" />

      {/* 2. Placeholder: substituído pelo formulário quando a fábrica chegar. */}
      <EmptyState
        title="Formulario em branco"
        description="Aguardando a fabrica de formularios (FormGrid). Os campos nav, item pai, titulo, rota, roles, ordem e status serao montados por ela."
      />
    </>
  );
}
