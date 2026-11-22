// Rotas do modulo Health (saude): registro profissional, paciente, prontuario, receita, exame, sinais vitais, alergia e identidade.
// Montadas em routes/v1/index.tsx (filhas do layout protegido, sem barra inicial). Espelha api/v1/health-*. Qualquer usuario autenticado
// (o backend isola por empresa e o form_manager.roles/list_manager.roles controlam o acesso as telas).

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
/*
CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:55:52
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\routes\v1\health.routes.tsx
LINHA ADICIONADA - linha 15 neste arquivo editado: import RequireRole from '@/routes/RequireRole';
Antes de : import type { RouteObject } from 'react-router-dom';
Depois de : (linha em branco)
Motivo: importar o guard de papel (mesmo usado em company.routes.tsx).
*/
import RequireRole from '@/routes/RequireRole';

const HealthRegistrationsGetAllPage = lazy(() => import('@/pages/v1/health/health-registrations/GetAllPage'));
const HealthRegistrationsCreatePage = lazy(() => import('@/pages/v1/health/health-registrations/CreatePage'));
const HealthRegistrationsUpdatePage = lazy(() => import('@/pages/v1/health/health-registrations/UpdatePage'));
const HealthRegistrationsGetPage = lazy(() => import('@/pages/v1/health/health-registrations/GetPage'));
const HealthPatientsGetAllPage = lazy(() => import('@/pages/v1/health/health-patients/GetAllPage'));
const HealthPatientsCreatePage = lazy(() => import('@/pages/v1/health/health-patients/CreatePage'));
const HealthPatientsUpdatePage = lazy(() => import('@/pages/v1/health/health-patients/UpdatePage'));
const HealthPatientsGetPage = lazy(() => import('@/pages/v1/health/health-patients/GetPage'));
const HealthRecordsGetAllPage = lazy(() => import('@/pages/v1/health/health-records/GetAllPage'));
const HealthRecordsCreatePage = lazy(() => import('@/pages/v1/health/health-records/CreatePage'));
const HealthRecordsUpdatePage = lazy(() => import('@/pages/v1/health/health-records/UpdatePage'));
const HealthRecordsGetPage = lazy(() => import('@/pages/v1/health/health-records/GetPage'));
const HealthPrescriptionsGetAllPage = lazy(() => import('@/pages/v1/health/health-prescriptions/GetAllPage'));
const HealthPrescriptionsCreatePage = lazy(() => import('@/pages/v1/health/health-prescriptions/CreatePage'));
const HealthPrescriptionsUpdatePage = lazy(() => import('@/pages/v1/health/health-prescriptions/UpdatePage'));
const HealthPrescriptionsGetPage = lazy(() => import('@/pages/v1/health/health-prescriptions/GetPage'));
const HealthExamsGetAllPage = lazy(() => import('@/pages/v1/health/health-exams/GetAllPage'));
const HealthExamsCreatePage = lazy(() => import('@/pages/v1/health/health-exams/CreatePage'));
const HealthExamsUpdatePage = lazy(() => import('@/pages/v1/health/health-exams/UpdatePage'));
const HealthExamsGetPage = lazy(() => import('@/pages/v1/health/health-exams/GetPage'));
const HealthVitalsGetAllPage = lazy(() => import('@/pages/v1/health/health-vitals/GetAllPage'));
const HealthVitalsCreatePage = lazy(() => import('@/pages/v1/health/health-vitals/CreatePage'));
const HealthVitalsUpdatePage = lazy(() => import('@/pages/v1/health/health-vitals/UpdatePage'));
const HealthVitalsGetPage = lazy(() => import('@/pages/v1/health/health-vitals/GetPage'));
const HealthAllergiesGetAllPage = lazy(() => import('@/pages/v1/health/health-allergies/GetAllPage'));
const HealthAllergiesCreatePage = lazy(() => import('@/pages/v1/health/health-allergies/CreatePage'));
const HealthAllergiesUpdatePage = lazy(() => import('@/pages/v1/health/health-allergies/UpdatePage'));
const HealthAllergiesGetPage = lazy(() => import('@/pages/v1/health/health-allergies/GetPage'));
const HealthUserIdentityGetAllPage = lazy(() => import('@/pages/v1/health/health-user-identity/GetAllPage'));
const HealthUserIdentityGetPage = lazy(() => import('@/pages/v1/health/health-user-identity/GetPage'));

export const healthRoutes: RouteObject[] = [
  { path: 'health-registrations', element: <HealthRegistrationsGetAllPage /> },
  { path: 'health-registrations/create', element: <HealthRegistrationsCreatePage /> },
  { path: 'health-registrations/update/:id', element: <HealthRegistrationsUpdatePage /> },
  { path: 'health-registrations/:id', element: <HealthRegistrationsGetPage /> },
  { path: 'health-patients', element: <HealthPatientsGetAllPage /> },
  { path: 'health-patients/create', element: <HealthPatientsCreatePage /> },
  { path: 'health-patients/update/:id', element: <HealthPatientsUpdatePage /> },
  { path: 'health-patients/:id', element: <HealthPatientsGetPage /> },
  { path: 'health-records', element: <HealthRecordsGetAllPage /> },
  { path: 'health-records/create', element: <HealthRecordsCreatePage /> },
  { path: 'health-records/update/:id', element: <HealthRecordsUpdatePage /> },
  { path: 'health-records/:id', element: <HealthRecordsGetPage /> },
  { path: 'health-prescriptions', element: <HealthPrescriptionsGetAllPage /> },
  { path: 'health-prescriptions/create', element: <HealthPrescriptionsCreatePage /> },
  { path: 'health-prescriptions/update/:id', element: <HealthPrescriptionsUpdatePage /> },
  { path: 'health-prescriptions/:id', element: <HealthPrescriptionsGetPage /> },
  { path: 'health-exams', element: <HealthExamsGetAllPage /> },
  { path: 'health-exams/create', element: <HealthExamsCreatePage /> },
  { path: 'health-exams/update/:id', element: <HealthExamsUpdatePage /> },
  { path: 'health-exams/:id', element: <HealthExamsGetPage /> },
  { path: 'health-vitals', element: <HealthVitalsGetAllPage /> },
  { path: 'health-vitals/create', element: <HealthVitalsCreatePage /> },
  { path: 'health-vitals/update/:id', element: <HealthVitalsUpdatePage /> },
  { path: 'health-vitals/:id', element: <HealthVitalsGetPage /> },
  { path: 'health-allergies', element: <HealthAllergiesGetAllPage /> },
  { path: 'health-allergies/create', element: <HealthAllergiesCreatePage /> },
  { path: 'health-allergies/update/:id', element: <HealthAllergiesUpdatePage /> },
  { path: 'health-allergies/:id', element: <HealthAllergiesGetPage /> },
  /*
  CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:55:52
  Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\routes\v1\health.routes.tsx
  BLOCO ADICIONADO - 3 linhas (88 a 90 neste arquivo editado):
  {
  element: <RequireRole role="superuser" />,
  children: [
  Antes de : { path: 'health-allergies/:id', element: <HealthAllergiesGetPage /> },
  Depois de : { path: 'health-user-identity', element: <HealthUserIdentityGetAllPage /> },
  Motivo: abrir o grupo protegido: Identidade de saude so para superuser.
  */
  {
    element: <RequireRole role="superuser" />,
    children: [
  { path: 'health-user-identity', element: <HealthUserIdentityGetAllPage /> },
  { path: 'health-user-identity/:id', element: <HealthUserIdentityGetPage /> },
    /*
    CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:55:52
    Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\routes\v1\health.routes.tsx
    BLOCO ADICIONADO - 2 linhas (103 a 104 neste arquivo editado):
    ],
    },
    Antes de : { path: 'health-user-identity/:id', element: <HealthUserIdentityGetPage /> },
    Depois de : ];
    Motivo: fechar o grupo protegido por RequireRole superuser.
    */
    ],
  },
];

export default healthRoutes;
