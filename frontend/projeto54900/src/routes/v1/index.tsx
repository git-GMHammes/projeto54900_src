/**
 * =========================================================================
 * FILE HEADER — routes/v1/index.tsx
 * =========================================================================
 *
 * O QUE FAZ: agrega as subrotas de TODOS os módulos da versão v1 sob o prefixo
 * "/v1", espelhando o grupo `api/v1` do backend (`app/Config/Routes.php`). O
 * path "/v1" (index) NÃO tem página própria: um loader com `redirect` manda o
 * usuário para a primeira listagem útil (`paths.v1.user.profilesList`).
 *
 * MAPA DOS MÓDULOS (esta é a ordem do array `children`; cada módulo é um arquivo
 * que exporta um array de `RouteObject` e é espalhado aqui):
 *
 *   arquivo              exporta       rotas que registra
 *   auth.routes.tsx   -> authRoutes    login (só a tela de login)
 *   user.routes.tsx   -> userPublicRoutes (cadastro, público) +
 *                         userProtectedRoutes (user-manager/user-profiles, sob RequireAuth)
 *   upload.routes.tsx -> uploadRoutes  upload-manager (somente leitura)
 *   form.routes.tsx   -> formRoutes    construtor de formulários + renderer (/form/:slug)
 *   list.routes.tsx   -> listRoutes    construtor de listagens
 *   nav.routes.tsx    -> navRoutes     nav-manager (a "casca" do app)
 *   menu.routes.tsx   -> menuRoutes    menu-manager (itens de menu)
 *   calendar.routes.tsx -> calendarRoutes  calendar-manager (listagem calendario->eventos)
 *   svgMap.routes.tsx -> svgMapRoutes  svg-map (mapa SVG dos municipios do RJ, rota estatica)
 *
 * DEPENDÊNCIAS (arquivos próprios do projeto):
 *   - `routes/v1/*.routes.tsx` — um arquivo por módulo, cada um exportando seu
 *     próprio array de `RouteObject` (é esse o padrão que este agregador junta).
 *   - `routes/paths` (`paths.v1.user.profilesList`) — destino do redirect do index.
 *   - `react-router-dom` (`redirect` e o tipo `RouteObject`).
 *
 * CONSUMIDORES: `routes/index.tsx` importa `v1Routes` e o registra como FILHO
 *   do `RootLayout`, ao lado de `v1aRoutes` — é lá que o layout da aplicação
 *   (navbar/sidebar) envolve todas as rotas v1.
 *
 * REGRAS DE MANUTENÇÃO / ARMADILHAS:
 *   1. A ORDEM dos módulos no array NÃO decide o matching: o React Router
 *      escolhe pela especificidade dos segmentos (estático vence dinâmico), não
 *      pela posição. Aqui a ordem serve para organização — mantenha agrupada.
 *   2. Estes `path` são ROTAS FILHAS: nenhum começa com "/" nem repete o "v1",
 *      porque o prefixo vem do objeto pai (`path: 'v1'`). Barra inicial em rota
 *      filha é erro silencioso de navegação — é o detalhe que mais aparece em
 *      revisão.
 *   3. `routes/paths.ts` é a FONTE das URLs da aplicação. Ao criar, renomear ou
 *      remover um `path` em qualquer módulo, ajuste `paths.ts` e os consumidores
 *      (navbar, botões das páginas) NO MESMO commit; sem isso a navegação cai no
 *      `NotFoundPage` (o `"*"` de `routes/index.tsx`).
 *   4. Módulo novo NÃO entra aqui antes de existir o arquivo
 *      `routes/v1/<modulo>.routes.tsx` exportando o array — este arquivo só
 *      agrega, não define rota.
 *
 * COMO REGISTRAR UM NOVO MÓDULO v1 (ex.: `relatorio`):
 *   1. criar `routes/v1/relatorio.routes.tsx` exportando `relatorioRoutes`
 *      (`RouteObject[]`), no padrão dos demais `*.routes.tsx` (lazy import das
 *      páginas + `export default` do array);
 *   2. importar o array neste arquivo e acrescentar `...relatorioRoutes` no
 *      `children`, mantendo o agrupamento por módulo;
 *   3. criar as entradas correspondentes em `routes/paths.ts`;
 *   4. atualizar `README_rotas_frontend.md` com a nova seção `relatorio`.
 * -------------------------------------------------------------------------
 */

import { redirect } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { paths } from '@/routes/paths';
import RequireAuth from '@/routes/RequireAuth';
import { authRoutes } from './auth.routes';
import { userPublicRoutes, userProtectedRoutes } from './user.routes';
import { accountRoutes } from './account.routes';
import { uploadRoutes } from './upload.routes';
import { formRoutes } from './form.routes';
import { listRoutes } from './list.routes';
import { navRoutes } from './nav.routes';
import { menuRoutes } from './menu.routes';
import { calendarRoutes } from './calendar.routes';
import { svgMapRoutes } from './svgMap.routes';

/**
 * =========================================================================
 * BLOCO 1 — O AGREGADOR
 * =========================================================================
 *
 * O QUE FAZ: declara o objeto de rota PAI (`path: 'v1'`) e espalha, como
 * filhos, os arrays de cada módulo. É um `RouteObject` ÚNICO (e não um array)
 * porque este arquivo representa o "módulo raiz" da versão — os arrays ficam em
 * cada `*.routes.tsx`.
 *
 * COMPOSIÇÃO, na ordem:
 *   1. `index: true` com `loader: () => redirect(...)` -> "/v1" não tem tela:
 *      manda para a primeira listagem útil do sistema;
 *   2. `...authRoutes`, `...userRoutes`, `...uploadRoutes`, `...formRoutes`,
 *      `...listRoutes`, `...navRoutes`, `...menuRoutes` — os sete módulos, na
 *      mesma ordem listada no mapa do header.
 *
 * POR QUE `...` (spread) E NÃO ANINHAR: cada módulo já é um array de rotas
 *   filhas; espalhar mantém o nível achatado — qualquer nova rota de módulo
 *   herda o layout do `RootLayout` sem precisar de rota intermediária.
 *
 * COMO REAPROVEITAR: para uma versão nova (ex.: "v2"), copie este arquivo para
 *   `routes/v2/index.tsx`, troque `path` para 'v2' e os imports para
 *   `routes/v2/*`, e registre o resultado em `routes/index.tsx` ao lado deste.
 * -------------------------------------------------------------------------
 */
export const v1Routes: RouteObject = {
  path: 'v1',
  children: [
    // /v1 -> não tem página: redireciona para a primeira listagem útil.
    { index: true, loader: () => redirect(paths.v1.user.profilesList) },
    // Público: login e as duas etapas do Cadastro de Usuário — únicas telas
    // deste bloco acessíveis sem sessão. Todo o resto vive sob <RequireAuth/>.
    ...authRoutes,
    ...userPublicRoutes,
    {
      element: <RequireAuth />,
      children: [
        ...userProtectedRoutes,
        ...accountRoutes,
        ...uploadRoutes,
        ...formRoutes,
        ...listRoutes,
        ...navRoutes,
        ...menuRoutes,
        ...calendarRoutes,
        ...svgMapRoutes,
      ],
    },
  ],
};

export default v1Routes;
