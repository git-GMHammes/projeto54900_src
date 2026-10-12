// Lista de Empresas <-> Membros — api/v1/company-memberships-view (empresa + contagem e nomes
// dos membros ativos). Wrapper do componente global ListBuild (slug 'company-members'):
// colunas, acoes e busca vem do banco (list_manager). Acao "Membros" leva a UpdatePage
// (tela de 2 cards); o botao "Novo" abre o modal de 2 etapas (CreateModal: empresa + membros).
// Escrita so admin (o backend recusa com 403 os demais).
import { useState } from 'react';

import ListBuild from '@/components/global/ListBuild';
import CreateModal from './CreateModal';

export default function GetAllPage() {
  const [creating, setCreating] = useState(false);
  // Muda ao fechar o modal com alteracao: remonta a lista e recarrega os dados.
  const [version, setVersion] = useState(0);

  return (
    <>
      <ListBuild
        key={version}
        slug="company-members"
        searchPlaceholder="Buscar por empresa ou membro (nome, usuário, telefone)"
        emptyTitle="Nenhuma empresa encontrada"
        emptyDescription="Use Novo para criar a primeira empresa e escolher os membros."
        headerActions={
          <button type="button" className="btn btn-primary me-2" onClick={() => setCreating(true)}>
            Novo
          </button>
        }
      />
      <CreateModal
        open={creating}
        onClose={(changed) => {
          setCreating(false);
          if (changed) setVersion((v) => v + 1);
        }}
      />
    </>
  );
}
