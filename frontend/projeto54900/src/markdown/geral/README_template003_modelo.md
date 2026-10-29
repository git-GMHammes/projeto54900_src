[◄ Índice da base de conhecimento](../README.md)

---

# Template003 — sem menu lateral, com Offcanvas

O Template003 parte do [Template002](README_template002_modelo.md) (sem bordas, mesmo degradê, mesmas
paletas e animações) e muda a navegação do menu. Este documento traz a **empresa vinculada** e o que
difere do 002. O contrato de JSON, as paletas e as animações ficam no
[Template001](README_template001_modelo.md) (seções 2, 5 e 12).

---

## 1. Empresa vinculada (banco)

O vínculo fica em `temp_manager.company_manager`, uma lista JSON de slugs de empresa (a tabela
`company_manager` não tem coluna de template). Leitura no DEV em 2026-10-29, somente SELECT:

| Campo do `temp_manager` | Valor                                                                 |
| ----------------------- | --------------------------------------------------------------------- |
| `id`                    | 3                                                                     |
| `code`                  | `template003`                                                         |
| `name`                  | Template 003                                                          |
| `description`           | Menu lateral em Offcanvas, aberto pelo botão dos quadradinhos no nav. |
| `company_manager`       | `[]`                                                                  |
| `status`                | `active`                                                              |

**Nenhuma empresa está vinculada ao `template003`** (lista vazia). Quem a usa hoje é só o usuário que
a escolhe em "Editar perfil" (`user_manager.temp_manager_id`).

**Pendência:** a empresa `drsergiopsicologo` (Dr Sérgio Psicologo, paleta `Purple_white`) não consta em
nenhum `temp_manager.company_manager`; sem template vinculado, o visitante cai no padrão
`VITE_GUEST_TEMPLATE` (`template001`). O vínculo é dado do banco (tela `/v1/temp-manager`); o banco não
foi alterado. Como o frontend escolhe o template: seção 16 do 001.

---

## 2. Rota e arquivos

Rota `/template003` (também `/<slug>/template003`), pública e fora do `RootLayout`. `template003` é
**segmento reservado** em `RESERVED_ROOT_SEGMENTS` (`config/env.ts`): o primeiro segmento da URL não
vira slug de empresa, então `/template003/` abre o modelo estático (só JSON, sem sessão nem API) e não a
Home com dados do banco. Nenhuma empresa pode ter esse slug. Detalhe na abertura do 001.

| Arquivo                                                                | Papel                                         |
| ---------------------------------------------------------------------- | --------------------------------------------- |
| `src/pages/Template003/Template003Page.tsx` e `template003.json`       | página e JSON de conteúdo (mesmas chaves do 001) |
| `src/routes/template003.routes.tsx` e `paths.template003`              | rota lazy                                     |
| `public/img/template003/`                                              | imagens                                       |
| `src/styles/_animations.scss` e `_custom.scss`                         | `.template003` entra nas listas `:is(...)`, no bloco `.tpl-blend` e no sticky (`template003-sticky`) |

Ids do DOM: `template003-nav` e `template003-menu`.

---

## 3. O que muda em relação ao Template002

- **Sem menu lateral fixo.** Não há coluna de menu; o conteúdo ocupa a largura toda.
- **Menu em Offcanvas.** O painel abre pela esquerda (`offcanvas offcanvas-start`, sem o `-lg`), fora do
  fluxo da página, com o degradê e as cores da região do menu e a borda zerada. Fecha pelo botão do
  próprio painel. Regra geral do Offcanvas como menu lateral: seção 3 do 001.
- **Ícone no nav.** O botão da grade (`bi-grid-3x3-gap-fill`) fica à esquerda do nav em todas as telas
  (no 002 só existia no celular). O hambúrguer continua à direita e só aparece abaixo de `lg`.
- **Nav fechado.** Resta uma barra mínima só com o ícone da grade, à esquerda, para o menu continuar
  acessível. O X vale para cabeçalho, nav e rodapé (o menu não tem X permanente).
- **Nav com setas (a partir de `lg`):** igual ao 002. Os itens ficam em uma única linha; quando passam da
  largura, aparecem as setas `bi-chevron-left` e `bi-chevron-right` nas pontas, que deslizam a lista 75%
  da largura visível a cada clique (seta direita mostra os itens do fim) e ficam desabilitadas na ponta
  alcançada. Lista que cabe fica centralizada e sem setas; abaixo de `lg` vale o hambúrguer. Hook
  `hooks/useNavScroll.ts`.
  **Código que funcionou** (validado no navegador em 2026-10-29), em `Template003Page.tsx`; é o mesmo do
  002 (detalhe no `README_template002_modelo.md`): `useNavScroll(navOpen)`, `style={{ minWidth: 0 }}` no
  `tpl-collapsible-inner` do nav (**obrigatório**: o grid `.tpl-collapsible` tem coluna `auto` e, sem isso,
  a página estoura na horizontal e as setas não aparecem), `overflow-hidden` no `navbar-collapse` e na
  `ul` (`flex-lg-nowrap`, `mx-lg-auto`), `li` com `flex-shrink-0 text-nowrap` e as duas setas condicionais
  a `navScroll.overflow`. O SCSS compartilhado não foi alterado.
- **X no template dinâmico:** cabeçalho, nav e rodapé fecham pelo X; o **menu (Offcanvas) não tem X
  permanente**. Com o nav fechado resta uma barra mínima à esquerda só com o ícone da grade, em qualquer
  tela. Regras completas na seção 6 do [001](README_template001_modelo.md).
- **Nav do template dinâmico (produção) sem marca nem versão:** onde antes aparecia "Menu v1" fica só o
  botão da grade que aciona o Offcanvas (sempre visível no 003), e mais nada. Detalhe no
  `README_template002_modelo.md`.
- **Nav do template dinâmico (produção):** a variante plana do `TemplateNavRegion` (002 e 003) segue o
  mesmo padrão dos modelos: uma linha, setas, `minWidth: 0` no `navbar-collapse`, ícones de `entry.icon`
  mantidos, menu do usuário fora da lista e submenus controlados pelo React, desenhados por portal dentro
  do `<nav>` a partir de `lg` (para o `overflow-hidden` da lista não cortar). Detalhe no
  `README_template002_modelo.md`.
- **Sem linhas** entre componentes; a transição é o degradê (`.tpl-blend`).
- **Rodapé no sistema real:** variante `flat`, igual à do 002 (seção 15 do 001).

---

## 4. Código validado do nav com setas e submenus

O código completo (hook `useNavScroll`, marcação do modelo, nav dinâmico com submenus por portal, tabela de
armadilhas e checklist) está na **seção 4 do [Template002](README_template002_modelo.md)**; aqui vale o
mesmo, validado no navegador em 2026-10-29. Particularidades do 003:

- Ids do DOM: `template003-nav` (nav) e `template003-menu` (Offcanvas); as setas ficam entre o
  ícone da grade (sempre visível à esquerda) e o `CloseButton`.
- No modelo, o nav fica dentro de `navOpen ? (<div collapsibleClass('nav')>...) : (barra mínima)`: o
  `style={{ minWidth: 0 }}` vai no `tpl-collapsible-inner` do ramo `navOpen`, e `useNavScroll(navOpen)`
  logo após `const navOpen = !closed.has('nav')`.
- **Armadilha principal** (vale aqui e em qualquer template com `.tpl-collapsible`): sem `minWidth: 0` o
  grid de coluna `auto` cresce até a largura dos itens, a página ganha rolagem horizontal e as setas nunca
  aparecem.
- **Nunca** usar `data-bs-toggle="dropdown"` em item dentro da lista que rola (`overflow-hidden` corta o
  menu e o Bootstrap não usa Popper em `.navbar`); no dinâmico use o portal da seção 4.4 do 002.

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
