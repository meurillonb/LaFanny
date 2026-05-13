import { Chip } from '@mui/material'
import type { StatutConcours } from '@/types/domain'

const CONFIG: Record<StatutConcours, { color: 'default' | 'warning' | 'success'; label: string }> = {
  inscription: { color: 'default', label: 'Inscriptions' },
  en_cours:    { color: 'warning', label: 'En cours'     },
  termine:     { color: 'success', label: 'Terminé'      },
}

export function StatusBadge({ statut }: { statut: StatutConcours }) {
  const { color, label } = CONFIG[statut]
  return <Chip size="small" color={color} label={label} />
}
