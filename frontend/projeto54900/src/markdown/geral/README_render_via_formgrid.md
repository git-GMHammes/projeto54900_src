[◄ Índice da base de conhecimento](../README.md)

---

# Campo de formulário passa pelo `<FormGrid>` — não markup à mão

Regra do frontend: para renderizar **campos de formulário** (input, select,
textarea, campos mascarados, radio, checkbox), descreve-se um **schema JSON** e
entrega-se ao componente `<FormGrid>`. Não se escreve
`<input className="form-control">` + `<label>` + coluna Bootstrap + `onChange` de
validação à mão, campo por campo.

Motivo: a fábrica já resolve grade responsiva, máscara, validação em digitação e
no blur, modo controlado/não-controlado e serialização — replicar isso na mão
gera divergência de comportamento e de estilo.

## Onde está

- Componente: `src/components/ui/FormGrid/Input/index.tsx` — `export default
  FormGrid` e todos os tipos de schema. Cada subpasta (`cpf/`, `select/`, …) é um
  tipo especializado.
- Contrato: `FormGridSchema = { rows: FormRowSchema[] }`,
  `FormRowSchema = { sectionTitle?: string; fields: AnyFieldSchema[] }`.
- 22 tipos de campo. **API completa em
  [`README_FormGrid.md`](README_FormGrid.md)** — este doc é só a regra de uso.

```tsx
import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';

const schema: FormGridSchema = {
  rows: [{ fields: [{ type: 'text', col: 12, label: 'Nome', name: 'name' }] }],
};
return <FormGrid schema={schema} />;
```

## Select remoto e múltiplo

O tipo `select` cobre o caso "opções vêm da API":

- `src` — GET carregado na montagem (sem lista estática no código).
- `valueKey` / `labelKey` (ou `labelKey: string[]` / `labelTemplate`).
- `multiple: true` + `values: string[]` + `onChangeMultiple: (values, items) => void`.
- `findSrc` / `getSrc` — reidratação de valores pré-selecionados fora do cache.

## Quando aplicar

- **Tela ou campo novo de formulário:** sempre schema + `<FormGrid>`.
- **Editando um campo existente** cujo entorno permita: preferir **migrar o
  bloco para schema** a estender o markup manual.
- **Exceção:** chrome que não é campo de formulário — cabeçalhos de card,
  botões de ação, switches soltos de UI. O seletor de tabelas no topo do
  `FormBuilderPage` já usa `<FormGrid>` e é o modelo a seguir.

## `FormBuilderPage` — migrado (referência)

Os subcards **FORMULÁRIO** (`form_manager`) e **GRUPOS** (`form_groups`) da página
`/v1/form-constructor` foram convertidos de markup Bootstrap manual (commit
`0050e27`) para **um `FormGridSchema` por subcard**, renderizado por
`<FormGrid>`. A página agora só tem estado + effects + a **montagem do schema** —
zero `<input>`/`<select>`/`<textarea>` de campo. Única exceção: o `<IconSelect>`
do ícone do grupo, que é componente próprio e fica ao lado do bloco `<FormGrid>`.

Lógica que era inline na página foi isolada:

| Antes (inline na página) | Agora |
| --- | --- |
| `slugify()` | [`src/utils/slug.ts`](../../utils/slug.ts) → `slugify()` |
| `parseProfileGroup()` + `JSON.stringify` | [`src/utils/jsonList.ts`](../../utils/jsonList.ts) → `parseStringList()` / `toStringList()` |
| `ManagerLocal`/`managerInicial`/`GrupoLocal`/`toTabela`/`toColuna` | `src/pages/v1/form/formBuilder.model.ts` |
| efeito próprio que buscava `user_roles` | o campo `select` carrega sozinho via `src` |

O campo **"Grupo de perfil"** ficou assim no schema:

```ts
{
  type: 'select',
  col: 6,
  label: 'Grupo de perfil',
  multiple: true,
  src: `${env.apiBaseUrl}/v1/user-roles/get-no-pagination`,
  valueKey: 'slug',
  labelKey: 'name',
  values: parseStringList(m.roles),
  onChangeMultiple: (values) =>
    patch(tabela, { roles: toStringList(values) }),
}
```

O par `montar` / `parse` continua valendo — ver
[`README_campo_json_montado.md`](README_campo_json_montado.md).

Notas da conversão: `version` e `sort_order` viram `text` com
`inputMode: 'numeric'` (o FormGrid não tem tipo `number`); `col` passa a
`col-md-N` (padrão do FormGrid). Estado e roadmap da página:
[`README_form_builder.md`](README_form_builder.md).

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
