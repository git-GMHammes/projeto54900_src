[◄ Índice da base de conhecimento](../README.md)

---

# Template004 — cópia do Template002 para a empresa Menezes 22001

Criado em 2026-11-04. O Template004 é uma **duplicata do [Template002](README_template002_modelo.md)** (variante sem
bordas, degradê entre regiões, menu lateral em coluna a partir de `lg`). Visual, contrato de JSON, paletas e
animações são os do 002; muda só o que é próprio da empresa `menezes22001`: o registro no banco e as imagens.

## 1. Vínculo no banco (DEV)

Criado para a Menezes não depender dos registros da Tryik (o Template 2 trazia o cabeçalho e o rodapé dela). O 004
tem registros próprios, com o modelo neutro do `default` (cabeçalho e rodapé 1).

| Tabela | Registro | Conteúdo |
| ------ | -------- | -------- |
| `temp_manager` | id 4, `template004`, "Template 004" | `company_manager=[]`, `status=inactive` |
| `temp_header` | id 4, "Cabeçalho Template 4" | fundo `img/template004/header_background.svg`; logo central só com o texto `LOGOMARCA`; `[]`, `inactive` |
| `temp_footer` | id 4, "Rodapé Template 4" | textos genéricos do rodapé 1; imagem `img/template004/footer_detail.png`; `[]`, `inactive` |

**Decisão do usuário (2026-11-04): o Template 004 é MANTIDO** (código, imagens e linhas id 4), porque receberá no futuro
atualizações diferentes das do 002. Não apagar nem reaproveitar.

**Estado atual (2026-11-04): sem empresa vinculada e inativo.** A Menezes voltou a usar o Template 2 com o cabeçalho e o
rodapé do `default` (ver [SVG-2026](README_SVG_2026.md)). Para reativar o 004: repor `["menezes22001"]` e
`status=active` nas três linhas id 4 (e tirar a Menezes do `temp_manager` 2 e das linhas 1).

## 2. Rota e arquivos

Rota `/template004` (também `/<slug>/template004`), pública, só JSON, sem sessão nem API. `template004` é segmento
reservado em `RESERVED_ROOT_SEGMENTS` (`config/env.ts`): nenhuma empresa pode ter esse slug.

| Arquivo (002 -> 004) | Observação |
| -------------------- | ---------- |
| `pages/Template002/Template002Page.tsx` e `template002.json` -> `pages/Template004/Template004Page.tsx` e `template004.json` | `template002` trocado por `template004` (classes, ids, caminhos de imagem) |
| `routes/template002.routes.tsx` -> `routes/template004.routes.tsx` | registrada em `routes/index.tsx`; `paths.template004` em `routes/paths.ts` |
| `public/img/template002/` -> `public/img/template004/` | `header_background.svg`, `footer_detail.png`, `img_detail.png` |
| `components/template/templateVariants.ts` | `template004: { flat: true, offcanvasOnly: false }` (mesmas flags do 002) |
| `styles/_animations.scss`, `_custom.scss` | `.template004` nas listas `:is(...)`, no degradê e no sticky (`template004-sticky`) |
| `hooks/useNavScroll.ts` | só o comentário dos consumidores |

`styles/_template-global.scss` não precisou mudar: o template dinâmico usa `.tpl-app.tpl-flat`, escolhido pela flag
`flat` da variante. Como o frontend escolhe o template (usuário, empresa ou visitante): seção 16 do
[Template001](README_template001_modelo.md).

## 3. Empresas

| Empresa (`slug`) | Template |
| ---------------- | -------- |
| `default` | `template001` |
| `tryikads` | `template002` |
| `drsergiopsicologo` | sem template em `temp_manager` (ver [Template003](README_template003_modelo.md)) |
| `menezes22001` | `template002` com cabeçalho/rodapé do `default` e paleta `Dark` (o 004 está inativo; ver [SVG-2026](README_SVG_2026.md)) |

Validação: `typecheck` e lint sem erro; ainda **não conferido em tela**.

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
