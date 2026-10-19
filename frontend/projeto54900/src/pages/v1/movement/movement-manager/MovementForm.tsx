// Formulario de cadastro de movimento sobre o RecordFormWithRoles. Regra de tela: o tipo escolhido
// (select controlado `type`) decide quais campos aparecem -- expected_at so em encomenda; lote, validade e
// custo em entrada e encomenda; motivo em desperdicio. Usuario, status e data do movimento nao aparecem
// (a API define).
import { useMemo, useState } from 'react';

import RecordFormWithRoles from '@/components/global/RecordFormWithRoles';
import type { RecordFormBuildProps } from '@/components/global/RecordFormBuild';

/** Tipos que mostram lote, validade e custo unitario. */
const LOT_TYPES: ReadonlySet<string> = new Set(['entry', 'order']);

type MovementFormProps = Pick<RecordFormBuildProps, 'slug' | 'backPath' | 'defaults' | 'successMessage' | 'fallbackTitle'>;

export default function MovementForm(props: MovementFormProps) {
  const [type, setType] = useState(props.defaults?.type ?? '');

  const patches = useMemo(
    () => ({
      type: { value: type, onChange: (value: string) => setType(value) },
      expected_at: { hidden: type !== 'order' },
      lot: { hidden: !LOT_TYPES.has(type) },
      expires_at: { hidden: !LOT_TYPES.has(type) },
      unit_cost: { hidden: !LOT_TYPES.has(type) },
      reason: { hidden: type !== 'waste' },
    }),
    [type],
  );

  return <RecordFormWithRoles {...props} patches={patches} />;
}
