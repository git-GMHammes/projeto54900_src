[◄ Índice da base de conhecimento](../README.md)

---

# Erro "Formulário/Lista em branco" — causa, correção e como resolver de novo

## O que é esse erro

Várias telas do projeto foram criadas como **placeholders intencionais**:
mostram um `<EmptyState>` fixo ("Formulario em branco" / "Listagem em
branco") em vez de buscar dados de verdade, com um comentário no topo do
arquivo dizendo `EM BRANCO ate a fabrica de formularios (FormGrid)` ou
`aguardando a fabrica de listas`.

Isso **não é bug de dado ausente** — é código nunca religado. O sintoma
"a lista/formulário está vazio" engana: o usuário acha que falta cadastro
no banco, mas o problema é que a página nem chega a fazer a chamada de
API. Em 2026-09-20 isso gerou confusão real (achou-se que faltava
cadastro de usuário, quando os dados já existiam — só a tela não buscava).

## Como identificar TODOS os placeholders que ainda existem

Rodar a partir de `src/frontend/projeto54900`:

```bash
grep -rn "EM BRANCO ate a fabrica" src/pages
grep -rni "fabrica" src/pages
```

**Atenção:** o segundo comando (mais amplo) pode trazer falsos positivos —
comentários antigos que mencionam "fabrica de listas" mas a página JÁ busca
dados de verdade (foi o caso de `pages/v1/nav/GetAllPage.tsx` e
`pages/v1/menu/GetAllPage.tsx`: comentário desatualizado, código já
funcional). **Sempre abrir o arquivo e confirmar se o corpo tem
`<EmptyState title="Formulario em branco">` fixo** antes de assumir que
precisa religar.

## O que foi corrigido nesta sessão (2026-09-19/20) — lista completa

| #   | Arquivo                                                             | Tipo       | Religado com                                                                                     |
| --- | ------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| 1   | `src/pages/v1/user/user-manager/CreatePage.tsx`                     | Formulário | build `cadastro-usuario` (form_manager) — etapa 1 do cadastro                                    |
| 2   | `src/pages/v1/user/user-profiles/CreatePage.tsx` (**novo arquivo**) | Formulário | build `dados-do-usuario` (form_manager) — etapa 2, lê `?user_manager_id=`                        |
| 3   | `src/pages/v1/user/user-manager/GetAllPage.tsx`                     | Listagem   | motor "Construtor de Listas", slug `user-manager` (`list_manager`/`list_columns`/`list_actions`) |
| 4   | `src/pages/v1/user/user-manager/UpdatePage.tsx`                     | Formulário | build `atualizar-usuario` (form_manager) + preload via `userManagerView.get(id)`                 |
| 5   | `src/pages/v1/nav/CreatePage.tsx`                                   | Formulário | schema `FormGrid` escrito à mão + `navManagerTable.create`                                       |
| 6   | `src/pages/v1/nav/UpdatePage.tsx`                                   | Formulário | schema `FormGrid` escrito à mão + preload via `navManagerTable.get(id)`                          |
| 7   | `src/pages/v1/menu/CreatePage.tsx`                                  | Formulário | schema `FormGrid` escrito à mão + `menuManagerTable.create`                                      |
| 8   | `src/pages/v1/menu/UpdatePage.tsx`                                  | Formulário | schema `FormGrid` escrito à mão + preload via `menuManagerTable.get(id)`                         |

**Arquivos de apoio alterados/removidos no processo** (não eram
placeholders, mas fizeram parte da correção):

| Arquivo                                                    | O que mudou                                                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/routes/v1/user.routes.tsx`                            | rota `register` removida; rota `user-profiles/create` acrescentada                               |
| `src/routes/paths.ts`                                      | `paths.v1.user.register` removido; `paths.v1.user.profilesCreate` acrescentado                   |
| `src/pages/v1/auth/LoginPage.tsx`                          | link "Criar conta" apontado para `paths.v1.user.create` (era `paths.v1.user.register`)           |
| `src/pages/v1/user/register/RegisterPage.tsx`              | **arquivo deletado** (fluxo substituído pelas 2 páginas do item 1/2 da tabela acima)             |
| `src/app/Database/Seeds/202609161351_seed.sql`             | linha do campo `user_manager_id` corrigida (era `id`, FK errada)                                 |
| Banco `codeigniter54900_db`, tabela `form_fields`, `id=68` | `field_name`/`field_key` corrigidos de `id` para `user_manager_id` (ver seção "Comandos usados") |

## Receita — como religar um placeholder novo

### Passo 0 — Confirmar que é mesmo um placeholder

Abrir o arquivo. Se o corpo for só:

```tsx
<EmptyState
  title="Formulario em branco"
  description="Aguardando a fabrica..."
/>
```

é placeholder. Ler o comentário no topo do arquivo — ele documenta os
campos e o wiring esperado (é a especificação, escrita por quem criou o
stub).

### Passo 1 — Descobrir se existe um build no `form_manager` para essa tabela

```bash
podman compose exec -T mysql mysql --default-character-set=utf8mb4 -u codeigniter54900_user -p"<SENHA>" codeigniter54900_db -e "
SELECT id, slug, table_name, react_route, submit_endpoint, http_method, status FROM form_manager;"
```

(`<SENHA>` = a senha do `docker-compose.yml`, nunca colar em texto puro em
arquivo versionado — ver a regra crítica de segredos do `CLAUDE.md`.)

- **Existe um `slug` com `table_name`/`react_route` batendo com a página?**
  → Caso A (pipeline dinâmico).
- **Não existe nada** (caso de `nav_manager`/`menu_manager`, que não têm
  builds) → Caso B (schema `FormGrid` escrito à mão).

### Caso A — build existe no `form_manager` (pipeline dinâmico)

Mesmo pipeline usado em `FormRendererPage.tsx` e nas páginas 1/2/4 da
tabela acima:

```tsx
import { formManagerView } from "@/services/v1";
import { buildRenderSchema } from "@/services/formSchema";
import {
  formDataToPayload,
  errorDetail,
  resolveEndpoint,
  senderFor,
} from "@/utils/formSubmit";

const raw = await formManagerView.getGrouped(
  { fm_slug: [SLUG] },
  { limit: 1000, sort: "fc_sort_order", order: "ASC" },
);
const { rows } = normalizeList(raw);
const form = buildRenderSchema(rows); // { meta, schema }
```

Renderiza com `<FormGrid schema={form.schema} />`; envia com
`senderFor(form.meta.httpMethod)` no `resolveEndpoint(form.meta.submitEndpoint)`.

**Para UPDATE:** o `submit_endpoint` gravado no banco geralmente NÃO tem o
`{id}` no fim (ex.: `/v1/user-manager/update`, sem o id) — é preciso
concatenar na mão: `` `${resolveEndpoint(form.meta.submitEndpoint)}/${id}` ``.
Pré-carregar os valores atuais com a `-view` do recurso (ex.:
`userManagerView.get(id)`) e usar uma função tipo `prefillFromRecord` que
seta `defaultValue`/`values` dos campos cujo `name` bate com uma chave do
registro.

### Caso B — não existe build (CRUD direto, `nav_manager`/`menu_manager`)

Escrever o `FormGridSchema` à mão (mesmo espírito de `FormBuilderPage.tsx`)
e chamar o service da tabela direto:

```tsx
import { navManagerTable } from "@/services/v1"; // ou menuManagerTable

const SCHEMA: FormGridSchema = {
  rows: [
    /* campos, ver comentario do arquivo antigo */
  ],
};

// create:
await navManagerTable.create(payload);
// update (precisa preload):
const row = normalizeItem<ApiRow>(await navManagerTable.get(id));
await navManagerTable.update(id, payload);
```

Os NOMES DOS CAMPOS e quais são obrigatórios/opcionais estão nos
`Requests` do backend — conferir antes de montar o schema:

```
src/app/Requests/V1/<Modulo>/<Recurso>/CreateRequest.php
src/app/Requests/V1/<Modulo>/<Recurso>/UpdateRequest.php
```

Essas classes têm um comentário `DDL de referencia` com TODAS as colunas,
tipos e obrigatoriedade — é a fonte da verdade mais confiável (mais do que
o comentário do placeholder, que pode estar desatualizado).

### Passo 2 — Select com lista carregada depois do primeiro render? Usar `src`, não `options`

**Armadilha encontrada e corrigida nesta sessão:** o componente
`components/ui/FormGrid/select/index.tsx` só lê a prop `options` **uma
vez**, na montagem:

```ts
// linha ~173
const [allData, setAllData] = useState<SelectOptionItem[]>(field.options ?? []);
```

Não existe nenhum `useEffect` que resincroniza `allData` quando `options`
muda depois. Resultado: se as opções vêm de um `fetch` assíncrono guardado
em `useState` e passadas como `options={meuEstado}`, elas **nunca aparecem**
— `meuEstado` começa `[]` no primeiro render e o componente já capturou
esse `[]` para sempre.

**A prop `src` NÃO tem esse problema** — ela tem o próprio efeito reativo:

```ts
// linha ~198
useEffect(() => {
  const src = field.src
  if (!src) return
  fetch(src, ...).then(json => setAllData(extrairLista(json)))
}, [field.src, field.authToken])
```

Ou seja, **sempre que a STRING de `src` mudar, o componente refaz o fetch
sozinho**. É assim que um select "dependente" (ex.: "Item pai" que só deve
mostrar itens do "Nav" escolhido) deve ser feito: montar a URL do `src`
incluindo o filtro, e trocar essa URL quando o campo do qual ele depende
mudar — nunca gerenciar a lista manualmente em `useState` + `options`.

```tsx
// ERRADO (options fica vazio para sempre se carregado async):
const [opts, setOpts] = useState([]);
useEffect(() => {
  fetchOpts().then(setOpts);
}, []);
<select-field options={opts} />;

// CERTO (src recarrega sozinho quando a URL muda):
const src = `${env.apiBaseUrl}/v1/menu-manager/get-no-pagination?nav_manager_id=${navId}`;
<select-field src={src} />;
```

Isso vale para QUALQUER campo select cuja lista não seja 100% estática e
conhecida no momento de montar o schema.

### Passo 3 — Validar

Sempre nesta ordem, a partir de `src/frontend/projeto54900`:

```powershell
npm run typecheck
npx eslint src/pages/v1/<caminho-do-arquivo>.tsx
```

Erros comuns de `eslint`/`tsc` já vistos nesta sessão:

| Erro                                                    | Causa                                                        | Correção                                                                  |
| ------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `no-floating-promises` em `navigate(...)`               | `navigate()` do React Router pode retornar Promise           | prefixar com `void navigate(...)`                                         |
| `exactOptionalPropertyTypes` reclamando de `end={x?.y}` | prop opcional não aceita `undefined` explícito               | usar `?? false` (ou valor padrão do tipo)                                 |
| `no-base-to-string` em `String(campo ?? '')`            | `campo` vem tipado como `unknown`/objeto genérico (`ApiRow`) | usar `toText(campo, 'default')` de `@/utils/format`, nunca `String()` cru |

### Passo 4 — Testar de verdade, não só compilar

`npm run typecheck` prova que o código compila, **não que a tela funciona**.
Sem acesso a um browser interativo, usar Chrome headless com o protocolo
DevTools (CDP) — funcionou bem nesta sessão sem precisar instalar nada
extra (Chrome já existe no Windows):

```bash
# sobe um Chrome headless com debug remoto na porta 9333
"/c/Program Files/Google/Chrome/Application/chrome.exe" \
  --headless=new --disable-gpu --no-sandbox \
  --remote-debugging-port=9333 \
  --user-data-dir="<pasta-temp>/chrome-profile" &
```

Depois, um script Node pequeno conecta no `ws://localhost:9333/...`
(endpoint devolvido por `GET http://localhost:9333/json/new?<url>`), manda
`Runtime.evaluate` para preencher campos/clicar em botões e
`Page.captureScreenshot` para tirar prints. Sem isso, é fácil declarar uma
tela "corrigida" só porque o `tsc` não reclamou — foi exatamente o que
aconteceu com o select de "Nav"/"Item pai" (compilava limpo, mas ficava
vazio na tela real).

## Checklist final antes de dizer "religado"

- [ ] `npm run typecheck` limpo
- [ ] `npx eslint <arquivo>` limpo
- [ ] Testado no navegador (headless ou manual): a tela mostra dado real,
      não `<EmptyState>`
- [ ] Testado o SUBMIT (criar/editar de verdade), não só o carregamento
- [ ] Se o formulário tem select cuja lista não é fixa: usa `src`, não
      `options` carregado em `useState`
- [ ] Conferido no `Requests/V1/.../CreateRequest.php` (ou `UpdateRequest.php`)
      que os campos obrigatórios do schema batem com as regras reais do
      backend

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
