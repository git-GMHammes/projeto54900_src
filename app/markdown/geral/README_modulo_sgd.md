[◄ Índice da base de conhecimento](../README.md)

---

# Módulo SGD — Sistema Gerenciador de Documentos

> NÃO EXISTE ALTERAÇÃO de MIGRATE: apenas no fim de cada ciclo um novo, para a renovação de todo o sistema.

> **Status (2026-11-02):** frontend completo e validado — telas, menu, leitura de documento por OCR no navegador, dicionário de campos e tratamento de valores. **Ainda não existem** tabela, API nem rotas de backend: o botão **Enviar** não faz nada (por decisão). Roteiro dos próximos passos na seção 10.

## 1. Objetivo

Realizar o **upload** de um documento, passar o **OCR** e preencher os campos conforme o que está escrito nele: o sistema identifica os rótulos do documento (`Nome`, `NOME`, `nome` → `name`) por um **dicionário de campos** em JSON e mostra `chave : "valor"` abaixo do campo de upload, com o valor já tratado para gravar em banco.

## 2. Decisões de arquitetura

| Decisão | Motivo |
| --- | --- |
| Frontend **estático** (build `vite build` → HTML/JS/CSS) publicado no **Apache**; **sem Node em produção** | hospedagem comum; Node só para desenvolver e compilar |
| OCR **no navegador**, nada é enviado a servidor nesta fase | privacidade (documentos pessoais) e sem custo por página |
| Tudo **autohospedado**, sem CDN (modelos, WASM, workers) | independência de rede externa; mesmo build roda em qualquer host/pasta |
| Open source gratuito (PaddleOCR, ONNX Runtime, PDF.js — Apache 2.0 / MIT) | sem custo de licença nem de API |
| Regras de campo em **JSON** (dicionário e tipos), não no código | "sem gambiarra": o código da extração não conhece nenhum campo |
| Componente **global** com props; a página é só um wrapper | regra do sistema: nada estático preso a uma rota |
| Módulo independente: nenhuma ligação com outro módulo sem pedido | [`README_modulos_independentes.md`](README_modulos_independentes.md) |

## 3. Fluxo (upload → OCR → campos)

```
campo "arquivo" (form_manager criar-sgd)
   └─ DocumentFieldReader (change no <form>)
        1. PDF? pdfjs-dist (legacy) renderiza cada página (até 10) em canvas; imagem segue direto
        2. PaddleOCR (detecção + reconhecimento latino) → caixas de texto com posição na página
        3. extractFields: acha os rótulos do dicionário e o valor de cada um (mesma caixa, ao lado ou abaixo)
        4. tipos de valor (tipos.json): máscara, dinheiro, data, e-mail → valor pronto para o banco
        5. exibe  chave : "valor"  + "Texto reconhecido" (detalhe recolhido)
```

O **Enviar** está barrado em `CreatePage` (`onSubmitCapture`): nada é enviado até existir o backend.

## 4. Mapa de arquivos (frontend: `src/frontend/projeto54900/`)

| Arquivo | Papel |
| --- | --- |
| `src/pages/v1/sgd/{CreatePage,UpdatePage,GetAllPage,GetPage}.tsx` | páginas (wrappers finos), uma por ação |
| `src/routes/v1/sgd.routes.tsx`, `src/routes/paths.ts` (`paths.v1.sgd`) | rotas |
| `src/services/v1/sgd.table.ts`, `sgd.view.ts`, `constants/api.ts` (`sgd`, `sgdView`) | services (apontam para `api/v1/sgd` e `api/v1/sgd-view`, ainda inexistentes) |
| `src/components/global/DocumentFieldReader.tsx` | lê o arquivo do `<form>` em que está, roda o OCR e mostra os campos |
| `src/utils/documentOcr.ts` | OCR (PDF → canvas → PaddleOCR), devolve texto e caixas com posição |
| `src/utils/documentLayout.ts` | posição: acha o valor de cada rótulo (`assignValues`), `boxFromPoly` |
| `src/utils/documentFields.ts` | `extractFields`: rótulos do dicionário → valores |
| `src/utils/documentValueTypes.ts` | tipos de valor (registry) |
| `src/catalogs/sgd/*.json` + `index.ts` | dicionário (`identificacao`, `documentos`, `contato`, `endereco`) e `tipos.json` |
| `public/ocr/paddle/*.tar` | modelos ONNX do OCR |

Banco (DEV): carga `src/writable/claude/20261102150000_sgd_telas.sql` (rollback em `..._rollback.sql`).

## 5. Telas e menu (sem backend)

Não há tabela nem rotas de backend; todas as telas e a navegação existem e chamam `api/v1/sgd` / `api/v1/sgd-view` (o erro da API aparece no toast até o módulo existir).

| Ação | Rota | Página | Definição no banco |
| --- | --- | --- | --- |
| Ler (lista, busca) | `/v1/sgd` | `GetAllPage` (`ListBuild`) | `list_manager` slug `sgd` |
| Criar | `/v1/sgd/create` | `CreatePage` (`RecordFormBuild`) | `form_manager` slug `criar-sgd` (1 campo `arquivo`) |
| Editar | `/v1/sgd/update/:id` | `UpdatePage` | `form_manager` slug `editar-sgd` |
| Visualizar | `/v1/sgd/:id` | `GetPage` (`RecordDetail`) | view `view_sgd` (prefixo `sg_`) |
| Excluir | ação da lista (confirmação) | — | `list_actions` (`DELETE .../sgd/delete-soft/{id}`) |
| Visualizador de Mídias | ação da lista (modal) | — | `list_actions` `media-viewer` |
| Menu | grupo **SGD** (Documentos, Novo documento) | — | `temp_menu` |

## 6. Dicionário de campos

JSONs em `src/catalogs/sgd/`, formato `{ "name": ["nome", "nome completo"] }` — **chave do sistema → rótulos aceitos**. A comparação ignora acento e caixa. Rótulo mais longo vence (`nome da mãe` antes de `nome`).

Campo novo: editar um JSON (ou criar outro e importá-lo em `catalogs/sgd/index.ts`). Cada documento novo escaneado acrescenta rótulos aqui.

## 7. Como o valor é achado (por posição na página)

O OCR devolve cada caixa de texto com a posição. O valor de um rótulo é:

1. o que vem depois do `:` na mesma caixa (`Nome: Maria`; vários rótulos na mesma caixa também);
2. senão, a caixa **ao lado** (mesma linha) ou **logo abaixo** do rótulo — vale tanto `Nome: Maria` quanto rótulo numa linha e valor na de baixo, em várias colunas.

Os rótulos disputam as caixas próximas, do par mais perto para o mais longe, e cada caixa serve a um só rótulo; o valor pode estar deslocado da coluna do rótulo. **Texto que termina em `:` é sempre rótulo** (inclusive desconhecido), nunca valor. Vale a primeira ocorrência da chave. Em texto puro (sem posição) o valor é a linha seguinte. Lógica: `documentLayout.ts` (`assignValues`) e `documentFields.ts`. As constantes de distância (em múltiplos da altura do rótulo) ficam no topo do `documentLayout.ts`.

## 8. Tipos de valor (pronto para o banco)

`catalogs/sgd/tipos.json` (`chave → tipo`) liga um campo a um tipo de `utils/documentValueTypes.ts`. Tipo novo: uma função no registry + uma linha no JSON.

| Tipo | Faz | Exemplo |
| --- | --- | --- |
| `email` | `@` lido como uma maiúscula volta a `@` (só com uma maiúscula e e-mail válido) | `a.bQgmail.com` → `a.b@gmail.com` |
| `cpf` / `cnpj` / `cep` | remove a máscara (só se tiver 11 / 14 / 8 dígitos) | `545.566.234-01` → `54556623401` |
| `phone` | só dígitos: DDD + número (10 ou 11); descarta o prefixo `55` | `(21) 9 8055-8545` → `21980558545` |
| `rg` | tira pontos, traços e espaços; aceita verificador `X`; com outras letras (ex.: `MG-`) volta como lido | `876876-98` → `87687698` |
| `money` | tira `R$` e o milhar, troca vírgula por ponto, 2 casas (`DECIMAL`) | `R$8.500,00` → `8500.00` |
| `date` | `dd/mm/aaaa` → ISO; com horário, o horário sai separado em `<chave>_time` | `12/12/2026 14:30` → `birth_date: 2026-12-12` + `birth_date_time: 14:30:00` |

Valor que não cabe no formato (CPF com 10 dígitos, data 31/02, ano com 2 dígitos) **volta como foi lido**, para o erro ficar visível em vez de virar dado errado.

Hoje ligados: `email`, `cpf`, `cnpj`, `zip_code`→`cep`, `phone`, `mobile`→`phone`, `rg`, `salary`→`money`, `birth_date`/`rg_issue_date`/`validity`/`admission_date`→`date`.

## 9. OCR: motor, hospedagem e histórico

- **Motor:** PaddleOCR PP-OCRv5 (`@paddleocr/paddleocr-js` + `onnxruntime-web`), detecção `PP-OCRv5_mobile_det` (4,8 MB) e reconhecimento **latino** `latin_PP-OCRv5_mobile_rec` (8 MB): português com acentos, `@` e pontuação ASCII. Modelos baixados uma vez de `paddle-model-ecology.bj.bcebos.com` e guardados em `public/ocr/paddle/` (não há requisição externa em uso).
- **Runtime:** WASM do ONNX Runtime (29 MB, ~7 MB com gzip) emitido pelo Vite; referenciado por caminho relativo em `documentOcr.ts` porque o `exports` do pacote não permite import direto.
- **PDF:** `pdfjs-dist` build `legacy`; até 10 páginas; escala 2; timeout de 30 s por etapa (evita barra parada).
- **Carga sob demanda:** as libs só carregam quando o usuário escolhe um arquivo (1ª leitura ~10 s; depois ~2 s).
- **Apache:** precisa servir `.wasm` como `application/wasm` e `.mjs` como `text/javascript`.
- **Dependências** (detalhe em `frontend/.../README_dependencias_node.md`): `@paddleocr/paddleocr-js`, `onnxruntime-web`, `pdfjs-dist`.

### Histórico e decisões descartadas

| Tentativa | Resultado |
| --- | --- |
| Tesseract.js (`por`) | funcionou, mas lia o `@` como `Q` (e `(Q`); testado com resolução 3×/4× e modelo `best` — não resolveu; **removido** |
| `fixEmail` por nome de campo no código | descartado ("gambiarra"); virou tipo de valor declarado em JSON |
| PDF.js build moderno | travava em navegador mais antigo; trocado por `legacy` |
| Leitura por "linha seguinte" | falhou no layout rótulo-em-cima/valor-embaixo; trocada por leitura por posição |
| Regra rígida de alinhamento do valor | falhou com valor deslocado da coluna; trocada por atribuição global por distância |
| `UploadPage` / `DocumentFields` / multipart no `FormBuild` | desfeitos: o pedido era só a tela `create` com um campo de upload |

Documentos de teste: `doc/pdf/ocr_form_001.pdf` (valor ao lado do rótulo) e `ocr_form_002.pdf` (valor abaixo, em colunas), com os `.txt` correspondentes em `doc/txt/`. Ambos extraem os mesmos 14 campos.

### Como testar (sem login)

Dev: `npm run dev` (porta 54910). Teste de fluxo completo em Chrome headless (CDP): página temporária em `public/` que importa `/src/utils/documentOcr.ts`, `documentFields.ts` e `catalogs/sgd`, roda o PDF e imprime `chave : valor`; apagar a página depois. `npm run build` escreve em `src/public/app` (**versionado**): não rodar sem pedido, ou restaurar com `git checkout -- public/app`.

## 10. Roteiro dos próximos passos (sugestão — a priorizar)

**A. Fechar o ciclo no ambiente real**
1. Publicar o build no Apache e validar: MIME de `.wasm`/`.mjs`, cache e gzip (`.htaccess`), tempo da 1ª leitura e peso (~13 MB de modelos + 7 MB de WASM comprimido).
2. Registrar a origem, a versão e o checksum dos modelos `.tar` (hoje só há o link de download) e confirmar as licenças (Apache 2.0 / MIT).
3. Decidir se os modelos (13 MB) ficam no Git ou fora dele (Git LFS / artefato de deploy).

**B. Qualidade da leitura (fontes ruins, fotos)**
4. Montar um **conjunto de documentos de teste** com o resultado esperado em JSON e um script headless que roda todos e acusa regressão — hoje o teste é manual.
5. Pré-processamento da imagem (contraste, binarização, correção de inclinação) e comparação com o modelo de reconhecimento maior (`server_rec`); medir antes de adotar.
6. Mostrar a **confiança** do OCR (o motor devolve `score` por caixa) e marcar o que veio incerto.
7. Foto de celular (perspectiva, sombra), documento girado, várias colunas e tabelas.

**C. Dicionário e tipos**
8. Escanear documentos reais (RG, CNH, comprovante de residência, contrato, nota fiscal) e acrescentar rótulos; tratar rótulos ambíguos (`número`, `n.`, `data`).
9. **Tipo de documento**: classificar (RG, CNH…) e aplicar o dicionário daquele tipo, reduzindo falsos positivos.
10. Mais tipos de valor: data com ano de 2 dígitos, telefone com ramal, CNH/PIS/título com validação de dígito, UF, valores em outras moedas; campo com **mais de uma ocorrência** (dois telefones).
11. Validar dígitos verificadores (CPF/CNPJ) e sinalizar sem alterar o valor.

**D. Revisão pelo usuário**
12. Tela de **conferência**: documento ao lado com as caixas reconhecidas destacadas e o valor de cada campo, permitindo corrigir antes de gravar (hoje só exibe).
13. Permitir ao usuário **ensinar** um rótulo novo (aprender com o documento) e gravar no dicionário.

**E. Backend (quando for hora; exige permissão e o migrate do fim do ciclo)**
14. Tabela do módulo (com `company_id`, arquivo, tipo, campos extraídos em JSON, status), view `view_sgd`, API `create` **multipart**, `update`, `delete-soft` e `get-all` com busca. Seguir [`ROADMAP_padrao_modulo.md`](ROADMAP_padrao_modulo.md) e a regra de migrate (3 pares, editados in place).
15. Religar o **Enviar**: multipart pelo `RecordFormBuild`/`FormBuild` (hoje só JSON) e gravar também os campos já extraídos; retirar o bloqueio do `CreatePage`.
16. Armazenamento via módulo de upload (`README_modulo_upload.md`) e visualização de mídia.
17. **LGPD/segurança:** documentos pessoais — retenção, acesso por papel, log de acesso e, se houver, criptografia em repouso. Hoje nada sai do navegador.

**F. Desempenho e UX**
18. Rodar o OCR em **Web Worker** (`worker: true`) para não travar a página; cachear modelos (Cache API).
19. Limite de páginas configurável, cancelamento da leitura e mensagens de erro por etapa.

**G. Pendências técnicas menores**
20. `npm audit` aponta vulnerabilidades só em ferramentas de desenvolvimento (`vite`, `eslint`); decidir quando atualizar.
21. `@popperjs/core` é dependência par do Bootstrap e não é importado direto — avaliar remoção.
22. Documentar na base de conhecimento do frontend (`src/markdown/README.md`) um atalho para este módulo.

## 11. Planos executados (`src/writable/claude/`)

Prefixos `20261102120000` (doc em branco), `130000` (README de dependências), `140000` (UploadPage — **desfeito**), `150000` (telas e menu), `170000` (dicionário e OCR Tesseract), `180000` (e-mail), `190000` (tipos de valor), `200000` (motor PaddleOCR), `210000` (máscara/dinheiro/data), `220000` (leitura por posição), `230000` (telefone e RG).

## 12. Documentos-alvo dos testes (OCR e dicionário)

Decisão de 2026-11-02: o módulo será testado com **todos** os tipos de documento abaixo. Cada tipo novo cresce os JSONs (`catalogs/sgd/`), nunca o código — ver seções 6 e 7. Por ora, apenas o registro da lista; nada foi implementado além do já testado.

| # | Tipo | Situação |
| --- | --- | --- |
| 1 | Ofício | testado (`doc/pdf/Ofício nº 001_2026.pdf`) |
| 2 | Memorando | a testar |
| 3 | Despacho | a testar |
| 4 | Parecer | a testar |
| 5 | Nota Técnica | a testar |
| 6 | Informação | a testar |
| 7 | Portaria | a testar |
| 8 | Decisão | a testar |
| 9 | Resolução | a testar |
| 10 | Instrução Normativa | a testar |
| 11 | Circular | a testar |
| 12 | Comunicado | a testar |
| 13 | Edital | a testar |
| 14 | Contrato | a testar |
| 15 | Convênio | a testar |
| 16 | Termo de Referência | a testar |
| 17 | Ata | a testar |
| 18 | Relatório | a testar |
| 19 | Requerimento | a testar |
| 20 | Declaração | testado (declaração de dados bancários, `doc/pdf/DECLARACAO_NUBANK.pdf`) |
| 21 | Certidão | a testar |
| 22 | Minuta | a testar |
| 23 | Formulário | testado (`doc/pdf/ocr_form_001.pdf` e `ocr_form_002.pdf`) |
| 24 | E-mail | a testar |
| 25 | Documento Externo | a testar |

Fora da lista, já exercitado: **NF-e/DANFE** (`doc/pdf/000.073.162.pdf`).
