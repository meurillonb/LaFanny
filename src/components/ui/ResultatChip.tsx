import { Chip } from '@mui/material'
import type { Gagnant } from '@/types/domain'

interface Props { gagnant: Gagnant; equipe: 'A' | 'B' }

export function ResultatChip({ gagnant, equipe }: Props) {
  if (gagnant === null)
    return <Chip color="default" size="small" label="En cours" />
  return gagnant === equipe
    ? <Chip color="success" size="small" label="Gagné" />
    : <Chip color="error"   size="small" label="Perdu" />
}
