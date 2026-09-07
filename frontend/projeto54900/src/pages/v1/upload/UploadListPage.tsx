// Lista de uploads — tabela EM BRANCO ate a fabrica de listas.
// O envio de arquivo (acao, nao formulario) permanece ativo.
//
// Wiring da listagem (preservar para religar na fabrica):
//   - dados:    uploadManagerView.getAll(params)
//   - exclusao: uploadManagerTable.deleteSoft(id)  (+ ConfirmModal)
//   - colunas:  id | original_name(truncate 44) | mime_type | size(formatBytes) |
//               model_type#model_id | created_at(formatDateTime) | acoes(Ver / Baixar / Excluir)

import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { uploadManagerUpload } from '@/services/v1';
import { useToast } from '@/hooks/useToast';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';

export default function UploadListPage() {
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadManagerUpload.upload({ file });
      toast.success(`"${file.name}" enviado.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha no envio do arquivo.');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  return (
    <>
      <PageHeader title="Uploads" subtitle="api/v1/upload-manager">
        <button
          className="btn btn-primary"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
        >
          {uploading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
          Enviar arquivo
        </button>
        <input
          ref={fileInput}
          type="file"
          className="d-none"
          onChange={(e) => void handleFile(e)}
        />
      </PageHeader>

      <EmptyState
        title="Listagem em branco"
        description="Aguardando a fabrica de listas. A tabela de anexos (nome, tipo, tamanho, vinculo, data e acoes) sera montada por ela."
      />
    </>
  );
}
