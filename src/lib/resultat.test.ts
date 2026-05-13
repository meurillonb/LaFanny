import { describe, expect, it } from 'vitest'
import { calculerGagnant, normaliserResultatTerrain } from './resultat'

describe('normaliserResultatTerrain', () => {
  it('force une victoire 13-7 quand l équipe A est seule', () => {
    const resultat = normaliserResultatTerrain(
      { equipeA: ['j1', 'j2'], equipeB: [] },
      0,
      0,
    )

    expect(resultat).toEqual({ scoreA: 13, scoreB: 7, gagnant: 'A' })
  })

  it('force une victoire 13-7 quand l équipe B est seule', () => {
    const resultat = normaliserResultatTerrain(
      { equipeA: [], equipeB: ['j3', 'j4'] },
      4,
      12,
    )

    expect(resultat).toEqual({ scoreA: 7, scoreB: 13, gagnant: 'B' })
  })

  it('conserve le score saisi si les deux équipes existent', () => {
    const resultat = normaliserResultatTerrain(
      { equipeA: ['j1', 'j2'], equipeB: ['j3', 'j4'] },
      13,
      9,
    )

    expect(resultat).toEqual({ scoreA: 13, scoreB: 9, gagnant: 'A' })
  })
})

describe('calculerGagnant', () => {
  it('déduit un gagnant seulement quand une équipe atteint 13', () => {
    expect(calculerGagnant(8, 13)).toBe('B')
    expect(calculerGagnant(13, 11)).toBe('A')
  })

  it('laisse le gagnant indéfini tant que le score final n est pas saisi', () => {
    expect(calculerGagnant(11, 9)).toBeNull()
    expect(calculerGagnant(7, 7)).toBeNull()
  })

  it('retourne null quand les deux équipes sont à 13', () => {
    expect(calculerGagnant(13, 13)).toBeNull()
  })
})