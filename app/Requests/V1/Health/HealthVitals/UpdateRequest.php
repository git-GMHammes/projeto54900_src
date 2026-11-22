<?php

namespace App\Requests\V1\Health\HealthVitals;

/**
 * Regras de entrada do PUT /update/{id} da tabela health_vitals.
 *
 * sinais vitais medidos em um prontuario. Regras de negocio (vinculos, unicidade, status) ficam no Processor.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'record_id' => 'permit_empty|is_natural_no_zero|is_not_unique[health_records.id]',
            'weight_kg' => 'permit_empty|decimal',
            'height_cm' => 'permit_empty|decimal',
            'blood_pressure' => 'permit_empty|string|max_length[10]',
            'heart_rate' => 'permit_empty|is_natural',
            'temperature' => 'permit_empty|decimal',
            'oxygen_saturation' => 'permit_empty|is_natural|less_than_equal_to[100]',
            /*
            CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:47:42
            Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Requests\V1\Health\HealthVitals\UpdateRequest.php
            BLOCO ADICIONADO - 8 linhas (38 a 45 neste arquivo editado):
            'glucose_mg_dl' => 'permit_empty|is_natural|less_than_equal_to[1000]',
            'glucose_context' => 'permit_empty|in_list[fasting,post_meal,random,bedtime]',
            'total_cholesterol_mg_dl' => 'permit_empty|is_natural|less_than_equal_to[1000]',
            'triglycerides_mg_dl' => 'permit_empty|is_natural|less_than_equal_to[5000]',
            'uric_acid_mg_dl' => 'permit_empty|decimal|less_than_equal_to[30]',
            'respiratory_rate' => 'permit_empty|is_natural|less_than_equal_to[100]',
            'waist_cm' => 'permit_empty|decimal|less_than_equal_to[300]',
            'body_fat_percent' => 'permit_empty|decimal|less_than_equal_to[100]',
            Antes de : 'oxygen_saturation' => 'permit_empty|is_natural|less_than_equal_to[100]',
            Depois de : 'measured_at' => 'permit_empty|string|valid_date[Y-m-d H:i:s]',
            Motivo: validar as colunas novas (opcionais, com limite de valor).
            */
            'glucose_mg_dl' => 'permit_empty|is_natural|less_than_equal_to[1000]',
            'glucose_context' => 'permit_empty|in_list[fasting,post_meal,random,bedtime]',
            'total_cholesterol_mg_dl' => 'permit_empty|is_natural|less_than_equal_to[1000]',
            'triglycerides_mg_dl' => 'permit_empty|is_natural|less_than_equal_to[5000]',
            'uric_acid_mg_dl' => 'permit_empty|decimal|less_than_equal_to[30]',
            'respiratory_rate' => 'permit_empty|is_natural|less_than_equal_to[100]',
            'waist_cm' => 'permit_empty|decimal|less_than_equal_to[300]',
            'body_fat_percent' => 'permit_empty|decimal|less_than_equal_to[100]',
            'measured_at' => 'permit_empty|string|valid_date[Y-m-d H:i:s]',
        ];
    }

    public function messages(): array
    {
        return [
            'record_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
        ];
    }
}
