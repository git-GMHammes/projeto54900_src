[◄ Índice da base de conhecimento](../README.md)

---

# FormGrid — fábrica de campos dirigida por JSON

Componente de UI que **monta um formulário inteiro a partir de um schema JSON**.
Em vez de escrever `<input>`/`<label>`/coluna Bootstrap/validação para cada
campo, descreve-se o formulário como dados (`{ rows: [{ fields: [...] }] }`) e o
`FormGrid` renderiza a grade, aplica máscara, valida e serializa.

- **Local neste projeto:** `src/components/ui/FormGrid/` (TypeScript, `.tsx`).
- **Origem:** portado de `projeto55100`
  (`src/public/frontend/Projeto55100App/src/components/ui/FormGrid/`).
- **Arquivo da fábrica:** `FormGrid/Input/index.tsx` — exporta `default FormGrid`
  e todos os tipos de schema. Cada subpasta (`cpf/`, `select/`, …) exporta o
  componente especializado daquele tipo e o seu `*FieldSchema`.
- **Helper compartilhado:** `FormGrid/emitValue.ts` — reemite o `ChangeEvent` dos
  campos mascarados com o valor limpo em `e.target.value`.
- Substitui o stub `src/components/global/FormField.tsx` (que segue no repo, sem
  uso; aposentar quando nenhuma referência restar).

## Import

```tsx
import FormGrid from "@/components/ui/FormGrid/Input";
import type {
  FormGridSchema,
  AnyFieldSchema,
} from "@/components/ui/FormGrid/Input";
```

## Contrato do schema

```
FormGridSchema
└─ rows: FormRowSchema[]
   ├─ sectionTitle?: string        // título de seção acima da linha (opcional)
   └─ fields: AnyFieldSchema[]     // campos daquela linha

AnyFieldSchema = TextFieldSchema | CpfFieldSchema | PhoneFieldSchema | ...
                 (union discriminada por `type`)
```

- **`rows`** — cada item vira um bloco `<div class="row g-3">`. Se tiver
  `sectionTitle`, um `<h6>` sublinhado é renderizado antes da linha.
- **`fields`** — cada campo vira uma coluna `<div class="col-md-{col} mb-1">`.
- **Discriminador `type`** — decide qual componente renderiza. Ausente (ou
  `'text'` / `'password'`) → `<input>` de texto genérico.

## Props comuns a (quase) todos os tipos

| Prop                                   | Tipo      | Efeito                                                                                                 |
| -------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------ |
| `col`                                  | `1..12`   | **Obrigatória.** Largura Bootstrap → `col-md-{col}`                                                    |
| `label`                                | `string`  | `<label>` acima do campo; `*` vermelho quando `required`                                               |
| `id`                                   | `string`  | `id` do controle e `htmlFor` do label                                                                  |
| `name`                                 | `string`  | Nome na serialização do form (nos campos mascarados vai num `<input type="hidden">` com o valor limpo) |
| `value`                                | `string`  | Valor **controlado** (exige `onChange`)                                                                |
| `defaultValue`                         | `string`  | Valor inicial **não-controlado**                                                                       |
| `required` `disabled` `readOnly`       | `boolean` | Idem HTML                                                                                              |
| `hidden`                               | `boolean` | Esconde a coluna (`hidden` no wrapper)                                                                 |
| `className` `style` `title` `tabIndex` | —         | Repassados ao controle                                                                                 |
| `onChange` `onBlur` `onFocus`          | handler   | Repassados ao controle (assinatura varia: ver cada tipo)                                               |

## Modo controlado vs não-controlado

- **Não-controlado:** informe só `defaultValue`. O componente guarda o valor em
  estado interno. Leia no submit pelo `name`.
- **Controlado:** informe `value` **e** `onChange`. O `onChange` de campos
  mascarados entrega **o valor limpo** (só dígitos / sem máscara) em
  `e.target.value` — não o texto formatado.

## Serialização de campos mascarados

CPF, CNPJ, CEP, telefone, moeda, data, hora, PIS, placa, título, CNH, processo,
RENAVAM, SEI e o `select` renderizam, além do controle visível (com máscara), um
`<input type="hidden" name={name} value={valorLimpo}>`. Assim um `FormData`/submit
nativo carrega o valor cru (ex.: `"07633959789"`), e a máscara fica só na tela.

## Validação

Dois momentos, independentes:

| Momento                    | Regras                                                                                                                                                  | Origem                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **Digitação** (`onChange`) | `noNumbers`, `noLetters`, `noSpecialChars`                                                                                                              | só nos tipos de texto (`text`, `textarea`, `senha`) |
| **Blur** (`onBlur`)        | `required`, `minLength`, `maxLength`, `pattern` + regra própria do tipo (ex.: dígito verificador de CPF, e-mail válido, senha forte, datas `min`/`max`) | todos                                               |

O erro aparece num `<div class="text-danger small">` logo abaixo do campo e o
controle recebe `is-invalid`. Cada campo gerencia o próprio erro; o `FormGrid`
mantém um mapa de erros apenas para os campos de texto genéricos.

## Tipos de campo

| `type`                            | Campo                     | Valor limpo              | Props próprias mais usadas                                                                                                                                                                                      |
| --------------------------------- | ------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| _(ausente)_ / `text` / `password` | Texto genérico            | texto                    | `datalist: string[]`, `pattern`, `maxLength`, `minLength`, `inputMode`, `list`, `noNumbers`, `noLetters`, `noSpecialChars`                                                                                      |
| `cpf`                             | CPF                       | 11 dígitos               | valida DV; `placeholder` `000.000.000-00`                                                                                                                                                                       |
| `cnpj`                            | CNPJ                      | 14 caracteres            | máscara `00.000.000/0000-00`; aceita CNPJ alfanumérico (padrão 2026) e valida DV                                                                                                                                |
| `cep`                             | CEP                       | 8 dígitos                | máscara `00000-000`; consulta ViaCEP ao completar 8 dígitos (spinner + `is-valid`/`is-invalid`)                                                                                                                 |
| `phone`                           | Telefone / WhatsApp       | 10–11 dígitos            | máscara fixo/celular; valida DDD e 9º dígito; `pattern` sobre dígitos                                                                                                                                           |
| `moeda`                           | Valor monetário           | decimal `"1234.56"`      | exibe `R$ 1.234,56`; `value`/`onChange` em decimal                                                                                                                                                              |
| `data`                            | Data                      | ISO `"YYYY-MM-DD"`       | `min`, `max` (ISO)                                                                                                                                                                                              |
| `hora`                            | Hora                      | `"HH:MM"` / `"HH:MM:SS"` | `comSegundos?: boolean`                                                                                                                                                                                         |
| `pis`                             | PIS/NIS/PASEP             | 11 dígitos               | máscara `000.00000.00-0`; valida DV                                                                                                                                                                             |
| `placa`                           | Placa de veículo          | 7 caracteres maiúsculos  | aceita `AAA-0000` e Mercosul `AAA0A00`                                                                                                                                                                          |
| `titulo`                          | Título de eleitor         | 12 dígitos               | máscara `0000 0000 0000`; valida DV + código de UF                                                                                                                                                              |
| `cnh`                             | CNH                       | 11 dígitos               | sem máscara; valida DV                                                                                                                                                                                          |
| `processo`                        | Processo judicial (CNJ)   | 20 dígitos               | máscara `0000000-00.0000.0.00.0000`; valida DV (módulo 97 / ISO 7064)                                                                                                                                           |
| `renavam`                         | RENAVAM                   | 11 dígitos               | sem separadores; valida DV                                                                                                                                                                                      |
| `sei`                             | Nº SEI                    | raw 19 caracteres        | display `SEI-15NNNN/NNNNNN/20NN`                                                                                                                                                                                |
| `email`                           | E-mail                    | texto                    | `allowedDomains?: string[]`                                                                                                                                                                                     |
| `textarea`                        | Área de texto             | texto                    | `rows`, `cols`, `maxLength`, `showCounter`, `noNumbers/noLetters/noSpecialChars`                                                                                                                                |
| `senha`                           | Senha                     | texto                    | `strongPassword`, `doubleField` (2º campo de confirmação), `equalFields`, `noNumbers/noLetters/noSpecialChars`; botão mostrar/ocultar                                                                           |
| `radio`                           | Grupo de opção única      | `string`                 | `options: {id,value,label,checked?}[]`, `inline`; `onChange(value)`                                                                                                                                             |
| `checkbox`                        | Grupo de múltipla escolha | `string[]`               | `options: {...}[]`, `inline`, `required` (≥1); submete `name[]`; `onChange(values[])`                                                                                                                           |
| `select`                          | Combobox com busca        | `string`                 | `options` inline **ou** `src` (GET), `valueKey`, `labelKey`/`labelTemplate`, `maxVisible`, `rows`, `findSrc`+`findColumn` (POST de busca), `getSrc` (GET por id), `authToken` (Bearer); `multiple`+`values`+`onChangeMultiple` (listbox multi); `disabledValues: string[]` (values como `<option disabled>`, cinza e não selecionáveis); `onChange(value, item)` |

### Notas por tipo

- **`select`** — feito para listas grandes: filtra o cache local **e** consulta
  o backend (`findSrc` com debounce de 300 ms) para achar candidatos fora do
  recorte inicial. Reidrata o label de um valor pré-selecionado via `getSrc`
  (`GET {getSrc}/{id}`) ou `findSrc` (`POST { [valueKey]: valor }`) — este
  último cobre chaves compostas incompatíveis com rotas `(:num)`. Usa `fetch`
  próprio (ver "Decisões de portabilidade").
- **`cep`** — a consulta ViaCEP é embutida no componente (`consultarViaCep`), sem
  contexto nem serviço externo; dispara sozinha ao completar os 8 dígitos e
  cancela em caso de desmontagem.
- **`senha`** — `strongPassword` exige letra + número + especial + `minLength`
  (default 6). `doubleField` + `equalFields` valida a confirmação.
- **`moeda` / `data` / `hora`** — o valor trafega sempre no formato "de
  máquina" (decimal, ISO, dígitos); a formatação é só de exibição.

## Exemplo

```tsx
import FormGrid from "@/components/ui/FormGrid/Input";
import type { FormGridSchema } from "@/components/ui/FormGrid/Input";

const schema: FormGridSchema = {
  rows: [
    {
      sectionTitle: "Dados pessoais",
      fields: [
        {
          col: 12,
          label: "Nome completo",
          id: "full_name",
          name: "full_name",
          required: true,
          noNumbers: true,
          autoComplete: "name",
        },
        {
          col: 6,
          label: "CPF",
          id: "cpf",
          name: "cpf",
          type: "cpf",
          required: true,
        },
        {
          col: 6,
          label: "Telefone / WhatsApp",
          id: "phone",
          name: "phone",
          type: "phone",
          required: true,
        },
        {
          col: 6,
          label: "Nascimento",
          id: "birth_date",
          name: "birth_date",
          type: "data",
        },
        {
          col: 6,
          label: "CEP",
          id: "zip",
          name: "address_zipcode",
          type: "cep",
        },
      ],
    },
    {
      sectionTitle: "Acesso",
      fields: [
        {
          col: 6,
          label: "E-mail",
          id: "email",
          name: "email",
          type: "email",
          required: true,
        },
        {
          col: 6,
          label: "Senha",
          id: "password",
          name: "password",
          type: "senha",
          strongPassword: true,
          doubleField: true,
          equalFields: true,
          required: true,
        },
        {
          col: 12,
          label: "Município",
          id: "city",
          name: "city_id",
          type: "select",
          src: "/api/v1/municipio-view/get-no-pagination",
          valueKey: "id",
          labelKey: "nome",
        },
      ],
    },
  ],
};

export default function CadastroForm() {
  return (
    <form onSubmit={/* ler FormData(e.currentTarget) */ undefined}>
      <FormGrid schema={schema} />
      <button type="submit" className="btn btn-primary mt-3">
        Salvar
      </button>
    </form>
  );
}
```

## Decisões de portabilidade

O componente veio do `projeto55100` com adaptações para o padrão deste frontend
(React 19 + TypeScript strict máximo, UI Bootstrap 5.3). O que mudou:

1. **Imports `@/` e tipos.** Caminhos relativos entre irmãos preservados
   (`../cpf`); consumidores externos usam o alias `@/components/ui/FormGrid/Input`.
   Imports de tipo marcados com `import type` (`verbatimModuleSyntax`).
2. **TS strict máximo.** `noUncheckedIndexedAccess` — os validadores de dígito
   verificador (CPF, CNPJ, PIS, CNH, RENAVAM, título, processo) acessam os
   caracteres via helper local com fallback (`Number(x[i] ?? 0)`); grupos de
   regex desestruturados com default. `exactOptionalPropertyTypes` — `style`
   condicional passa o objeto inteiro, nunca `{ prop: undefined }`. Sem `any`:
   respostas de `fetch` entram como `unknown` e passam por
   `extrairLista`/`extrairItem`/`asText` no `select`.
3. **`emitValue.ts`.** O truque de reemitir o `ChangeEvent` com o valor limpo
   (antes via `Object.create`, que produzia `any`) virou um helper tipado único,
   usado por todos os campos mascarados.
4. **`cep` autocontido.** Removidas as dependências do 55100
   (`CepContext`/`CepProvider`/`cepService`): a consulta ViaCEP passou a ser
   função interna do componente. Não é preciso envolver a árvore em provider.
5. **`select` com `fetch` próprio.** `src`/`findSrc`/`getSrc` aceitam qualquer
   URL (absoluta ou path do endpoint-set, ex.: `get-no-pagination`, `search`).
   **Não** foi acoplado ao `services/http.ts`/`resourceFactory.ts` — baixo
   acoplamento, sem `env.apiBaseUrl` nem tratamento de `ApiError`. `authToken`
   (Bearer) segue opcional.
6. **Bootstrap 5.3.** As classes (`form-control`, `is-invalid`, `input-group`,
   `form-check`) já batem. As páginas ainda **não** consomem o `FormGrid`:
   `pages/v1/user/UserFormPage.tsx` mantém o `<EmptyState>` e o wiring em
   `// TODO(fábrica…)`.

### Pendências menores (não bloqueiam o uso)

- **Cores fixas em `style` inline** (ex.: `#0d6efd` no `sectionTitle`, `#6c757d`
  nos botões de senha, `#dbeafe` no item selecionado do `select`). Trocar por
  classe utilitária / variável Bootstrap e conferir `data-bs-theme` (modo
  escuro).
- **Duas fontes de validação.** As mensagens/regras dos campos são internas a
  cada tipo; `src/utils/validation.ts` tem o seu próprio conjunto. Alinhar
  quando o `FormGrid` for religado nas páginas.
- **`select` remoto vs endpoint-set.** Se o acoplamento com `http.ts` passar a
  ser desejável (headers padrão, `ApiError`, `env.apiBaseUrl`), trocar os três
  `fetch` do `select` por chamadas ao service.

---

## Constructor

Página construtora de formulários (`FormBuilderPage.tsx`): o usuário escolhe
tabelas num `select` múltiplo e cada tabela escolhida gera um card abaixo
(cabeçalho = nome da tabela + Alias/nome do formulário).

### Requisito — origem dos dados (NÃO NEGOCIÁVEL)

> **TODAS as tabelas e TODAS as colunas vêm de API. Nunca de lista fixa
> no código.**
>
> 1. **TODAS as tabelas** do banco (sem recorte, sem allowlist manual),
>    numa carga só — sem paginação.
> 2. Ao selecionar uma tabela, uma **2ª chamada** traz **TODAS as colunas**
>    daquela tabela (nome, tipo, nulidade, chave, default).
>
> O `select` de tabelas é populado por **(1)**. O corpo de cada card sai das
> colunas de **(2)**.

### API (já existente) — módulo `db-schema`

Backend: `Api\V1\Meta\DbSchema\SchemaController` + `SchemaInspector`
(`INFORMATION_SCHEMA`, read-only, whitelist via `listTables()`). Service
frontend: `dbSchema` em `@/services/v1` (via `http.ts`).

| Ação | Chamada | Rota | Resposta |
| --- | --- | --- | --- |
| Listar tabelas | `dbSchema.tables()` | `GET api/v1/db-schema/tables` | `{ success, data: [{ name, type, engine, rows_estimate, comment }] }` |
| Colunas de uma tabela | `dbSchema.columns(tabela)` | `GET api/v1/db-schema/columns/{tabela}` | `{ success, data: [{ name, position, data_type, column_type, nullable, default, key, extra, enum_values, comment }] }` |
| Estrutura + PK + FKs | `dbSchema.describe(tabela)` | `GET api/v1/db-schema/describe/{tabela}` | `{ success, data: { table, primary_key, foreign_keys, columns } }` |

Tabela inexistente em `columns`/`describe` → HTTP 404. As linhas passam por
`normalizeList` (`utils/apiResult.ts`), que lê `data`.

### Estado atual

`FormBuilderPage.tsx` **consome as duas APIs**: `dbSchema.tables()` num
`useEffect` popula o `options` do `select` (`valueKey`/`labelKey` = `name`); o
`onChangeMultiple` dispara `dbSchema.columns(tabela)` por tabela nova (com cache
em estado e loader por card). Não há lista estática de tabelas na página.

---

[◄ Índice da base de conhecimento](../README.md)
