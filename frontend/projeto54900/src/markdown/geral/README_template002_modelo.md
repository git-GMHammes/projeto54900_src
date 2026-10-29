[◄ Índice da base de conhecimento](../README.md)

---

# Template002 — variante sem bordas

O Template002 é a variante sem bordas do [Template001](README_template001_modelo.md). Mantém a
estrutura de cinco regiões (cabeçalho, nav, menu lateral, conteúdo e rodapé), o contrato de JSON, as
paletas e as animações do 001; muda só o visual. Este documento traz a **empresa vinculada** e o que
difere do 001. O contrato de JSON, as paletas e as animações ficam no 001 (seções 2, 5 e 12).

---

## 1. Empresa vinculada (banco)

O vínculo fica em `temp_manager.company_manager`, uma lista JSON de slugs de empresa (a tabela
`company_manager` não tem coluna de template). Leitura no DEV em 2026-10-29, somente SELECT:

| Campo do `temp_manager` | Valor                    |
| ----------------------- | ------------------------ |
| `id`                    | 2                        |
| `code`                  | `template002`            |
| `name`                  | Template 002             |
| `description`           | Ausência de bordas.      |
| `company_manager`       | `["tryikads"]`           |
| `status`                | `active`                 |

| Empresa (`slug`)       | Paleta (`color_theme`) |
| ---------------------- | ---------------------- |
| `tryikads` (Tryik ADS) | `Purple_dark`          |

Resumo dos três templates no DEV: `default` usa o `template001`, `tryikads` usa o `template002`, e
`drsergiopsicologo` não tem template vinculado (ver [Template003](README_template003_modelo.md)).
Como o frontend escolhe o template (usuário, empresa ou visitante): seção 16 do 001.

---

## 2. Rota e arquivos

Rota `/template002` (também `/<slug>/template002`), pública e fora do `RootLayout`. `template002` é
**segmento reservado** em `RESERVED_ROOT_SEGMENTS` (`config/env.ts`): o primeiro segmento da URL não
vira slug de empresa, então `/template002/` abre o modelo estático (só JSON, sem sessão nem API) e não a
Home com dados do banco. Nenhuma empresa pode ter esse slug. Detalhe na abertura do 001.

| Arquivo                                                                | Papel                                         |
| ---------------------------------------------------------------------- | --------------------------------------------- |
| `src/pages/Template002/Template002Page.tsx` e `template002.json`       | página e JSON de conteúdo (mesmas chaves do 001) |
| `src/routes/template002.routes.tsx` e `paths.template002`              | rota lazy                                     |
| `public/img/template002/`                                              | imagens (`header_background.svg`, `footer_detail.png`) |
| `src/styles/_animations.scss` e `_custom.scss`                         | `.template002` entra nas listas `:is(...)`; sticky `template002-sticky` |

---

## 3. O que muda em relação ao Template001

- **Sem borda, sombra 3D, canto arredondado, espaço entre blocos e margem externa.** Os blocos ficam
  encostados e ocupam a tela toda.
- **Degradê entre os componentes.** O fundo de cada região é um degradê vertical: no topo recebe uma
  parcela da região de cima; na base, da região de baixo (`sectionBlendCssVars` em `config/theme.ts`,
  via `color-mix`). Vizinhas: cabeçalho, nav, (menu lateral e conteúdo), rodapé. Sem vizinha, a ponta
  fica na cor da própria região. Classe `.tpl-blend`.
- **Parcela misturada: 20%** (`BLEND_NEIGHBOR_PERCENT`). Com 30% duas paletas (`CopaDoMundo` e `Natal`)
  caíam abaixo do contraste 4,5; com 20% o menor contraste letra/fundo nas 11 paletas é 4,54.
- **Paletas:** as chaves de borda continuam no contrato (os mesmos JSONs servem aos dois templates),
  mas o 002 as ignora.
- **Cabeçalho:** a camada de contraste sobre a imagem usa o degradê do cabeçalho com 75% de opacidade.
- **Menu lateral:** sem o separador `border-bottom` entre itens; o espaço vem do `py-2`.
- **Nav com setas (a partir de `lg`):** os itens ficam em uma única linha (sem quebra). Quando passam da
  largura, aparecem duas setas (`bi-chevron-left` e `bi-chevron-right`) nas pontas; cada clique desliza a
  lista 75% da largura visível, de forma suave (a seta direita mostra os itens do fim). A seta fica
  desabilitada na ponta em que a lista já chegou. Lista que cabe na tela fica centralizada e sem setas.
  Abaixo de `lg` continua o hambúrguer vertical, sem setas. Hook `hooks/useNavScroll.ts`, só Bootstrap.
  **Código que funcionou** (validado no navegador em 2026-10-29), em `Template002Page.tsx`:
  - `const navScroll = useNavScroll(navOpen);` logo depois de `navOpen`.
  - `<div className="tpl-collapsible-inner" style={{ minWidth: 0 }}>` no nav. **Obrigatório:** o wrapper
    `.tpl-collapsible` é um grid de coluna `auto`; sem `min-width: 0` a coluna cresce até a largura dos
    itens, a página ganha rolagem horizontal e a lista nunca "extrapola" (as setas não aparecem).
  - `<div className="collapse navbar-collapse justify-content-center overflow-hidden" ...>`: sem
    `overflow-hidden` o item flex também não encolhe.
  - `<ul ref={navScroll.ref} className="navbar-nav flex-lg-row flex-lg-nowrap overflow-hidden mx-lg-auto
    align-items-lg-center small">`, itens `li` com `flex-shrink-0 text-nowrap`.
  - Setas `{navScroll.overflow && <button ... d-none d-lg-inline-flex>}` antes e depois da `ul`, com
    `disabled={navScroll.atStart}` / `disabled={navScroll.atEnd}` e `navScroll.scrollNav('prev' | 'next')`.
  - O ajuste foi só no 002 e no 003; o SCSS compartilhado `.tpl-collapsible` não foi alterado.
- **X no template dinâmico:** cabeçalho, nav, menu lateral e rodapé fecham pelo X, como no modelo; regras,
  chaves de estado e a barra mínima do nav fechado na seção 6 do
  [001](README_template001_modelo.md). No nav dinâmico o `tpl-collapsible-inner` leva `minWidth: 0`.
- **Nav do template dinâmico (produção) segue o modelo:** `components/template/TemplateNavRegion.tsx`
  (usado pelas três variantes) aplica o mesmo padrão **só na variante plana** (`flat`, 002 e 003); o 001
  dinâmico mantém a lista que quebra em linhas. Na variante plana:
  - **sem marca nem versão no nav** (vale para as três variantes): o antigo `navbar-brand` ("Menu" e "v1",
    de `temp_nav.title` e `temp_nav.system_version`) foi removido do `TemplateNavRegion`, junto das props
    `brandName` / `brandVersion`. O que sobra à esquerda é só o botão da grade que abre o Offcanvas (no 003
    sempre; no 001 e no 002 abaixo de `lg`). O nome do app continua só como título do menu lateral
    (`TemplateShell`, `brandName`); `temp_nav.title` e `system_version` seguem no banco;
  - itens em uma linha, **alinhados à direita** (`flex-lg-nowrap overflow-hidden ms-lg-auto`; no dinâmico o nav
    fica à direita nas três variantes, diferente do modelo, que centraliza com `mx-lg-auto`),
    `li` com `flex-shrink-0 text-nowrap`,
    separador `|` alinhado (o `li` com dropdown ganha `d-lg-flex align-items-lg-center`);
  - `useNavScroll(flat)` e as setas `bi-chevron-left` / `bi-chevron-right` antes e depois da lista;
  - `style={{ minWidth: 0 }}` no `navbar-collapse` (a mesma causa do grid, aqui no item flex);
  - **ícones mantidos:** continuam vindo de `entry.icon` (`bi-...`) do banco (`temp_menu`);
  - o **menu do usuário** saiu da lista e fica em uma `ul` própria depois da seta direita (não é cortado
    nem some ao deslizar o nav; vale também para o 001);
  - **submenus (Calendário, Timeline, Chat, Mensagem...):** o `overflow-hidden` da lista cortaria o menu
    aberto, e o Bootstrap não usa o Popper dentro de `.navbar` (`data-bs-popper-config` não resolve).
    **Tentativa que quebrou os submenus (não repetir):** manter o dropdown do Bootstrap com `li`
    `position-static` e reposicionar o menu em `shown.bs.dropdown`. **Solução em uso:** na variante plana o
    submenu é controlado pelo React (estado `openKey`, sem `data-bs-toggle`). O item vira um `button`
    (`data-tpl-group-toggle`); a partir de `lg` o menu aberto é desenhado por **portal dentro do `<nav>`**
    (`position: absolute; top: 100%`, `left` calculado contra o nav e limitado à largura dele, na ref
    `placeMenu`), fora da lista que rola, então nada o corta. Abaixo de `lg` o menu fica em fluxo dentro do
    item. Fecha ao clicar fora, Escape, rolar a lista, redimensionar ou escolher um item. A rota própria do
    grupo (`entry.to`), se existir, vira o primeiro item do submenu. O 001 e o menu do usuário continuam no
    dropdown do Bootstrap.
- **Animações:** as mesmas 14 do 001. A 11 (sombra 3D no hover) vira um clareamento leve
  (`brightness(1.04)`).
- **Resquícios de borda no celular (corrigidos):** imagem do cabeçalho trocada por
  `header_background.svg` (retângulo reto), `--bs-navbar-toggler-border-color` transparente,
  `--bs-offcanvas-border-width` zero e imagem do rodapé sem `rounded`. O `footer_detail.png` ainda
  tem cantos arredondados desenhados na própria imagem.
- **Rodapé no sistema real:** variante `flat` (classe `tpl-blend`, sem borda, sombra nem canto
  arredondado); detalhe na seção 15 do 001.

---

## 4. Código validado do nav com setas e submenus (referência para outros templates)

Validado no navegador em 2026-10-29 (nav do modelo e do template dinâmico). Copiar daqui ao levar o
mesmo comportamento para outro template; **não improvisar**: cada peça abaixo existe porque a
alternativa falhou.

### 4.1 Armadilhas (o que falhou e por quê)

| Sintoma | Causa | Correção |
| ------- | ----- | -------- |
| Página com rolagem horizontal, nav passa da tela e as setas nunca aparecem | `.tpl-collapsible` é um grid de coluna `auto`; o item do grid tem largura mínima automática igual ao conteúdo (40 itens sem quebra) | `style={{ minWidth: 0 }}` no `tpl-collapsible-inner` do nav (modelos) |
| Mesmo sintoma, agora no item flex | `navbar-collapse` é item flex com largura mínima automática | modelos: `overflow-hidden` no `navbar-collapse`; dinâmico: `style={{ minWidth: 0 }}` no `navbar-collapse` |
| Submenu cortado ou quebrado dentro da lista | `overflow-hidden` da lista corta o dropdown do Bootstrap; o Bootstrap **não usa o Popper dentro de `.navbar`**, então `data-bs-popper-config` e `strategy: fixed` não resolvem | submenu controlado pelo React com portal no `<nav>` (4.4) |
| Submenus quebraram | tentativa de manter o dropdown do Bootstrap com `li` `position-static` e reposicionar em `shown.bs.dropdown` | **não repetir**; usar 4.4 |
| Menu do usuário sumia ou era cortado ao deslizar | estava dentro da lista que rola | `ul` própria fora da lista, depois da seta direita |
| Separador `\|` fora da linha nos itens com submenu | `li` com dropdown sem `d-lg-flex align-items-lg-center` | classes no `li` |

### 4.2 Hook `hooks/useNavScroll.ts` (igual para qualquer template)

```ts
import { useCallback, useEffect, useRef, useState } from 'react';

interface NavScrollState { overflow: boolean; atStart: boolean; atEnd: boolean }

/** Fração da largura visível percorrida a cada clique numa seta. */
const SCROLL_STEP = 0.75;

export function useNavScroll(active = true) {
  const ref = useRef<HTMLUListElement>(null);
  const [state, setState] = useState<NavScrollState>({ overflow: false, atStart: true, atEnd: true });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const next: NavScrollState = { overflow: max > 1, atStart: el.scrollLeft <= 1, atEnd: el.scrollLeft >= max - 1 };
    setState((prev) =>
      prev.overflow === next.overflow && prev.atStart === next.atStart && prev.atEnd === next.atEnd ? prev : next,
    );
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.addEventListener('scroll', measure, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', measure);
    };
  }, [active, measure]);

  const scrollNav = useCallback((direction: 'prev' | 'next') => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * SCROLL_STEP * (direction === 'next' ? 1 : -1), behavior: 'smooth' });
  }, []);

  return { ref, ...state, scrollNav };
}
```

`active` deve ser `false` quando a lista não está montada (ex.: nav fechado no modelo: `useNavScroll(navOpen)`).

### 4.3 Nav dos modelos (`Template002Page.tsx`, `Template003Page.tsx`)

```tsx
const navOpen = !closed.has('nav');
const navScroll = useNavScroll(navOpen);

<div className={collapsibleClass('nav')}>
  {/* minWidth 0: o item do grid não pode ter a largura mínima dos itens do nav */}
  <div className="tpl-collapsible-inner" style={{ minWidth: 0 }}>
    <nav className="tpl-region tpl-blend navbar navbar-expand-lg position-relative ...">
      <div className="collapse navbar-collapse justify-content-center overflow-hidden" id="template002-nav">
        {navScroll.overflow && (
          <button type="button" aria-label="Rolar nav para a esquerda" disabled={navScroll.atStart}
            className="btn btn-sm border-0 text-body fs-5 lh-1 px-1 flex-shrink-0 d-none d-lg-inline-flex"
            onClick={() => navScroll.scrollNav('prev')}>
            <i className="bi bi-chevron-left" aria-hidden="true" />
          </button>
        )}
        <ul ref={navScroll.ref}
          className="navbar-nav flex-lg-row flex-lg-nowrap overflow-hidden mx-lg-auto align-items-lg-center small">
          {navItems.map((item, i) => (
            <li key={item.id} className="tpl-nav-item nav-item flex-shrink-0 text-nowrap d-lg-flex align-items-lg-center">
              <a href={item.url} className="tpl-nav-link nav-link px-lg-1">{item.label}</a>
              {i < navItems.length - 1 && <span className="d-none d-lg-inline mx-1 text-body-secondary">|</span>}
            </li>
          ))}
        </ul>
        {navScroll.overflow && (
          <button type="button" aria-label="Rolar nav para a direita" disabled={navScroll.atEnd}
            className="btn btn-sm border-0 text-body fs-5 lh-1 px-1 flex-shrink-0 d-none d-lg-inline-flex"
            onClick={() => navScroll.scrollNav('next')}>
            <i className="bi bi-chevron-right" aria-hidden="true" />
          </button>
        )}
      </div>
    </nav>
  </div>
</div>
```

### 4.4 Nav do template dinâmico (`components/template/TemplateNavRegion.tsx`, variante `flat`)

Estado e efeitos (dentro do componente):

```tsx
const navScroll = useNavScroll(flat);
const [navEl, setNavEl] = useState<HTMLElement | null>(null);          // ref do <nav> como estado (usado no portal)
const [openKey, setOpenKey] = useState<string | null>(null);
const [isLg, setIsLg] = useState(() => window.matchMedia('(min-width: 992px)').matches);
const menuLeft = useRef(0);

useEffect(() => {                                                       // acompanha o breakpoint lg
  const media = window.matchMedia('(min-width: 992px)');
  const onChange = () => setIsLg(media.matches);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}, []);

useEffect(() => {                                                       // fecha: clique fora, Escape, rolar, redimensionar
  if (openKey === null) return;
  const close = () => setOpenKey(null);
  const onPointerDown = (e: PointerEvent) => {
    const t = e.target;
    if (t instanceof Element && (t.closest('[data-tpl-group-toggle]') || t.closest('.tpl-group-menu'))) return;
    close();
  };
  const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
  const list = navScroll.ref.current;
  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('keydown', onKeyDown);
  list?.addEventListener('scroll', close, { passive: true });
  window.addEventListener('resize', close);
  return () => { /* remove os quatro listeners */ };
}, [openKey, navScroll.ref]);

const toggleGroup = (e: MouseEvent<HTMLElement>, key: string) => {
  if (openKey === key) { setOpenKey(null); return; }
  if (navEl) menuLeft.current = e.currentTarget.getBoundingClientRect().left - navEl.getBoundingClientRect().left;
  setOpenKey(key);
};

/** Ref do menu em lg: sob o item, sem passar da largura do nav. */
const placeMenu = (menu: HTMLUListElement | null) => {
  if (!menu || !navEl) return;
  menu.style.left = `${Math.max(0, Math.min(menuLeft.current, navEl.clientWidth - menu.offsetWidth))}px`;
};
```

Marcação:

```tsx
<nav ref={setNavEl} className="tpl-region navbar navbar-expand-lg position-relative ..."> {/* position-relative é obrigatório: o menu em portal é absoluto em relação ao nav */}
  <div className="collapse navbar-collapse" id="tpl-nav" style={flat ? { minWidth: 0 } : undefined}>
    {/* seta esquerda (igual a 4.3, condicionada a flat && navScroll.overflow) */}
    <ul ref={navScroll.ref}
      className={`navbar-nav flex-lg-row align-items-lg-center small ${flat ? 'flex-lg-nowrap overflow-hidden ms-lg-auto' : 'ms-auto flex-wrap'}`}>
      {/* item com submenu (flat): botão, sem data-bs-toggle; o ícone vem de entry.icon (bi-...) do temp_menu */}
      <li className="tpl-nav-item nav-item flex-shrink-0 text-nowrap d-lg-flex align-items-lg-center">
        <button type="button" data-tpl-group-toggle="" className="tpl-nav-link nav-link px-lg-1"
          aria-haspopup="true" aria-expanded={openKey === entry.key} onClick={(e) => toggleGroup(e, entry.key)}>
          {entry.icon && <i className={`bi bi-${entry.icon} me-1`} aria-hidden="true" />}
          {entry.label}
        </button>
        {/* abaixo de lg o menu fica em fluxo dentro do item */}
        {!isLg && openKey === entry.key && <ul className="tpl-group-menu dropdown-menu show">{groupMenuItems(entry)}</ul>}
        {/* separador | */}
      </li>
    </ul>
    {/* seta direita */}
    {/* a partir de lg: portal dentro do <nav>, FORA da lista que rola */}
    {flat && isLg && openEntry && navEl &&
      createPortal(
        <ul ref={placeMenu} className="tpl-group-menu dropdown-menu show" style={{ top: '100%' }}>
          {groupMenuItems(openEntry)}
        </ul>,
        navEl,
      )}
    {/* menu do usuário: ul própria, fora da lista que rola (dropdown do Bootstrap, sem corte) */}
    <ul className="navbar-nav flex-shrink-0 ms-lg-2">{/* li.nav-item.dropdown do usuário */}</ul>
  </div>
</nav>
```

`groupMenuItems(entry)` devolve `<li><NavLink className="dropdown-item" to=... end onClick={closeGroup}>` para
a rota própria do grupo (se houver) e para cada filho. Regras: ícones sempre de `entry.icon`; só a variante
`flat` usa este caminho; o 001 dinâmico segue o dropdown do Bootstrap com a lista quebrando em linhas.

### 4.5 Checklist ao levar para outro template

1. A região do nav está dentro de `.tpl-collapsible`? Então `style={{ minWidth: 0 }}` no `tpl-collapsible-inner`.
2. `navbar-collapse` tem `overflow-hidden` (modelo) ou `minWidth: 0` (dinâmico, onde há dropdown do usuário)?
3. A lista tem `flex-lg-nowrap overflow-hidden` e os `li` têm `flex-shrink-0 text-nowrap`? Alinhamento: `mx-lg-auto` (centralizada, modelos) ou `ms-lg-auto` (à direita, **template dinâmico: sempre à direita**).
4. O `<nav>` tem `position-relative` e há submenu? Usar o portal de 4.4; **nunca** `data-bs-toggle="dropdown"` dentro da lista que rola.
5. O menu do usuário está fora da lista?
6. `useNavScroll(active)` recebe `false` quando a lista não está montada?
7. Rodar `npm run typecheck` e `npx eslint` e **testar no navegador** com muitos itens e a janela estreita: setas, submenus em itens do começo, do meio e do fim.

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
