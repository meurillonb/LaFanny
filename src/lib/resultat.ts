import type { Gagnant, Terrain } from '@/types/domain'

export interface ResultatTerrain {
  scoreA: number
  scoreB: number
  gagnant: Gagnant
}

export function calculerGagnant(scoreA: number, scoreB: number): Gagnant {
  if (scoreA === 13 && scoreB === 13) return null
  if (scoreA === 13 && scoreB < 13) return 'A'
  if (scoreB === 13 && scoreA < 13) return 'B'
  return null
}

export function normaliserResultatTerrain(
  terrain: Pick<Terrain, 'equipeA' | 'equipeB'>,
  scoreA: number,
  scoreB: number,
): ResultatTerrain {
  if (terrain.equipeA.length > 0 && terrain.equipeB.length === 0) {
    return { scoreA: 13, scoreB: 7, gagnant: 'A' }
  }

  if (terrain.equipeB.length > 0 && terrain.equipeA.length === 0) {
    return { scoreA: 7, scoreB: 13, gagnant: 'B' }
  }

  return {
    scoreA,
    scoreB,
    gagnant: calculerGagnant(scoreA, scoreB),
  }
}