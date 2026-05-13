import { describe, it, expect } from 'vitest'
import { tirerPartie, construireHistorique } from './tirage'
import type { Joueur, FormatMatch, HistoriqueJoueur } from '@/types/domain'

// ── Helpers ───────────────────────────────────────────────────

function makeJoueur(id: string, genre: 'M' | 'F' = 'M'): Joueur {
  return {
    id,
    nom: `Joueur-${id}`,
    prenom: null,
    genre,
    role: null,
    niveau: null,
    actif: true,
    presentSessionSuivante: false,
    createdAt: '2024-01-01T00:00:00.000Z',
  }
}

function countFemmesParEquipe(equipeIds: string[], joueurs: Joueur[]): number {
  return equipeIds.filter((id) => joueurs.find((j) => j.id === id)?.genre === 'F').length
}

// ── Tests tirerPartie ─────────────────────────────────────────

describe('tirerPartie — contrainte femmes', () => {
  it('T2.01 — jamais 2 femmes dans la même équipe (12 joueurs, 3F, 3 doublettes)', () => {
    const joueurs = [
      makeJoueur('f1', 'F'),
      makeJoueur('f2', 'F'),
      makeJoueur('f3', 'F'),
      ...Array.from({ length: 9 }, (_, i) => makeJoueur(`m${i + 1}`)),
    ]
    const format: FormatMatch = { doublettes: 3, triplettes: 0, terrains: 3, bye: false }

    for (let run = 0; run < 20; run++) {
      const terrains = tirerPartie(joueurs, { ...format }, [])
      for (const t of terrains) {
        expect(countFemmesParEquipe(t.equipeA, joueurs)).toBeLessThanOrEqual(1)
        expect(countFemmesParEquipe(t.equipeB, joueurs)).toBeLessThanOrEqual(1)
      }
    }
  })

  it('T2.02 — contrainte femmes avec triplettes (12 joueurs, 2F, 2 triplettes)', () => {
    const joueurs = [
      makeJoueur('f1', 'F'),
      makeJoueur('f2', 'F'),
      ...Array.from({ length: 10 }, (_, i) => makeJoueur(`m${i + 1}`)),
    ]
    // 2 triplettes = 12 joueurs (6+6)
    const format: FormatMatch = { doublettes: 0, triplettes: 2, terrains: 2, bye: false }

    for (let run = 0; run < 20; run++) {
      const terrains = tirerPartie(joueurs, { ...format }, [])
      for (const t of terrains) {
        expect(countFemmesParEquipe(t.equipeA, joueurs)).toBeLessThanOrEqual(1)
        expect(countFemmesParEquipe(t.equipeB, joueurs)).toBeLessThanOrEqual(1)
      }
    }
  })
})

describe('tirerPartie — bye', () => {
  it('T2.10 — le joueur exempt tourne (bye change à chaque partie)', () => {
    const joueurs = [
      makeJoueur('j1'),
      makeJoueur('j2'),
      makeJoueur('j3'),
      makeJoueur('j4'),
      makeJoueur('j5'),
    ]
    // 5 joueurs → bye=true, Neff=4 → 1 doublette (calculerFormat(5,10))
    const format: FormatMatch = { doublettes: 1, triplettes: 0, terrains: 1, bye: true }

    const byeIds: string[] = []
    let historique: HistoriqueJoueur[] = []

    for (let partie = 0; partie < 5; partie++) {
      const f = { ...format }
      const terrains = tirerPartie(joueurs, f, historique)
      const byeId = f.joueurByeId!
      byeIds.push(byeId)
      historique = construireHistorique(terrains, historique, byeId)
    }

    // Chaque joueur doit avoir eu le bye au moins 1 fois sur 5 parties
    const uniqueByes = new Set(byeIds)
    expect(uniqueByes.size).toBeGreaterThanOrEqual(2)
  })

  it('T2.11 — le joueur avec le plus de byes n\'est pas choisi si alternatives existent', () => {
    const joueurs = [
      makeJoueur('j1'),
      makeJoueur('j2'),
      makeJoueur('j3'),
      makeJoueur('j4'),
      makeJoueur('j5'),
    ]
    // 5 joueurs → 1 doublette + bye
    const format: FormatMatch = { doublettes: 1, triplettes: 0, terrains: 1, bye: true }

    // j1 a déjà eu 3 byes, les autres 0
    const historique: HistoriqueJoueur[] = [
      { joueurId: 'j1', partenairesIds: [], adversairesIds: [], byeCount: 3 },
    ]

    // Sur 20 tirages, j1 ne devrait jamais être le bye
    for (let i = 0; i < 20; i++) {
      const f = { ...format }
      tirerPartie(joueurs, f, historique)
      expect(f.joueurByeId).not.toBe('j1')
    }
  })
})

describe('tirerPartie — format', () => {
  it('T2.20 — bon nombre de terrains, doublettes, triplettes (8 joueurs, 2 doublettes)', () => {
    const joueurs = Array.from({ length: 8 }, (_, i) => makeJoueur(`j${i + 1}`))
    const format: FormatMatch = { doublettes: 2, triplettes: 0, terrains: 2, bye: false }
    const terrains = tirerPartie(joueurs, { ...format }, [])

    expect(terrains).toHaveLength(2)
    for (const t of terrains) {
      expect(t.equipeA).toHaveLength(2)
      expect(t.equipeB).toHaveLength(2)
      expect(t.scoreA).toBeNull()
      expect(t.scoreB).toBeNull()
      expect(t.gagnant).toBeNull()
    }
  })

  it('T2.21 — bon nombre de terrains avec triplettes (6 joueurs, 1 triplette)', () => {
    const joueurs = Array.from({ length: 6 }, (_, i) => makeJoueur(`j${i + 1}`))
    const format: FormatMatch = { doublettes: 0, triplettes: 1, terrains: 1, bye: false }
    const terrains = tirerPartie(joueurs, { ...format }, [])

    expect(terrains).toHaveLength(1)
    expect(terrains[0]!.equipeA).toHaveLength(3)
    expect(terrains[0]!.equipeB).toHaveLength(3)
  })

  it('T2.22 — format mixte doublettes+triplettes (14 joueurs)', () => {
    // calculerFormat(14, 10) → doublettes=2, triplettes=1, terrains=3
    const joueurs = Array.from({ length: 14 }, (_, i) => makeJoueur(`j${i + 1}`))
    const format: FormatMatch = { doublettes: 2, triplettes: 1, terrains: 3, bye: false }
    const terrains = tirerPartie(joueurs, { ...format }, [])

    expect(terrains).toHaveLength(3)
    // Les 2 premières sont des doublettes
    expect(terrains[0]!.equipeA).toHaveLength(2)
    expect(terrains[0]!.equipeB).toHaveLength(2)
    expect(terrains[1]!.equipeA).toHaveLength(2)
    expect(terrains[1]!.equipeB).toHaveLength(2)
    // La 3ème est une triplette
    expect(terrains[2]!.equipeA).toHaveLength(3)
    expect(terrains[2]!.equipeB).toHaveLength(3)
  })

  it('T2.23 — tous les joueurs sont placés exactement une fois', () => {
    const joueurs = Array.from({ length: 12 }, (_, i) => makeJoueur(`j${i + 1}`))
    const format: FormatMatch = { doublettes: 3, triplettes: 0, terrains: 3, bye: false }
    const terrains = tirerPartie(joueurs, { ...format }, [])

    const placed = new Set<string>()
    for (const t of terrains) {
      for (const id of [...t.equipeA, ...t.equipeB]) {
        expect(placed.has(id), `joueur ${id} placé deux fois`).toBe(false)
        placed.add(id)
      }
    }
    expect(placed.size).toBe(12)
  })
})

describe('tirerPartie — 10 tirages aléatoires', () => {
  it('T2.30 — 10 tirages consécutifs passent toutes les contraintes (16 joueurs, 2F)', () => {
    const joueurs = [
      makeJoueur('f1', 'F'),
      makeJoueur('f2', 'F'),
      ...Array.from({ length: 14 }, (_, i) => makeJoueur(`m${i + 1}`)),
    ]
    const format: FormatMatch = { doublettes: 4, triplettes: 0, terrains: 4, bye: false }

    let historique: HistoriqueJoueur[] = []

    for (let partie = 0; partie < 10; partie++) {
      const terrains = tirerPartie(joueurs, { ...format }, historique)

      // Contrainte femmes
      for (const t of terrains) {
        expect(countFemmesParEquipe(t.equipeA, joueurs)).toBeLessThanOrEqual(1)
        expect(countFemmesParEquipe(t.equipeB, joueurs)).toBeLessThanOrEqual(1)
      }

      // Bon nombre de terrains
      expect(terrains).toHaveLength(4)

      // Tous les joueurs placés
      const placed = new Set(terrains.flatMap((t) => [...t.equipeA, ...t.equipeB]))
      expect(placed.size).toBe(16)

      historique = construireHistorique(terrains, historique)
    }
  })
})

describe('construireHistorique', () => {
  it('T2.40 — construit les partenaires et adversaires correctement', () => {
    const terrain = {
      id: 't1',
      partieId: 'p1',
      numero: 1,
      equipeA: ['j1', 'j2'],
      equipeB: ['j3', 'j4'],
      scoreA: 13,
      scoreB: 5,
      gagnant: 'A' as const,
    }
    const hist = construireHistorique([terrain], [])

    const h1 = hist.find((h) => h.joueurId === 'j1')!
    expect(h1.partenairesIds).toContain('j2')
    expect(h1.adversairesIds).toContain('j3')
    expect(h1.adversairesIds).toContain('j4')
    expect(h1.byeCount).toBe(0)
  })

  it('T2.41 — byeCount incrémenté correctement', () => {
    const terrain = {
      id: 't1',
      partieId: 'p1',
      numero: 1,
      equipeA: ['j1', 'j2'],
      equipeB: ['j3', 'j4'],
      scoreA: null,
      scoreB: null,
      gagnant: null,
    }
    const hist = construireHistorique([terrain], [], 'j5')
    const h5 = hist.find((h) => h.joueurId === 'j5')!
    expect(h5.byeCount).toBe(1)
  })
})
