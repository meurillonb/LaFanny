import { describe, expect, it } from 'vitest'
import type { Inscription, Joueur, Partie, Terrain } from '@/types/domain'
import { construireStatsConcours } from './concoursStats'

function makeJoueur(id: string, prenom: string, nom: string): Joueur {
  return {
    id,
    prenom,
    nom,
    genre: 'M',
    role: null,
    niveau: null,
    actif: true,
    presentSessionSuivante: false,
    createdAt: '2026-05-13T00:00:00.000Z',
  }
}

describe('construireStatsConcours', () => {
  it('classe les joueurs par victoires puis différentiel', () => {
    const joueurs: Joueur[] = [
      makeJoueur('j1', 'Alex', 'Martin'),
      makeJoueur('j2', 'Bruno', 'Martin'),
      makeJoueur('j3', 'Chloé', 'Durand'),
      makeJoueur('j4', 'Diane', 'Petit'),
    ]
    const inscriptions: Inscription[] = joueurs.map((j, idx) => ({
      id: `i${idx + 1}`,
      concoursId: 'c1',
      joueurId: j.id,
      nOrdre: idx + 1,
      presentSessionSuivante: false,
    }))
    const parties: Partie[] = [{ id: 'p1', concoursId: 'c1', numero: 1, statut: 'termine' }]
    const terrains: Terrain[] = [
      {
        id: 't1',
        partieId: 'p1',
        numero: 1,
        equipeA: ['j1', 'j2'],
        equipeB: ['j3', 'j4'],
        scoreA: 13,
        scoreB: 8,
        gagnant: 'A',
      },
    ]

    const stats = construireStatsConcours(joueurs, inscriptions, parties, terrains)

    expect(stats.classement).toHaveLength(4)
    expect(stats.classement[0]?.joueurId).toBe('j1')
    expect(stats.classement[1]?.joueurId).toBe('j2')
    expect(stats.classement[2]?.joueurId).toBe('j3')
    expect(stats.classement[0]?.partiesGagnees).toBe(1)
    expect(stats.classement[2]?.diffPoints).toBe(-5)
    expect(stats.partiesTerminees).toBe(1)
  })

  it('compte les byes et expose un historique lisible', () => {
    const joueurs: Joueur[] = [
      makeJoueur('j1', 'Alex', 'Martin'),
      makeJoueur('j2', 'Bruno', 'Martin'),
      makeJoueur('j3', 'Chloe', 'Durand'),
    ]
    const inscriptions: Inscription[] = joueurs.map((j, idx) => ({
      id: `i${idx + 1}`,
      concoursId: 'c2',
      joueurId: j.id,
      nOrdre: idx + 1,
      presentSessionSuivante: false,
    }))
    const parties: Partie[] = [
      { id: 'p1', concoursId: 'c2', numero: 1, statut: 'termine', byeJoueurId: 'j3' },
    ]
    const terrains: Terrain[] = [
      {
        id: 't1',
        partieId: 'p1',
        numero: 1,
        equipeA: ['j1', 'j2'],
        equipeB: [],
        scoreA: 13,
        scoreB: 7,
        gagnant: 'A',
      },
    ]

    const stats = construireStatsConcours(joueurs, inscriptions, parties, terrains)
    const ligneBye = stats.classement.find((l) => l.joueurId === 'j3')

    expect(ligneBye?.byes).toBe(1)
    expect(stats.historique[0]?.byeJoueur).toBe('Chloe Durand')
    expect(stats.historique[0]?.terrains[0]?.equipeA).toEqual(['Alex Martin', 'Bruno Martin'])
  })
})