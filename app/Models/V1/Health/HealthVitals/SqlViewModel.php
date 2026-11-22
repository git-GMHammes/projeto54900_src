<?php

namespace App\Models\V1\Health\HealthVitals;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_health_vitals — sinais vitais com paciente e IMC calculado.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de health_vitals for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'health_vitals';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_health_vitals';
    protected $primaryKey = 'id';

    protected array $likeFields = ['patient_name', 'blood_pressure'];

    protected array $sortableFields = [
        'id',
        'record_id',
        'patient_id',
        'patient_name',
        'weight_kg',
        'height_cm',
        'bmi',
        'heart_rate',
        'temperature',
        'oxygen_saturation',
        /*
        CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:47:42
        Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Models\V1\Health\HealthVitals\SqlViewModel.php
        BLOCO ADICIONADO - 8 linhas (49 a 56 neste arquivo editado):
        'glucose_mg_dl',
        'glucose_context',
        'total_cholesterol_mg_dl',
        'triglycerides_mg_dl',
        'uric_acid_mg_dl',
        'respiratory_rate',
        'waist_cm',
        'body_fat_percent',
        Antes de : 'oxygen_saturation',
        Depois de : 'measured_at',
        Motivo: adicionar as colunas de aparelhos de farmacia (glicemia, colesterol, triglicerideos, acido urico, frequencia respiratoria, cintura, gordura corporal).
        */
        'glucose_mg_dl',
        'glucose_context',
        'total_cholesterol_mg_dl',
        'triglycerides_mg_dl',
        'uric_acid_mg_dl',
        'respiratory_rate',
        'waist_cm',
        'body_fat_percent',
        'measured_at',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = ['patient_name', 'blood_pressure'];

    public array $filterFields = ['record_id', 'patient_id'];
}
