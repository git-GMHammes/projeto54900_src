[◄ Índice da base de conhecimento](../../../README.md)

---

# Módulo `health` (Saúde) — frontend

> NÃO EXISTE ALTERAÇÃO de MIGRATE: apenas no fim de cada ciclo um novo, para a renovação de todo o sistema.

Telas do módulo Saúde: 8 listas (uma por view), 7 pares de formulário (cadastro e edição, um por tabela),
detalhe de cada registro e o menu **Saúde**. Backend, tabelas, views, regras e rotas em
[`README_modulo_health.md`](../../../../../../../app/markdown/geral/README_modulo_health.md) e
[`README_rotas_swagger.md`](../../../../../../../app/markdown/geral/README_rotas_swagger.md).

## Como funciona

Mesmo padrão do módulo Service: as páginas são **wrappers finos** dos componentes globais e tudo que
define a tela vem do banco DEV (`form_manager`, `list_manager`, `temp_menu`):

- **Lista:** `ListBuild` (slug do `list_manager` = slug da API). Busca textual pelo `api_search_endpoint` da view,
  paginação, ordenação, botão Novo e ações Ver, Editar e Excluir (`delete-soft` com confirmação).
- **Cadastro e edição:** `RecordFormBuild` (slug do `form_manager`). Os campos de vínculo (paciente, profissional,
  prontuário, usuário) são **opcionais** no cadastro ("Opcional." no tooltip) e **editáveis** na edição (`toValues` os
  preenche); só `company_id` é obrigatório no banco. Tabelas de
  saúde não têm `roles` por registro, então não se usa `RecordFormWithRoles`.
- **Detalhe:** `RecordDetail` sobre a view.
- Rotas em `routes/v1/health.routes.tsx` (30 rotas), caminhos em `routes/paths.ts` (`paths.v1.health*`),
  grupos de API em `constants/api.ts` (15), services em `services/v1/health*.ts`, rótulos em `utils/recordLabels.ts`
  (`HEALTH_*`). Páginas em `pages/v1/health/<slug-do-recurso>/`.

## Telas

| Submódulo | Rota da lista | Formulários (`form_manager`) | Lista (`list_manager`) | Colunas | Ações |
| --- | --- | --- | --- | --- | --- |
| Registros profissionais (CRM) | `/v1/health-registrations` | `criar-registro-profissional`, `editar-registro-profissional` | `health-registrations` | 7 | Ver, Editar, Excluir |
| Pacientes | `/v1/health-patients` | `criar-paciente`, `editar-paciente` | `health-patients` | 8 | Ver, Editar, Excluir |
| Prontuários | `/v1/health-records` | `criar-prontuario`, `editar-prontuario` | `health-records` | 9 | Visualizador de Mídias, Ver, Editar, Excluir |
| Receitas | `/v1/health-prescriptions` | `criar-receita`, `editar-receita` | `health-prescriptions` | 6 | Ver, Editar, Excluir |
| Exames | `/v1/health-exams` | `criar-exame`, `editar-exame` | `health-exams` | 5 | Visualizador de Mídias, Ver, Editar, Excluir |
| Sinais vitais | `/v1/health-vitals` | `criar-sinais-vitais`, `editar-sinais-vitais` | `health-vitals` | 9 | Ver, Editar, Excluir |
| Alergias | `/v1/health-allergies` | `criar-alergia`, `editar-alergia` | `health-allergies` | 5 | Ver, Editar, Excluir |
| Identidade de saúde | `/v1/health-user-identity` | — (só leitura) | `health-user-identity` | 4 | Ver |

Identidade de saúde não tem cadastro nem edição: ela é derivada de Registros profissionais e Pacientes (dispensa de CRUD
prevista na regra 4 da seção 10.2 do `ROADMAP_padrao_modulo.md`).

**Selects remotos dos formulários** (`select_config_json`): usuário (`user-directory-view`), paciente
(`health-patients-view`), profissional (`health-registrations-view`), prontuário (`health-records-view`) e ordem de
serviço (`service-order-view`). Todo campo tem `help_text`.

**Pré-seleção por querystring:** `?patient_id=` (prontuário, alergia), `?service_order_id=` (prontuário) e
`?record_id=` (receita, exame, sinais vitais).

**Regra de ação por registro:** em Prontuários e Receitas, Editar e Excluir ficam desabilitados ("indisponível") quando o
prontuário não está em rascunho (`business_rule_json` em `status` e `record_status`; o `ListBuild` desabilita, não oculta).
A API continua sendo a barreira (409).

## Anexos e Visualizador de Mídias (Prontuários e Exames)

- **Onde ficam os arquivos:** em `uploads` (módulo `UploadManager`), ligados ao registro por `module` + `reference_id`.
  Módulos de saúde: `HealthRecords` (prontuário) e `HealthExams` (exame). Isolamento por empresa vem do próprio `uploads`.
- **`ListBuild` (prop `mediaModule`):** a ação `media-viewer` (`action_type` `modal`, ícone `images`) abre o
  `MediaViewerModal` com os anexos da linha. `GetAllPage` de Prontuários passa `mediaModule="HealthRecords"` e a de Exames
  `mediaModule="HealthExams"`. Sem a prop, a ação continua avisando que não tem tratamento (comportamento das demais listas).
- **`AttachmentsPanel` (componente global):** no detalhe do prontuário e do exame; lista, anexa, visualiza, baixa e exclui.
  No prontuário, anexar e excluir só com o prontuário em rascunho (`canEdit`); no exame, sempre liberado, porque o
  resultado costuma chegar depois. Essa regra é só da tela: o backend de `uploads` não conhece o status do prontuário.

## Detalhes com comportamento próprio

- **Prontuário (`health-records/GetPage`):** `StatusActions` (Assinar com confirmação e Cancelar), e os blocos de
  receitas, exames e sinais vitais do prontuário, com atalhos de criação que só aparecem em rascunho. Editar só em rascunho.
- **Paciente (`health-patients/GetPage`):** prontuários e alergias do paciente, com atalhos de criação já com o paciente.
- **Receita:** Editar só com o prontuário em rascunho.

## Menu

`temp_menu`: pai **Saúde** (ícone `heart-pulse`, `sort_order` 73, `offcanvas`, perfis user e admin) com 8 filhos, um por
lista: Prontuários, Pacientes, Profissionais (CRM), Receitas, Exames, Sinais vitais, Alergias e Identidade de saúde.
Empresas com o menu: `default`, `tryikads` e `drsergiopsicologo` (as mesmas do Service).

## Arquivos de banco (execução única no DEV)

Em `src/writable/claude/`, um par por submódulo (`<ts>_saude_<submodulo>_telas.sql` e `..._rollback.sql`) e o do menu
(`20261122171000_saude_menu.sql` e `..._rollback.sql`). Não são migrations: entram no próximo REMAKE quando o usuário pedir.

## Exame ligado a evento do Calendar (2026-11-22)

- No cadastro de evento (`cadastro-evento`) há o campo opcional **Exame**, alimentado por `health-exams-view/get-no-pagination`.
- A lista de exames (`health-exams`) mostra a coluna **Data do Calendar** (início do evento mais recente ligado ao exame).
- Detalhes da regra e da API em `src/app/markdown/geral/README_modulo_health.md`.
- Pendente: mostrar o exame na lista do modal "Ver eventos" (exige mapear o campo em `calendarSchema.ts`).

## Máscaras de exibição (2026-11-22)

CPF e telefone são gravados sem máscara e exibidos com máscara: `formatCpf` e `formatPhone` (`utils/format.ts`) nos detalhes de
pacientes, prontuários e profissionais, e os formatos `cpf`/`phone` nas colunas da lista de pacientes. Detalhe do formato em
`README_list_constructor.md`. Pendente: abrir as telas no navegador logado para conferir visualmente.

## Sinais vitais com aparelhos de farmácia (2026-11-22)

Formulários de cadastro e edição com glicemia (e momento), colesterol total, triglicerídeos, ácido úrico, frequência respiratória, cintura e
gordura corporal, todos opcionais. Lista com Glicemia, Colesterol e Triglicerídeos; detalhe com os 8 campos (`GetPage.tsx`) e edição
carregando os valores (`UpdatePage.tsx`). Regras e API em `src/app/markdown/geral/README_modulo_health.md`.

## Identidade de saúde: só superusuário (2026-11-22)

As rotas `health-user-identity` e `health-user-identity/:id` ficam dentro de `<RequireRole role="superuser" />` em
`routes/v1/health.routes.tsx`; o item do menu (`temp_menu` 104) e a lista (`list_manager` 77) têm `roles = ["superuser"]`.
Os demais papéis não veem o menu e, pela URL, vão para a tela de acesso negado. O backend também bloqueia (403).

## Sinais vitais para o guest (2026-11-22)

O perfil `guest` vê no menu só Saúde > Sinais vitais, com a lista e a ação Ver, e somente os próprios aferimentos (a API filtra). Não vê Novos
sinais, Editar nem Excluir. Detalhes em `src/app/markdown/geral/README_modulo_health.md`. Usuários de teste: `gustavo.guest` e `sergio.guest`.

## Exames e receitas para o guest (2026-11-22)

O guest vê no menu Saúde > Exames e Receitas, só com a lista e a ação Ver, e somente os próprios registros (a API filtra). Não vê Novo, Editar,
Excluir nem o Visualizador de Mídias. Detalhes em `src/app/markdown/geral/README_modulo_health.md`.

## Pendências

1. **Visualizador de Mídias:** feito (ver seção acima). Não aberto no navegador, assim como o envio de anexos.
2. **`route_manager`:** catalogadas 228 rotas de saúde (198 de backend e 30 de frontend), por SQL de execução única no DEV.
3. **SGD:** a ação `media-viewer` da lista do SGD continua sem tratamento (não passa `mediaModule`); pode adotar a prop depois.
4. **Campo condicional:** no cadastro de registro profissional, o campo Usuário não some quando o titular é a empresa; a API
   valida (422).
5. **Teste de tela no navegador:** não feito (sem credencial de DEV para o login). Conferidos: `typecheck`, `lint` e as
   contagens no banco.
6. **Menu das outras empresas:** só as 3 empresas do Service enxergam o menu Saúde.
7. REMAKE com as tabelas, views e definições de tela (decisão do usuário).

---

[◄ Índice da base de conhecimento](../../../README.md)
