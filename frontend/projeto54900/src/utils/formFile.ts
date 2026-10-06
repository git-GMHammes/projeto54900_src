// PROPOSITO: utilitarios de arquivo para formularios FormGrid cujo envio e em duas etapas (grava o
// registro em JSON e, depois, sobe o binario em multipart) — ex.: anexo de mensagem e do chat.
// `formDataToPayload` ignora campos de arquivo, entao o binario e lido aqui, do proprio <form>.

/** Arquivo escolhido no campo `file` do FormGrid (null se vazio). */
export function selectedFile(form: HTMLFormElement, fieldName = 'file'): File | null {
  const value = new FormData(form).get(fieldName);

  return value instanceof File && value.size > 0 ? value : null;
}

/** Dispara o "salvar como" do navegador para um Blob ja baixado (com token). */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
