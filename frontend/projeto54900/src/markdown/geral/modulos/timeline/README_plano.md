[◄ Índice da base de conhecimento](../../../README.md)

---

# Módulo `timeline` — plano e estado atual

Feed social do sistema: cada usuário ganha uma timeline própria na primeira
publicação; o feed mistura publicações de todas as timelines. Backend
completo e as duas telas de frontend (listagem clássica e Home Feed) prontas
e validadas por `typecheck`/`lint`. Detalhe técnico completo (modelo de
dados, regras de negócio, decisões registradas) fica no README do backend:
[`app/markdown/geral/README_modulo_timeline.md`](../../../../../../../app/markdown/geral/README_modulo_timeline.md)
— este documento aqui é o resumo do lado frontend + o estado geral do
módulo, no mesmo formato de
[`calendar/README_calendar.md`](../calendar/README_calendar.md).

## ✅ O que está pronto

### Backend — completo e testado

- **7 tabelas** (`timeline_manager`, `timeline_posts`, `timeline_post_attachments`,
  `timeline_post_comments`, `timeline_post_reactions`, `timeline_post_ratings`,
  `timeline_post_reports`) + **7 views** (o feed `view_timeline_posts` + uma
  de apoio por tabela).
- **189 rotas** do contrato canônico (7×18 de tabela + 7×9 de view) — `Controller`/
  `Request`/`Processor`/`Model` de cada recurso, testados um a um (
  `src/writable/claude/timeline_api_testes_resultado.json`).
- **1 rota extra** — `GET /api/v1/timeline-posts-view/home-feed?seed=&page=&limit=` —
  o algoritmo do feed misto (cotas 3/3/2/2: hoje aleatório / outros usuários
  aleatório / mais curtidos / mais bem avaliados), mesmo padrão de rota extra
  do Calendar (`respond`, `accept-token`). Detalhe do algoritmo:
  `README_modulo_timeline.md` seção 5.1.
- **5 formulários** (`form_manager`) já funcionam **hoje** pelo renderizador
  genérico `/v1/form/<slug>` (`pages/v1/form/FormRendererPage.tsx`) — não
  precisaram de página própria: `timeline-post`, `timeline-settings`,
  `timeline-comment`, `timeline-report`, `timeline-attachment`.

### Frontend — duas telas, com propósitos diferentes

| Tela                  | Rota                 | Página                                            | O que é                                                                                                                                                                                                      |
| --------------------- | -------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Listagem clássica** | `/v1/timeline-posts` | `pages/v1/timeline/timeline-posts/GetAllPage.tsx` | Tabela paginada (motor `list_manager`/`list_columns`/`list_actions`, slug `timeline-feed`), mesmo padrão de `calendar-list`. Curtir/Avaliar/Republicar chamam a API de verdade (`list_actions.data_action`). |
| **Home Feed**         | `/v1/timeline`       | `pages/v1/timeline/home-feed/GetAllPage.tsx`      | Feed misto (algoritmo do backend), **scroll infinito** 10 em 10, card único por post, botão flutuante de novo post.                                                                                          |

A Home Feed **não substitui** a listagem clássica — foi pedido explícito do
usuário terem os dois: uma é o feed algorítmico "página inicial", a outra é
a listagem tradicional (base para uma futura tela "timeline deste usuário").

**Peças da Home Feed** (`pages/v1/timeline/home-feed/`):

- `GetAllPage.tsx` — gera um `seed` uma vez (estável durante o scroll,
  garante paginação sem repetição), carrega páginas via `getHomeFeed`,
  scroll infinito, botão flutuante. **Correção 2026-09-28:** o scroll parava
  na 1ª página quando um balde do algoritmo vinha vazio (ex.: todos os posts
  do mesmo usuário) — o backend agora monta uma ordem global pelo `seed`
  (completa vagas, sem repetir) e devolve `pagination.has_more`, que o
  frontend usa no lugar de "veio 10 itens" (`README_modulo_timeline.md` §5.1).
- `PostCard.tsx` — o template único do post: `MediaPreview` (mídia) →
  título/descrição → curtir/avaliar (estrelas)/comentar/denunciar → 3
  comentários **mais recentes** (último no topo) + "ver mais" com scroll
  infinito próprio (antigos abaixo) + botão de novo comentário.
  **Correção 2026-09-28:** a 1ª carga (limit 3) e o "ver mais" (page 2,
  limit 10) usavam tamanhos diferentes — a API pulava os itens 4-10 e a
  sentinela ficava pedindo páginas vazias em loop. Agora cada carga é uma
  janela (`page=1`, `limit` = exibidos + 10, `id DESC`) com trava
  `commentsExhausted`; "Recolher" volta a mostrar só os 3 mais recentes.
- `NewPostModal.tsx` — modal do botão flutuante, reaproveita a técnica do
  `FormRendererPage` (schema do `form_manager` `timeline-post` + `FormGrid`),
  sem navegar de página. **Form enxuto desde 2026-09-28:** só "Publicação*"
  e "Anexo" — Timeline, Republicar de, Título e Status saíram do form (soft
  delete; as colunas continuam no banco por uso interno — ver
  `app/markdown/geral/form/timeline/timeline_posts.md`). Republicar fica
  como ação sobre um post existente (hoje só na listagem clássica; um botão
  no `PostCard` é sugestão futura). **Fake fill (dev-only, 2026-09-28):**
  botão "Fake fill" com o modal aberto — texto médio + imagem aleatória de
  `doc/clipart_teste` (`dev/fakeFill/timelinePost.ts`; detalhe em
  [`README_envHost.md`](../../README_envHost.md)).

- `NewCommentModal.tsx` (2026-09-28) — modal "Novo comentário" do
  `PostCard`, agora pelo form `timeline-comment` + `FormGrid` (antes era um
  `<textarea>` escrito à mão, sem tooltip): mostra só "Comentário*" — o post
  vem do card (`timeline_post_id` injetado) e "Responder a" não se aplica na
  Home Feed. Fake fill dev-only (`dev/fakeFill/timelineComment.ts`).

**Tooltips (2026-09-28):** todos os campos dos 5 forms da Timeline têm
`help_text` (regra de `app/markdown/geral/README_modulo_form.md` §2.4).
Auditoria do sistema achou **124 campos sem tooltip em outros módulos**
(form-constructor, list-constructor, usuário, nav, menu, role, route,
upload) — tarefa separada: propor os textos num markdown para revisão antes
de gravar.

**Componentes/hooks globais novos** (reaproveitáveis por qualquer módulo,
não só Timeline):

- [`hooks/useInfiniteScroll.ts`](../../../../hooks/useInfiniteScroll.ts) —
  primeiro hook de scroll infinito do projeto (`IntersectionObserver`).
- [`components/global/MediaPreview.tsx`](../../../../components/global/MediaPreview.tsx) —
  imagem/vídeo tocam inline; PDF/Office/planilha/áudio/arquivo viram ícone
  Bootstrap num card médio, clicável.

**Services novos** (`services/v1/`): `timelinePosts.table.ts` (+ `getHomeFeed`
extra), `timelinePostComments.table.ts` + `.view.ts`,
`timelinePostReactions.table.ts`, `timelinePostRatings.table.ts`,
`timelinePostAttachments.table.ts`.

**Menu:** "Timeline" (dropdown navbar) → "Início" (`/v1/timeline`, Home Feed)
e "Feed" (`/v1/timeline-posts`, listagem clássica) — os 5 formulários e a
listagem **não** têm item de menu próprio, aparecem de forma genérica em
"Listar Formulários"/"Listar" (mesmo padrão de todos os outros módulos).

**Validação feita:** `php -l` em todos os arquivos backend; `npm run typecheck`
e `npm run lint` limpos em todos os arquivos frontend novos/alterados; teste
HTTP manual sem token confirmando `401` (proteção `jwtauth` ativa).

## ⚠️ Pendências — para continuar depois

1. ~~**Upload de anexo não está ligado no backend.**~~ **RESOLVIDO em
   2026-09-28** (plano `src/writable/claude/20260928081213_upload_anexo_timeline_*`).
   Backend exclusivo da Timeline (`timeline_post_attachments`, nunca o
   módulo Upload):
   - envio = o próprio `POST .../timeline-post-attachments/create`
     (multipart, campo `file`, já existia); **1 anexo por publicação** — o
     segundo responde `409`;
   - novo `EndpointUpload.php` com `GET serve/{id}` e `GET download/{id}`
     (sob `jwtauth`); `file_url` agora é preenchido com a URL de serve.
   - Frontend: novo tipo de campo **`arquivo`** no FormGrid
     (`components/ui/FormGrid/arquivo`), campo "Anexo" (`file`) no form
     `timeline-post` (SQL `doc/sql/insert/20260928081213_timeline_post_campo_arquivo.sql`,
     banco DEV); `NewPostModal` envia em 2 etapas (post JSON → anexo
     multipart; falha no anexo mantém o post e avisa); `PostCard` baixa o
     binário com token (`http.ts` `responseType: 'blob'`) e passa um `blob:`
     URL ao `MediaPreview` — `<img src>` direto daria 401.
2. ~~**Curtir/Avaliar são "write-only".**~~ **RESOLVIDO em 2026-09-27** —
   `Processor::homeFeed` devolve `my_reaction_id`/`my_rating` por post (2
   queries em lote, sem N+1); `PostCard.tsx` inicia `liked`/`myRating` com
   esses valores, então recarregar a página mantém a marcação (decisão 13
   do `README_modulo_timeline.md`).
3. **"Denunciar" não pré-preenche a publicação.** Abre
   `/v1/form/timeline-report` (formulário genérico) e o usuário escolhe a
   publicação num select remoto — funciona, mas não é tão direto quanto
   poderia ser.
4. **Sem página de detalhe nem de edição de post.** Os `list_actions` "Ver"
   (`/v1/timeline-posts/{id}`), "Comentar"
   (`/v1/timeline-post-comments?timeline_post_id={id}`) e "Editar"
   (`/v1/timeline-posts/update/{id}`) da **listagem clássica** apontam para
   rotas que não existem — clicar cai em 404 (documentado em
   `README_rotas_frontend.md`, mesmo padrão aceito em `upload.routes.tsx`).
   Só existe formulário de **criação** de post (`timeline-post`), não de
   edição.
5. **Falta a "timeline agrupada pelo ID do usuário criador".** Pedido
   original do usuário ("essa página inicial não substitui a necessidade das
   listas padrões na timeline agrupada pelo ID do usuário Criador") — hoje a
   listagem clássica (`/v1/timeline-posts`) mostra TODOS os posts, sem
   filtro por autor. Precisa de: um jeito de navegar para "a timeline de
   fulano" (provavelmente `?timeline_manager_id=` ou `?user_manager_id=` via
   `POST .../find`, já suportado pela API) e um link a partir do nome do
   autor no `PostCard`/na listagem para chegar lá.
6. **Corpo do `api_call` de curtir/avaliar/republicar na listagem clássica**
   foi resolvido só **localmente** (`list_actions.data_action`, lido pelo
   `ActionButton` de `pages/v1/timeline/timeline-posts/GetAllPage.tsx`) — o
   motor genérico do Construtor de Listas (`utils/listConstructor.tsx`)
   continua sem suporte nativo a corpo de `api_call`. Se outra lista do
   sistema precisar do mesmo no futuro, vale generalizar no motor em vez de
   repetir a solução local.
7. **Avaliação por `window.prompt`** não existe mais na listagem clássica
   (foi substituída por estrelas clicáveis no `PostCard` da Home Feed) — mas
   a ação "Avaliar" da listagem clássica (Fase 2) ainda usa o prompt simples.
   Se a listagem clássica continuar em uso, considerar trocar pelo mesmo
   componente de estrelas.

## Arquivos

- Backend: `src/app/{Controllers,Services,Models,Requests,Config/Routes}/**/Timeline/**`
  — ver `app/markdown/geral/README_modulo_timeline.md` para o mapa completo.
- Frontend:
  - [`pages/v1/timeline/timeline-posts/GetAllPage.tsx`](../../../../pages/v1/timeline/timeline-posts/GetAllPage.tsx) — listagem clássica.
  - [`pages/v1/timeline/home-feed/`](../../../../pages/v1/timeline/home-feed/) — Home Feed (`GetAllPage.tsx`, `PostCard.tsx`, `NewPostModal.tsx`).
  - [`hooks/useInfiniteScroll.ts`](../../../../hooks/useInfiniteScroll.ts), [`components/global/MediaPreview.tsx`](../../../../components/global/MediaPreview.tsx).
  - [`routes/v1/timeline.routes.tsx`](../../../../routes/v1/timeline.routes.tsx), entradas em [`routes/paths.ts`](../../../../routes/paths.ts).
  - `services/v1/timelinePost{s,Comments,Reactions,Ratings,Attachments}.{table,view}.ts`.
- Rotas React documentadas em [`README_rotas_frontend.md`](../../README_rotas_frontend.md) (seção `timeline`).

---

[◄ Índice da base de conhecimento](../../../README.md)

---

### 📌 Metadados do Autor

| Campo               | Informação                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Nome**            | Gustavo Hammes                                                                                                               |
| **Local**           | Rio de Janeiro                                                                                                               |
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
