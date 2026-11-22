[◄ Índice da base de conhecimento](../README.md)

---

# Módulo Health (Saúde) — tabelas e views

> Estado (2026-11-22): **banco DEV + API (backend) + telas**. 7 tabelas e 8 views em
> `codeigniter54900_db`, a API V1 completa (Model, Request, Processor, Controller e
> rotas): 198 rotas, e as telas (listas, formulários, detalhe e menu Saúde), documentadas em
> [`README_health.md`](../../../frontend/projeto54900/src/markdown/geral/modulos/health/README_health.md).
> Sem arquivo em `app/Database/Migrations/`: tabelas e views entram no próximo REMAKE,
> quando o usuário pedir (ver [`README_migrate.md`](README_migrate.md)).

## Princípio: não repetir o que já existe

O módulo **não** recria empresa, usuário, serviço nem agenda. Ele cruza com:

| Já existe | Papel no módulo Health |
| --- | --- |
| `company_manager` | tenant: toda tabela `health_*` tem `company_id` |
| `user_manager` + `user_profiles` | pessoa (nome, CPF, telefone, e-mail): médico e paciente são usuários |
| `service_manager` | catálogo do que é feito (consulta, exame etc.) |
| `service_order` | o atendimento: `customer_user_id` (paciente), `executor_user_id` (profissional), `scheduled_at`, `status` |
| `uploads` | arquivos (resultado de exame, laudo), polimórfico por `module` + `reference_id` |

## Quem é médico e quem é paciente

- **Médico/profissional:** `health_registrations` guarda o registro no conselho
  (`council` = CRM, CRO, CRN, COREN, CREFITO, CRP, CRF ou OTHER; `state` = UF;
  `registration_number`; `specialty`; `rqe`; `valid_until`; `status`).
  O titular pode ser **usuário** (`subject_type = 'user'`, `user_id` exigido por esse tipo)
  ou a **própria empresa** (`subject_type = 'company'`, `user_id` NULL) — regra
  garantida pelo `Processor` (o CHECK do banco foi removido). Único por `company_id + council + state + registration_number`.
- **Paciente:** `health_patients` liga o usuário (`user_id`) à empresa e guarda só
  o clínico (nascimento, sexo, tipo sanguíneo, convênio, contato de emergência).
  Único por `company_id + user_id`.
- **Consulta rápida:** `view_health_user_identity` devolve, por empresa e usuário,
  `is_doctor` (registro ativo) e `is_patient` (paciente ativo).

## Tabelas (todas com `id`, `company_id`, `created_at`, `updated_at`, `deleted_at`)

| Tabela | Função | Vínculos (FK no banco, coluna **opcional/NULL**) |
| --- | --- | --- |
| `health_registrations` | registro em conselho (CRM etc.) de usuário ou empresa | `company_id`, `user_id` -> `user_manager` (opcional) |
| `health_patients` | usuário que é paciente da empresa | `company_id`, `user_id` -> `user_manager` (opcional) |
| `health_records` | prontuário do atendimento (queixa, anamnese, diagnóstico, CID-10, conduta, status draft/signed/cancelled) | `patient_id` -> `health_patients`, `professional_id` -> `health_registrations`, `service_order_id` -> `service_order` (todos opcionais) |
| `health_prescriptions` | receitas e medicamentos do prontuário | `record_id` -> `health_records` (opcional; exclusão definitiva do prontuário leva os itens, no código) |
| `health_exams` | exames solicitados e resultado (status requested/done/cancelled) | `record_id` -> `health_records` (opcional; idem) |
| `health_vitals` | sinais vitais (peso, altura, pressão, FC, temperatura, SpO2) | `record_id` -> `health_records` (opcional; idem) |
| `health_allergies` | alergias do paciente (severidade mild/moderate/severe) | `patient_id` -> `health_patients` (opcional; exclusão definitiva do paciente leva as alergias, no código) |

Prontuário não se apaga: a exclusão é lógica (`deleted_at`). A exclusão definitiva (`deleteHard` e `clearDeleted`, só admin) é
regra dos Processors: paciente ou registro profissional com prontuário respondem 409, e prontuário e paciente apagam os
itens e as alergias junto. Sem triggers e sem CHECK no banco; as FKs existem, mas as colunas de vínculo aceitam NULL.

## Views (uma por tabela, para as APIs, mais a de identidade)

| View | O que acrescenta |
| --- | --- |
| `view_health_registrations` | nome do titular (`holder_name`), `username`, CPF, empresa, `registration_label` (ex.: `CRM/RJ 123456`) |
| `view_health_patients` | nome, CPF, telefone, WhatsApp, e-mail, `age` |
| `view_health_records` | paciente (nome, CPF), profissional (nome, conselho, número, UF, especialidade), OS (`service_order_code`, `status`, `scheduled_at`) e `service_name` |
| `view_health_prescriptions` | `patient_id`, `patient_name`, `record_status` |
| `view_health_exams` | `patient_id`, `patient_name` |
| `view_health_vitals` | `patient_id`, `patient_name`, `bmi` calculado |
| `view_health_allergies` | `patient_user_id`, `patient_name` |
| `view_health_user_identity` | `is_doctor` e `is_patient` por empresa e usuário |

As views usam apenas `LEFT JOIN` e funções do MySQL 5.7 (sem função de janela,
sem CTE), conforme [`README_migrate.md`](README_migrate.md). Os `LEFT JOIN` de
usuário e perfil filtram `deleted_at IS NULL` do lado dependente.

## API V1 (backend)

Cada tabela e cada view é um submódulo `Health/<Submódulo>`, com as 6 camadas do
[`ROADMAP_padrao_modulo.md`](ROADMAP_padrao_modulo.md): 18 rotas por tabela, 9 por view,
198 no total (mapa em [`README_rotas_swagger.md`](README_rotas_swagger.md)). `jwtauth` por
wildcard em `Config/Filters.php`; `adminonly` na exclusão definitiva; sem rota pública.

| Submódulo | Tabela | View | Prefixo da rota |
| --- | --- | --- | --- |
| `HealthRegistrations` | `health_registrations` | `view_health_registrations` | `health-registrations` |
| `HealthPatients` | `health_patients` | `view_health_patients` | `health-patients` |
| `HealthRecords` | `health_records` | `view_health_records` | `health-records` |
| `HealthPrescriptions` | `health_prescriptions` | `view_health_prescriptions` | `health-prescriptions` |
| `HealthExams` | `health_exams` | `view_health_exams` | `health-exams` |
| `HealthVitals` | `health_vitals` | `view_health_vitals` | `health-vitals` |
| `HealthAllergies` | `health_allergies` | `view_health_allergies` | `health-allergies` |
| `HealthUserIdentity` | — | `view_health_user_identity` | `health-user-identity-view` (só leitura) |

Arquivos de cada submódulo (a partir de `src/app/`): `Models/V1/Health/<S>/SqlTableModel.php` e
`SqlViewModel.php`, `Requests/V1/Health/<S>/CreateRequest.php` e `UpdateRequest.php`,
`Services/V1/Health/<S>/Processor.php`, `Controllers/Api/V1/Health/<S>/ResourceTableController.php` e
`ResourceViewController.php`, `Config/Routes/Api/v1/Health/<S>/EndpointTable.php` e `EndPointView.php`.
Registro dos 15 grupos em `Config/Routes.php` e dos 15 padrões no `jwtauth` em `Config/Filters.php`.

Isolamento por empresa: as tabelas usam `companyScope = 'column'` (a empresa vem da sessão e não
muda); as views usam `via_table` sobre a tabela de origem e `view_health_user_identity` usa `column`.

## Regras de negócio (nos Processors)

Todos: guest não escreve (403); nenhum trigger no banco.

- **HealthRegistrations:** `subject_type` `user` exige `user_id` de usuário da empresa (422); `company`
  exige `user_id` vazio (422). Conselho + UF + número são únicos na empresa, inclusive excluídos (409);
  a UF é gravada em maiúsculas. `subject_type` e `user_id` são imutáveis no update.
- **HealthPatients:** `user_id` é opcional; quando informado, o usuário precisa pertencer à empresa (422) e é
  paciente uma vez por empresa, inclusive excluído (409). Pode ser informado ou trocado no update.
- **HealthRecords:** paciente e registro profissional são opcionais; quando informados precisam existir na
  empresa, e o registro precisa estar `active` e dentro de `valid_until` (422; no update só é conferido se o
  profissional foi trocado). `service_order_id`, quando informado, deve ser OS da empresa; se a OS tiver
  `customer_user_id` e houver paciente com usuário, devem coincidir, e se tiver `executor_user_id` e houver
  profissional com usuário, devem coincidir (422). Nasce `draft`; fluxo `draft -> signed | cancelled` e
  `signed -> cancelled`; `signed_at` vem do servidor. Prontuário `signed` ou `cancelled` não é editado (409).
  Paciente e profissional podem ser informados ou trocados no update (rascunho).
- **HealthPrescriptions, HealthExams, HealthVitals:** `record_id` é opcional; quando informado, o prontuário
  precisa existir na empresa (422) e estar `draft` (409). Em prontuário `signed` ou `cancelled` não há
  inclusão, alteração nem exclusão (409). `record_id` pode ser informado ou trocado no update.
- **HealthAllergies:** `patient_id` é opcional; quando informado, o paciente precisa existir na empresa (422).
  Pode ser informado ou trocado no update.
- **HealthUserIdentity:** só leitura; ignora paciente sem usuário.

## IDs de vínculo opcionais (independência dos submódulos)

Regra (2026-11-22, ampliada pelo usuário): toda FK entre módulos aceita NULL, inclusive `company_id` (FK para `company_manager`,
módulo Company). Dentro do mesmo módulo `NOT NULL` é permitido quando houver necessidade. Todo ID de vínculo aceita NULL, para que cada
submódulo exista por conta própria e a ligação entre módulos seja opcional. Quando o ID vem preenchido, continua validado
(existe na empresa, regras de status). Colunas que passaram a aceitar NULL: `health_allergies.patient_id`,
`health_patients.user_id`, `health_records.patient_id`, `health_records.professional_id`, `health_prescriptions.record_id`,
`health_exams.record_id` e `health_vitals.record_id` (`health_registrations.user_id` e `health_records.service_order_id` já aceitavam).
`company_id` das tabelas `health_*` (todas as 7: allergies, exams, patients, prescriptions, records, registrations e vitals) aceita NULL no DEV e
no `202611221920_replace_table.sql`; as FKs para `company_manager` foram mantidas. O isolamento por empresa fica no código
(`companyScope = 'column'`): registro sem `company_id` não aparece para nenhuma empresa, e índice único com `company_id` aceita duplicado
quando ele é NULL.
Esta regra faz parte da regra geral "dependência é responsabilidade do código (backend e frontend), não do banco" (ver
[`README_modulos_independentes.md`](README_modulos_independentes.md), seção 5). **Correção (2026-11-22):** o problema nunca
foi a FK, e sim a dependência (ID `NOT NULL`). As 16 FKs foram removidas por engano e **recriadas** (mesmas regras de
`ON DELETE` de antes); com a coluna aceitando NULL, a FK não obriga o vínculo, mas um ID informado inexistente também é
barrado pelo banco, além do Processor. O CHECK do titular **não** voltou (a regra "titular usuário exige `user_id`" é do
Processor). A cascata e o bloqueio de exclusão definitiva continuam também nos Processors (ver acima). As views toleram vínculo
vazio com `LEFT JOIN` (nome vazio). Paciente sem `user_id` aparece sem
nome e CPF nas views, pois eles vêm de `user_profiles`. No `health_registrations` a regra "titular usuário exige `user_id`"
continua no Processor, por coerência de tipo. Os formulários de cadastro marcam esses campos como "Opcional" e os de
edição passaram a incluí-los. Auditoria feita em todo o banco: outros módulos (Calendar, Chat, Message, Timeline, Product,
Movement, Service, Map etc.) têm colunas `*_id` `NOT NULL` equivalentes; não foram alterados.

Validação feita em 2026-11-22 (Processors dentro de transação, com rollback e tabelas zeradas ao
final): registro CRM e da empresa, duplicidade (409), usuário inexistente (422), paciente único (409),
OS de outro profissional (422), status forçado para `draft` no create, assinatura com `signed_at`,
bloqueio de edição de prontuário assinado e de seus itens (409), guest (403) e isolamento por empresa.
Não foi testada a camada HTTP com login (sem credencial de DEV).

## Exame ligado a evento do Calendar (2026-11-22)

`calendar_events.health_exam_id` (BIGINT NULL, FK `fk_calendar_events_health_exam` -> `health_exams`, `ON DELETE SET NULL`,
`ON UPDATE CASCADE`) marca o evento como a data de um exame. É a única ligação entre os módulos e vai no sentido
Calendar -> Health; `health_exams` não guarda nada do evento. Um exame pode ter vários eventos.

- **Views:** `view_health_exams` traz `calendar_event_id`, `calendar_event_summary`, `calendar_event_start` e
  `calendar_event_end` do evento mais recente não excluído (início mais tarde primeiro), sem duplicar o exame.
  `view_calendar_manager` traz `ce_health_exam_id` e `ce_health_exam_name`.
- **API Calendar (`calendar-events`):** `health_exam_id` opcional no create e no update (`is_not_unique[health_exams.id]`);
  o Processor valida que o exame existe na empresa da sessão (422) e converte vazio em NULL. Sem trigger no banco.
- **Telas:** formulário `cadastro-evento` ganhou o campo Exame (opcional); a lista `health-exams` ganhou a coluna
  "Data do Calendar" (não ordenável, porque `calendar_event_start` não está em `sortableFields` da view).
- **Pendente:** a lista de eventos do modal "Ver eventos" (`calendar-events-view`) ainda não mostra o exame; depende de
  mapear `ce_health_exam_name` em `src/services/calendarSchema.ts` (arquivo fora do plano aprovado).
- **Testado:** no banco (evento ligado, view com o evento mais recente, `SET NULL` ao excluir o exame; dados revertidos),
  `php -l` e aplicação dos dois `.sql` do REMAKE num banco descartável. Não testado: chamada HTTP da API e telas no navegador.

## Sinais vitais com aparelhos de farmácia (2026-11-22)

`health_vitals` ganhou 8 colunas opcionais (NULL): `glucose_mg_dl` e `glucose_context` (`fasting`, `post_meal`, `random`, `bedtime`),
`total_cholesterol_mg_dl`, `triglycerides_mg_dl`, `uric_acid_mg_dl`, `respiratory_rate`, `waist_cm` e `body_fat_percent`.
Pressão, frequência cardíaca, temperatura, saturação, peso e altura já existiam. `view_health_vitals` traz as colunas novas.

- **API:** `CreateRequest` e `UpdateRequest` validam as colunas novas (opcionais, com limite de valor); `SqlTableModel` e `SqlViewModel`
  liberam gravação e ordenação. O Processor não mudou.
- **Telas:** os formulários `criar-sinais-vitais` e `editar-sinais-vitais` têm 2 linhas novas (campos de 3 colunas; o momento da glicemia
  é seleção). A lista `health-vitals` mostra Glicemia, Colesterol e Triglicerídeos (sem ordenação); o detalhe mostra os 8 campos.
- **Dados de teste:** os 5 registros de `health_vitals` receberam valores fictícios nas colunas novas.
- **Testado:** `php -l`, `tsc`, `eslint`, build e os dois `.sql` do REMAKE num banco descartável (21 colunas, view com as novas).
  Não testado: chamada HTTP da API e telas no navegador.

## Identidade de saúde: só superusuário (2026-11-22)

`api/v1/health-user-identity-view/*` está na lista do filtro `superuseronly` (`Config/Filters.php`, depois do `jwtauth`): só o papel
`superuser` acessa; `admin` e `user` recebem 403. É o mesmo padrão do módulo Empresa. No banco, `temp_menu` 104 e `list_manager` 77 têm
`roles = ["superuser"]`. Não testado: a chamada HTTP com usuário comum e com superusuário.

## Dados de teste de médicos e pacientes (2026-11-22)

No DEV, todo usuário com username `*.user` é médico (CRM/RJ 200001 a 200010, `health_registrations`) e todo `*.guest` é paciente
(`health_patients`), um registro por usuário, na empresa de menor id dele (empresas 1, 5, 6, 7 e 8). Os prontuários e as alergias foram
revinculados aleatoriamente a esses registros, sempre dentro da mesma empresa; receitas, exames e sinais vitais seguem o prontuário.
Os 5 médicos e os 5 pacientes de teste anteriores foram apagados. Esses dados não estão no `seed_table.sql`.

## Sinais vitais: o guest vê só os próprios (2026-11-22)

`view_health_vitals` ganhou `patient_user_id` (usuário dono do paciente do prontuário). No `HealthVitals\Processor`, os métodos de leitura da
view (`findView`, `getGroupedView`, `searchView`, `getView`, `getAllView`, `getNoPaginationView`, `getDeletedView`, `getDeletedAllView` e
`getAllWithDeletedView`) aplicam, para o perfil `guest`, o filtro `patient_user_id = usuário da sessão`; o detalhe de linha alheia dá 404
(mesmo padrão do `CalendarManager`). `admin`, `user` e `superuser` veem todos os da empresa. Guest continua sem escrever (403).
Sinal vital sem prontuário não tem dono e não aparece para o guest.

- **Banco:** `guest` entrou nos `roles` do menu Saúde (`temp_menu` 96), do item Sinais vitais (102), da lista `health-vitals` (`list_manager` 75)
  e da ação Ver (`list_actions` 186). Editar e Excluir e os formulários seguem sem guest.
- **Usuários de teste:** `gustavo.guest` e `sergio.guest` (senha igual ao usuário, só para teste) já eram pacientes; cada um tem um prontuário
  de teste com 10 sinais vitais (`sergio.guest` tem mais 2 de dados de teste anteriores).
- **Limite:** as demais telas de Saúde não foram restringidas para o guest na leitura.

## Exames e receitas: o guest vê só os próprios (2026-11-22)

Mesma regra dos sinais vitais: `view_health_exams` e `view_health_prescriptions` ganharam `patient_user_id` (usuário dono do paciente do
prontuário) e os Processors `HealthExams` e `HealthPrescriptions` aplicam, para o perfil `guest`, o filtro `patient_user_id = usuário da sessão`
nos métodos de leitura da view; detalhe de linha alheia dá 404. Vale para todos os usuários `.guest`. `admin`, `user` e `superuser` veem
todos da empresa; guest segue sem escrever (403). Item sem prontuário não tem dono e não aparece para o guest.

- **Banco:** `guest` entrou nos `roles` do menu Receitas (`temp_menu` 100) e Exames (101), das listas 73 e 74 e da ação Ver (180 e 183).
  Editar, Excluir, o Visualizador de Mídias e os formulários seguem sem guest.
- **Dados de teste:** 10 exames e 10 receitas para `gustavo.guest` (prontuário 23) e para `sergio.guest` (prontuário 24); `sergio.guest` tem
  mais 2 de cada de dados de teste anteriores.
- **Atenção:** o detalhe do exame lista anexos pelo módulo de Uploads; o guest pode não conseguir ver os anexos do próprio exame.

## Pendências

1. REMAKE com estas tabelas e views (decisão do usuário).
2. Telas, menu, Visualizador de Mídias (anexos de Prontuários e Exames em `uploads`, módulos `HealthRecords` e `HealthExams`) e
   catálogo de 228 rotas em `route_manager` feitos em 2026-11-22; ver o doc do frontend. Falta abrir as telas no navegador.
3. Decisão de negócio: hoje um prontuário assinado trava também o resultado de exame
   (`result_text`/`result_at`); se o resultado precisar chegar depois da assinatura, liberar só esses campos.
4. Registrar `health_*` na lista de módulos de `map_links`/anexos, se for usado.

---

[◄ Índice da base de conhecimento](../README.md)
