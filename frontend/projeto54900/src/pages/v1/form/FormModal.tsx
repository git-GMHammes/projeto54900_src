/**
 * =============================================================================
 * FILE HEADER — FormModal (modal genérico controlado por React)
 * =============================================================================
 *
 * O QUE FAZ:
 *   Um modal do Bootstrap com rodapé OPCIONAL de "Salvar". Recebe `title`,
 *   `children` (o conteúdo — nas duas telas que usam, um `<FormGrid>`) e
 *   `onClose`; se receber `onSave`, ganha "Fechar" + botão de salvar com spinner
 *   e área de erro. É o "casco" de edição dos dois construtores (form e lista).
 *
 * POR QUE NÃO USA O PLUGIN JS DO BOOTSTRAP (`data-bs-toggle`/`bootstrap.Modal`):
 *   o React é dono desta subárvore; o bundle do Bootstrap move/limpa esses nós
 *   por fora do ciclo de render, e as duas coisas brigam. Aqui o estado de
 *   aberto/fechado é do PAI (o componente só existe quando está aberto), e as
 *   classes do Bootstrap são aplicadas à mão:
 *     `.modal.fade.show.d-block` + `.modal-backdrop.fade.show` + `.modal-open`
 *     no `<body>` (esta última é o que trava o scroll da página).
 *
 * COMPORTAMENTO (o que o pai ganha de graça):
 *   fecha em Esc, fecha no clique FORA do diálogo, fecha no botão fechar e no
 *   botão de concluir do rodapé, trava o scroll do body e põe o foco inicial no
 *   diálogo. Ver BLOCO 2 para os detalhes e para o que NÃO existe.
 *
 * DEPENDÊNCIAS:
 *   - `react-dom` (`createPortal`) — renderiza fora da árvore do card, direto em
 *     `document.body`, para o modal não ficar preso ao `overflow`/`z-index` de
 *     onde o componente foi declarado.
 *   - CSS do Bootstrap 5 (`.modal*`, `.btn*`, `.alert`, `spinner-border`); este
 *     componente não tem CSS próprio.
 *   - Regra do projeto: `src/markdown/geral/README_modal.md` — todo modal
 *     CENTRALIZADO (`modal-dialog-centered` sempre; `-scrollable` quando o
 *     conteúdo cresce; este componente já traz os dois).
 *
 * CONSUMIDORES (2 — atenção antes de mexer):
 *   - `pages/v1/form/FormBuilderPage.tsx` — usa TODAS as props: `onSave`,
 *     `saving`, `saveError`, `saveDisabled` (gate "salve o pai antes do filho")
 *     e `saveLabel`.
 *   - `pages/v1/list/ListBuilderPage.tsx` — importa por caminho ABSOLUTO
 *     (`@/pages/v1/form/FormModal`): um componente de `form` reusado por
 *     `list`. Mudança aqui atinge as DUAS telas.
 *
 * COMO REAPROVEITAR / QUANDO *NÃO* USAR ESTE:
 *   o projeto tem 3 modais — escolha antes de criar o 4º:
 *     `components/global/Modal.tsx`        -> genérico, sem rodapé: quem usa
 *                                            monta os botões no `children`
 *                                            (e tem prop `size`)
 *     `components/global/ConfirmModal.tsx` -> confirmação (Confirmar/Cancelar)
 *     ESTE (`pages/v1/form/FormModal.tsx`) -> edição de formulário: rodapé
 *                                            "Salvar" pronto, spinner e
 *                                            `alert` de erro no topo do corpo
 *   Para editar formulário em OUTRO módulo, use este mesmo (é o que a lista
 *   faz) em vez de copiar o arquivo.
 *
 * ARMADILHAS (ler antes de mexer):
 *   1. O componente NÃO tem estado de aberto/fechado: quem monta/desmonta é o
 *      pai. Não existe aqui um `open={false}` para "esconder" o modal.
 *   2. `onClose` entra na dependência do efeito do Esc: passe função ESTÁVEL
 *      (`useCallback`), senão o listener e a classe do body são removidos e
 *      repostos a cada render do pai.
 *   3. O clique de fora usa `onMouseDown` DE PROPÓSITO: o fechamento só dispara
 *      se o clique COMEÇAR no backdrop. Assim, um arrasto que começa dentro do
 *      diálogo (selecionar texto, arrastar o scroll) e termina fora não fecha.
 *   4. O "trava/destrava scroll" é por instância: com dois modais montados ao
 *      mesmo tempo, o primeiro a desmontar remove o `.modal-open` do body.
 *   5. `saveLabel` só tem efeito quando existe `onSave`; no modo sem `onSave` o
 *      botão é fixo ("Concluir").
 *   6. Não há trap de foco, nem devolução do foco ao gatilho ao fechar, nem
 *      `aria-labelledby` ligando o `<h5>` do título ao diálogo.
 * =============================================================================
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * =============================================================================
 * BLOCO 1 — CONTRATO DAS PROPS (e os dois rodapés)
 * =============================================================================
 *
 * O QUE FAZ: é o contrato do componente com quem o monta. A presença de
 *   `onSave` escolhe o RODAPÉ (BLOCO 3), então ela é a prop mais importante
 *   deste arquivo:
 *
 *   SEM `onSave` (modo exibição/leitura):
 *     rodapé = um botão "Concluir" (texto fixo). É o formato de quando o
 *     conteúdo não é um formulário a salvar.
 *   COM `onSave` (modo edição):
 *     rodapé = "Fechar" (outline) + `saveLabel` (default 'Salvar'), com spinner
 *     enquanto `saving` e desabilitado quando `saving || saveDisabled`.
 *
 * PROP POR PROP:
 *   `title`        ReactNode; as páginas passam coisa como
 *                  `<code>list_columns</code>` e o nome da tabela. Vira o
 *                  `<h5 class="modal-title">`.
 *   `onClose`      chamado em TODOS os caminhos de fechamento (Esc, clique fora,
 *                  botão fechar, "Fechar"). Quem decide se PODE fechar é o pai
 *                  (ex.: ignorar o pedido enquanto `saving`).
 *   `children`     corpo do modal; o `alert` de `saveError` entra ACIMA dele.
 *   `onSave`       liga o rodapé de edição e é o handler do botão primário.
 *   `saving`       mostra o spinner e bloqueia o botão primário.
 *   `saveError`    mensagem de erro exibida dentro do corpo (`role="alert"`);
 *                  `null` = sem erro.
 *   `saveDisabled` bloqueio EXTRA do botão (ex.: salvar o pai antes do filho);
 *                  o `disabled` do botão soma isto ao `saving`.
 *   `saveLabel`    texto do botão primário (default 'Salvar'); o pai troca
 *                  quando o verbo não é salvar (ex.: 'Adicionar').
 *
 * COMO REAPROVEITAR: para um modal de edição novo, passe o trio
 *   `title`/`onClose`/`onSave` (+ `saving`/`saveError`) e ponha o formulário em
 *   `children` — o abrir/fechar e o desenho do rodapé já vêm prontos.
 * -------------------------------------------------------------------------
 */

interface FormModalProps {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  /** Com `onSave` o rodapé passa a "Salvar" + "Fechar"; sem ele mantém "Concluir". */
  onSave?: () => void;
  saving?: boolean;
  saveError?: string | null;
  saveDisabled?: boolean;
  saveLabel?: string;
}

/** Ver BLOCO 1 acima: os defaults só valem no modo com `onSave`. */
export default function FormModal({
  title,
  onClose,
  children,
  onSave,
  saving = false,
  saveError = null,
  saveDisabled = false,
  saveLabel = 'Salvar',
}: FormModalProps) {
  // Referência do `.modal-dialog` — usada só para o foco inicial (BLOCO 2).
  const dialogRef = useRef<HTMLDivElement>(null);

  /**
   * =============================================================================
   * BLOCO 2 — CICLO DE VIDA: ESC, SCROLL DO BODY E FOCO
   * =============================================================================
   *
   * EFEITO 1 (fechar com Esc + travar o scroll):
   *   - o listener é registrado no `document` (e não no diálogo) porque o foco
   *     pode estar em qualquer campo do formulário: o Esc precisa fechar de
   *     qualquer lugar;
   *   - `.modal-open` no `<body>` é o que impede a página de rolar por trás do
   *     modal (classe do próprio Bootstrap);
   *   - o `return` é o CLEANUP: remover o listener e a classe. Sem ele, o
   *     listener sobrevive ao desmonte (fecharia um modal que já não existe) e a
   *     página ficaria TRAVADA, sem scroll.
   *   - Dependência `[onClose]`: com arrow inline no pai, o efeito roda a cada
   *     render (remove e repõe listener + classe). Passe função estável.
   *
   * EFEITO 2 (foco inicial):
   *   joga o foco no DIÁLOGO (que tem `tabIndex={-1}`) ao montar. Faz o Esc
   *   funcionar de imediato e evita o foco ficar "solto" na página atrás. É `[]`
   *   de propósito: roda uma vez, na abertura.
   *
   * O QUE NÃO EXISTE AQUI (para não presumir ao evoluir):
   *   trap de foco (o `Tab` pode sair do modal), devolução do foco ao gatilho ao
   *   fechar e empilhamento de modais.
   * -------------------------------------------------------------------------
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
    };
  }, [onClose]);

  // Foco inicial no diálogo (uma vez, na abertura) — ver EFEITO 2 no BLOCO 2.
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  /**
   * =============================================================================
   * BLOCO 3 — RENDERIZAÇÃO (portal + markup do Bootstrap)
   * =============================================================================
   *
   * O QUE FAZ: `createPortal` monta o markup do modal direto em
   *   `document.body`, fora da árvore onde o componente foi declarado — por isso
   *   funciona igual vindo de um card, de dentro da árvore do construtor ou de
   *   outro modal, sem herdar `overflow`/`z-index` do container.
   *
   * ESTRUTURA, DE FORA PARA DENTRO:
   *   1. `.modal-backdrop.fade.show` — o fundo escurecido. É um DIV nosso (o
   *      backdrop do plugin JS do Bootstrap não é usado).
   *   2. `.modal.fade.show.d-block` — o "palco", cobrindo a tela inteira; é ele
   *      que recebe o clique fora (`onMouseDown`, armadilha 3 do header) e que
   *      carrega `role="dialog"` + `aria-modal`.
   *   3. `.modal-dialog` — centralizado e rolável, conforme a regra do
   *      `README_modal.md`, e com o `ref` do foco inicial. `modal-lg` é FIXO: o
   *      componente não tem prop de tamanho.
   *   4. `modal-header` (título + botão fechar) -> `modal-body` (aviso de
   *      `saveError` + `children`) -> `modal-footer` (os dois modos do BLOCO 1).
   *
   * COMO REAPROVEITAR: para mudar o rodapé ou acrescentar um botão secundário,
   *   mexa aqui E no BLOCO 1 (documentando a prop nova) — lembrando que o
   *   componente é compartilhado entre `form` e `list`.
   * -------------------------------------------------------------------------
   */
  return createPortal(
    <>
      {/* Fundo escurecido: é um DIV próprio, não o backdrop do JS do Bootstrap. */}
      <div className="modal-backdrop fade show" />
      {/* Palco: cobre a tela e captura o clique FORA do diálogo (onMouseDown). */}
      <div
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Diálogo: centralizado + rolável (README_modal.md); ref = foco inicial. */}
        <div
          className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
          ref={dialogRef}
          tabIndex={-1}
        >
          <div className="modal-content">
            {/* Header: título (ReactNode vindo do pai) + botão fechar. */}
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Fechar"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">
              {/* Erro de salvamento: alerta no topo do corpo, acima do formulário. */}
              {saveError ? (
                <div className="alert alert-danger py-2 small mb-3" role="alert">
                  {saveError}
                </div>
              ) : null}
              {children}
            </div>
            {/* Rodapé: COM onSave = "Fechar" + botão de salvar; SEM onSave = "Concluir" (BLOCO 1). */}
            <div className="modal-footer">
              {onSave ? (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={onClose}
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onSave}
                    disabled={saving || saveDisabled}
                  >
                    {saving ? (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                    ) : null}
                    {saveLabel}
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn-primary" onClick={onClose}>
                  Concluir
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
