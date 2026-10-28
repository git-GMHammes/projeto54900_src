<?php

namespace App\Services\V1\Template\TemplateRender;

use Config\Database;

/**
 * Preferencia de template do usuario da sessao (user_manager.temp_manager_id).
 *
 * Grava SO o proprio registro do usuario, por consulta propria: a coluna nao esta nos
 * allowedFields do model de usuarios, entao o CRUD de usuarios nunca a altera.
 *
 * Regras: null volta ao automatico (menor id ativo da empresa); um id so e aceito se for um
 * template ativo cuja lista company_manager traga o slug da empresa da sessao (422).
 */
class Preference
{
    /** @return array{success:bool,message:string,code:int} */
    public function set(int $userId, ?int $templateId): array
    {
        if ($templateId !== null) {
            $ids = array_column((new Builder())->templatesOfSessionCompany(), 'id');

            if (!in_array($templateId, $ids, true)) {
                return ['success' => false, 'message' => 'Template indisponivel para a empresa da sessao', 'code' => 422];
            }
        }

        Database::connect(DB_GROUP_001)->table('user_manager')
            ->where('id', $userId)
            ->where('deleted_at', null)
            ->update(['temp_manager_id' => $templateId]);

        return [
            'success' => true,
            'message' => $templateId === null ? 'Template automatico (menor ID da empresa)' : 'Template escolhido',
            'code'    => 200,
        ];
    }
}
