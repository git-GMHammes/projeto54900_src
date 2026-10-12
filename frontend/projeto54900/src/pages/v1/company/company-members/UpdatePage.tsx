// Tela dedicada de Empresas <-> Membros (update): dois cards — usuarios (checklist com busca)
// e empresa (select + membros atuais). O :id da rota e a EMPRESA inicial; trocar a empresa no
// select atualiza a URL. A gravacao e feita pelo Salvar do editor (PUT company-members/sync/{id}).
// Espelho de pages/v1/messages/message-group-members-manager/UpdatePage.tsx.
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import PageHeader from '@/components/global/PageHeader';
import { paths } from '@/routes/paths';
import CompanyMembersEditor from './CompanyMembersEditor';

export default function UpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleCompanyChange = useCallback(
    (next: string) => {
      void navigate(next === '' ? paths.v1.companyMembers.list : paths.v1.companyMembers.update(next), { replace: true });
    },
    [navigate],
  );

  return (
    <>
      <PageHeader
        title="Membros da empresa"
        subtitle="Marque usuários à esquerda para adicioná-los à empresa; marque um membro à direita para removê-lo."
      >
        <button type="button" className="btn btn-outline-secondary" onClick={() => void navigate(paths.v1.companyMembers.list)}>
          Voltar
        </button>
      </PageHeader>

      <CompanyMembersEditor companyId={id ?? ''} onCompanyChange={handleCompanyChange} />
    </>
  );
}
