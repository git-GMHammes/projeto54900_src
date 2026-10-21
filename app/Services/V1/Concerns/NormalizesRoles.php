<?php

namespace App\Services\V1\Concerns;

/**
 * Normaliza o campo `roles` (lista de slugs de user_roles) antes de gravar numa coluna JSON.
 *
 * O multi select do frontend envia array (`["admin","user"]`); a coluna JSON recebe a string.
 * String que ja e uma lista JSON valida passa como esta; qualquer outra coisa e descartada
 * (a coluna mantem o valor atual/padrao). Lista vazia grava `[]` = todos os perfis.
 */
trait NormalizesRoles
{
    /**
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    protected function normalizeRoles(array $data): array
    {
        if (!array_key_exists('roles', $data)) {
            return $data;
        }

        $roles = $data['roles'];

        if (is_string($roles)) {
            $decoded = json_decode($roles, true);
            $roles   = is_array($decoded) ? $decoded : null;
        }

        if (!is_array($roles)) {
            unset($data['roles']);

            return $data;
        }

        $slugs = array_values(array_unique(array_filter(
            array_map(static fn ($slug): string => is_scalar($slug) ? trim((string) $slug) : '', $roles),
            static fn (string $slug): bool => $slug !== ''
        )));

        $data['roles'] = json_encode($slugs, JSON_UNESCAPED_UNICODE);

        return $data;
    }
}
