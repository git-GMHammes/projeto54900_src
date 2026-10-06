// Tela dedicada de Grupos <-> Membros (update): dois cards — usuarios (checklist com busca)
// e grupo (select + membros atuais). O :id da rota e o GRUPO inicial; trocar o grupo no select
// atualiza a URL. A gravacao e feita pelo Salvar do editor (PUT message-group-members/sync/{id}).
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import PageHeader from '@/components/global/PageHeader';
import { paths } from '@/routes/paths';
import GroupMembersEditor from './GroupMembersEditor';

export default function UpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleGroupChange = useCallback(
    (next: string) => {
      void navigate(next === '' ? paths.v1.messageGroupMembers.list : paths.v1.messageGroupMembers.update(next), { replace: true });
    },
    [navigate],
  );

  return (
    <>
      <PageHeader title="Membros do grupo" subtitle="Marque usuários à esquerda para adicioná-los ao grupo; marque um membro à direita para removê-lo.">
        <button type="button" className="btn btn-outline-secondary" onClick={() => void navigate(paths.v1.messageGroupMembers.list)}>
          Voltar
        </button>
      </PageHeader>

      <GroupMembersEditor groupId={id ?? ''} onGroupChange={handleGroupChange} />
    </>
  );
}
