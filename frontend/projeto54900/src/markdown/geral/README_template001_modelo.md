[◄ Índice da base de conhecimento](../README.md)

---

# Template001 — modelo de referência para templates por empresa

O Template001 é uma página estática construída para validar, passo a passo, o
desenho `doc/drawio_svg/template_001.drawio`. **Ele não será usado como está.**
Serve de **modelo** para as integrações complexas em que cada empresa terá o
próprio template: o que foi decidido aqui (dados em JSON, tema por paleta,
Bootstrap primeiro, responsivo até TV, regiões fecháveis) é o padrão a repetir.

Rota de demonstração: `/<slug-da-empresa>/template001` (ex.: `/default/template001`).
Pública, sem API, sem `RequireAuth`, e **fora do layout global** (`TemplateLayout`; o modelo estático traz o
próprio cabeçalho, nav, menu e rodapé, então a navbar do app não se repete).

---

## 1. Mapa de arquivos

Base: `src/frontend/projeto54900/`.

| Arquivo                                                                                                       | Papel                                                           |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `src/pages/Template001/Template001Page.tsx`                                                                   | página: monta as 5 regiões lendo o JSON e o tema                |
| `src/pages/Template001/template001.json`                                                                      | dados estáticos do conteúdo, em arrays (no futuro vêm do banco) |
| `src/routes/template001.routes.tsx`                                                                           | rota lazy `/template001`                                        |
| `src/routes/paths.ts`                                                                                         | constante `paths.template001`                                   |
| `src/routes/index.tsx`                                                                                        | registra `template001Routes` fora do `RootLayout`               |
| `src/config/env.ts` e `src/vite-env.d.ts`                                                                     | chave `env.theme` (`VITE_THEME`, padrão `Blue_white`)           |
| `src/config/theme.ts`                                                                                         | carrega as paletas, escolhe a ativa e gera as variáveis CSS     |
| `src/config/themes/*.json`                                                                                    | uma paleta de cores por arquivo (11 hoje)                       |
| `src/styles/_custom.scss`                                                                                     | o 1% de CSS fora do Bootstrap (ver seção 7)                     |
| `src/styles/_animations.scss`                                                                                 | animações do template, escopadas em `.template001` (seção 12)   |
| `src/hooks/useScrolled.ts` e `src/hooks/useReveal.ts`                                                         | JS das animações: rolagem da página e revelação ao rolar        |
| `public/img/template001/header_background.png` e `footer_detail.png`                                          | imagens estáticas                                               |
| `doc/drawio_svg/template_001.drawio`, `template_001.png`, `img_cabecalho_fundo.png`, `img_rodape_detalhe.png` | desenho de origem e imagens originais (não são lidos pelo app)  |
| `src/markdown/geral/README_temas_paleta.md`                                                                   | contrato detalhado das paletas                                  |

Os arquivos de plano ficam fora do projeto, em `C:\laragon\www\Claude\plano\`.

---

## 2. JSON de conteúdo (`template001.json`)

Tudo que aparece na tela vem do JSON, em **arrays**, para o dado poder vir do
banco sem mexer no markup. Chaves em inglês técnico; os textos de exemplo ficam
em português.

| Chave                       | Item do array                                             |
| --------------------------- | --------------------------------------------------------- |
| `template`                  | objeto `{ id, source }`                                   |
| `header.background_image[]` | `{ id, url, alt }`                                        |
| `header.logo[]`             | `{ id, position, text, image_url, alt }`                  |
| `header.company_name[]`     | `{ id, text }`                                            |
| `nav[]`                     | `{ id, order, label, url, type }`                         |
| `menu[]`                    | `{ id, order, label, url }`                               |
| `content_headings[]`        | `{ id, order, row, column, columns_in_row, title, text }` |
| `footer.footer_headings[]`  | `{ id, order, column, title, text }`                      |
| `footer.footer_images[]`    | `{ id, order, column, url, alt }`                         |

Regras de leitura:

- **Logomarca:** `position` é `left`, `center` ou `right`. Com `image_url`
  preenchida a imagem substitui o texto (`text`). O cliente escolhe uma logomarca,
  escrita ou imagem, e onde ela fica; não são mais três placeholders.
- **Ordem:** `nav`, `menu` e o rodapé são ordenados por `order`.
- **Conteúdo:** agrupado por `row` e ordenado por `column`; `columns_in_row`
  (1 ou 2) define a largura de cada bloco. O desenho tem 3 linhas de 1 coluna,
  1 linha de 2 colunas e 1 linha de 1 coluna.
- **Rodapé:** textos e imagem ocupam as colunas na ordem de `order` (no desenho:
  texto, imagem, texto, texto). A chave `column` existe no contrato, mas a ordem
  de exibição usa `order`.
- **Nav:** `type` (`link`, `user`, `logout`) está no contrato para o futuro
  (usuário e sair); a página ainda trata todos como link.
- O desenho tem 19 itens `NAV` mais `USUARIO` e `SAIR`, e 20 itens `MENU`
  (contagem feita a olho no desenho).

---

## 3. Regiões e responsividade

Cinco regiões: **cabeçalho**, **nav**, **menu lateral**, **conteúdo** e **rodapé**.
O template ocupa a tela toda (`min-vh-100`) com uma margem mínima de `p-1`, que é
o espaço reservado ao efeito 3D das bordas. Não há largura máxima: do celular
menor até a TV, tudo se contrai ou expande.

| Faixa                            | Nav                                                      | Menu lateral                            | Conteúdo                                              | Rodapé                                                                                     |
| -------------------------------- | -------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| abaixo de `lg` (celular, tablet) | sanfona: botão da grade à esquerda, hambúrguer à direita | painel offcanvas pela esquerda          | `col-12`; blocos de 2 colunas empilham abaixo de `md` | 1 coluna (`col-12`), 2 a partir de `sm`                                                    |
| `lg` e acima                     | links na horizontal, separados por `\|`                  | coluna lateral `col-lg-3` (`col-xxl-2`) | `col-lg-9` (`col-xxl-10`)                             | 4 colunas (`col-lg-3`)                                                                     |
| 1920px, 2560px, 3840px           | igual ao `lg`                                            | igual                                   | igual                                                 | a fonte base (`html`) sobe para 125%, 175% e 250%, para a interface em `rem` crescer em TV |

Detalhes da barra no celular:

- **Nav e botão da grade** ficam num único bloco `sticky-top`: ao rolar, colam no
  topo. A partir de `lg` o bloco volta a `position: static` (regra no SCSS).
- **Botão da grade** usa o mesmo ícone do app (`bi-grid-3x3-gap-fill`) e abre o
  painel lateral. **Hambúrguer** abre o nav vertical. Os dois são
  `navbar-toggler` e têm o **mesmo tamanho**: o glifo da grade fica numa caixa de
  `1.5em x 1.5em`, igual ao `navbar-toggler-icon` do Bootstrap.
- **Menu lateral** usa `offcanvas-lg offcanvas-start`: painel abaixo de `lg` e
  coluna normal a partir de `lg`, sem código extra.
- O `navbar-expand-lg` esconde sozinho os dois botões a partir de `lg`.

### Regra — Offcanvas é o menu lateral quando o template exigir

A marcação **Offcanvas** (`placement = 'offcanvas'`, painel `offcanvas-start` do
Bootstrap) deve ser tratada como o **menu lateral** sempre que o template exigir
esse tipo de menu. Nos templates (`/template001`, `/template002`, `/template003`):

- Itens `offcanvas` formam o **menu lateral**; itens `navbar` formam a **barra de navegação** (nav).
- Template001 e Template002: menu lateral em coluna fixa a partir de `lg` e painel Offcanvas abaixo de `lg`.
- Template003: não há coluna fixa; o menu lateral é sempre o painel Offcanvas, aberto pelo ícone da grade, em qualquer tamanho de tela.

### Regra — o meio do template recebe qualquer módulo

A região de **conteúdo** (o meio do template, entre o nav/menu lateral e o
rodapé) é o lugar onde entra **qualquer módulo já existente no sistema**, e
também os que ainda não foram previstos. Os blocos "Heading + Lorem ipsum" do
`template00X.json` são só o conteúdo de demonstração.

- Exemplos de módulos que entram no meio: gerência de usuário, chat, mensagens,
  usuários, produtos, serviços, mapas, e todos os demais já definidos.
- O template não conhece o módulo: ele só entrega a região de conteúdo (largura
  total, ou ao lado do menu lateral quando o template tem coluna fixa), e a
  página do módulo é renderizada ali dentro.
- Cabeçalho, nav, menu lateral e rodapé são a moldura (vêm das tabelas `temp_`);
  o meio é do módulo. Módulo novo não exige mudança no template.

### Cópia global dos efeitos (migração para o sistema real)

Os efeitos de entrada e saída dos templates estáticos foram **copiados** (os modelos `.template001`,
`.template002` e `.template003` e os arquivos originais ficaram **intactos**) para uso global:

| Original (continua servindo os modelos)                      | Cópia global                                      | Escopo / observação                                                   |
| ------------------------------------------------------------ | ------------------------------------------------- | --------------------------------------------------------------------- |
| `styles/_animations.scss`                                    | `styles/_template-global.scss`                    | `.template00X` -> `.tpl-app`; sem bordas (002/003) -> `.tpl-app.tpl-flat`; `@keyframes tpl-*` -> `tplg-*` |
| blocos de template de `styles/_custom.scss` (fonte base em telas grandes, barra fixa, degradê da página) | `styles/_template-global.scss` | `html:has(.tpl-app)`; `template00X-sticky` -> `.tpl-app .tpl-sticky` |
| `hooks/useReveal.ts`                                         | `hooks/template/useReveal.ts`                     | revelação ao rolar (`tpl-reveal`, `tpl-reveal-group`, `tpl-in`)        |
| `hooks/useScrolled.ts`                                       | `hooks/template/useScrolled.ts`                   | nav que encolhe e ganha sombra ao rolar (`tpl-scrolled`)              |
| lógica de fechar região dentro de cada `Template00XPage.tsx` | `hooks/template/useClosableRegions.ts`            | saída em 2 etapas (`tpl-closing`, 350 ms), sem desfazer               |
| `CloseButton` dentro de cada `Template00XPage.tsx`           | `components/template/CloseButton.tsx`             | X discreto no canto da região                                         |

As classes de componente são as mesmas dos modelos (`tpl-region`, `tpl-enter-down`, `tpl-fade-in`, `tpl-nav-link`,
`tpl-nav-item`, `tpl-menu-item`, `tpl-menu-link`, `tpl-blend`, `tpl-collapsible`, `tpl-fade-out`), valendo dentro de
`.tpl-app`. A paleta (`--tpl-*`) segue vindo de `config/theme.ts`, que já é global e não foi duplicado. A única
alteração em arquivo existente foi uma linha em `styles/index.scss` (`@import "template-global"`), depois de `animations`.

---

## 4. Cabeçalho

- A **imagem é o fundo** do cabeçalho (`object-fit-cover`, ocupa tudo), e não um
  elemento no centro.
- Sobre a imagem há uma **camada translúcida** na cor `header_background` da
  paleta (`bg-body bg-opacity-75`). Garante contraste da letra com qualquer
  imagem. Motivo: com o placeholder azul-claro, o texto branco quase não aparecia.
- A **logomarca** (texto ou imagem) fica na posição do JSON; o **nome da empresa**
  fica centralizado abaixo.

---

## 5. Sistema de temas (paletas por JSON)

Resumo; o contrato completo e a tabela das paletas estão em
[`README_temas_paleta.md`](README_temas_paleta.md).

- **Quem escolhe a paleta:** `env.theme`, lido de `VITE_THEME` (padrão
  `Blue_white`). É escolha de build; não há troca em tempo de execução.
- **Carregamento:** `config/theme.ts` usa `import.meta.glob('./themes/*.json')`.
  Soltar um JSON novo na pasta basta, sem alterar código. Nome inexistente cai em
  `Blue_white`. Em dev, chave faltante gera aviso no console.
- **Contrato (24 chaves, iguais em todos os JSONs):** `name`, `mode`
  (`light`/`dark`, vira `data-bs-theme`), `background_from`/`_to`/`_angle`
  (degradê da página), `primary`, `border_highlight`/`_shadow`/`_depth` (3D) e,
  para cada região (`header`, `nav`, `menu`, `content`, `footer`),
  `<região>_background`, `<região>_border` e `<região>_text`.
- **Como chega ao Bootstrap:** `paletteToCssVars` põe as variáveis globais no
  elemento raiz (degradê `--tpl-bg-*`, `--bs-primary`, `--bs-box-shadow` e os
  valores-base). `sectionCssVars(palette, região)` devolve as variáveis do
  Bootstrap de cada região (`--bs-body-bg`, `--bs-body-color`, `--bs-border-color`,
  `--bs-link-color`, `--bs-heading-color`, `--bs-secondary-color` e, no nav, as
  `--bs-navbar-*`, porque o `.navbar` as define em si mesmo). A página aplica
  cada uma no `style` do elemento da região e usa as classes `bg-body`,
  `text-body`, `border` e `shadow`.
- **3D das bordas:** a sombra é composta (`inset` de luz no topo, `inset` de
  sombra na base e sombra projetada difusa com `color-mix`) e entregue em
  `--bs-box-shadow`, que a classe `shadow` aplica. Todos os blocos com borda
  usam `shadow`.
- **Por que uma cor por região:** a paleta pode colorir cada região de um jeito
  (ex.: na `CopaDoMundo` o cabeçalho é amarelo, o nav e o rodapé azuis, o menu
  verde). Repetir cores entre regiões é permitido; o contrato é que a região
  tenha fundo, borda e letra próprios.

Paletas existentes: `Dark` (neutra), `Green_white`, `Green_dark`, `Blue_white`,
`Blue_dark`, `Purple_white`, `Purple_dark`, `Pink_white`, `Pink_dark`,
`CopaDoMundo` e `Natal`.

**Critério de cor.** `_white` é suave e harmonioso (tons claros e médios da cor,
letra preta); `_dark` é intenso e escuro (tons vibrantes e profundos da cor,
letra branca). Os temas coloridos **não usam fundo branco nem preto** como base:
degradê, cards e bordas são da cor do tema. `Dark` é a exceção neutra. Contraste
mínimo de 4,5 (WCAG) entre `<região>_text` e `<região>_background` nas 5 regiões;
nas 11 paletas atuais o menor valor medido é 4,8.

**CopaDoMundo** segue a bandeira do Brasil, em que o verde predomina:

| Região           | Fundo                             | Borda   | Letra       |
| ---------------- | --------------------------------- | ------- | ----------- |
| página (degradê) | verde `#009c3b` para verde escuro | n/a     | n/a         |
| cabeçalho        | amarelo `#ffcc00`                 | verde   | azul escuro |
| nav              | azul `#2b2a85`                    | amarelo | branca      |
| menu lateral     | verde escuro `#00782f`            | amarelo | branca      |
| conteúdo         | amarelo bem claro                 | verde   | azul escuro |
| rodapé           | azul `#2b2a85`                    | branca  | amarela     |

---

## 6. Fechar regiões (X)

Cabeçalho, nav, menu lateral e rodapé têm um **X pequeno e discreto** no canto
superior direito (ícone `bi-x`, `opacity-50`, `btn-sm`, herda a cor da letra da
região, então é legível em qualquer paleta). O conteúdo não tem X.

- Clicar oculta a região e as demais **reocupam o espaço**, continuando
  responsivas. O estado é **só em memória** (`useState`); não há desfazer, e
  **recarregar a página restaura tudo**. Não usa `localStorage`.
- Sem o menu lateral, o conteúdo passa a `col-12`.
- No nav, o X fica no canto direito, e o nav reserva espaço (`pe-5`, `pe-lg-4`)
  para ele não cobrir o botão do celular.
- O X do menu lateral aparece só a partir de `lg`. No celular o painel já tem o
  próprio botão fechar, que apenas recolhe o painel.
- **Nav fechado no celular:** o botão da grade perderia o lugar. Aparece então uma
  barra mínima fixa só com o ícone da grade, alinhada à direita e na cor da região
  do menu. Menu e nav fechados: a barra some.
- **Menu fechado:** o botão da grade não aparece no nav.

---

## 7. Regra Bootstrap primeiro (99% / 1%)

A UI é Bootstrap. O que ficou fora, por não haver utilitário, e por quê:

| Onde                  | O que                                                                                                                                     | Motivo                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `_custom.scss`        | `html:has(.template001)` com `font-size` de 125%, 175% e 250% em 1920px, 2560px e 3840px                                                  | o Bootstrap não escala a fonte base por breakpoint; escopado ao template              |
| `_custom.scss`        | `.template001` com `linear-gradient(var(--tpl-bg-angle), var(--tpl-bg-from), var(--tpl-bg-to))`, `background-attachment: fixed` e `color` | o Bootstrap só tem `.bg-gradient` (sobreposição sutil), sem degradê de cores próprias |
| `_custom.scss`        | `.template001 .template001-sticky` com `position: static` e fundo transparente a partir de `lg`                                           | não existe "sticky só no celular"                                                     |
| `Template001Page.tsx` | `style` com as variáveis CSS da paleta                                                                                                    | os valores vêm do JSON de tema                                                        |
| `Template001Page.tsx` | `style={{ width: '1.5em', height: '1.5em' }}` na caixa do glifo da grade                                                                  | não há utilitário de tamanho em `em`; iguala o glifo ao ícone do hambúrguer           |
| `_animations.scss`    | `@keyframes`, transições e cascata por `:nth-child` (seção 12)                                                                            | o Bootstrap não traz animação de entrada, cascata, revelação ao rolar nem sublinhado que cresce |

---

## 8. Convenções aplicadas

- **Identificadores em inglês técnico** (variáveis, funções, interfaces, chaves
  do JSON, valores técnicos como `left`/`center`/`right` e `user`/`logout`,
  nomes de imagem como `header_background.png`). **Comentários em português do
  Brasil, com acentuação.** Textos visíveis ao usuário e dados de exemplo ficam
  em português. Sem emoji em comentário.
- Cabeçalho de arquivo (FILE HEADER) e TSDoc no padrão do projeto.
- `import type` onde for só tipo; TypeScript no modo estrito do projeto.
- Rotas só via `paths.ts`; página lazy.
- Prettier **não** deve ser rodado sem a configuração do projeto: numa rodada ele
  trocou as aspas simples por duplas e foi preciso refazer o arquivo.

---

## 9. Histórico dos pedidos (em ordem)

| #   | Pedido                                                                                                                                                                                              | Resultado                                                                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | Entender o desenho por PNG e por draw.io                                                                                                                                                            | o draw.io (XML) dá medidas exatas, o PNG serve de conferência visual; ideal usar os dois |
| 2   | JSON só com os elementos em arrays (logomarca, imagem de fundo, nome, conteúdo, rodapé, nav, menu)                                                                                                  | contrato da seção 2                                                                      |
| 3   | Página, rota e JSON estático do template                                                                                                                                                            | página, `/template001`, JSON e imagens copiadas de `doc/drawio_svg/`                     |
| 4   | Revisão: 99% Bootstrap; 100% responsivo do celular à TV; ocupar 99% da tela deixando espaço ao 3D; cabeçalho com a imagem como fundo e logomarca escolhida pelo cliente (direita, centro, esquerda) | seções 3 e 4                                                                             |
| 5   | Menu lateral como offcanvas da esquerda; nav e menu colados no topo só no celular                                                                                                                   | `offcanvas-lg`, bloco `sticky-top` abaixo de `lg`                                        |
| 6   | Revisar tudo em inglês técnico e comentários em português                                                                                                                                           | renomeados código, JSON e imagens; comentários acentuados nos 8 arquivos relacionados    |
| 7   | Paletas por JSON escolhidas pelo `env.ts` (Dark, Green, Blue, Purple; `_white` suave, `_dark` intenso): degradê, fundo suave, borda 3D, letras na paleta                                            | `env.theme`, `theme.ts`, `config/themes/`                                                |
| 8   | Mais paletas: Pink_white, Pink_dark, CopaDoMundo, Natal                                                                                                                                             | 4 JSONs novos                                                                            |
| 9   | Correção: usar a cor do tema no fundo, não branco nem preto; letras pretas ou brancas                                                                                                               | valores reescritos, contraste medido por script                                          |
| 10  | Fundo, borda e letra por componente, para dar elasticidade (ex.: Copa com verde, amarelo e azul, e a bandeira do Brasil como referência)                                                            | contrato de 24 chaves e `sectionCssVars`; camada de contraste no cabeçalho               |
| 11  | X para fechar cabeçalho, nav, menu e rodapé, temporário, discreto, demais componentes responsivos                                                                                                   | seção 6                                                                                  |
| 12  | No celular, trocar a linha "Menu" pelo ícone de 9 quadradinhos no nav (primeiro à direita)                                                                                                          | ícone da grade no nav                                                                    |
| 13  | Inverter: grade à esquerda, hambúrguer à direita, mesmo tamanho                                                                                                                                     | seção 3                                                                                  |
| 14  | Documentar tudo                                                                                                                                                                                     | este arquivo                                                                             |
| 15  | Sugerir e aplicar animações; separar o que é Bootstrap puro do que é CSS com JS                                                                                                                     | seção 12                                                                                 |
| 16  | Entrada do nav: links em cascata (a barra deslizando de cima foi sugerida e não pedida)                                                                                                             | animação 14 da seção 12                                                                  |
| 17  | `/template002`: sem bordas, mesmos componentes e animações, degradê sutil entre componentes, mesmos JSONs de paleta                                                                                 | seção 13                                                                                 |
| 18  | `/template002` no celular: remover resquícios de borda arredondada                                                                                                                                  | seção 13                                                                                 |
| 19  | `/template003`: sem menu lateral (Offcanvas aberto pelo ícone no nav), sem linhas, degradê entre componentes                                                                                        | seção 14                                                                                 |

Ajustes e erros no caminho (para não repetir):

- A primeira `CopaDoMundo` ficou quase toda azul; a bandeira é predominantemente
  verde. Refeita pela bandeira.
- As primeiras paletas usavam fundo branco ou preto com detalhes coloridos; o
  pedido era a cor do tema no fundo. Refeitas.
- O botão "Menu" do celular tinha pouco contraste (azul sobre roxo); substituído
  pelo ícone da grade.
- A primeira versão do ícone da grade ficou menor que o hambúrguer; igualado.
- O Prettier sem configuração trocou as aspas; o arquivo foi reescrito no estilo
  do projeto.
- `README_temas_paleta.md` foi criado sem entrada no índice; corrigido junto
  com esta documentação.

---

## 10. Como criar o template de uma empresa a partir deste modelo

1. Copiar `src/pages/Template001/` para uma pasta nova (ex.: `pages/<Empresa>/`),
   renomeando página, JSON e prefixos de `id` do DOM (`template001-nav`,
   `template001-menu`) para o novo nome.
2. Ajustar o JSON de conteúdo mantendo as **mesmas chaves** do contrato (seção 2).
   Imagens em `public/img/<empresa>/`.
3. Registrar a rota: arquivo `routes/<empresa>.routes.tsx`, constante em
   `paths.ts` e entrada em `routes/index.tsx` (fora do `TemplateLayout`, se o
   template trouxer o próprio cabeçalho).
4. Escolher a paleta (`VITE_THEME`) ou criar uma nova copiando um JSON de
   `config/themes/` e conferindo o contraste de 4,5 em cada região.
5. Trocar o `import` do JSON por uma chamada de API que devolva o mesmo formato
   quando o dado vier do banco; a página não muda.
6. Manter a regra: Bootstrap primeiro; CSS novo só com motivo registrado na
   tabela da seção 7.
7. Atualizar o índice `src/markdown/README.md` e este documento.

---

## 11. Limitações e pendências

- **Validação feita:** `npm run typecheck` e `eslint` a cada etapa, mais o teste
  visual do usuário no navegador em desktop e celular.
- **Não validado:** o SCSS não foi compilado pela linha de comando, porque o
  `sass` do ambiente falha ao iniciar (`ERR_REQUIRE_ESM`); o Vite compila ao abrir
  a página. Também não foi rodado `vite build`.
- A troca de paleta por empresa ou usuário **em tempo de execução** não existe;
  hoje é por build (`VITE_THEME`).
- O ícone da sanfona do nav segue o `mode` da paleta e não a cor do nav; pode ter
  pouco contraste em alguma combinação.
- A barra fixa do celular usa `background_from` do degradê como fundo e pode
  destoar um pouco no meio da rolagem.
- `nav[].type` e `footer_images[].column` estão no contrato, mas não alteram a
  tela hoje.
- O efeito 3D hoje é só a sombra composta; texturas e outros acabamentos nas
  bordas ficam para depois, sobre a estrutura de bordas já definida.
- As animações (seção 12) passaram em typecheck e lint, mas o movimento só se
  valida visualmente no navegador.

---

## 12. Animações

Todas escopadas em `.template001`, em `styles/_animations.scss` (classes com
prefixo `tpl-`), mais dois hooks pequenos. Com `prefers-reduced-motion: reduce`
todas são desligadas e os blocos de revelação ficam visíveis.

| #   | Animação                          | Técnica                                                                                          | Origem                    |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------- |
| 1   | entrada do cabeçalho              | `@keyframes tpl-slide-down` em `.tpl-enter-down`                                                 | CSS                       |
| 2   | fade da imagem de fundo           | `@keyframes tpl-fade-in` em `.tpl-fade-in`                                                       | CSS                       |
| 3   | nav ao rolar                      | `useScrolled(16)` troca o padding (`py-1 py-lg-2`) e põe `.tpl-scrolled` (sombra maior); só tem efeito no celular, onde a barra é fixa | Bootstrap + JS + CSS      |
| 4   | links do nav                      | `.tpl-nav-link::after` com `scaleX`: o sublinhado cresce do centro; o separador `\|` fica fora do link | CSS                       |
| 5   | menu lateral                      | `offcanvas-lg offcanvas-start` do Bootstrap                                                      | Bootstrap puro            |
| 6   | itens do menu em cascata          | `.tpl-menu-item` com `animation-delay` por `:nth-child` (até 30 itens)                           | CSS                       |
| 7   | hover nos itens do menu           | `.tpl-menu-link`: fundo preenche da esquerda por `background-size`                               | CSS                       |
| 8   | conteúdo ao rolar                 | `.tpl-reveal` mais `useReveal` (`IntersectionObserver` adiciona `.tpl-in`)                       | CSS + JS                  |
| 9   | fechar região (X)                 | estado `closing` (animação) e depois `closed` (retira da tela); `.tpl-collapsible` anima `grid-template-rows` de `1fr` para `0fr` e a opacidade | CSS + JS (estado React)   |
| 10  | espaço liberado                   | efeito da altura do item 9: as regiões abaixo sobem junto. Sem técnica FLIP.                     | CSS                       |
| 11  | borda 3D no hover                 | `.tpl-region:hover` com `filter: drop-shadow` em transição                                       | CSS                       |
| 12  | troca de paleta                   | `.tpl-region` com `transition` de cor, fundo e borda. Só deixa pronto: a troca em tempo de execução não existe | CSS                       |
| 13  | colunas do rodapé em sequência    | `.tpl-reveal-group` com atraso por `:nth-child` nos filhos, ativado por `useReveal`              | CSS + JS                  |
| 14  | links do nav em cascata           | `.tpl-nav-item` com `tpl-fade-up`, início em 0,3 s (depois do cabeçalho) e 0,04 s entre itens, até 30; só a partir de `lg` | CSS                       |

Observações:

- **Fechar pelo X:** `CLOSE_ANIMATION_MS` (350 ms) na página precisa coincidir com
  a duração de `.tpl-collapsible` no SCSS. O `overflow: hidden` só vale durante o
  fechamento, para não cortar a sombra 3D no estado normal.
- **Menu lateral fechado:** só desvanece (`.tpl-fade-out`); o conteúdo passa para
  `col-12` de uma vez, porque largura de coluna não anima sem código extra.
- **Hooks:** `useScrolled` usa listener passivo de `scroll`; `useReveal` observa,
  uma vez na montagem, os descendentes `.tpl-reveal` e `.tpl-reveal-group` do
  elemento que recebe o `ref`.
- **Ordem do SCSS:** `variables` → Bootstrap → `custom` → `animations`
  (`styles/index.scss`).

---

## 13. Template002 — variante sem bordas

Rota `/<slug>/template002`, também pública e fora do `RootLayout`. É uma **cópia
da estrutura** da página do Template001 (como o modelo prevê para cada empresa),
com os mesmos cinco componentes, o mesmo contrato de JSON de conteúdo, as mesmas
paletas (`config/themes/`) e as mesmas animações. Muda só o visual:

- **Sem borda, sombra 3D, canto arredondado, espaço entre blocos e margem
  externa.** Os blocos ficam encostados e ocupam a tela toda.
- **Degradê entre os componentes.** O fundo de cada região é um degradê vertical:
  no topo recebe uma parcela da região de cima; na base, da região de baixo
  (`sectionBlendCssVars` em `config/theme.ts`, via `color-mix`). Vizinhas: cabeçalho
  → nav → (menu lateral e conteúdo) → rodapé. Sem vizinha, a ponta fica na cor da
  própria região. A classe `.tpl-blend` (em `_animations.scss`, escopo
  `.template002`) aplica o degradê.
- **Parcela misturada: 20%** (`BLEND_NEIGHBOR_PERCENT`). Com 30% duas paletas
  (`CopaDoMundo` e `Natal`) caíam abaixo do contraste 4,5; com 20% o menor
  contraste letra/fundo nas 11 paletas é 4,54.
- **Paletas:** as chaves de borda (`<região>_border`, `border_*`) continuam no
  contrato, para os mesmos JSONs servirem aos dois templates, mas o 002 as ignora.
- **Cabeçalho:** a camada de contraste sobre a imagem usa o degradê do cabeçalho
  com 75% de opacidade.
- **Menu lateral:** sem o separador `border-bottom` entre itens; o espaço vem do
  `py-2`.
- **Animações:** as mesmas 14. A 11 (sombra 3D no hover) vira um clareamento leve
  (`brightness(1.04)`), porque não há borda para aprofundar.
- **Arquivos:** `pages/Template002/Template002Page.tsx` e `template002.json`,
  `routes/template002.routes.tsx`, `paths.template002`, imagens em
  `public/img/template002/`.
- **SCSS compartilhado:** `_animations.scss` e as regras do template em
  `_custom.scss` passaram a usar `:is(.template001, .template002)` e o sticky tem
  um seletor por template (`template001-sticky` e `template002-sticky`).
  Template novo = incluir a classe raiz nessas listas.

### Resquícios de borda no celular (ajuste posterior)

No celular ainda apareciam cantos arredondados. Causas e correções:

- A imagem de fundo do cabeçalho (placeholder PNG copiado do 001) trazia os cantos
  arredondados desenhados. No 002 ela foi trocada por `header_background.svg`, um
  retângulo reto; a URL em `template002.json` foi atualizada.
- O `navbar-toggler` do Bootstrap tem contorno: `--bs-navbar-toggler-border-color`
  ficou `transparent` no nav.
- O painel offcanvas tem uma linha: `--bs-offcanvas-border-width` ficou `0`.
- A imagem do rodapé perdeu a classe `rounded`. O `footer_detail.png` ainda tem
  cantos arredondados desenhados na própria imagem (não alterado).

---

## 14. Template003 — sem menu lateral, com Offcanvas

Rota `/<slug>/template003`, pública e fora do `RootLayout`. Parte da página do
Template002 (sem bordas, mesmo degradê, mesmas paletas e animações) e muda a
navegação do menu:

- **Sem menu lateral fixo.** Não há coluna de menu; o conteúdo ocupa a largura toda.
- **Menu em Offcanvas.** O painel abre pela esquerda (`offcanvas offcanvas-start`,
  sem o `-lg`), fora do fluxo da página, com o degradê e as cores da região do
  menu e a borda zerada. Fecha pelo botão do próprio painel.
- **Ícone no nav.** O botão da grade (`bi-grid-3x3-gap-fill`) fica à esquerda do nav
  em todas as telas (no 002 só existia no celular). O hambúrguer continua à direita
  e só aparece abaixo de `lg`.
- **Nav fechado.** Resta uma barra mínima só com o ícone da grade, à esquerda, para o
  menu continuar acessível. O X vale para cabeçalho, nav e rodapé (o menu não tem X
  permanente).
- **Sem linhas** entre componentes; a transição é o degradê (`.tpl-blend`).
- **Arquivos:** `pages/Template003/Template003Page.tsx` e `template003.json`,
  `routes/template003.routes.tsx`, `paths.template003`, imagens em
  `public/img/template003/`. Ids: `template003-nav`, `template003-menu`; sticky
  `template003-sticky`.
- **SCSS:** `.template003` entrou nas listas `:is(...)`, no bloco `.tpl-blend` e no
  sticky.

---

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo               | Informação                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Nome**            | Gustavo Hammes                                                                                                               |
| **Local**           | Rio de Janeiro                                                                                                               |
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
