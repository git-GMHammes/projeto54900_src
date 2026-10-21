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
