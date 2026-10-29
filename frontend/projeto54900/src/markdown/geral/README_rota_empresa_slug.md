[◄ Índice da base de conhecimento](../README.md)

---

# Rota com slug da empresa — `/<slug-empresa>/v1/...` (multiempresa)

Cada empresa tem um endereço próprio. O slug é o **primeiro segmento** da URL e vira parte do `basename` do router,
então nenhuma rota escrita no código (`paths.ts`, menu vindo do banco, `navigate`, `Link`) precisa conhecer o slug.
Regras da API em `README_multiempresa_isolamento.md` e `README_multiempresa_guia_modulos.md` (backend).

## 1. Endereços

| URL | Efeito |
| --- | ------ |
| `/v1/login`, `/v1/...` público (home, cadastro) | sem slug: empresa DEFAULT no login |
| `/<slug>/v1/login` | login na empresa do slug (só entra quem tem vínculo ativo) |
| `/<slug>/v1/...` | rotas autenticadas; o slug tem de ser o da sessão |
| `/acesso-negado` | página fixa da raiz, nunca é slug |

## 2. Peças do código

| Arquivo | Papel |
| ------- | ----- |
| `config/env.ts` (BLOCO 5) | `companySlug` lido **uma vez** da URL de carga; `companyBasePath(slug)` = `<basePath>/<slug>`; `routerBasename` já inclui o slug |
| `routes/RequireAuth.tsx` | compara `user.company_slug` com `companySlug`; diferente ou ausente: `window.location.replace` para a empresa da sessão, preservando caminho, query e hash |
| `pages/v1/auth/LoginPage.tsx` | após o login, `window.location.assign(companyBasePath(slug) + '/')` (navegação completa para fixar o basename) |
| `services/v1/auth.service.ts` | `POST auth/login` envia `company_slug` quando a URL tem slug |
| `context/AuthContext.tsx` | `login()` devolve o `company_slug`; a sessão é restaurada pelo refresh token |
| `components/template/TemplateNavRegion.tsx` (antes `components/layout/Navbar.tsx`) | sair com slug volta para a raiz sem slug (`env.basePath/`) por navegação completa |
| `types/auth.ts` | `AuthCompany {id, name, slug}`, `AuthUser.companies`, `AuthUser.company_slug`, `LoginPayload.company_slug` |

## 3. Regra de leitura do slug (`readCompanySlug`)

1. Remove o `env.basePath` do `pathname` e pega o primeiro segmento.
2. **Não é slug:** vazio, `acesso-negado` (`RESERVED_ROOT_SEGMENTS`) e grupos de versão (`/^v\d+[a-z]*$/`: `v1`, `v1a`...).
3. É slug se casar com `/^[a-z0-9-]+$/`; senão, `null`.

Slug de empresa não pode, portanto, ser `acesso-negado` nem parecer versão (`v2`).

## 4. Fluxo

1. Usuário abre `/acme/v1/login`. `companySlug = 'acme'`, `routerBasename = '/acme'`.
2. Login envia `company_slug: 'acme'`. A API devolve `company_slug` e `user.companies`.
3. `LoginPage` faz navegação completa para `/acme/`; o app recarrega com o basename correto.
4. Em toda rota protegida, `RequireAuth` confere o slug da URL contra o da sessão.
5. Logout vai para a raiz sem slug. Trocar de empresa = sair e entrar pelo endereço da outra empresa.

## 4.1 Home (landing page) por empresa

A rota índice (`/` e `/<slug>`) renderiza `pages/Home/CompanyHome.tsx`, que escolhe a Home pelo slug da URL
(`companySlug`); sem slug na URL usa `default`. **Estática** (código, sem API) e dentro do `TemplateLayout`.

- Registro: `pages/Home/company/companyHomes.ts` (`COMPANY_HOMES`, slug -> componente).
- **`default` (`DefaultHome.tsx`)** mantém a página de cards informativos do projeto (`HomePage.tsx`).
- **Empresa sem Home própria usa a da `default`** (fallback em `CompanyHome`): `/`, `/default` e
  `/drsergiopsicologo` mostram os cards.
- **`tryikads` (`TryikadsHome.tsx`)** tem Home própria, construída aos poucos em **rows responsivas do Bootstrap**.
  Hoje só a **row 1**, montada a partir da arte do cliente (`doc/img/tryikads/img_8.jpeg`): `row g-0` com a
  imagem `img/tryikads/interior_carro_002.jpg` como **fundo da própria row** (`style`: `backgroundImage`, `cover`,
  `center` e **`aspectRatio: '1024 / 572'`**, a proporção da imagem; o Bootstrap não tem utilitário de imagem de
  fundo). A imagem não leva overlay nem filtro; o texto é HTML. **Decisão:** o texto da arte do cliente é
  refeito em HTML (responsivo, editável, legível por leitor de tela), não usado como imagem; o fundo é só a foto.
  - **Conteúdo da row 1** (de cima para baixo): logo (`img/tryikads/logo.png`, `10em`) com "ADS" sobreposto à
    direita; chamada `PUBLICIDADE DIGITAL EM MOVIMENTO` (maiúsculas, espaçamento largo); título **"Promoções /
    que geram / resultado."** em `3em`, `fw-bolder`, com "que geram" em **degradê igual ao logo Tryik** (ciano `#00d4ff` → azul `#2f6bff` → violeta `#8b3dff` →
    magenta `#e02bff` → rosa `#ff5ce1`); parágrafo "Divulgue ofertas e condições especiais...".
    - **Texto em degradê** (`GRADIENT_TEXT_STYLE`): `background-clip: text` + `-webkit-text-fill-color:
      transparent`; o Bootstrap não tem texto em degradê. Aplicado num `d-inline-block` dentro do `d-block`, para
      o degradê cobrir **só a palavra** (num `d-block` ele se estica pela coluna inteira e o rosa cai fora do texto).
    - **Armadilha (não repetir):** o `text-shadow` do card é **herdado** pelo trecho em degradê e, com o preenchimento
      transparente, aparece **por dentro das letras**: todas ficavam de uma cor só (roxo). Por isso o trecho leva
      **`textShadow: 'none'`**, e o brilho vem de `filter: drop-shadow` (acompanha só as letras). As tentativas
      anteriores (azul→rosa e branco→rosa) falharam por esse motivo, não pelas cores.
  - **Sem fundo no card:** `card bg-transparent border-0 text-white`; o card só mantém o espaço. Letras brancas
    com `textShadow` roxo escuro (`0 2px 6px rgb(46 16 101 / 0.9)`) para ler sobre a foto clara.
  - **Posição:** coluna `col-12 col-lg-5` (de `lg` para cima o texto ocupa cerca de **42% da largura da row**, à
    esquerda, em desktop e TV; no celular a coluna é inteira).
  - **Letras proporcionais:** `fontSize: clamp(0.8rem, 1.7vw, 2.2rem)` no card; logo, título e chamada usam `em`.
  - **Fundo nunca cortado:** a row segue a proporção da imagem. Se o conteúdo for mais alto que a row (celular
    estreito, onde a row tem ~200px), a row cresce e o `cover` corta um pouco.
  - **Rows 2 a 5 — 4 linhas x 3 cards = 12 cards** (`FEATURE_ROWS`, em `TryikadsHome.tsx`): cada linha é um
    segmento, com os 3 cards do meio da arte correspondente do cliente (`doc/img/tryikads/`): **Promoções**
    (`img_8`: Ofertas da semana, Descontos exclusivos, Ações sazonais), **Serviços** (`img_7`: Clínicas e
    profissionais, Prestadores de serviços, Agendamentos e contatos), **Institucional** (`img_9`: Posicionamento
    de marca, Responsabilidade social, Comunicação institucional) e **Eventos** (`img_10`: Shows e festivais,
    Inaugurações e feiras, Campanhas especiais). A `img_6` é a arte de abertura ("O que sua marca pode
    anunciar?"), com cards de benefício geral; **não entrou** nestas 4 linhas.
    - **Sem repetição:** textos e ícones são únicos. Os ícones originais repetiam entre artes (megafone,
      calendário, pessoas), então foram trocados: `tag`, `percent`, `cart`, `people`, `gear`, `calendar-check`,
      `bullseye`, `heart`, `bar-chart`, `music-note-beamed`, `shop`, `megaphone` (um por card).
    - **Layout:** cada linha `row g-3`, cada card `col-12 col-md-4` (1 por linha no celular, 3 lado a lado de
      `md`); `card h-100 bg-white bg-opacity-10 border-0 text-white text-center`; ícone numa caixa arredondada
      com **borda em degradê** (`ICON_BOX_STYLE`, `style` porque o Bootstrap não tem borda em degradê), título em
      maiúsculas e texto `small`. Para trocar um card, editar só o item em `FEATURE_ROWS`.
  - **A fazer:** a faixa "Ideal para" das artes (ícones em linha) não foi montada. Pendente do cliente: fonte
    exata, cores do degradê e logo em SVG/PNG transparente com o "ADS" incluído.
- **Imagens das Homes** ficam na **public do frontend**, em `public/img/<slug>/` (o build copia para
  `src/public/app/img/<slug>/`); a URL é `env.basePath` + `img/<slug>/arquivo` (`assetUrl`). A public do backend
  e as pastas de upload ficam para arquivos enviados pelos usuários, não para imagem fixa de página.
- Criar a Home de uma empresa: arquivo novo `pages/Home/company/<Slug>Home.tsx` e uma linha em `COMPANY_HOMES`,
  com o slug exatamente como está em `company_manager.slug`.
- Histórico: na primeira versão (2026-10-29) a `default` foi montada vazia por engano de interpretação e
  tirou os cards de todas as empresas; corrigido no mesmo dia.

## 5. Regras para quem mantém

- **Nunca** montar link com o slug manualmente nem recalcular o basename: use `paths`, `Link`/`navigate` e, para redirect completo, `companyBasePath()`.
- Mudar de empresa exige **navegação completa** (o basename é fixado na carga).
- O slug da URL não dá acesso: a autorização é da sessão (`cid` no JWT). Slug adulterado só gera redirect para a empresa da sessão.
- Deploy: o servidor precisa devolver o `index.html` para qualquer caminho (`try_files $uri $uri/ /index.html` em `docker/nginx/default.conf`), inclusive `/<slug>/v1/...`. Em subpasta, `VITE_BASE_PATH` vem antes do slug.
- Telas de empresas, membros e usuários por empresa: ver [`README_rotas_frontend.md`](README_rotas_frontend.md) (seção company-manager) e [`modulos/company-manager/README_plano.md`](modulos/company-manager/README_plano.md).

## 6. Como validar

1. `/<slug>/v1/login` com usuário da empresa: entra e a URL fica `/<slug>/...`.
2. Mesmo usuário em `/<outro-slug>/v1/...` com sessão aberta: redireciona para o slug da sessão.
3. Usuário sem vínculo ativo na empresa: mensagem genérica de usuário ou senha inválidos.
4. Sair: volta para a raiz sem slug.
5. Recarregar (F5) em `/<slug>/v1/<qualquer-rota>`: abre a mesma tela.

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
