import type { CSSProperties } from 'react';
import { useAppConfig } from '@/context/AppConfigContext';
import PageHeader from '@/components/global/PageHeader';

// Cards informativos: conteudo estatico, nao consultam API nenhuma, sem link.
const INFO_CARDS = [
  {
    icon: 'bi-shield-lock-fill',
    title: 'Autenticação via API (JWT)',
    lead: 'Login, sessão e permissões resolvidos por token — sem estado guardado no servidor.',
    items: [
      'Login por usuário e senha emite um token de acesso e um token de renovação, no padrão Bearer.',
      'Login, renovação e encerramento de sessão são públicos (o logout identifica a sessão pelo token enviado); consultar o usuário logado exige token válido.',
      'Cada rota protegida da API passa por um filtro de autenticação antes de executar qualquer regra de negócio.',
      'A renovação evita pedir login de novo enquanto a sessão estiver ativa, mantendo o acesso contínuo.',
      'O mesmo contrato de autenticação atende qualquer cliente: aplicação web, aplicativo mobile ou integração externa.',
      'Tokens expiram automaticamente, reduzindo o risco de sessões esquecidas em aberto.',
    ],
  },
  {
    icon: 'bi-calendar2-week-fill',
    title: 'Calendário e agenda de compromissos',
    lead: 'Estrutura própria de calendários e eventos, pronta para múltiplos calendários por usuário ou setor.',
    items: [
      'Cada calendário cadastrado organiza um conjunto próprio e independente de compromissos.',
      'Eventos guardam data, horário, convidados e o status de participação de cada convidado.',
      'Lembretes configuráveis por evento, com antecedência definida pelo usuário.',
      'Anexos podem ser vinculados diretamente a um compromisso específico.',
      'Propriedades extras podem ser adicionadas a um evento sem alterar a estrutura das tabelas.',
      'Toda a agenda é exposta por API REST, pronta para alimentar novas telas sem mudar o backend.',
    ],
  },
  {
    icon: 'bi-chat-square-text-fill',
    title: 'Timeline social',
    lead: 'Feed interno de publicações entre usuários logados, com mídia, interação e moderação.',
    items: [
      'Cada usuário ganha sua própria timeline automaticamente na primeira publicação.',
      'Publicações com texto e anexo (imagem, vídeo ou documento), guardados em área própria do módulo e entregues somente com token.',
      'Curtir, avaliar de 1 a 5 estrelas e comentar; o sistema lembra o que o usuário já fez em cada post.',
      'Abertura do feed com 14 posts (5 recentes aleatórios, 3 mais bem avaliados, 3 mais curtidos e 3 mais comentados) e rolagem infinita de 10 em 10, sem repetição.',
      'Cada post aparece inteiro, só depois que texto e mídia terminam de carregar; a publicação nova do usuário fica no topo até a página ser atualizada.',
      'Publicar, comentar e denunciar acontecem em modais, sem sair do feed.',
      'Post denunciado sai do feed de todos na hora e segue para a moderação do administrador.',
      'Toda a Timeline é exposta por API REST protegida por JWT; as listagens administrativas mostram ao usuário apenas as próprias publicações.',
    ],
  },
  {
    icon: 'bi-chat-dots-fill',
    title: 'Salas de chat moderadas',
    lead: 'Salas abertas a qualquer usuário logado, com um moderador responsável por manter a ordem.',
    items: [
      'Qualquer usuário logado, exceto visitante, entra em qualquer sala sem pedir permissão.',
      'Quem cria a sala vira dono e moderador, e precisa aceitar a responsabilidade pela moderação antes de a sala existir.',
      'Filtro de palavrão: a mensagem barrada nunca aparece para os demais e gera uma advertência; com 3 advertências na mesma sala o membro é bloqueado.',
      'Qualquer membro pode denunciar um anexo; a denúncia bloqueia na hora o anexo e o autor do envio, sem esperar nova chance.',
      'Com 3 membros bloqueados a sala fecha sozinha, exibindo o aviso de que é preciso procurar o moderador; só o dono reabre.',
      'Mensagens com anexo (imagem, vídeo ou documento) e marcação de membros da sala.',
      'Salas favoritas por usuário e histórico completo guardado, com as 100 últimas mensagens na tela.',
      'O administrador pode editar o conteúdo de uma mensagem, e cada edição guarda o texto anterior, quem editou e quando.',
      'Todo o módulo é exposto por API REST protegida por JWT; a moderação de denúncias e advertências é exclusiva do administrador.',
    ],
  },
  {
    icon: 'bi-chat-left-dots-fill',
    title: 'Mensagens diretas e em grupo',
    lead: 'Conversas entre usuários, de 1 para 1 ou para grupos, com agendamento de envio e controle de leitura.',
    items: [
      'Tela de Conversas com busca por nome, usuário ou celular, listando os grupos do usuário e todos os contatos ativos.',
      'Conversa privada e de grupo abertas em modal, com balões, atualização automática por consulta periódica e envio de anexos.',
      'Contador de mensagens não lidas nos cartões e no menu; no grupo, só conta o que foi enviado depois da entrada do membro.',
      'Em grupo, cada mensagem mostra quantos membros já leram, e é possível marcar usuários com @ (até 20 por mensagem).',
      'Agendamento de envio: a mensagem fica visível só para quem a escreveu até a hora marcada, sem depender de cron no servidor.',
      'Editar só é permitido enquanto a mensagem está agendada; apagar a própria mensagem vale em qualquer momento.',
      'Grupos com dono e membros: o dono adiciona, remove e reativa membros, e quem não participa nem sabe que o grupo existe.',
      'Filtro de palavrão com advertência: a mensagem barrada não é entregue; o administrador consulta as advertências.',
      'Listas e formulários administrativos (mensagens, grupos, membros, anexos e advertências) só para administradores; toda a API e REST protegida por JWT.',
    ],
  },
  {
    icon: 'bi-person-vcard-fill',
    title: 'Usuários e conta pessoal',
    lead: 'Cadastro de usuários em duas etapas e área de autoatendimento para o próprio usuário logado.',
    items: [
      'Cadastro em duas etapas: primeiro o usuário de acesso e, ao criar, segue direto para o perfil com os dados pessoais.',
      'Lista "Dados Usuário" com busca, exclusiva do administrador.',
      'Pelo menu da barra superior, cada usuário edita o próprio perfil e troca a própria senha, sem depender do administrador.',
      'Permissão individual de um usuário a um formulário ou lista, independente da empresa.',
      'Todo o módulo é exposto por API REST protegida por JWT.',
    ],
  },
  {
    icon: 'bi-buildings-fill',
    title: 'Empresas e multiempresa (SaaS)',
    lead: 'Um mesmo sistema atendendo várias empresas, cada uma enxergando somente os próprios dados.',
    items: [
      'Cadastro de empresas com nome, identificador, CNPJ opcional e situação (ativa ou inativa); a exclusão é lógica.',
      'Cada usuário pode acessar uma ou mais empresas, definidas no cadastro; os vínculos de membros são geridos em tela própria.',
      'Toda tabela de negócio carrega a empresa do registro: consultas, códigos únicos e vínculos nunca cruzam empresas.',
      'Módulos independentes entre si: cada um funciona sozinho, e a ligação com outro módulo é sempre opcional e feita só sob pedido.',
      'Telas de empresas, membros e usuários por empresa são exclusivas do administrador, e o backend também restringe a escrita.',
    ],
  },
  {
    icon: 'bi-ui-checks-grid',
    title: 'Formulários dinâmicos',
    lead: 'Formulários desenhados no banco e montados na tela, sem programar cada formulário novo.',
    items: [
      'Estrutura em árvore: formulário, grupos, linhas e campos, cada nível gravado pelo Salvar do seu modal.',
      'Construtor visual para criar e editar formulários, com a árvore compacta e o formulário de cada nó em modal.',
      'O mesmo formulário pode ser exibido direto na página ou dentro de um modal.',
      'Campo de data com calendário nativo do navegador e demais tipos de campo definidos pelo esquema salvo.',
      'Vinte e dois formulários já desenhados para os módulos do sistema, usados pelas telas de cadastro e edição.',
    ],
  },
  {
    icon: 'bi-table',
    title: 'Listas dinâmicas',
    lead: 'Motor de listagens definidas no banco: colunas, ações, paginação e permissões configuradas sem escrever uma tela nova por listagem.',
    items: [
      'Construtor de listagens em árvore: a lista (título, tabela de origem, endpoint da API, ordenação e paginação padrão) e, abaixo dela, suas colunas e suas ações.',
      'Colunas geradas automaticamente a partir da tabela escolhida, ajustáveis uma a uma: rótulo, campo da API, visível ou oculta e texto de apoio quando o valor é vazio.',
      'Formatação por coluna: texto, CPF, CNPJ, moeda, data e data com hora, além de classe visual própria por célula.',
      'Célula composta: uma coluna pode juntar vários campos e textos fixos (ex.: nome, traço e CPF) numa só célula.',
      'Ordenação ao clicar no cabeçalho, inclusive por mais de um campo ao mesmo tempo, e tamanhos de página oferecidos ao usuário (ex.: 10, 20, 50, 100).',
      'Ações por linha com ícone: abrir uma tela (link) ou chamar a API direto, com confirmação antes de executar quando configurada.',
      'Permissão em duas camadas por ação: perfis que podem vê-la e regra sobre o dado da própria linha (ex.: editar só se o status for Aprovada).',
      'Tela de pré-visualização: escolhe uma listagem cadastrada, mostra as definições de colunas e ações e renderiza a grade com os dados reais da API, sem executar as ações.',
      'Mesmo motor usado pelas listas administrativas dos demais módulos; listagem nova nasce como rascunho e todo o módulo é exposto por API REST protegida por JWT.',
    ],
  },
  {
    icon: 'bi-geo-alt-fill',
    title: 'Mapas',
    lead: 'Módulo independente: mapas com pontos, categorias, endereços, CEP e trajetos com tempo de deslocamento.',
    items: [
      'Vários mapas cadastrados, cada um com centro, zoom inicial, limites de zoom, fonte dos tiles, categorias de ponto e ícones próprios.',
      'Explorador de mapas: escolha do mapa, pontos classificados por categoria e cor, busca por endereço ou CEP e clique no mapa para marcar um ponto.',
      'Planejador de trajetos: paradas reordenáveis, perfil de deslocamento (carro, caminhão, bicicleta ou a pé), distância e tempo total e por trecho, com a opção de gravar o trajeto calculado.',
      'Endereços georreferenciados e base de CEP própria, com cache de geocodificação para não repetir consulta ao provedor.',
      'Vínculo universal: qualquer registro de 21 módulos (usuários, empresas, agenda, timeline, salas de chat, mensagens, uploads) pode receber CEP, endereço, ponto ou rota e ter mapa próprio.',
      'Um mesmo ponto, endereço ou rota pode ser reaproveitado por vários módulos e registros; módulo novo entra no vínculo com uma linha de configuração.',
      'Geocodificação, rotas e CEP passam por um proxy no servidor, que protege as chaves dos provedores; o navegador só carrega os tiles do mapa.',
      'Administrativo completo dos 10 recursos do módulo exclusivo do administrador; as demais telas exigem usuário logado.',
    ],
  },
  {
    icon: 'bi-diagram-3-fill',
    title: 'Locais',
    lead: 'Módulo independente: locais de qualquer escala numa só árvore recursiva, da galáxia à caixa, pasta ou frasco.',
    items: [
      'Uma única tabela organiza tudo: cada local aponta para o pai, que fica vazio no topo da árvore.',
      'Trinta e dois tipos de local, em ordem de grandeza: geografia (galáxia, país, rua), ambientes (galpão, corredor, sala), mobiliário (prateleira, palete) e recipientes (caixa, pasta, garrafa, frasco).',
      'O tipo não define o nível: qualquer tipo pode ficar sob qualquer pai (uma garrafa pode estar numa caixa, numa prateleira ou direto numa sala).',
      'Tipo novo cadastrado pelo administrador, com código, nome e posição na escala, sem alterar o banco.',
      'Cada local mostra o caminho completo (País > Estado > ...), a profundidade, a quantidade de filhos e latitude e longitude para o mapa.',
      'Busca pelo nome de qualquer ancestral, listagem dos filhos diretos e de toda a árvore a partir de um topo.',
      'Proteções de consistência: um local não pode ser pai de si mesmo nem de um ancestral, código repetido entre irmãos é recusado e local com filhos não é excluído.',
      'Tela de visualização com o local no mapa, pelo vínculo universal do módulo Mapas; locais para qualquer usuário, isolados por empresa, e tipos só para administradores.',
    ],
  },
  {
    icon: 'bi-map-fill',
    title: 'Mapa SVG do Rio de Janeiro',
    lead: 'Mapa estratégico dos 92 municípios do estado, base para comparação entre cidades, futuras coletas por município e detalhes em dashboards.',
    items: [
      'Malha SVG dos 92 municípios, cada um com identificação oficial (código do IBGE) e cor própria, com vizinhos sempre em cores distintas.',
      'Dica de contexto com o nome do município ao passar o mouse.',
      'Lista de seleção sincronizada nos dois sentidos: marcar o município na lista pinta o mapa e clicar no mapa marca a lista.',
      'Município marcado recebe a própria cor, o nome acima e um marcador no centro, para comparar várias cidades lado a lado.',
      'Preparado para coleta por cidade: cada município é um elemento identificável, pronto para receber dados e detalhes em painéis de dashboard.',
      'Funciona com arquivos estáticos do próprio sistema, sem depender de API externa.',
    ],
  },
  {
    icon: 'bi-box-seam-fill',
    title: 'Produtos',
    lead: 'Módulo independente: cadastro de produto de qualquer escala, de um comprimido a uma aeronave, que funciona sozinho.',
    items: [
      'Duas tabelas cobrem tudo: o produto e suas características, em uma linha por característica (grupo, campo, rótulo, valor e unidade).',
      'Catálogo de grupos e campos em arquivo próprio: campo novo entra no catálogo sem alterar o banco.',
      'Produto e características são gravados juntos, na mesma transação; na edição, a lista enviada substitui as características anteriores.',
      'Kits e conjuntos: um produto pode ter produto pai, com proteção contra ciclo e contra excluir produto que tem filhos.',
      'Código único por empresa, tipo, situação, estoque mínimo e máximo e ordem de exibição.',
      'Consulta com o caminho completo do local, a quantidade de produtos filhos e a de características.',
      'Ligação com Locais opcional: sem ela o produto funciona normalmente, e a ligação só é criada quando pedida.',
      'Exclusão lógica com restauração; exclusão definitiva e limpeza da lixeira exclusivas do administrador; dados isolados por empresa; visitante não grava.',
    ],
  },
  {
    icon: 'bi-tools',
    title: 'Serviços',
    lead: 'Módulo independente: catálogo de serviços de qualquer tipo e todo o ciclo do pedido, do orçamento à avaliação.',
    items: [
      'Serviço de qualquer tipo, de uma troca de chuveiro e um passeio com cão a enfermagem e construção civil.',
      'Prestador autônomo informal, MEI ou empresa com CNPJ, com documento, unidade de cobrança, preço, moeda, duração e prazo de início.',
      'Pacotes, obras e etapas por serviço pai, e características em catálogo gravadas junto com o serviço, no mesmo envio.',
      'Pedido com fluxo controlado: solicitado, orçado, aceito, agendado, em andamento e concluído, com cancelamento e recusa de orçamento; transição fora do fluxo é recusada.',
      'Cada passo exige o dado certo: orçamento pede valor, agendamento pede data, cancelamento pede motivo, e o início e o fim da execução são carimbados pelo sistema.',
      'Cliente, executor, endereço do atendimento, quantidade, valor orçado e final, datas de prazo e de pagamento.',
      'Avaliação de 1 a 5 e comentário só depois de o pedido ser concluído; pedido concluído deixa de ser alterado.',
      'Resumo por serviço, só leitura: pedidos totais, abertos, concluídos, cancelados e atrasados, receita, receita paga, nota média e duração média.',
      'Dados isolados por empresa; exclusão definitiva exclusiva do administrador; ligação com outros módulos só quando pedida.',
    ],
  },
  {
    icon: 'bi-arrow-left-right',
    title: 'Movimentação de estoque',
    lead: 'Módulo próprio, que registra o movimento de produtos e exige apenas o produto de referência.',
    items: [
      'Cinco tipos de movimento numa única tabela: entrada, saída, desperdício, separação (carrinho ou aguardando envio) e encomenda (comprada e a caminho).',
      'Saldo calculado por produto: em estoque, reservado, encomendado e disponível, inclusive para produtos que ainda não tiveram movimento.',
      'Alerta de estoque abaixo do mínimo e data da próxima chegada prevista.',
      'Saída ou separação acima do disponível e desperdício acima do saldo são recusados.',
      'Separação concluída gera a saída correspondente e encomenda concluída gera a entrada, com lote, validade e custo unitário, na mesma transação.',
      'Movimento concluído não é alterado: o erro se corrige com um movimento inverso, mantendo o histórico íntegro.',
      'Usuário, data e situação inicial vêm do servidor, não do cliente; local, origem, lote, validade, custo, motivo e referência são opcionais.',
      'Exclusão de movimento concluído só pelo administrador; dados isolados por empresa.',
    ],
  },
  {
    icon: 'bi-compass-fill',
    title: 'Navegação e menus',
    lead: 'Menu do sistema montado a partir do banco e editável por tela, sem alterar código.',
    items: [
      'Configuração da casca do app: nome exibido na barra, imagem, ícone de mensagens e versão exibida ao lado do nome.',
      'Árvore de itens com submenus em vários níveis, cada item com rótulo, destino no frontend, ordem e situação (rascunho, ativo ou inativo).',
      'Item sem destino funciona como agrupador, só para organizar o submenu.',
      'Cada item de topo escolhe onde aparece: na barra superior ou no painel lateral (offcanvas), levando junto todo o seu grupo de filhos.',
      'Lista de perfis de acesso cadastrada por item, pronta para a restrição de visibilidade por perfil.',
      'A barra real do site é lida da API; se a API falhar ou vier vazia, um menu de emergência embutido mantém o sistema navegável.',
      'Do detalhe de cada configuração, um botão leva direto aos itens de menu daquele conjunto.',
      'Telas de listagem, cadastro, detalhe e edição para as duas partes: a configuração do app e a árvore de itens.',
    ],
  },
  {
    icon: 'bi-paperclip',
    title: 'Arquivos (uploads)',
    lead: 'Módulo independente de armazenamento: guarda qualquer arquivo, de qualquer módulo, e o entrega somente a quem está autenticado.',
    items: [
      'Serve a qualquer módulo e a qualquer registro: o arquivo pertence a um módulo e a um registro (foto de usuário, anexo de compromisso, mídia de post), sem o módulo dono precisar mudar.',
      'Vocação aberta: reportagens e matérias de sucesso, resultados de exames entregues a clientes, resultados de ordens de serviço, planilhas financeiras, contratos, laudos e qualquer documento que precise ser guardado e compartilhado com controle.',
      'Aceita imagem, vídeo, áudio, PDF, documentos, planilhas, apresentações e arquivos compactados, com lista de tipos permitidos e teto de 500 MB por envio.',
      'Compartilhamento controlado: o arquivo fica em área protegida do servidor, fora do alcance público, e só é entregue por requisição autenticada com token válido.',
      'Dois modos de entrega: visualização direta na tela (imagem, PDF, vídeo) ou download forçado como anexo.',
      'Cada arquivo guarda nome original, tipo, tamanho, categoria, título e descrição editáveis, e uma impressão digital (SHA-256) para conferir integridade e evitar envio duplicado.',
      'Suspensão sem apagar: um arquivo inativo deixa de ser entregue e pode ser reativado depois, sem perder o histórico.',
      'Segurança no envio: arquivos de conteúdo ativo, como SVG, ficam de fora, e o cabeçalho de entrega impede o navegador de interpretar o arquivo como outro tipo.',
      'Exclusão lógica com restauração; a exclusão definitiva e a limpeza da lixeira removem o registro e o arquivo do disco.',
      'Consulta dos arquivos registrados e detalhe de cada um; envio, listagem por dono e entrega expostos por API REST protegida por JWT.',
    ],
  },
];

const infoCardShadowStyle: CSSProperties = {
  boxShadow: '0 14px 28px rgba(0,0,0,0.16), 0 6px 10px rgba(0,0,0,0.10)',
};

const infoCardBodyStyle: CSSProperties = {
  maxHeight: 320,
  overflowY: 'auto',
};

// Composicao de custo do desenvolvimento: conteudo estatico, numero fechado,
// sem chamada a API. Mao de obra expressa em horas (300 dias uteis x 8h),
// nunca em "ano". Mesmo modelo visual dos demais INFO_CARDS (icone + lista) —
// ver regra "alerta" (checklist de UI) antes de inventar card novo.
//
// Cada item tem piso e teto: a variacao reflete a cotacao do dolar nos
// servicos cobrados em USD (nuvem, chaves de API, consumo de IA, ferramentas
// de desenvolvimento) — nao e markup, e exposicao cambial real do custo.
const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

const formatBRLRange = (low: number, high: number) => `${formatBRL(low)} a ${formatBRL(high)}`;

const COST_BREAKDOWN = [
  { label: 'Mão de obra de desenvolvimento (2.400 horas)', low: 345600, high: 460800 },
  { label: 'Infraestrutura de desenvolvimento e homologação (nuvem, cotada em dólar)', low: 10800, high: 14400 },
  { label: 'Licenças de ferramentas e ambiente (cotadas em dólar)', low: 5400, high: 7200 },
  { label: 'Chaves de API e consumo (geocodificação, rotas, CEP — cotadas em dólar)', low: 3600, high: 4800 },
  { label: 'Automação e consumo de IA aplicados ao desenvolvimento (cotados em dólar)', low: 9000, high: 12000 },
];

const TOTAL_COST_LOW = COST_BREAKDOWN.reduce((sum, item) => sum + item.low, 0);
const TOTAL_COST_HIGH = COST_BREAKDOWN.reduce((sum, item) => sum + item.high, 0);

// Valor de uso mensal (SaaS): cobre a operacao continua do sistema e inclui,
// de forma explicita, atualizacoes constantes e testes de novos modulos para
// consumo posterior. Mesma logica de variacao cambial do dolar.
const MONTHLY_BREAKDOWN = [
  { label: 'Infraestrutura dedicada (servidor, banco, fileserver — nuvem cotada em dólar)', low: 3000, high: 4000 },
  { label: 'Chaves de API e consumo (geocodificação, rotas, CEP — cotadas em dólar)', low: 900, high: 1200 },
  { label: 'Automação e consumo de IA em produção (cotados em dólar)', low: 2400, high: 3200 },
  { label: 'Atualizações constantes e testes de novos módulos para consumo posterior', low: 2400, high: 3200 },
];

const TOTAL_MONTHLY_LOW = MONTHLY_BREAKDOWN.reduce((sum, item) => sum + item.low, 0);
const TOTAL_MONTHLY_HIGH = MONTHLY_BREAKDOWN.reduce((sum, item) => sum + item.high, 0);

// Um unico card com os dois valores — compra e uso mensal nunca em cards
// separados. Mesmo molde exato de INFO_CARDS: icone, titulo, lead, UMA lista
// unica com check-icon. Os dois totais entram como os dois ultimos itens da
// mesma lista, sem layout proprio.
const PRICING_CARD = {
  icon: 'bi-cash-stack',
  title: 'Valores do sistema',
  lead: 'Aquisição do sistema (pagamento único) e uso mensal como SaaS (operação contínua, com atualizações constantes e testes de novos módulos para consumo posterior). Faixas de valor variam conforme a cotação do dólar nos serviços cobrados em USD.',
  items: [
    ...COST_BREAKDOWN.map((item) => `${item.label}: ${formatBRLRange(item.low, item.high)}`),
    ...MONTHLY_BREAKDOWN.map((item) => `${item.label} (mensal): ${formatBRLRange(item.low, item.high)}`),
    `Valor de aquisição (pagamento único): ${formatBRLRange(TOTAL_COST_LOW, TOTAL_COST_HIGH)}`,
    `Valor de uso mensal (SaaS): ${formatBRLRange(TOTAL_MONTHLY_LOW, TOTAL_MONTHLY_HIGH)}/mês`,
  ],
};

export default function HomePage() {
  const { appName, apiVersion } = useAppConfig();

  return (
    <>
      <PageHeader title={<span className="display-6 fw-bold">{appName}</span>} />

      <div className="alert alert-light border d-flex flex-wrap gap-3 justify-content-between fs-6">
        <span className="fw-semibold">Home Page</span>
        <span>
          Versão ativa: <code>{apiVersion}</code>
        </span>
      </div>

      <div className="row g-4">
        {INFO_CARDS.map((card) => (
          <div className="col-12 col-md-6 d-flex" key={card.title}>
            <div className="card h-100 border-0 w-100" style={infoCardShadowStyle}>
              <div className="card-body d-flex flex-column p-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span
                    className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle flex-shrink-0"
                    style={{ width: 48, height: 48 }}
                  >
                    <i className={`bi ${card.icon} fs-4`} />
                  </span>
                  <h2 className="h4 fw-semibold mb-0">{card.title}</h2>
                </div>
                <p className="fs-6 text-body-secondary">{card.lead}</p>
                <div style={infoCardBodyStyle}>
                  <ul className="list-unstyled mb-0">
                    {card.items.map((item) => (
                      <li className="d-flex align-items-start gap-2 mb-2 fs-6" key={item}>
                        <i className="bi bi-check-circle-fill text-primary mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="col-12 col-md-6 d-flex" key={PRICING_CARD.title}>
          <div className="card h-100 border-0 w-100" style={infoCardShadowStyle}>
            <div className="card-body d-flex flex-column p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <span
                  className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle flex-shrink-0"
                  style={{ width: 48, height: 48 }}
                >
                  <i className={`bi ${PRICING_CARD.icon} fs-4`} />
                </span>
                <h2 className="h4 fw-semibold mb-0">{PRICING_CARD.title}</h2>
              </div>
              <p className="fs-6 text-body-secondary">{PRICING_CARD.lead}</p>
              <div style={infoCardBodyStyle}>
                <ul className="list-unstyled mb-0">
                  {PRICING_CARD.items.map((item) => (
                    <li className="d-flex align-items-start gap-2 mb-2 fs-6" key={item}>
                      <i className="bi bi-check-circle-fill text-primary mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
