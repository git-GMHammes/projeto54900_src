[◄ Índice da base de conhecimento](../README.md)

---

# ⚠️ ALERTA CRÍTICO — não crie UI fora do padrão sem checar a base primeiro

Registrado em 2026-09-14 depois de um erro real: ao montar a sessão de login
(JWT), o link "Entrar" / bloco "usuário + Sair" foi adicionado direto em
`components/layout/Navbar.tsx` como um `<ul>` solto, **sem passar por**
`useSiteMenu()` (que lê `nav-manager`/`menu-manager`). Resultado: um elemento
de navegação que não existe no banco, quebrando a regra "tudo que aparece na
navbar vem de `nav-manager`/`menu-manager`" documentada em
[`README_rotas_frontend.md`](README_rotas_frontend.md#navegação-navbar) — e
sem nenhuma linha nesta pasta que justificasse a exceção.

**Regra:** antes de escrever qualquer elemento novo de UI (item de navbar,
campo de formulário, página, rota), passar pelo checklist abaixo. Se nenhum
item cobrir o caso, é sinal de decisão em aberto — **parar e perguntar**, não
inventar um padrão novo sozinho.

## Checklist — antes de tocar em UI

1. **É um link/item de navegação (navbar, menu, submenu)?**
   → Só existe via `nav-manager`/`menu-manager`, lido por `useSiteMenu()` em
   `Navbar.tsx`. `FALLBACK_NAV` é *só* o fallback estático para quando a API
   falha ou vem vazia — não é lugar para adicionar item novo direto no código.
   Ver [`README_rotas_frontend.md`](README_rotas_frontend.md#navegação-navbar).

2. **É um campo de formulário (input, select, textarea, mascarado)?**
   → Sempre schema JSON + `<FormGrid>`, nunca `<input>`/`<label>` à mão.
   Exceção documentada: chrome que não é campo (cabeçalhos, botões).
   Ver [`README_render_via_formgrid.md`](README_render_via_formgrid.md).

3. **É uma página nova?**
   → `pages/v1/<modulo>/<recurso>/<Acao>Page.tsx`, nomeada pelo verbo do
   endpoint. Fluxo composto (mais de 1 tabela) ganha pasta própria no módulo.
   Ver [`README_paginas_modulo.md`](README_paginas_modulo.md).

4. **É uma rota nova?**
   → Sempre via `routes/paths.ts` (nunca string solta), registrada no
   `*.routes.tsx` do módulo, espelhando `api/v1/<grupo>` do backend.
   Ver [`README_rotas_frontend.md`](README_rotas_frontend.md).

5. **É um campo cujo valor persistido é JSON** (lista, config)?
   → UI comum (multi-select, tags) + par `montar`/`parse`, nunca o usuário
   digitando JSON cru. Ver
   [`README_campo_json_montado.md`](README_campo_json_montado.md).

6. **Não se encaixa em nada acima** (ex.: estado de sessão do usuário logado)?
   → Não é permissão para hardcodar. É sinal de que falta uma decisão — ver
   caso aberto abaixo.

7. **É um modal?**
   → Sempre `modal-dialog-centered` (centralizado no meio da página, nunca
   colado no topo), controlado por estado React (`open` via `useState`), nunca
   `data-bs-toggle`/instância JS do Bootstrap. Ver
   [`README_modal.md`](README_modal.md).

8. **É um campo novo em `form_fields`, sendo publicado num `form_manager`?**
   → `help_text` é **obrigatório**, nunca `NULL`/vazio. É o que aciona o
   tooltip automático (`components/ui/FormGrid/FieldTooltip`) — o
   `FormGrid` já faz isso sozinho via `field.title` (mapeado de
   `fc_help_text`), sem precisar tocar no componente do campo; falta o
   texto é falta de dado, não falta de funcionalidade. Registrado em
   2026-09-20 depois de publicar o form `calendario` com os 10 campos sem
   `help_text` — nenhum deles mostrava tooltip em `/v1/form/calendario` nem
   em `/v1/calendar-manager`.

## Decisão: onde mora o estado de sessão (Entrar/Sair) na navbar

Login/logout não é conteúdo navegável (não tem `href` fixo, muda com quem
está logado) — por isso não se encaixa 1:1 no item 1 do checklist. Três
caminhos eram possíveis:

- **(a) Item real em `menu-manager`**, com um campo/flag que marque "renderiza
  estado de sessão" em vez de um link fixo — mantém 100% do padrão DB-driven,
  mas exige mudança de schema (`menu-manager`) e lógica nova no
  `Navbar.tsx` para interpretar essa flag.
- **(b) Slot configurável em `nav-manager`** (ex.: `show_auth_slot: boolean`) —
  `nav-manager` já é a "casca" da navbar (nome, imagem, ícone); um slot de
  sessão cabe conceitualmente aí, sem virar item de menu.
- **(c) Exceção documentada e deliberada**, no mesmo espírito da exceção do
  `LoginPage.tsx` ao `<FormGrid>` (login não é uma tabela configurável, é
  infraestrutura) — mantém o bloco fora do banco, mas **registrado aqui como
  decisão consciente**, não como o que aconteceu (feito sem checar nada).

**~~Decidido em 2026-09-14: opção (c).~~ REVERTIDO no mesmo dia, a pedido
explícito do usuário** — rejeitou a exceção, exigiu o item real no banco.
**Solução final: opção (a), simplificada.** "Entrar" virou um item comum em
`menu_manager` (`MenuManagerSeeder.php`, `sort_order` 70, `react_route`
`/v1/login`), renderizado pelo mesmíssimo caminho dos outros itens
(`useSiteMenu()` → `Navbar.tsx`) — **sem flag, sem condicional de
`isAuthenticated`**, sempre visível, igual a "Cadastro". O bloco "usuário
logado + Sair" foi removido junto (não recriado — não é link navegável, não
cabe no modelo `menu_manager`; se for pedido depois, é tarefa nova).

Lição: quando o checklist aponta pra "falta decisão", **a decisão não é minha
para tomar sozinho por conveniência** — ofereça as opções, mas não escolha a
de menor esforço sem perguntar quando existe um padrão explícito e repetido
no projeto (aqui, "tudo na navbar vem do banco") que uma das opções
contraria.

---

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo | Informação |
| --- | --- |
| **Nome** | Gustavo Hammes |
| **Local** | Rio de Janeiro |
| **LinkedIn** | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes) |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
