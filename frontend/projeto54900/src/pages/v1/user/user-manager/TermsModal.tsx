// Modal do termo de uso do cadastro de usuario (ETAPA 1, CreatePage.tsx).
// Termo de uso de plataforma SaaS (cadastro, LGPD, responsabilidade pelo
// conteudo, bloqueio de acesso). Para alterar o texto, editar TERMS_SECTIONS;
// o restante do componente nao muda. Texto-modelo: revisar juridicamente
// (LGPD e foro) antes de producao.
// O aceite so habilita o botao Criar no navegador; a API nao guarda o aceite.

import Modal from '@/components/global/Modal';

// Titulo "N. Texto" vira selo numerico + titulo; paragrafo "Rotulo: texto"
// (rotulos em LABELED) vira rotulo em negrito; ADVERTENCIA ganha destaque.
const TITLE_RE = /^(\d+)\.\s*(.*)$/;
const LABEL_RE = /^(ADVERTÊNCIA|Finalidade|Seus direitos):\s*(.*)$/;

const TERMS_TITLE = 'Termo de uso e consentimento';

interface TermsSection {
  title: string;
  paragraphs: readonly string[];
}

const TERMS_INTRO =
  'Você está se cadastrando em uma plataforma SaaS (Software como Serviço) que administra serviços por meio de empresas. Leia com atenção as cláusulas abaixo: ao marcar "Li e aceito os termos de uso" e concluir o cadastro, você concorda com todas elas.';

const TERMS_SECTIONS: readonly TermsSection[] = [
  {
    title: '1. Objeto e natureza do serviço',
    paragraphs: [
      'Este termo regula o uso da plataforma, oferecida como SaaS: o software é hospedado e mantido pela Empresa e acessado pela internet, sem instalação no seu equipamento. A plataforma permite a empresas cadastradas administrar serviços, agendamentos, treinamentos e o relacionamento com seus usuários.',
      'O cadastro cria uma conta pessoal e intransferível. O acesso a cada empresa depende de aprovação do administrador dessa empresa e o cadastro não garante acesso imediato.',
    ],
  },
  {
    title: '2. Cadastro e veracidade dos dados',
    paragraphs: [
      'Você deve informar dados verdadeiros, completos e atualizados e mantê-los assim durante o uso da plataforma.',
      'ADVERTÊNCIA: os dados exibidos e armazenados na plataforma podem não estar corretos, completos ou atualizados, seja por erro de digitação, por informação desatualizada ou por falha de terceiros. Confira sempre as informações antes de tomar qualquer decisão com base nelas. A Empresa não garante a exatidão dos dados.',
    ],
  },
  {
    title: '3. Consentimento e proteção de dados pessoais (LGPD)',
    paragraphs: [
      'Ao aceitar este termo, você autoriza, nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), o tratamento dos seus dados pessoais informados no cadastro e gerados no uso da plataforma (como nome, usuário, e-mail, telefone, documentos e registros de acesso).',
      'Finalidade: operar a plataforma e permitir que a Empresa e as empresas a ela vinculadas entrem em contato com você para informar sobre serviços, agendamentos e treinamentos.',
      'Seus direitos: você pode, a qualquer momento, solicitar confirmação do tratamento, acesso, correção, anonimização, portabilidade, eliminação dos dados tratados com base em consentimento e informações sobre compartilhamento, além de revogar este consentimento (art. 18 da LGPD). A revogação pode impedir o uso de partes da plataforma.',
      'Os dados são mantidos pelo tempo necessário às finalidades acima e às obrigações legais, e protegidos por medidas técnicas e administrativas razoáveis. Nenhum sistema é totalmente imune a falhas, e a Empresa não responde por acessos indevidos decorrentes de culpa exclusiva do usuário ou de terceiros.',
    ],
  },
  {
    title: '4. Direito de recusa e bloqueio de acesso',
    paragraphs: [
      'A Empresa pode recusar um cadastro e bloquear, suspender ou encerrar o acesso de qualquer usuário a qualquer momento, com ou sem aviso prévio, inclusive por suspeita de dados falsos, violação deste termo, uso indevido ou determinação legal.',
      'O bloqueio não gera direito a indenização. Dados e registros podem ser mantidos pelo prazo exigido em lei ou necessário à defesa de direitos.',
    ],
  },
  {
    title: '5. Responsabilidade pelo conteúdo',
    paragraphs: [
      'Você é o único responsável por tudo o que escrever, enviar, publicar ou responder ao interagir com o sistema, inclusive em salas de chat, mensagens, comentários, publicações, formulários, imagens, vídeos e arquivos. A Empresa não revisa o conteúdo previamente e não responde por ele.',
      'Você se compromete a não publicar conteúdo ilegal, ofensivo, discriminatório, difamatório, ameaçador, obsceno, fraudulento ou que viole direitos de terceiros, incluindo dados pessoais de outras pessoas sem autorização, e a respeitar as regras de cada sala e de cada empresa.',
      'Ficam proibidas palavras e condutas contrárias a estas regras. A insistência pode resultar em advertência, remoção do conteúdo, bloqueio e banimento do usuário, sem prejuízo de responsabilização civil e criminal. Você responde por perdas e danos causados à Empresa ou a terceiros e deve ressarcir a Empresa por demandas decorrentes do seu conteúdo.',
      'A Empresa pode guardar registros de acesso e de conteúdo e fornecê-los às autoridades quando exigido por lei ou ordem judicial.',
    ],
  },
  {
    title: '6. Uso aceitável',
    paragraphs: [
      'É vedado: tentar acessar áreas ou dados sem permissão; usar robôs, scripts ou meios automatizados não autorizados; sobrecarregar, copiar, fazer engenharia reversa ou tentar comprometer a segurança da plataforma; usar a plataforma para spam ou finalidade ilícita; e se passar por outra pessoa ou empresa.',
    ],
  },
  {
    title: '7. Credenciais e sigilo',
    paragraphs: [
      'Seu usuário e sua senha são pessoais e intransferíveis. Você responde por toda atividade realizada com eles e deve avisar imediatamente a Empresa em caso de perda, roubo ou suspeita de uso indevido. Recomenda-se senha forte e exclusiva para esta plataforma.',
    ],
  },
  {
    title: '8. Empresas e prestadores de serviço',
    paragraphs: [
      'Os serviços, agendamentos e treinamentos são prestados pelas empresas cadastradas, e não pela plataforma. Preços, prazos, qualidade, cancelamentos e demais condições são de responsabilidade da empresa contratada, e a Empresa atua apenas como fornecedora da tecnologia.',
      'A empresa a que você se vincula pode ter regras e termos próprios, que se somam a este termo.',
    ],
  },
  {
    title: '9. Propriedade intelectual',
    paragraphs: [
      'O software, as marcas, o layout e a documentação pertencem à Empresa ou a seus licenciadores. Este termo concede apenas uma licença de uso pessoal, limitada, revogável, não exclusiva e intransferível. Você mantém a titularidade do conteúdo que publicar, mas concede à Empresa licença para armazená-lo e exibi-lo na medida necessária ao funcionamento da plataforma.',
    ],
  },
  {
    title: '10. Disponibilidade e limitação de responsabilidade',
    paragraphs: [
      'A plataforma é fornecida "no estado em que se encontra". Podem ocorrer interrupções por manutenção, falhas de internet, de provedores ou casos fortuitos e de força maior. A Empresa não garante funcionamento ininterrupto nem ausência de erros.',
      'Na máxima extensão permitida em lei, a Empresa não responde por lucros cessantes, perda de dados ou danos indiretos decorrentes do uso ou da impossibilidade de uso da plataforma, nem por atos de outros usuários ou das empresas.',
    ],
  },
  {
    title: '11. Alterações, vigência e foro',
    paragraphs: [
      'Este termo pode ser alterado a qualquer momento; a versão vigente é a publicada na plataforma, e o uso continuado após a alteração indica concordância. Ele vigora enquanto sua conta existir, e as cláusulas que, por sua natureza, devam subsistir (responsabilidade, propriedade intelectual e proteção de dados) continuam valendo após o encerramento.',
      'Aplica-se a lei brasileira. Fica eleito o foro do domicílio do usuário para dirimir controvérsias, salvo disposição legal em contrário.',
    ],
  },
];

const SAAS_SUMMARY_TITLE = 'Resumo: o que é um SaaS';
const SAAS_SUMMARY =
  'SaaS (Software as a Service, ou Software como Serviço) é um modelo em que o programa fica hospedado em servidores do fornecedor e é usado pela internet, pelo navegador, sem instalação. O fornecedor cuida de hospedagem, atualizações, backups e segurança da infraestrutura; o usuário acessa com login e senha, normalmente mediante cadastro, assinatura ou autorização de uma empresa. Em contrapartida, o usuário depende da internet e do fornecedor para o serviço funcionar, e seus dados ficam armazenados no ambiente do fornecedor, razão pela qual o tratamento de dados pessoais e as regras de uso são definidos em termos como este.';

interface TermsModalProps {
  open: boolean;
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  onClose: () => void;
}

export default function TermsModal({ open, accepted, onAcceptedChange, onClose }: TermsModalProps) {
  return (
    <Modal open={open} title={TERMS_TITLE} onClose={onClose} size="lg">
      <p className="lead pb-3 mb-4 border-bottom text-body-secondary">{TERMS_INTRO}</p>

      {TERMS_SECTIONS.map((section) => {
        const match = TITLE_RE.exec(section.title);
        return (
          <section key={section.title} className="d-flex gap-3 mb-4 pb-4 border-bottom">
            <span
              className="badge rounded-circle text-bg-primary d-inline-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '2rem', height: '2rem' }}
              aria-hidden="true"
            >
              {match?.[1]}
            </span>
            <div className="flex-grow-1">
              <h3 className="h5 fw-semibold mb-3">{match?.[2] ?? section.title}</h3>
              {section.paragraphs.map((text) => {
                const labeled = LABEL_RE.exec(text);
                const warning = labeled?.[1] === 'ADVERTÊNCIA';
                return (
                  <p
                    key={text}
                    className={
                      warning
                        ? 'border-start border-4 border-warning bg-body-tertiary rounded-end py-2 px-3'
                        : 'text-body-secondary'
                    }
                    style={{ lineHeight: 1.7 }}
                  >
                    {labeled ? (
                      <>
                        <strong className="text-body">{labeled[1]}:</strong> {labeled[2]}
                      </>
                    ) : (
                      text
                    )}
                  </p>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="border-start border-4 border-primary bg-body-tertiary rounded-end p-3 mt-2">
        <h3 className="h6 fw-semibold d-flex align-items-center gap-2">
          <i className="bi bi-cloud-check text-primary" aria-hidden="true" />
          {SAAS_SUMMARY_TITLE}
        </h3>
        <p className="mb-0 text-body-secondary" style={{ lineHeight: 1.7 }}>
          {SAAS_SUMMARY}
        </p>
      </div>

      <div className="form-check mt-4 pt-3 border-top">
        <input
          type="checkbox"
          className="form-check-input"
          id="terms-accepted"
          checked={accepted}
          onChange={(e) => onAcceptedChange(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="terms-accepted">
          Li e aceito os termos de uso
        </label>
      </div>

      <div className="d-flex justify-content-end mt-3">
        <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
          Fechar
        </button>
      </div>
    </Modal>
  );
}
