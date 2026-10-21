// Linha de caracteristica (grupo -> campo -> valor/unidade) como o AttributeForm a edita e a API
// recebe em `attributes`, e o filtro das linhas prontas para enviar.

export interface AttributeRow {
  group_code: string;
  field_code: string;
  value: string;
  unit?: string;
  label?: string;
}

/** Linhas prontas para enviar: so as que tem valor (campos tocados e depois limpos ficam de fora). */
export function filledRows(rows: AttributeRow[]): AttributeRow[] {
  return rows.filter((r) => r.value.trim() !== '').map((r) => ({ ...r, value: r.value.trim() }));
}
