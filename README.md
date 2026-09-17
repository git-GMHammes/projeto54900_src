# projeto54900

API REST (CodeIgniter 4 / PHP 8.2) + frontend React, pensado para crescer como
um **multitool de produtividade estilo Office**: um único usuário, uma única
API, vários módulos de domínio (formulários, listagens, calendário, upload,
e os módulos futuros de mapas, documentos e mensageria) todos seguindo o
**mesmo padrão de módulo** — o que faz um módulo novo custar horas, não dias.

> Base de conhecimento completa (mais profunda que este README):
> [`app/markdown/README.md`](app/markdown/README.md) (backend) e
> [`frontend/projeto54900/src/markdown/README.md`](frontend/projeto54900/src/markdown/README.md) (frontend).

---

## Sumário

- [Backend](#backend)
- [Frontend](#frontend)
- [Projeto futuro — multitool de Office](#projeto-futuro--multitool-de-office)
- [Tecnologias envolvidas](#tecnologias-envolvidas)
- [⚠️ Alerta — ambiente e DevOps não commitados](#️-alerta--ambiente-e-devops-não-commitados)
- [DevOps — detalhamento dos arquivos](#devops--detalhamento-dos-arquivos)

---

## Backend

`app/` — CodeIgniter 4, PHP 8.2. Estrutura por camada, cada uma com o próprio
namespace PSR-4 espelhando o caminho de pastas:

```
App\Controllers\Api\V1\<Domínio>\<Módulo>   → app/Controllers/Api/V1/<Domínio>/<Módulo>/
App\Requests\V1\<Domínio>\<Módulo>          → app/Requests/V1/<Domínio>/<Módulo>/
App\Services\V1\<Domínio>\<Módulo>          → app/Services/V1/<Domínio>/<Módulo>/
App\Models\V1\<Domínio>\<Módulo>            → app/Models/V1/<Domínio>/<Módulo>/
```

### As bases reaproveitáveis

Cada módulo é fino — não reimplementa nada — porque toda a lógica genérica
mora em 6 classes base, herdadas por todos os módulos:

| Classe base                                      | Fornece                                                                                                     |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `Controllers\Api\V1\BaseResourceTableController` | 18 endpoints (leitura + escrita + soft/hard delete) + helpers `respondSuccess/Created/Paginated/NotFound/…` |
| `Controllers\Api\V1\BaseResourceViewController`  | estende a anterior; 10 endpoints de leitura sobre uma `view` (view nunca tem create/update/delete)          |
| `Services\V1\BaseViewService`                    | sanitização, formatação de data, paginação, leitura genérica de view                                        |
| `Services\V1\BaseTableService`                   | estende o anterior; Template Method `create()`/`update()`, soft-delete completo                             |
| `Models\V1\BaseTableModel`                       | `findPaginated`, `searchByTerm`, `safeSort`/`safeOrder` (whitelist anti-SQL-injection), `hideFields`        |
| `Models\V1\BaseViewModel`                        | leitura de view (`findById`, `findDeletedById`, etc.)                                                       |

Um módulo novo só **declara configuração** (nome da tabela, campos ocultos,
regras de validação) e **sobrescreve hooks** de negócio
(`validateOnCreate`, `prepareData`, …) — nunca reescreve CRUD, paginação ou
soft-delete.

### O "MVC turbinado" — Request + Service

```
HTTP → Routes → Controller → Request (valida forma) → Processor/Service (regra de negócio) → Model → tabela/view MySQL
```

- **Routes** só mapeiam verbo+caminho → método do controller. Zero lógica.
- **Controller** chama `$this->validate(getCreateRules())`, delega ao
  `Processor` (o Service do módulo), formata a resposta. Zero regra de negócio.
- **Request** (`CreateRequest`/`UpdateRequest`) é uma classe simples com
  `rules()` e `messages()` — só valida forma (tipo, tamanho, `in_list` de
  ENUM), derivado direto do DDL da migration.
- **Processor** (`Services\V1\<Domínio>\<Módulo>\Processor`) é o "Service":
  liga os Models no construtor, e é o **único lugar** onde entram unicidade,
  FK, transições de status, hash de senha — via hooks do Template Method
  herdado de `BaseTableService`.
- **Model** só declara propriedades (`$table`, `$hidden`, `$allowedFields`,
  `$sortableFields`); as queries genéricas vêm da base.

Padrão obrigatório e documentado em detalhe (mapa DDL→regra de validação,
checklist de PR, passo a passo para criar módulo do zero):
[`ROADMAP_padrao_modulo.md`](app/markdown/geral/ROADMAP_padrao_modulo.md).

### Rotas descentralizadas

Nenhuma rota fica solta dentro de um `Config/Routes.php` gigante. Cada módulo
tem seu **próprio arquivo de rotas**, requerido dentro do grupo `api/v1`:

```php
// Config/Routes.php
$routes->group('calendar-manager', static function ($routes) {
    require __DIR__ . '/Routes/Api/v1/Calendar/CalendarManager/EndpointTable.php';
});
```

```
Config/Routes/Api/v1/<Domínio>/<Módulo>/
├─ EndpointTable.php   (18 rotas — recurso sobre a tabela)
└─ EndPointView.php    (10 rotas — leitura sobre a view, só se houver)
```

Todo módulo replica **exatamente** o mesmo contrato de rotas (`find`,
`get-grouped`, `search`, `get/{id}`, `get-all`, `get-no-pagination`,
`get-deleted*`, `create`, `update/{id}`, `delete-soft/update-restore/delete-hard`,
`clear-deleted`) e o mesmo envelope de resposta JSON
(`method`, `endpoint`, `statusCode`, `message`, `success`, `data`). Mapa
textual completo de toda rota já registrada:
[`README_rotas_swagger.md`](app/markdown/geral/README_rotas_swagger.md).

### Módulos hoje

| Domínio    | Módulo(s)                                                                                                    | Situação                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `Auth`     | login / refresh / logout / me (JWT HS256, nativo via `hash_hmac`, sem lib externa)                           | completo                                                            |
| `User`     | `user-manager`, `user-profiles`, `user-roles`                                                                | completo                                                            |
| `Upload`   | `upload-manager` (anexos polimórficos de qualquer outro módulo, `module` + `reference_id`)                   | completo (desvio sancionado: sem FK, +3 rotas de multipart/binário) |
| `Form`     | `form-manager` → `form-groups` → `form-rows` → `form-campos` (+ view)                                        | completo — motor de formulários dinâmicos                           |
| `List`     | `list-manager`, `list-columns`, `list-actions`                                                               | completo — motor de listagens dinâmicas                             |
| `Calendar` | `calendar-manager`, `calendar-events` + 4 sub-recursos (attendees/reminders/attachments/extended-properties) | backend completo (108 rotas); **frontend ainda só visualização**    |
| `Nav`      | `nav-manager` (branding/config do app)                                                                       | completo                                                            |
| `Menu`     | `menu-manager` (árvore de itens de navegação)                                                                | completo                                                            |
| `Meta`     | `db-schema` (introspecção read-only do banco), `route-manager` (catálogo de rotas)                           | completo                                                            |

---

## Frontend

`frontend/projeto54900/` — React 19 + TypeScript + Vite, UI **quase 100%
Bootstrap 5** (sem outra biblioteca de componentes). Convenção de páginas:
`pages/v1/<módulo>/<recurso>/<Ação>Page.tsx`, com `services/v1/*.ts`
espelhando 1:1 os endpoints do backend e `routes/v1/*.routes.tsx` registrando
as rotas React.

### Os constructors — banco vira UI, sem campo/coluna hardcoded

O frontend não escreve formulário nem tabela na mão: uma definição gravada no
banco (pelo próprio backend, módulos `Form` e `List`) é lida pela API e
renderizada por um **motor genérico**.

**FORM:**

- `components/ui/FormGrid/` — fábrica de campos dirigida por schema JSON
  (`{ rows: [{ fields: [...] }] }`). 22 tipos prontos (CPF, CNPJ, CEP,
  telefone, moeda, data, hora, PIS, placa, título de eleitor, CNH, processo,
  RENAVAM, SEI, e-mail, textarea, senha, radio, checkbox, select com busca)
  além de `text`/`password`, com máscara, validação e grid Bootstrap
  resolvidos pela própria fábrica.
- `pages/v1/form/FormConstructorPage.tsx` — lê a árvore
  `form_manager → form_groups → form_rows → form_fields` (via
  `view_form_manager`) e renderiza com `<FormGrid>`.
- `pages/v1/form/FormBuilderPage.tsx` (+ `FormBuilderTree.tsx`,
  `FormModal.tsx`) — construtor **visual**: escolhe tabelas do banco por
  introspecção (`db-schema`), monta a árvore em linhas compactas
  colapsáveis, formulário de cada nó abre em modal, e persiste nó a nó
  (salvar o pai libera o filho).

**LIST:**

- `utils/listConstructor.tsx` — motor puro (`toManager`/`toColumn`/`toAction`,
  `cellValue`/`renderCell`, `evalBusinessRule`) que renderiza qualquer grid a
  partir de `list_manager`/`list_columns`/`list_actions`.
- `pages/v1/list/ListConstructorPage.tsx` — preview de listagens já
  cadastradas.
- `pages/v1/list/ListBuilderPage.tsx` (+ `ListBuilderTree.tsx`, reaproveita
  `FormModal.tsx`) — cria listagens novas pela UI, com geração automática de
  colunas a partir do schema real da tabela.

`FormBuilderTree`/`ListBuilderTree` + `FormModal` formam um **padrão
reutilizável** (árvore + modal por nó) já usado nos dois construtores — base
para qualquer tela futura de estrutura pai→filho com formulário por nó
(Documentos, Mapas e Mensageria devem seguir o mesmo padrão em vez de
inventar um novo).

---

## Projeto futuro — multitool de Office

A visão é ligar quatro módulos de domínio sobre a mesma base de usuários
(`user-manager`) e o mesmo padrão de módulo/constructor, como um único
multitool — não quatro apps separados:

| Módulo                                        | Estado hoje                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Calendário**                                | Backend completo (espelha o Google Calendar: manager + eventos + attendees/reminders/attachments/extended-properties, 108 rotas). Frontend só mostra `MonthCalendar`/`YearCalendar` calculados por `Date`/`Intl`, sem ler nenhuma tabela ainda — falta o CRUD de evento e ligar a tela num `calendar_id` real. |
| **Documentos**                                | Ainda não iniciado. Deve reaproveitar o módulo `Upload` (anexos polimórficos) como armazenamento, seguindo o mesmo padrão de módulo do backend.                                                                                                                                                                |
| **Mapas** (rotas e pontos)                    | Ainda não iniciado. O grupo de conexão de banco `mapa` (`projeto54900_mapa`) já está reservado em `Config/Database.php`, sem módulo/API construído.                                                                                                                                                            |
| **Mensageria** (entre usuários, com timeline) | Ainda não iniciado como módulo REST. O grupo de banco `chat` (`projeto54900_chat`) já está reservado; o serviço `node` do `docker-compose.yml` já sobe um servidor WebSocket (pensado como transporte real-time dessa mensageria), mas sem schema/API ainda.                                                   |

---

## Tecnologias envolvidas

**Backend:** PHP 8.2, CodeIgniter 4, MySQL 8.0, JWT HS256 (nativo, sem lib
externa — ver [`README_regra_composer_proibido.md`](app/markdown/geral/README_regra_composer_proibido.md)).

**Frontend:** React 19, TypeScript, Vite, Bootstrap 5, React Router 7.

**Infraestrutura:** Podman (compatível com `docker-compose.yml`), Nginx
(reverse proxy), Node 20 (WebSocket), Adminer (UI de administração do MySQL).

---

## ⚠️ Alerta — ambiente e DevOps não commitados

O `docker-compose.yml` real (preenchido com credenciais de uso) **não é
versionado** — só o template público `docker-compose-example.yml`, com
placeholders, está neste repositório. O projeto **não usa `.env`**: toda
configuração de ambiente fica explícita no `docker-compose.yml` local e é
lida via `env()` nos `Config/*.php` do backend — por isso o compose real
nunca pode ir para o Git.

Gustavo está à disposição para apoiar diretamente no preparo/ajuste do DevOps
(Podman, compose, Dockerfiles) sempre que for necessário — é ele quem detém o
compose real e o ambiente de rede onde os serviços `php`/`node` foram
originalmente construídos.

---

## DevOps — detalhamento dos arquivos

```
projeto54900/                       (raiz — um nível acima de src/)
├── docker-compose.yml              (real, com credenciais — NÃO versionado)
├── docker-compose-example.yml      (versionado — template público, só placeholders)
├── docker/
│   ├── index.html                  (placeholder estático da pasta, sem função de runtime)
│   ├── php/
│   │   └── Dockerfile              (imagem do serviço php)
│   ├── mysql/
│   │   └── init.sql                (script de inicialização do serviço mysql)
│   ├── nginx/
│   │   └── default.conf            (config do reverse proxy)
│   └── node/
│       ├── Dockerfile              (imagem do serviço node)
│       ├── server.js               (servidor WebSocket)
│       └── package.json            (dependências do server Node)
└── src/                            (este repositório — montado em /var/www/html nos containers php e nginx)
```

### `docker-compose.yml` / `docker-compose-example.yml`

Definem 5 serviços:

| Serviço   | Container                  | Porta host → container    | Função                                                                       |
| --------- | -------------------------- | ------------------------- | ---------------------------------------------------------------------------- |
| `mysql`   | `codeigniter54900_mysql`   | `54901:3306`              | Banco MySQL 8.0. Volume nomeado `mysql_data` (persistência).                 |
| `adminer` | `codeigniter54900_adminer` | `54902:8080`              | UI web de administração do MySQL.                                            |
| `php`     | `codeigniter54900_php`     | interno (`9000`, FastCGI) | PHP-FPM 8.2 rodando o backend CodeIgniter. Monta `./src` em `/var/www/html`. |
| `node`    | `codeigniter54900_node`    | interno (`3000`)          | Servidor WebSocket, exposto para fora só via proxy do `nginx` em `/ws`.      |
| `nginx`   | `codeigniter54900_nginx`   | `54900:80`                | Reverse proxy: serve `/`, `/api` e `/ws`, roteando para `php`/`node`.        |

Rede interna: `codeigniter54900_net` (bridge). O `docker-compose.yml` real
difere do `-example.yml` **só** nos valores de credencial/proxy — a
estrutura (serviços, portas, volumes) é idêntica. `docker-compose-example.yml`
é o ponto de partida para qualquer ambiente novo: copiar/renomear para
`docker-compose.yml` e preencher os placeholders com credenciais próprias,
nunca reaproveitando senha de outro serviço.

Os serviços `php` e `node` aceitam `build.args` de proxy HTTP/HTTPS interno
(`USE_INTERNAL_PROXY`, `PROXY_HOST`, `PROXY_PORT`) — só usados quando o build
roda dentro da rede corporativa isolada onde o ambiente foi originalmente
montado; fora dela, o default (`"false"`) builda sem proxy.

### `docker/php/Dockerfile`

Imagem PHP 8.2-FPM com as extensões que o CodeIgniter 4 e os drivers de banco
exigem: `pdo_mysql`, `mysqli`, `mbstring`, `zip`, `intl`. Lê os `ARG` de proxy
do compose (nunca hardcoded no próprio Dockerfile, que é versionado).

### `docker/mysql/init.sql`

Script de inicialização do container `mysql`, executado **uma única vez**,
na primeira criação do volume `mysql_data` (a imagem oficial do MySQL só roda
`docker-entrypoint-initdb.d/*` em volume vazio). Cria os bancos dedicados por
módulo (`projeto54900_mapa`, `projeto54900_agenda`, `projeto54900_chat`) e os
`GRANT`s do usuário da aplicação sobre eles — o banco `codeigniter54900_db`
(conexão `default`) já nasce sozinho via `MYSQL_DATABASE` do compose. Se o
volume já existir, este script **não roda de novo**; um módulo/banco novo
precisa ser criado à mão (Adminer ou `mysql` CLI) num ambiente já
inicializado.

### `docker/nginx/default.conf`

Configuração do reverse proxy: roteia requisições estáticas e `.php` para
`php:9000` (FastCGI), `/ws` para `node:3000` (upgrade de conexão WebSocket),
e serve os arquivos estáticos do frontend com fallback de SPA (qualquer rota
não encontrada cai em `index.html`, para o React Router assumir).

### `docker/node/`

- **`Dockerfile`** — imagem `node:20-alpine`.
- **`server.js`** — servidor WebSocket de broadcast interno, com um endpoint
  HTTP `/internal/broadcast` (usado pelo próprio backend PHP para publicar
  eventos para quem estiver conectado). É a peça que hoje já sustenta o
  transporte real-time pensado para a futura Mensageria.
- **`package.json`** — dependências do servidor Node.

### `docker/index.html`

Arquivo estático sem função de runtime — apenas ocupa a pasta `docker/` na
raiz servida (não é referenciado por nenhum serviço).

### Subir o ambiente

```bash
cp docker-compose-example.yml docker-compose.yml
# editar docker-compose.yml e preencher os placeholders com credenciais próprias
podman compose up -d --build
```

App em `http://localhost:54900`, Adminer em `http://localhost:54902`. Passo a
passo completo, variante sem o serviço `node`, e como adicionar um
módulo/banco novo: [`README_docker-compose.md`](app/markdown/geral/README_docker-compose.md)
e [`README_conecta_banco_enviroments.md`](app/markdown/geral/README_conecta_banco_enviroments.md).

O frontend roda **fora do compose**, localmente:

```bash
cd frontend/projeto54900/
npm run dev
```

---

### 📌 Metadados do Autor

| Campo               | Informação                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Nome**            | Gustavo Hammes                                                                                                               |
| **Local**           | Rio de Janeiro                                                                                                               |
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
