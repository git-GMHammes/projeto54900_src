[◄ Índice da base de conhecimento](../README.md)

---

# Padrão de modal — sempre centralizado

Regra: **todo modal do frontend sempre centralizado no meio da página**, nunca
grudado no topo. Em Bootstrap 5 isso é a classe `modal-dialog-centered` na
`div.modal-dialog` — sem ela o modal renderiza colado no topo da viewport.

## Como os modais deste projeto são feitos

Nenhum modal daqui depende da instância JS do Bootstrap (`data-bs-toggle`,
`bootstrap.Modal`) — todos são **controlados por estado React** (`open`
boolean via `useState`), renderizando o markup do Bootstrap (`.modal.fade
.show.d-block` + `.modal-backdrop.fade.show`) manualmente. Vantagem: abrir/
fechar é só `setState`, sem sincronizar duas fontes de verdade (estado React x
instância JS).

Classes obrigatórias em `.modal-dialog`:

- `modal-dialog-centered` — **sempre**, é a regra desta página.
- `modal-dialog-scrollable` — quando o conteúdo pode crescer (formulário longo,
  lista) e não deve estourar a viewport.

## Componentes existentes

- [`components/global/Modal.tsx`](../../components/global/Modal.tsx) — modal
  genérico (`open`, `title`, `onClose`, `children`, `size?: 'sm'|'lg'|'xl'`),
  sem footer próprio — quem usa decide os botões dentro do `children`. Caso de
  referência: `FormRendererPage.tsx` (`/v1/form/:slug`), botão abre o modal com
  o `<FormGrid>` do formulário dentro.
- [`components/global/ConfirmModal.tsx`](../../components/global/ConfirmModal.tsx) —
  modal de confirmação (`title`, `message`, `onConfirm`/`onClose`, botões
  fixos Confirmar/Cancelar).

Antes de criar um modal novo, checar se um dos dois acima resolve — só criar
um terceiro se o caso não for genérico (`Modal`) nem confirmação (`ConfirmModal`).

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
