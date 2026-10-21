// Catalogo de grupos e campos dos atributos de produto (grupo -> campo, 2 niveis).
// Copia reduzida de doc/json/produto.json (fonte da verdade): tipos de campo 'arquivo' ficam de fora
// (sem upload nesta tela). Campo novo entra primeiro no JSON de doc/ e depois aqui, sem mudar o banco.
import type { AttributeCatalog } from '@/types/attributeCatalog';

export const productCatalog: AttributeCatalog = {
  "identificacao": {
    "label": "Identificação",
    "fields": {
      "marca": {
        "type": "string"
      },
      "fabricante": {
        "type": "string"
      },
      "modelo": {
        "type": "string"
      },
      "pais_fabricacao": {
        "type": "string"
      },
      "gtin": {
        "type": "string"
      },
      "codigo_fabricante": {
        "type": "string"
      },
      "apelido": {
        "type": "string",
        "multiple": true,
        "note": "nome popular (ex.: caneta, esferográfica); a busca varre este campo"
      }
    }
  },
  "classificacao": {
    "label": "Classificação",
    "fields": {
      "categoria": {
        "type": "string",
        "multiple": true
      },
      "natureza": {
        "type": "enum",
        "values": [
          "substancia",
          "mistura",
          "artigo",
          "dispositivo",
          "maquina",
          "sistema",
          "software",
          "servico"
        ]
      },
      "estado_materia": {
        "type": "enum",
        "values": [
          "solido",
          "liquido",
          "gasoso",
          "po",
          "gel"
        ]
      },
      "ncm": {
        "type": "string"
      },
      "gpc": {
        "type": "string"
      },
      "atc": {
        "type": "string"
      },
      "etiqueta": {
        "type": "string",
        "multiple": true
      }
    }
  },
  "composicao": {
    "label": "Composição",
    "fields": {
      "material": {
        "type": "string",
        "multiple": true
      },
      "substancia": {
        "type": "string",
        "multiple": true,
        "note": "nome ou CAS"
      },
      "fracao": {
        "type": "medida",
        "unit": "% ou mg",
        "multiple": true,
        "note": "na mesma ordem de material/substancia"
      }
    }
  },
  "estetica": {
    "label": "Estética",
    "fields": {
      "cor": {
        "type": "string"
      },
      "acabamento": {
        "type": "string"
      },
      "textura": {
        "type": "string"
      },
      "forma": {
        "type": "string"
      },
      "odor": {
        "type": "string"
      }
    }
  },
  "fisica": {
    "label": "Física",
    "fields": {
      "comprimento": {
        "type": "medida",
        "unit": "m"
      },
      "largura": {
        "type": "medida",
        "unit": "m"
      },
      "altura": {
        "type": "medida",
        "unit": "m"
      },
      "diametro": {
        "type": "medida",
        "unit": "m"
      },
      "massa_liquida": {
        "type": "medida",
        "unit": "kg"
      },
      "massa_bruta": {
        "type": "medida",
        "unit": "kg"
      },
      "volume": {
        "type": "medida",
        "unit": "L"
      },
      "densidade": {
        "type": "medida",
        "unit": "kg/L"
      }
    }
  },
  "tecnica": {
    "label": "Técnica",
    "fields": {
      "especificacao": {
        "type": "medida",
        "multiple": true,
        "note": "qualquer grandeza própria do tipo; o nome vai em 'label' e o valor/unidade em value/unit (ex.: dose 500 mg, empuxo 28 kN, viscosidade 95 KU)"
      },
      "norma": {
        "type": "string",
        "multiple": true
      }
    }
  },
  "seguranca": {
    "label": "Segurança",
    "fields": {
      "perigoso": {
        "type": "boolean"
      },
      "numero_onu": {
        "type": "string"
      },
      "classe_risco": {
        "type": "string"
      },
      "restricao_uso": {
        "type": "enum",
        "values": [
          "prescricao",
          "controlado",
          "militar",
          "dual_use",
          "exportacao_controlada",
          "menor_idade"
        ],
        "multiple": true
      }
    }
  },
  "regulatorio": {
    "label": "Regulatório",
    "fields": {
      "registro": {
        "type": "string",
        "multiple": true,
        "note": "autoridade:numero (ex.: Anvisa:1.0000.0000.000-0)"
      },
      "validade_registro": {
        "type": "date",
        "multiple": true
      }
    }
  },
  "armazenagem": {
    "label": "Armazenagem",
    "fields": {
      "temperatura_min": {
        "type": "medida",
        "unit": "Cel"
      },
      "temperatura_max": {
        "type": "medida",
        "unit": "Cel"
      },
      "umidade_max": {
        "type": "medida",
        "unit": "%"
      },
      "validade": {
        "type": "medida",
        "unit": "mo"
      },
      "vida_util": {
        "type": "medida",
        "unit": "h"
      },
      "garantia": {
        "type": "medida",
        "unit": "mo"
      },
      "rastreio": {
        "type": "enum",
        "values": [
          "nenhum",
          "lote",
          "serie"
        ]
      },
      "lote": {
        "type": "string"
      },
      "data_fabricacao": {
        "type": "date"
      },
      "data_validade": {
        "type": "date"
      }
    }
  },
  "embalagem": {
    "label": "Embalagem",
    "fields": {
      "tipo_embalagem": {
        "type": "string"
      },
      "quantidade_embalagem": {
        "type": "integer"
      },
      "quantidade_palete": {
        "type": "integer"
      },
      "fragil": {
        "type": "boolean"
      },
      "empilhavel": {
        "type": "boolean"
      }
    }
  },
  "comercial": {
    "label": "Comercial",
    "fields": {
      "unidade": {
        "type": "string",
        "note": "UCUM: 1, kg, L, m, box"
      },
      "moeda": {
        "type": "string"
      },
      "preco_custo": {
        "type": "decimal"
      },
      "preco_venda": {
        "type": "decimal"
      }
    }
  }
};

export default productCatalog;
