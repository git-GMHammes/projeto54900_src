<?php

namespace App\Models\V1\Health\HealthVitals;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela health_vitals — sinais vitais medidos em um prontuario.
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'health_vitals';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'record_id',
        'weight_kg',
        'height_cm',
        'blood_pressure',
        'heart_rate',
        'temperature',
        'oxygen_saturation',
        /*
        CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:47:42
        Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Models\V1\Health\HealthVitals\SqlTableModel.php
        BLOCO ADICIONADO - 8 linhas (47 a 54 neste arquivo editado):
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
    ];

    protected array $likeFields = ['blood_pressure'];

    protected array $sortableFields = [
        'id',
        'record_id',
        'weight_kg',
        'height_cm',
        'blood_pressure',
        'heart_rate',
        'temperature',
        'oxygen_saturation',
        /*
        CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:47:42
        Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Models\V1\Health\HealthVitals\SqlTableModel.php
        BLOCO ADICIONADO - 8 linhas (85 a 92 neste arquivo editado):
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

    public array $searchFields = ['blood_pressure'];
}
