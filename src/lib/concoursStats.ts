import type { Inscription, Joueur, Partie, Terrain } from '@/types/domain'

export interface LigneClassementStats {
  joueurId: string
  nomJoueur: string
  partiesJouees: number
  partiesGagnees: number
  pointsPour: number
  pointsContre: number
  diffPoints: number
  byes: number
  classement: number
}

export interface TerrainHistorique {
  id: string
  numero: number
  equipeA: string[]
  equipeB: string[]
  scoreA: number | null
  scoreB: number | null
  gagnant: 'A' | 'B' | null
}

export interface PartieHistorique {
  id: string
  numero: number
  statut: Partie['statut']
  byeJoueur?: string
  terrains: TerrainHistorique[]
}

export interface ConcoursStats {
  classement: LigneClassementStats[]
  historique: PartieHistorique[]
  totalParties: number
  partiesTerminees: number
}

interface MutableLigne {
  joueurId: string
  nomJoueur: string
  partiesJouees: number
  partiesGagnees: number
  pointsPour: number
  pointsContre: number
  byes: number
}

function toNomJoueur(joueur: Joueur | undefined, fallbackId: string): string {
  if (!joueur) return fallbackId
  return joueur.prenom ? `${joueur.prenom} ${joueur.nom}` : joueur.nom
}

export function construireStatsConcours(
  joueurs: Joueur[],
  inscriptions: Inscription[],
  parties: Partie[],
  terrains: Terrain[],
): ConcoursStats {
  const joueurMap = new Map(joueurs.map((j) => [j.id, j]))
  const inscritIds = new Set(inscriptions.map((i) => i.joueurId))
  const lignes = new Map<string, MutableLigne>()

  const ensureLigne = (joueurId: string): MutableLigne => {
    const existing = lignes.get(joueurId)
    if (existing) return existing

    const ligne: MutableLigne = {
      joueurId,
      nomJoueur: toNomJoueur(joueurMap.get(joueurId), joueurId),
      partiesJouees: 0,
      partiesGagnees: 0,
      pointsPour: 0,
      pointsContre: 0,
      byes: 0,
    }
    lignes.set(joueurId, ligne)
    return ligne
  }

  for (const joueurId of inscritIds) ensureLigne(joueurId)

  const partiesTriees = [...parties].sort((a, b) => a.numero - b.numero)
  const terrainsByPartie = new Map<string, Terrain[]>()
  for (const terrain of terrains) {
    const list = terrainsByPartie.get(terrain.partieId) ?? []
    list.push(terrain)
    terrainsByPartie.set(terrain.partieId, list)
  }

  for (const partie of partiesTriees) {
    if (partie.byeJoueurId) {
      ensureLigne(partie.byeJoueurId).byes += 1
    }

    if (partie.statut !== 'termine') continue

    const terrainsPartie = terrainsByPartie.get(partie.id) ?? []
    for (const terrain of terrainsPartie) {
      const scoreA = terrain.scoreA ?? 0
      const scoreB = terrain.scoreB ?? 0

      for (const joueurId of terrain.equipeA) {
        const ligne = ensureLigne(joueurId)
        ligne.partiesJouees += 1
        ligne.pointsPour += scoreA
        ligne.pointsContre += scoreB
        if (terrain.gagnant === 'A') ligne.partiesGagnees += 1
      }

      for (const joueurId of terrain.equipeB) {
        const ligne = ensureLigne(joueurId)
        ligne.partiesJouees += 1
        ligne.pointsPour += scoreB
        ligne.pointsContre += scoreA
        if (terrain.gagnant === 'B') ligne.partiesGagnees += 1
      }
    }
  }

  const classement = Array.from(lignes.values())
    .map((l) => ({
      ...l,
      diffPoints: l.pointsPour - l.pointsContre,
      classement: 0,
    }))
    .sort((a, b) => {
      if (b.partiesGagnees !== a.partiesGagnees) return b.partiesGagnees - a.partiesGagnees
      if (b.diffPoints !== a.diffPoints) return b.diffPoints - a.diffPoints
      if (b.pointsPour !== a.pointsPour) return b.pointsPour - a.pointsPour
      if (a.byes !== b.byes) return a.byes - b.byes
      return a.nomJoueur.localeCompare(b.nomJoueur, 'fr')
    })
    .map((l, index) => ({ ...l, classement: index + 1 }))

  const historique: PartieHistorique[] = partiesTriees.map((partie) => {
    const terrainsPartie = [...(terrainsByPartie.get(partie.id) ?? [])].sort((a, b) => a.numero - b.numero)
    return {
      id: partie.id,
      numero: partie.numero,
      statut: partie.statut,
      ...(partie.byeJoueurId ? { byeJoueur: toNomJoueur(joueurMap.get(partie.byeJoueurId), partie.byeJoueurId) } : {}),
      terrains: terrainsPartie.map((terrain) => ({
        id: terrain.id,
        numero: terrain.numero,
        equipeA: terrain.equipeA.map((id) => toNomJoueur(joueurMap.get(id), id)),
        equipeB: terrain.equipeB.map((id) => toNomJoueur(joueurMap.get(id), id)),
        scoreA: terrain.scoreA,
        scoreB: terrain.scoreB,
        gagnant: terrain.gagnant,
      })),
    }
  })

  return {
    classement,
    historique,
    totalParties: partiesTriees.length,
    partiesTerminees: partiesTriees.filter((p) => p.statut === 'termine').length,
  }
}