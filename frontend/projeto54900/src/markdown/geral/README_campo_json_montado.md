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

## Caso de referência — "Grupo de perfil"

Campo `profile_group` de `form_manager`, no
[`FormBuilderPage`](README_form_builder.md) (`/v1/form-constructor`).

- **Persistência:** `form_manager.profile_group` (`VARCHAR(255)`), guardando uma
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
  values: parseStringList(m.profile_group),
  onChangeMultiple: (values) => patch(tabela, { profile_group: toStringList(values) }),
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

## Onde está no código

```
src/utils/jsonList.ts                  parseStringList() / toStringList() (o par)
src/pages/v1/form/FormBuilderPage.tsx   managerSchema() — o campo select 'Grupo de perfil'
```

Detalhe da tela do construtor: [`README_form_builder.md`](README_form_builder.md).

---

[◄ Índice da base de conhecimento](../README.md)
