// Tipos do catalogo de atributos (grupo -> campo, 2 niveis) usado pelo AttributeEditor.
// Os catalogos de produto e servico ficam em src/catalogs/ (copia reduzida de doc/json/).

export interface AttributeField {
  /** Tipo do campo no catalogo: string, text, integer, decimal, boolean, date, enum, medida... */
  type: string;
  /** Unidade padrao (UCUM) para campos de medida. */
  unit?: string;
  /** Valores permitidos de um campo enum. */
  values?: readonly string[];
  /** O campo pode se repetir (varias linhas para o mesmo registro). */
  multiple?: boolean;
  /** Dica de uso do campo. */
  note?: string;
}

export interface AttributeGroup {
  label: string;
  fields: Record<string, AttributeField>;
}

export type AttributeCatalog = Record<string, AttributeGroup>;
