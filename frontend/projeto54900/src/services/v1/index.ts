/**
 * =========================================================================
 * FILE HEADER — services/v1/index.ts
 * =========================================================================
 *
 * O QUE FAZ: barrel (arquivo agregador) dos services da v1 — reexporta cada
 * instancia/objeto de service com nome unico, para import unico:
 * `import { userManagerView } from '@/services/v1';` em vez de importar
 * arquivo por arquivo.
 *
 * DEPENDENCIAS: todos os demais arquivos deste diretorio
 * (`*.table.ts`, `*.view.ts`, `auth.service.ts`, `dbSchema.ts`,
 * `uploadManager.upload.ts`) — cada um exportando uma instancia nomeada.
 * CONSUMIDORES: paginas e hooks em toda a v1 (pages/v1/**, hooks/useSiteMenu.ts,
 * context/AuthContext.tsx) importam os services daqui.
 *
 * COMO REGISTRAR UM NOVO SERVICE: criar o arquivo `<recurso>.table.ts` (ou
 * `.view.ts`/`.service.ts` conforme o caso, seguindo os padroes descritos no
 * header de cada arquivo deste diretorio) e adicionar uma linha
 * `export { <nome> } from './<arquivo>';` abaixo, mantendo o agrupamento
 * por modulo (auth, user, upload, form, list, nav, menu, meta).
 * -------------------------------------------------------------------------
 */

export { authService } from './auth.service';
export { userManagerTable } from './userManager.table';
export { userManagerView } from './userManager.view';
export { userRolesTable } from './userRoles.table';
export { uploadManagerTable } from './uploadManager.table';
export { uploadManagerView } from './uploadManager.view';
export { uploadManagerUpload } from './uploadManager.upload';
export { formManagerTable } from './formManager.table';
export { formManagerView } from './formManager.view';
export { formGroupsTable } from './formGroups.table';
export { formRowsTable } from './formRows.table';
export { formCamposTable } from './formCampos.table';
export { listManagerTable } from './listManager.table';
export { listColumnsTable } from './listColumns.table';
export { listActionsTable } from './listActions.table';
export { navManagerTable } from './navManager.table';
export { menuManagerTable } from './menuManager.table';
export { calendarManagerView } from './calendarManager.view';
export { dbSchema } from './dbSchema';
