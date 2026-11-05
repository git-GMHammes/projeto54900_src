const e=`[◄ Índice da base de conhecimento](../README.md)\r
\r
---\r
\r
# Template002 — variante sem bordas\r
\r
O Template002 é a variante sem bordas do [Template001](README_template001_modelo.md). Mantém a\r
estrutura de cinco regiões (cabeçalho, nav, menu lateral, conteúdo e rodapé), o contrato de JSON, as\r
paletas e as animações do 001; muda só o visual. Este documento traz a **empresa vinculada** e o que\r
difere do 001. O contrato de JSON, as paletas e as animações ficam no 001 (seções 2, 5 e 12).\r
\r
---\r
\r
## 1. Empresa vinculada (banco)\r
\r
O vínculo fica em \`temp_manager.company_manager\`, uma lista JSON de slugs de empresa (a tabela\r
\`company_manager\` não tem coluna de template). Leitura no DEV em 2026-10-29, somente SELECT:\r
\r
| Campo do \`temp_manager\` | Valor                    |\r
| ----------------------- | ------------------------ |\r
| \`id\`                    | 2                        |\r
| \`code\`                  | \`template002\`            |\r
| \`name\`                  | Template 002             |\r
| \`description\`           | Ausência de bordas.      |\r
| \`company_manager\`       | \`["tryikads"]\`           |\r
| \`status\`                | \`active\`                 |\r
\r
| Empresa (\`slug\`)       | Paleta (\`color_theme\`) |\r
| ---------------------- | ---------------------- |\r
| \`tryikads\` (Tryik ADS) | \`Purple_dark\`          |\r
\r
Resumo dos três templates no DEV: \`default\` usa o \`template001\`, \`tryikads\` usa o \`template002\`, e\r
\`drsergiopsicologo\` não tem template vinculado (ver [Template003](README_template003_modelo.md)).\r
Como o frontend escolhe o template (usuário, empresa ou visitante): seção 16 do 001.\r
\r
---\r
\r
## 2. Rota e arquivos\r
\r
Rota \`/template002\` (também \`/<slug>/template002\`), pública e fora do \`RootLayout\`. \`template002\` é\r
**segmento reservado** em \`RESERVED_ROOT_SEGMENTS\` (\`config/env.ts\`): o primeiro segmento da URL não\r
vira slug de empresa, então \`/template002/\` abre o modelo estático (só JSON, sem sessão nem API) e não a\r
Home com dados do banco. Nenhuma empresa pode ter esse slug. Detalhe na abertura do 001.\r
\r
| Arquivo                                                                | Papel                                         |\r
| ---------------------------------------------------------------------- | --------------------------------------------- |\r
| \`src/pages/Template002/Template002Page.tsx\` e \`template002.json\`       | página e JSON de conteúdo (mesmas chaves do 001) |\r
| \`src/routes/template002.routes.tsx\` e \`paths.template002\`              | rota lazy                                     |\r
| \`public/img/template002/\`                                              | imagens (\`header_background.svg\`, \`footer_detail.png\`) |\r
| \`src/styles/_animations.scss\` e \`_custom.scss\`                         | \`.template002\` entra nas listas \`:is(...)\`; sticky \`template002-sticky\` |\r
\r
---\r
\r
## 3. O que muda em relação ao Template001\r
\r
- **Sem borda, sombra 3D, canto arredondado, espaço entre blocos e margem externa.** Os blocos ficam\r
  encostados e ocupam a tela toda.\r
- **Degradê entre os componentes.** O fundo de cada região é um degradê vertical: no topo recebe uma\r
  parcela da região de cima; na base, da região de baixo (\`sectionBlendCssVars\` em \`config/theme.ts\`,\r
  via \`color-mix\`). Vizinhas: cabeçalho, nav, (menu lateral e conteúdo), rodapé. Sem vizinha, a ponta\r
  fica na cor da própria região. Classe \`.tpl-blend\`.\r
- **Parcela misturada: 20%** (\`BLEND_NEIGHBOR_PERCENT\`). Com 30% duas paletas (\`CopaDoMundo\` e \`Natal\`)\r
  caíam abaixo do contraste 4,5; com 20% o menor contraste letra/fundo nas 11 paletas é 4,54.\r
- **Paletas:** as chaves de borda continuam no contrato (os mesmos JSONs servem aos dois templates),\r
  mas o 002 as ignora.\r
- **Cabeçalho:** a camada de contraste sobre a imagem usa o degradê do cabeçalho com 75% de opacidade.\r
- **Menu lateral:** sem o separador \`border-bottom\` entre itens; o espaço vem do \`py-2\`.\r
- **Nav com setas (a partir de \`lg\`):** os itens ficam em uma única linha (sem quebra). Quando passam da\r
  largura, aparecem duas setas (\`bi-chevron-left\` e \`bi-chevron-right\`) nas pontas; cada clique desliza a\r
  lista 75% da largura visível, de forma suave (a seta direita mostra os itens do fim). A seta fica\r
  desabilitada na ponta em que a lista já chegou. Lista que cabe na tela fica centralizada e sem setas.\r
  Abaixo de \`lg\` continua o hambúrguer vertical, sem setas. Hook \`hooks/useNavScroll.ts\`, só Bootstrap.\r
  **Código que funcionou** (validado no navegador em 2026-10-29), em \`Template002Page.tsx\`:\r
  - \`const navScroll = useNavScroll(navOpen);\` logo depois de \`navOpen\`.\r
  - \`<div className="tpl-collapsible-inner" style={{ minWidth: 0 }}>\` no nav. **Obrigatório:** o wrapper\r
    \`.tpl-collapsible\` é um grid de coluna \`auto\`; sem \`min-width: 0\` a coluna cresce até a largura dos\r
    itens, a página ganha rolagem horizontal e a lista nunca "extrapola" (as setas não aparecem).\r
  - \`<div className="collapse navbar-collapse justify-content-center overflow-hidden" ...>\`: sem\r
    \`overflow-hidden\` o item flex também não encolhe.\r
  - \`<ul ref={navScroll.ref} className="navbar-nav flex-lg-row flex-lg-nowrap overflow-hidden mx-lg-auto\r
    align-items-lg-center small">\`, itens \`li\` com \`flex-shrink-0 text-nowrap\`.\r
  - Setas \`{navScroll.overflow && <button ... d-none d-lg-inline-flex>}\` antes e depois da \`ul\`, com\r
    \`disabled={navScroll.atStart}\` / \`disabled={navScroll.atEnd}\` e \`navScroll.scrollNav('prev' | 'next')\`.\r
  - O ajuste foi só no 002 e no 003; o SCSS compartilhado \`.tpl-collapsible\` não foi alterado.\r
- **X no template dinâmico:** cabeçalho, nav, menu lateral e rodapé fecham pelo X, como no modelo; regras,\r
  chaves de estado e a barra mínima do nav fechado na seção 6 do\r
  [001](README_template001_modelo.md). No nav dinâmico o \`tpl-collapsible-inner\` leva \`minWidth: 0\`.\r
- **Nav do template dinâmico (produção) segue o modelo:** \`components/template/TemplateNavRegion.tsx\`\r
  (usado pelas três variantes) aplica o mesmo padrão em **todas as variantes** (desde 2026-11-03 o 001\r
  dinâmico também usa linha única, setas e submenus por portal; \`flat\` só define o estilo, com ou sem caixa). Comportamento:\r
  - **sem marca nem versão no nav** (vale para as três variantes): o antigo \`navbar-brand\` ("Menu" e "v1",\r
    de \`temp_nav.title\` e \`temp_nav.system_version\`) foi removido do \`TemplateNavRegion\`, junto das props\r
    \`brandName\` / \`brandVersion\`. O que sobra à esquerda é só o botão da grade que abre o Offcanvas (no 003\r
    sempre; no 001 e no 002 abaixo de \`lg\`). O nome do app continua só como título do menu lateral\r
    (\`TemplateShell\`, \`brandName\`); \`temp_nav.title\` e \`system_version\` seguem no banco;\r
  - itens em uma linha, **alinhados à direita** (\`flex-lg-nowrap overflow-hidden ms-lg-auto\`; no dinâmico o nav\r
    fica à direita nas três variantes, diferente do modelo, que centraliza com \`mx-lg-auto\`),\r
    \`li\` com \`flex-shrink-0 text-nowrap\`,\r
    separador \`|\` alinhado (o \`li\` com dropdown ganha \`d-lg-flex align-items-lg-center\`);\r
  - \`useNavScroll(flat)\` e as setas \`bi-chevron-left\` / \`bi-chevron-right\` antes e depois da lista;\r
  - \`style={{ minWidth: 0 }}\` no \`navbar-collapse\` (a mesma causa do grid, aqui no item flex);\r
  - **ícones mantidos:** continuam vindo de \`entry.icon\` (\`bi-...\`) do banco (\`temp_menu\`);\r
  - o **menu do usuário** saiu da lista e fica em uma \`ul\` própria depois da seta direita (não é cortado\r
    nem some ao deslizar o nav; vale também para o 001);\r
  - **submenus (Calendário, Timeline, Chat, Mensagem...):** o \`overflow-hidden\` da lista cortaria o menu\r
    aberto, e o Bootstrap não usa o Popper dentro de \`.navbar\` (\`data-bs-popper-config\` não resolve).\r
    **Tentativa que quebrou os submenus (não repetir):** manter o dropdown do Bootstrap com \`li\`\r
    \`position-static\` e reposicionar o menu em \`shown.bs.dropdown\`. **Solução em uso:** na variante plana o\r
    submenu é controlado pelo React (estado \`openKey\`, sem \`data-bs-toggle\`). O item vira um \`button\`\r
    (\`data-tpl-group-toggle\`); a partir de \`lg\` o menu aberto é desenhado por **portal dentro do \`<nav>\`**\r
    (\`position: absolute; top: 100%\`, \`left\` calculado contra o nav e limitado à largura dele, na ref\r
    \`placeMenu\`), fora da lista que rola, então nada o corta. Abaixo de \`lg\` o menu fica em fluxo dentro do\r
    item. Fecha ao clicar fora, Escape, rolar a lista, redimensionar ou escolher um item. A rota própria do\r
    grupo (\`entry.to\`), se existir, vira o primeiro item do submenu. O menu do usuário continua no\r
    dropdown do Bootstrap.\r
- **Animações:** as mesmas 14 do 001. A 11 (sombra 3D no hover) vira um clareamento leve\r
  (\`brightness(1.04)\`).\r
- **Resquícios de borda no celular (corrigidos):** imagem do cabeçalho trocada por\r
  \`header_background.svg\` (retângulo reto), \`--bs-navbar-toggler-border-color\` transparente,\r
  \`--bs-offcanvas-border-width\` zero e imagem do rodapé sem \`rounded\`. O \`footer_detail.png\` ainda\r
  tem cantos arredondados desenhados na própria imagem.\r
- **Rodapé no sistema real:** variante \`flat\` (classe \`tpl-blend\`, sem borda, sombra nem canto\r
  arredondado); detalhe na seção 15 do 001.\r
\r
---\r
\r
## 4. Código validado do nav com setas e submenus (referência para outros templates)\r
\r
Validado no navegador em 2026-10-29 (nav do modelo e do template dinâmico). Copiar daqui ao levar o\r
mesmo comportamento para outro template; **não improvisar**: cada peça abaixo existe porque a\r
alternativa falhou.\r
\r
### 4.1 Armadilhas (o que falhou e por quê)\r
\r
| Sintoma | Causa | Correção |\r
| ------- | ----- | -------- |\r
| Página com rolagem horizontal, nav passa da tela e as setas nunca aparecem | \`.tpl-collapsible\` é um grid de coluna \`auto\`; o item do grid tem largura mínima automática igual ao conteúdo (40 itens sem quebra) | \`style={{ minWidth: 0 }}\` no \`tpl-collapsible-inner\` do nav (modelos) |\r
| Mesmo sintoma, agora no item flex | \`navbar-collapse\` é item flex com largura mínima automática | modelos: \`overflow-hidden\` no \`navbar-collapse\`; dinâmico: \`style={{ minWidth: 0 }}\` no \`navbar-collapse\` |\r
| Submenu cortado ou quebrado dentro da lista | \`overflow-hidden\` da lista corta o dropdown do Bootstrap; o Bootstrap **não usa o Popper dentro de \`.navbar\`**, então \`data-bs-popper-config\` e \`strategy: fixed\` não resolvem | submenu controlado pelo React com portal no \`<nav>\` (4.4) |\r
| Submenus quebraram | tentativa de manter o dropdown do Bootstrap com \`li\` \`position-static\` e reposicionar em \`shown.bs.dropdown\` | **não repetir**; usar 4.4 |\r
| Menu do usuário sumia ou era cortado ao deslizar | estava dentro da lista que rola | \`ul\` própria fora da lista, depois da seta direita |\r
| Separador \`\\|\` fora da linha nos itens com submenu | \`li\` com dropdown sem \`d-lg-flex align-items-lg-center\` | classes no \`li\` |\r
\r
### 4.2 Hook \`hooks/useNavScroll.ts\` (igual para qualquer template)\r
\r
\`\`\`ts\r
import { useCallback, useEffect, useRef, useState } from 'react';\r
\r
interface NavScrollState { overflow: boolean; atStart: boolean; atEnd: boolean }\r
\r
/** Fração da largura visível percorrida a cada clique numa seta. */\r
const SCROLL_STEP = 0.75;\r
\r
export function useNavScroll(active = true) {\r
  const ref = useRef<HTMLUListElement>(null);\r
  const [state, setState] = useState<NavScrollState>({ overflow: false, atStart: true, atEnd: true });\r
\r
  const measure = useCallback(() => {\r
    const el = ref.current;\r
    if (!el) return;\r
    const max = el.scrollWidth - el.clientWidth;\r
    const next: NavScrollState = { overflow: max > 1, atStart: el.scrollLeft <= 1, atEnd: el.scrollLeft >= max - 1 };\r
    setState((prev) =>\r
      prev.overflow === next.overflow && prev.atStart === next.atStart && prev.atEnd === next.atEnd ? prev : next,\r
    );\r
  }, []);\r
\r
  useEffect(() => {\r
    const el = ref.current;\r
    if (!active || !el) return;\r
    measure();\r
    const observer = new ResizeObserver(measure);\r
    observer.observe(el);\r
    el.addEventListener('scroll', measure, { passive: true });\r
    return () => {\r
      observer.disconnect();\r
      el.removeEventListener('scroll', measure);\r
    };\r
  }, [active, measure]);\r
\r
  const scrollNav = useCallback((direction: 'prev' | 'next') => {\r
    const el = ref.current;\r
    if (!el) return;\r
    el.scrollBy({ left: el.clientWidth * SCROLL_STEP * (direction === 'next' ? 1 : -1), behavior: 'smooth' });\r
  }, []);\r
\r
  return { ref, ...state, scrollNav };\r
}\r
\`\`\`\r
\r
\`active\` deve ser \`false\` quando a lista não está montada (ex.: nav fechado no modelo: \`useNavScroll(navOpen)\`).\r
\r
### 4.3 Nav dos modelos (\`Template002Page.tsx\`, \`Template003Page.tsx\`)\r
\r
\`\`\`tsx\r
const navOpen = !closed.has('nav');\r
const navScroll = useNavScroll(navOpen);\r
\r
<div className={collapsibleClass('nav')}>\r
  {/* minWidth 0: o item do grid não pode ter a largura mínima dos itens do nav */}\r
  <div className="tpl-collapsible-inner" style={{ minWidth: 0 }}>\r
    <nav className="tpl-region tpl-blend navbar navbar-expand-lg position-relative ...">\r
      <div className="collapse navbar-collapse justify-content-center overflow-hidden" id="template002-nav">\r
        {navScroll.overflow && (\r
          <button type="button" aria-label="Rolar nav para a esquerda" disabled={navScroll.atStart}\r
            className="btn btn-sm border-0 text-body fs-5 lh-1 px-1 flex-shrink-0 d-none d-lg-inline-flex"\r
            onClick={() => navScroll.scrollNav('prev')}>\r
            <i className="bi bi-chevron-left" aria-hidden="true" />\r
          </button>\r
        )}\r
        <ul ref={navScroll.ref}\r
          className="navbar-nav flex-lg-row flex-lg-nowrap overflow-hidden mx-lg-auto align-items-lg-center small">\r
          {navItems.map((item, i) => (\r
            <li key={item.id} className="tpl-nav-item nav-item flex-shrink-0 text-nowrap d-lg-flex align-items-lg-center">\r
              <a href={item.url} className="tpl-nav-link nav-link px-lg-1">{item.label}</a>\r
              {i < navItems.length - 1 && <span className="d-none d-lg-inline mx-1 text-body-secondary">|</span>}\r
            </li>\r
          ))}\r
        </ul>\r
        {navScroll.overflow && (\r
          <button type="button" aria-label="Rolar nav para a direita" disabled={navScroll.atEnd}\r
            className="btn btn-sm border-0 text-body fs-5 lh-1 px-1 flex-shrink-0 d-none d-lg-inline-flex"\r
            onClick={() => navScroll.scrollNav('next')}>\r
            <i className="bi bi-chevron-right" aria-hidden="true" />\r
          </button>\r
        )}\r
      </div>\r
    </nav>\r
  </div>\r
</div>\r
\`\`\`\r
\r
### 4.4 Nav do template dinâmico (\`components/template/TemplateNavRegion.tsx\`, variante \`flat\`)\r
\r
Estado e efeitos (dentro do componente):\r
\r
\`\`\`tsx\r
const navScroll = useNavScroll(flat);\r
const [navEl, setNavEl] = useState<HTMLElement | null>(null);          // ref do <nav> como estado (usado no portal)\r
const [openKey, setOpenKey] = useState<string | null>(null);\r
const [isLg, setIsLg] = useState(() => window.matchMedia('(min-width: 992px)').matches);\r
const menuLeft = useRef(0);\r
\r
useEffect(() => {                                                       // acompanha o breakpoint lg\r
  const media = window.matchMedia('(min-width: 992px)');\r
  const onChange = () => setIsLg(media.matches);\r
  media.addEventListener('change', onChange);\r
  return () => media.removeEventListener('change', onChange);\r
}, []);\r
\r
useEffect(() => {                                                       // fecha: clique fora, Escape, rolar, redimensionar\r
  if (openKey === null) return;\r
  const close = () => setOpenKey(null);\r
  const onPointerDown = (e: PointerEvent) => {\r
    const t = e.target;\r
    if (t instanceof Element && (t.closest('[data-tpl-group-toggle]') || t.closest('.tpl-group-menu'))) return;\r
    close();\r
  };\r
  const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };\r
  const list = navScroll.ref.current;\r
  document.addEventListener('pointerdown', onPointerDown);\r
  document.addEventListener('keydown', onKeyDown);\r
  list?.addEventListener('scroll', close, { passive: true });\r
  window.addEventListener('resize', close);\r
  return () => { /* remove os quatro listeners */ };\r
}, [openKey, navScroll.ref]);\r
\r
const toggleGroup = (e: MouseEvent<HTMLElement>, key: string) => {\r
  if (openKey === key) { setOpenKey(null); return; }\r
  if (navEl) menuLeft.current = e.currentTarget.getBoundingClientRect().left - navEl.getBoundingClientRect().left;\r
  setOpenKey(key);\r
};\r
\r
/** Ref do menu em lg: sob o item, sem passar da largura do nav. */\r
const placeMenu = (menu: HTMLUListElement | null) => {\r
  if (!menu || !navEl) return;\r
  menu.style.left = \`\${Math.max(0, Math.min(menuLeft.current, navEl.clientWidth - menu.offsetWidth))}px\`;\r
};\r
\`\`\`\r
\r
Marcação:\r
\r
\`\`\`tsx\r
<nav ref={setNavEl} className="tpl-region navbar navbar-expand-lg position-relative ..."> {/* position-relative é obrigatório: o menu em portal é absoluto em relação ao nav */}\r
  <div className="collapse navbar-collapse" id="tpl-nav" style={flat ? { minWidth: 0 } : undefined}>\r
    {/* seta esquerda (igual a 4.3, condicionada a flat && navScroll.overflow) */}\r
    <ul ref={navScroll.ref}\r
      className={\`navbar-nav flex-lg-row align-items-lg-center small \${flat ? 'flex-lg-nowrap overflow-hidden ms-lg-auto' : 'ms-auto flex-wrap'}\`}>\r
      {/* item com submenu (flat): botão, sem data-bs-toggle; o ícone vem de entry.icon (bi-...) do temp_menu */}\r
      <li className="tpl-nav-item nav-item flex-shrink-0 text-nowrap d-lg-flex align-items-lg-center">\r
        <button type="button" data-tpl-group-toggle="" className="tpl-nav-link nav-link px-lg-1"\r
          aria-haspopup="true" aria-expanded={openKey === entry.key} onClick={(e) => toggleGroup(e, entry.key)}>\r
          {entry.icon && <i className={\`bi bi-\${entry.icon} me-1\`} aria-hidden="true" />}\r
          {entry.label}\r
        </button>\r
        {/* abaixo de lg o menu fica em fluxo dentro do item */}\r
        {!isLg && openKey === entry.key && <ul className="tpl-group-menu dropdown-menu show">{groupMenuItems(entry)}</ul>}\r
        {/* separador | */}\r
      </li>\r
    </ul>\r
    {/* seta direita */}\r
    {/* a partir de lg: portal dentro do <nav>, FORA da lista que rola */}\r
    {flat && isLg && openEntry && navEl &&\r
      createPortal(\r
        <ul ref={placeMenu} className="tpl-group-menu dropdown-menu show" style={{ top: '100%' }}>\r
          {groupMenuItems(openEntry)}\r
        </ul>,\r
        navEl,\r
      )}\r
    {/* menu do usuário: ul própria, fora da lista que rola (dropdown do Bootstrap, sem corte) */}\r
    <ul className="navbar-nav flex-shrink-0 ms-lg-2">{/* li.nav-item.dropdown do usuário */}</ul>\r
  </div>\r
</nav>\r
\`\`\`\r
\r
\`groupMenuItems(entry)\` devolve \`<li><NavLink className="dropdown-item" to=... end onClick={closeGroup}>\` para\r
a rota própria do grupo (se houver) e para cada filho. Regras: ícones sempre de \`entry.icon\`; todas as\r
variantes usam este caminho.\r
\r
### 4.5 Checklist ao levar para outro template\r
\r
1. A região do nav está dentro de \`.tpl-collapsible\`? Então \`style={{ minWidth: 0 }}\` no \`tpl-collapsible-inner\`.\r
2. \`navbar-collapse\` tem \`overflow-hidden\` (modelo) ou \`minWidth: 0\` (dinâmico, onde há dropdown do usuário)?\r
3. A lista tem \`flex-lg-nowrap overflow-hidden\` e os \`li\` têm \`flex-shrink-0 text-nowrap\`? Alinhamento: \`mx-lg-auto\` (centralizada, modelos) ou \`ms-lg-auto\` (à direita, **template dinâmico: sempre à direita**).\r
4. O \`<nav>\` tem \`position-relative\` e há submenu? Usar o portal de 4.4; **nunca** \`data-bs-toggle="dropdown"\` dentro da lista que rola.\r
5. O menu do usuário está fora da lista?\r
6. \`useNavScroll(active)\` recebe \`false\` quando a lista não está montada?\r
7. Rodar \`npm run typecheck\` e \`npx eslint\` e **testar no navegador** com muitos itens e a janela estreita: setas, submenus em itens do começo, do meio e do fim.\r
\r
---\r
\r
[◄ Índice da base de conhecimento](../README.md)\r
\r
---\r
\r
### 📌 Metadados do Autor\r
\r
| Campo               | Informação                                                                                                                   |\r
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |\r
| **Nome**            | Gustavo Hammes                                                                                                               |\r
| **Local**           | Rio de Janeiro                                                                                                               |\r
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |\r
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |\r
`;export{e as default};
