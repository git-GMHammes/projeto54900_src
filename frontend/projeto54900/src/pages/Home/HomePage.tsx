import type { CSSProperties } from 'react';
import { useAppConfig } from '@/context/AppConfigContext';
import PageHeader from '@/components/global/PageHeader';

// Cards informativos: conteudo estatico, nao consultam API nenhuma, sem link.
const INFO_CARDS = [
  {
    icon: 'bi-shield-lock-fill',
    title: 'Autenticacao via API (JWT)',
    lead: 'Login, sessao e permissoes resolvidos por token — sem estado guardado no servidor.',
    items: [
      'Login por usuario e senha emite um token de acesso e um token de renovacao, no padrao Bearer.',
      'Login, renovacao e encerramento de sessao sao publicos (o logout identifica a sessao pelo token enviado); consultar o usuario logado exige token valido.',
      'Cada rota protegida da API passa por um filtro de autenticacao antes de executar qualquer regra de negocio.',
      'A renovacao evita pedir login de novo enquanto a sessao estiver ativa, mantendo o acesso continuo.',
      'O mesmo contrato de autenticacao atende qualquer cliente: aplicacao web, aplicativo mobile ou integracao externa.',
      'Tokens expiram automaticamente, reduzindo o risco de sessoes esquecidas em aberto.',
    ],
  },
  {
    icon: 'bi-calendar2-week-fill',
    title: 'Calendario e agenda de compromissos',
    lead: 'Estrutura propria de calendarios e eventos, pronta para multiplos calendarios por usuario ou setor.',
    items: [
      'Cada calendario cadastrado organiza um conjunto proprio e independente de compromissos.',
      'Eventos guardam data, horario, convidados e o status de participacao de cada convidado.',
      'Lembretes configuraveis por evento, com antecedencia definida pelo usuario.',
      'Anexos podem ser vinculados diretamente a um compromisso especifico.',
      'Propriedades extras podem ser adicionadas a um evento sem alterar a estrutura das tabelas.',
      'Toda a agenda e exposta por API REST, pronta para alimentar novas telas sem mudar o backend.',
    ],
  },
  {
    icon: 'bi-chat-square-text-fill',
    title: 'Timeline social',
    lead: 'Feed interno de publicacoes entre usuarios logados, com midia, interacao e moderacao.',
    items: [
      'Cada usuario ganha sua propria timeline automaticamente na primeira publicacao.',
      'Publicacoes com texto e anexo (imagem, video ou documento), guardados em area propria do modulo e entregues somente com token.',
      'Curtir, avaliar de 1 a 5 estrelas e comentar; o sistema lembra o que o usuario ja fez em cada post.',
      'Abertura do feed com 14 posts (5 recentes aleatorios, 3 mais bem avaliados, 3 mais curtidos e 3 mais comentados) e rolagem infinita de 10 em 10, sem repeticao.',
      'Cada post aparece inteiro, so depois que texto e midia terminam de carregar; a publicacao nova do usuario fica no topo ate a pagina ser atualizada.',
      'Publicar, comentar e denunciar acontecem em modais, sem sair do feed.',
      'Post denunciado sai do feed de todos na hora e segue para a moderacao do administrador.',
      'Toda a Timeline e exposta por API REST protegida por JWT; as listagens administrativas mostram ao usuario apenas as proprias publicacoes.',
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

export default function HomePage() {
  const { appName, apiVersion } = useAppConfig();

  return (
    <>
      <PageHeader title={<span className="display-6 fw-bold">{appName}</span>} />

      <div className="alert alert-light border d-flex flex-wrap gap-3 justify-content-between fs-6">
        <span className="fw-semibold">Home Page</span>
        <span>
          Versao ativa: <code>{apiVersion}</code>
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
      </div>
    </>
  );
}
