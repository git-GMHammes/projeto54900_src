[◄ Índice da base de conhecimento](../README.md)

---

# Campo com valor JSON — a UI monta, o usuário não digita

Padrão adotado no frontend para qualquer campo cujo **valor persistido é JSON**
(uma lista, um objeto de configuração), mas cuja **edição não pode exigir que o
usuário escreva JSON à mão**. A interface oferece um controle nativo (multi
select, tags, switches, linhas chave/valor…) e o código serializa/desserializa.

## Princípio

- O que vai para o banco é **uma string JSON** (ou string vazia).
- O que o usuário vê e opera é **um controle de formulário comum**.
- Entre os dois há sempre **um par de funções**: `montar` (estado da UI →
  string JSON) e `parse` (string → estado da UI).
- O `parse` é **tolerante**: valor legado em texto livre, JSON inválido ou
  formato inesperado devolvem "vazio", nunca quebram a tela.

Exceção: um campo de **configuração livre de desenvolvedor** (não de usuário
final) pode ser um `<textarea>` monoespaçado de JSON cru, sem o par
`montar`/`parse`. Hoje não há nenhum no módulo Form — a coluna
`form_manager.settings_json`, que era esse caso, foi removida por não ter
contrato nem consumidor. Todo o resto segue o padrão acima.

## Padrão de nomenclatura — campo de grupo de perfil: `roles`

Todo campo que responde "quais perfis podem ver/usar este recurso" usa o
nome de coluna **`roles`** — nunca `permissions` (em `user_roles.permissions`
essa palavra já significa outra coisa: uma lista de ações granulares tipo
`"forms.read"`, não perfis) nem `profile_group` (nome antigo, descontinuado).
`roles` é sempre uma **lista JSON de slugs de `user_roles`**
(`["admin","user"]`), qualquer que seja o tipo real da coluna no banco
(`VARCHAR` guardando a string JSON, ou `JSON` nativo — ver regra 6 abaixo).

Casos existentes:

| Tabela        | Coluna  | Tipo SQL         | Módulo/UI                                                |
| ------------- | ------- | ---------------- | --------------------------------------------------------- |
| `form_manager`| `roles` | `VARCHAR(255)`   | [`FormBuilderPage`](README_form_builder.md) (`/v1/form-constructor`) |
| `menu_items`  | `roles` | `JSON`           | Backend pronto (`api/v1/menu-items`); frontend ainda não construído |

Novo módulo que precisar disso: reaproveitar o nome `roles` e o mecanismo
abaixo, não inventar um nome novo.

## Caso de referência — "Grupo de perfil" (`form_manager.roles`)

Campo `roles` de `form_manager`, no
[`FormBuilderPage`](README_form_builder.md) (`/v1/form-constructor`). O rótulo
exibido ao usuário continua "Grupo de perfil" — só o nome da coluna/campo é
`roles`.

- **Persistência:** `form_manager.roles` (`VARCHAR(255)`), guardando uma
  lista JSON de slugs de perfis: `["admin","user"]`. Nada selecionado grava `''`
  (string vazia), **não** `'[]'`.
- **Opções:** vêm da API, sem lista estática — o campo `select` do `<FormGrid>`
  tem `src: '${apiBaseUrl}/v1/user-roles/get-no-pagination'` e carrega sozinho.
  `valueKey: 'slug'`, `labelKey: 'name'`.
- **Controle:** campo `select` `multiple` do `<FormGrid>` — ver
  [`README_render_via_formgrid.md`](README_render_via_formgrid.md).

### O par montar/parse — `src/utils/jsonList.ts`

```ts
export function toStringList(items: readonly string[]): string {
  return items.length > 0 ? JSON.stringify(items) : '';
}

export function parseStringList(raw: string): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === 'string')
      : [];
  } catch {
    return []; // '' / JSON inválido / formato inesperado -> vazio
  }
}
```

### Uso no schema do FormGrid

```ts
{
  type: 'select', col: 6, label: 'Grupo de perfil', multiple: true,
  src: `${env.apiBaseUrl}/v1/user-roles/get-no-pagination`,
  valueKey: 'slug', labelKey: 'name',
  values: parseStringList(m.roles),
  onChangeMultiple: (values) => patch(tabela, { roles: toStringList(values) }),
}
```

`values` recebe `string[]` e o `<FormGrid>` marca as opções; `onChangeMultiple`
entrega `string[]`, serializado por `toStringList`.

## Regras para adotar em novos campos JSON

1. **Nunca** um `<textarea>` de JSON cru para o usuário final (aceitável apenas
   em campo de configuração livre de desenvolvedor).
2. Sempre o par `montar` / `parse`, com o `parse` tolerante (retorna vazio em
   `''`, JSON inválido e formato inesperado).
3. Vazio grava `''`. O `parse` normaliza `''`, `'[]'`, `'{}'` e lixo para o
   mesmo estado "vazio".
4. As opções vêm de API (padrão do resto da página), não de lista fixa no
   código.
5. O **nome/tipo da coluna no banco não muda** por causa disto. Se a estrutura
   puder crescer muito (lista longa, objeto grande), migrar a coluna para
   `TEXT`/`JSON` é decisão separada, feita por migration.
6. Exceção à regra 5: campo de **grupo de perfil com acesso ao recurso** usa
   sempre o nome `roles` (não `permissions`, não `profile_group`) — ver
   "Padrão de nomenclatura" acima. O tipo da coluna (`VARCHAR` ou `JSON`) fica
   a critério do módulo, mas o nome é fixo.

## Onde está no código

```
src/utils/jsonList.ts                  parseStringList() / toStringList() (o par)
src/pages/v1/form/FormBuilderPage.tsx   managerSchema() — o campo select 'Grupo de perfil'
```

Detalhe da tela do construtor: [`README_form_builder.md`](README_form_builder.md).

---

[◄ Índice da base de conhecimento](../README.md)
