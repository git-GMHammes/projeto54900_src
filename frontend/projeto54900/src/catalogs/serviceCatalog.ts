// Catalogo de grupos e campos dos atributos de servico (grupo -> campo, 2 niveis).
// Copia reduzida de doc/json/servico.json (fonte da verdade): tipos de campo 'arquivo' ficam de fora
// (sem upload nesta tela). Campo novo entra primeiro no JSON de doc/ e depois aqui, sem mudar o banco.
import type { AttributeCatalog } from '@/types/attributeCatalog';

export const serviceCatalog: AttributeCatalog = {
  "identificacao": {
    "label": "Identificação",
    "fields": {
      "apelido": {
        "type": "string",
        "multiple": true,
        "note": "nome popular (ex.: marido de aluguel, bico, passeio com cachorro); a busca varre este campo"
      },
      "codigo_externo": {
        "type": "string"
      }
    }
  },
  "classificacao": {
    "label": "Classificação",
    "fields": {
      "area": {
        "type": "string",
        "note": "ex.: saude, construcao, domestico, tecnologia, animais, educacao, industrial"
      },
      "categoria": {
        "type": "string",
        "multiple": true
      },
      "cbo": {
        "type": "string",
        "note": "Classificação Brasileira de Ocupações"
      },
      "cnae": {
        "type": "string"
      },
      "lc116": {
        "type": "string",
        "note": "item da lista de serviços do ISS (LC 116)"
      },
      "etiqueta": {
        "type": "string",
        "multiple": true
      }
    }
  },
  "execucao": {
    "label": "Execução",
    "fields": {
      "modalidade": {
        "type": "enum",
        "values": [
          "presencial",
          "remoto",
          "hibrido"
        ]
      },
      "local_execucao": {
        "type": "enum",
        "values": [
          "cliente",
          "prestador",
          "terceiro"
        ]
      },
      "equipe": {
        "type": "integer",
        "note": "profissionais necessários"
      },
      "equipamento": {
        "type": "string",
        "multiple": true
      },
      "material_incluso": {
        "type": "boolean"
      },
      "deslocamento_incluso": {
        "type": "boolean"
      },
      "raio_atendimento": {
        "type": "medida",
        "unit": "km"
      },
      "quantidade_minima": {
        "type": "medida"
      }
    }
  },
  "agenda": {
    "label": "Agenda e prazos",
    "fields": {
      "dia_atendimento": {
        "type": "enum",
        "values": [
          "seg",
          "ter",
          "qua",
          "qui",
          "sex",
          "sab",
          "dom"
        ],
        "multiple": true
      },
      "horario_inicio": {
        "type": "string",
        "note": "HH:MM"
      },
      "horario_fim": {
        "type": "string",
        "note": "HH:MM"
      },
      "antecedencia_minima": {
        "type": "medida",
        "unit": "h"
      },
      "validade_orcamento": {
        "type": "medida",
        "unit": "d"
      },
      "garantia": {
        "type": "medida",
        "unit": "mo"
      },
      "urgencia": {
        "type": "boolean"
      }
    }
  },
  "preco": {
    "label": "Preço e pagamento",
    "fields": {
      "preco_minimo": {
        "type": "decimal"
      },
      "taxa_visita": {
        "type": "decimal"
      },
      "taxa_urgencia": {
        "type": "medida",
        "unit": "%"
      },
      "desconto_maximo": {
        "type": "medida",
        "unit": "%"
      },
      "forma_pagamento": {
        "type": "enum",
        "values": [
          "pix",
          "dinheiro",
          "cartao",
          "boleto",
          "transferencia"
        ],
        "multiple": true
      },
      "parcelamento_maximo": {
        "type": "integer"
      }
    }
  },
  "fiscal": {
    "label": "Fiscal",
    "fields": {
      "regime_tributario": {
        "type": "enum",
        "values": [
          "autonomo",
          "mei",
          "simples",
          "presumido",
          "real"
        ]
      },
      "emite_nota": {
        "type": "boolean"
      },
      "iss_aliquota": {
        "type": "medida",
        "unit": "%"
      },
      "municipio_tributacao": {
        "type": "string"
      }
    }
  },
  "exigencias": {
    "label": "Exigências do serviço",
    "fields": {
      "registro_profissional": {
        "type": "string",
        "multiple": true,
        "note": "autoridade:numero (ex.: COREN:123456, CREA:000000)"
      },
      "validade_registro": {
        "type": "date",
        "multiple": true
      },
      "habilitacao": {
        "type": "string",
        "multiple": true
      },
      "seguro": {
        "type": "boolean"
      },
      "antecedentes": {
        "type": "boolean"
      },
      "epi": {
        "type": "string",
        "multiple": true
      }
    }
  },
  "seguranca": {
    "label": "Segurança e risco",
    "fields": {
      "nivel_risco": {
        "type": "enum",
        "values": [
          "baixo",
          "medio",
          "alto",
          "critico"
        ]
      },
      "restricao_uso": {
        "type": "enum",
        "values": [
          "registro_profissional",
          "licenca",
          "controlado",
          "militar",
          "dual_use",
          "exportacao_controlada",
          "menor_idade"
        ],
        "multiple": true
      },
      "licenca": {
        "type": "string",
        "multiple": true,
        "note": "autoridade:numero"
      },
      "norma": {
        "type": "string",
        "multiple": true
      }
    }
  },
  "especificacao": {
    "label": "Especificação própria do tipo",
    "fields": {
      "especificacao": {
        "type": "medida",
        "multiple": true,
        "note": "qualquer grandeza própria do serviço; o nome vai em 'label' e o valor/unidade em value/unit (ex.: porte do cão pequeno, voltagem 220 V, área 120 m2)"
      }
    }
  }
};

export default serviceCatalog;
