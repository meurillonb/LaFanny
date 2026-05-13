import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Concours, Joueur, Partie, Terrain, HistoriqueJoueur, Inscription } from '@/types/domain'
import { db } from '@/lib/db'
import type { LocalTerrain } from '@/lib/db'
import { calculerFormat } from '@/lib/format'
import { normaliserResultatTerrain } from '@/lib/resultat'
import { tirerPartie as executerTirage, construireHistorique } from '@/lib/tirage'

function estTransitionStatutValide(from: Concours['statut'], to: Concours['statut']): boolean {
  if (from === to) return true
  if (from === 'inscription' && to === 'en_cours') return true
  if (from === 'en_cours' && to === 'termine') return true
  // Réouverture manuelle
  if (from === 'termine' && to === 'en_cours') return true
  return false
}

function validerBornesScore(scoreA: number, scoreB: number): void {
  if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB)) {
    throw new Error('Les scores doivent être des entiers')
  }
  if (scoreA < 0 || scoreA > 13 || scoreB < 0 || scoreB > 13) {
    throw new Error('Les scores doivent être compris entre 0 et 13')
  }
}

interface ConcoursState {
  concours: Concours[]
  courant: Concours | null
  inscrits: Joueur[]
  partieEnCours: Partie | null
  terrainsEnCours: Terrain[]
  byeJoueurId: string | null

  load: () => Promise<void>
  creer: (c: Omit<Concours, 'id' | 'createdAt' | 'partieCourante' | 'statut'>) => Promise<Concours>
  setCourant: (id: string) => Promise<void>
  updateStatut: (id: string, statut: Concours['statut']) => Promise<void>
  chargerInscrits: (concoursId: string) => Promise<void>
  inscrire: (concoursId: string, joueurIds: string[]) => Promise<void>
  tirerPartie: () => Promise<Terrain[]>
  saisirScore: (terrainId: string, scoreA: number, scoreB: number) => Promise<void>
  validerPartie: (partieId: string) => Promise<void>
  chargerPartieEnCours: (concoursId: string) => Promise<void>
  reouvrirDernierePartie: (concoursId: string) => Promise<void>
}

export const useConcoursStore = create<ConcoursState>()(
  immer((set, get) => ({
    concours: [],
    courant: null,
    inscrits: [],
    partieEnCours: null,
    terrainsEnCours: [],
    byeJoueurId: null,

    load: async () => {
      const list = await db.concours.orderBy('date').reverse().toArray()
      set((s) => { s.concours = list })
    },

    creer: async (c) => {
      const nouveau: Concours = {
        ...c, id: crypto.randomUUID(), partieCourante: 0, statut: 'inscription', createdAt: new Date().toISOString(),
      }
      await db.concours.add(nouveau)
      set((s) => { s.concours.unshift(nouveau); s.courant = nouveau })
      return nouveau
    },

    setCourant: async (id) => {
      const c = await db.concours.get(id)
      set((s) => { s.courant = c ?? null })
    },

    updateStatut: async (id, statut) => {
      const concours = await db.concours.get(id)
      if (!concours) throw new Error('Concours introuvable')
      if (!estTransitionStatutValide(concours.statut, statut)) {
        throw new Error(`Transition de statut invalide: ${concours.statut} -> ${statut}`)
      }

      await db.concours.update(id, { statut })
      set((s) => {
        const c = s.concours.find((x) => x.id === id)
        if (c) c.statut = statut
        if (s.courant?.id === id) s.courant.statut = statut
      })
    },

    chargerInscrits: async (concoursId) => {
      const inscriptions = await db.inscriptions.where('concoursId').equals(concoursId).toArray()
      const joueurIds = inscriptions.map((i) => i.joueurId)
      const joueurs = joueurIds.length > 0
        ? (await db.joueurs.bulkGet(joueurIds)).filter((j): j is NonNullable<typeof j> => j != null)
        : []
      set((s) => { s.inscrits = joueurs as Joueur[] })
    },

    inscrire: async (concoursId, joueurIds) => {
      const concours = await db.concours.get(concoursId)
      if (!concours) throw new Error('Concours introuvable')
      if (concours.statut === 'termine') throw new Error('Impossible de modifier les inscriptions d\'un concours terminé')

      const joueurIdsUniques = Array.from(new Set(joueurIds))
      if (joueurIdsUniques.length < 4) {
        throw new Error('Minimum 4 joueurs requis pour lancer un concours')
      }

      // Supprime les inscriptions existantes pour ce concours
      const existing = await db.inscriptions.where('concoursId').equals(concoursId).toArray()
      if (existing.length > 0) {
        await db.inscriptions.bulkDelete(existing.map((i) => i.id))
      }
      // Crée les nouvelles inscriptions
      const nouvelles: Inscription[] = joueurIdsUniques.map((joueurId, idx) => ({
        id: crypto.randomUUID(),
        concoursId,
        joueurId,
        nOrdre: idx + 1,
        presentSessionSuivante: false,
      }))
      if (nouvelles.length > 0) await db.inscriptions.bulkAdd(nouvelles)

      // Charge les joueurs inscrits
      const joueurs = joueurIdsUniques.length > 0
        ? (await db.joueurs.bulkGet(joueurIdsUniques)).filter((j): j is NonNullable<typeof j> => j != null)
        : []
      set((s) => { s.inscrits = joueurs as Joueur[] })
    },

    tirerPartie: async () => {
      const { courant, inscrits, partieEnCours } = get()
      if (!courant) throw new Error('Pas de concours courant')
      if (courant.statut === 'termine') throw new Error('Ce concours est terminé et ne peut plus être tiré')
      if (courant.partieCourante >= 4) throw new Error('Le concours a déjà atteint 4 parties')
      if (partieEnCours) throw new Error('Une partie est déjà en cours')
      if (inscrits.length === 0) throw new Error('Pas de joueurs inscrits')
      if (inscrits.length < 4) throw new Error('Minimum 4 joueurs requis pour tirer une partie')

      const uniqueInscrits = Array.from(new Map(inscrits.map((j) => [j.id, j])).values())
      if (uniqueInscrits.length !== inscrits.length) {
        throw new Error('La liste des inscrits contient des doublons')
      }

      const formatResult = calculerFormat(uniqueInscrits.length, courant.nbTerrains)
      if (!formatResult.ok) throw new Error(formatResult.error.message)

      const format = { ...formatResult.format }

      // Construit l'historique à partir des parties terminées
      const partiesTerminees = await db.parties
        .where('concoursId').equals(courant.id)
        .filter((p) => p.statut === 'termine')
        .toArray()

      let historique: HistoriqueJoueur[] = []
      if (partiesTerminees.length > 0) {
        const tousTerrains = await db.terrains
          .where('partieId').anyOf(partiesTerminees.map((p) => p.id))
          .toArray()
        const partiesTriees = partiesTerminees.sort((a, b) => a.numero - b.numero)
        for (const partie of partiesTriees) {
          const terrainsPartie = tousTerrains.filter((t) => t.partieId === partie.id)
          historique = construireHistorique(terrainsPartie, historique, partie.byeJoueurId)
        }
      }

      // Tire les équipes
      const terrainsBruts = executerTirage(uniqueInscrits, format, historique)

      // Crée la Partie en DB
      const numeroPartie = (courant.partieCourante + 1) as 1 | 2 | 3 | 4
      const partie: Partie = {
        id: crypto.randomUUID(),
        concoursId: courant.id,
        numero: numeroPartie,
        statut: 'en_cours',
        ...(format.joueurByeId !== undefined ? { byeJoueurId: format.joueurByeId } : {}),
      }
      await db.parties.add(partie)

      // Affecte le partieId et sauvegarde les terrains
      const terrainsAvecId: Terrain[] = terrainsBruts.map((t) => ({ ...t, partieId: partie.id }))
      await db.terrains.bulkAdd(terrainsAvecId.map((t) => ({ ...t, _dirty: true } as LocalTerrain)))

      // Passe le concours en cours si besoin
      if (courant.statut === 'inscription') {
        await db.concours.update(courant.id, { statut: 'en_cours' })
      }

      const byeId = format.joueurByeId ?? null
      set((s) => {
        s.partieEnCours = partie
        s.terrainsEnCours = terrainsAvecId
        s.byeJoueurId = byeId
        if (s.courant?.statut === 'inscription') s.courant.statut = 'en_cours'
        const c = s.concours.find((x) => x.id === courant.id)
        if (c?.statut === 'inscription') c.statut = 'en_cours'
      })

      return terrainsAvecId
    },

    saisirScore: async (terrainId, scoreA, scoreB) => {
      const terrain = get().terrainsEnCours.find((x) => x.id === terrainId)
      if (!terrain) return

      validerBornesScore(scoreA, scoreB)
      if (scoreA === 13 && scoreB === 13) {
        throw new Error('Deux équipes ne peuvent pas atteindre 13 simultanément')
      }

      const resultat = normaliserResultatTerrain(terrain, scoreA, scoreB)
      await db.terrains.update(terrainId, {
        scoreA: resultat.scoreA,
        scoreB: resultat.scoreB,
        gagnant: resultat.gagnant,
      })
      set((s) => {
        const t = s.terrainsEnCours.find((x) => x.id === terrainId)
        if (t) {
          t.scoreA = resultat.scoreA
          t.scoreB = resultat.scoreB
          t.gagnant = resultat.gagnant
        }
      })
    },

    validerPartie: async (partieId) => {
      const { courant } = get()
      if (!courant) return
      if (courant.statut === 'termine') throw new Error('Le concours est déjà terminé')

      const partie = await db.parties.get(partieId)
      if (!partie) throw new Error('Partie introuvable')
      if (partie.concoursId !== courant.id) throw new Error('Cette partie ne correspond pas au concours courant')
      if (partie.statut !== 'en_cours') throw new Error('Seule une partie en cours peut être validée')

      const terrains = await db.terrains.where('partieId').equals(partieId).toArray()
      if (terrains.length === 0) throw new Error('Impossible de valider une partie sans terrain')
      const terrainSansGagnant = terrains.find((terrain) => terrain.gagnant === null)
      if (terrainSansGagnant) throw new Error('Tous les terrains doivent avoir un gagnant avant validation')

      await db.parties.update(partieId, { statut: 'termine' })

      const nouveauPartieCourante = courant.partieCourante + 1
      const updates: Partial<Concours> = { partieCourante: nouveauPartieCourante }
      if (nouveauPartieCourante >= 4) updates.statut = 'termine'

      await db.concours.update(courant.id, updates)

      set((s) => {
        s.partieEnCours = null
        s.terrainsEnCours = []
        s.byeJoueurId = null
        if (s.courant) {
          s.courant.partieCourante = nouveauPartieCourante
          if (nouveauPartieCourante >= 4) s.courant.statut = 'termine'
        }
        const c = s.concours.find((x) => x.id === courant.id)
        if (c) {
          c.partieCourante = nouveauPartieCourante
          if (nouveauPartieCourante >= 4) c.statut = 'termine'
        }
      })
    },

    chargerPartieEnCours: async (concoursId) => {
      const parties = await db.parties.where('concoursId').equals(concoursId).toArray()
      const active = parties
        .filter((p) => p.statut !== 'termine')
        .sort((a, b) => b.numero - a.numero)[0]

      if (!active) {
        set((s) => { s.partieEnCours = null; s.terrainsEnCours = [] })
        return
      }

      const terrains = await db.terrains.where('partieId').equals(active.id).sortBy('numero')
      const byeId = active.byeJoueurId ?? null

      const terrainsNormalises = terrains.map((terrain) => {
        if (terrain.equipeA.length > 0 && terrain.equipeB.length === 0) {
          return { ...terrain, scoreA: 13, scoreB: 7, gagnant: 'A' as const }
        }
        if (terrain.equipeB.length > 0 && terrain.equipeA.length === 0) {
          return { ...terrain, scoreA: 7, scoreB: 13, gagnant: 'B' as const }
        }
        return terrain
      })

      await Promise.all(
        terrainsNormalises.map(async (terrain, index) => {
          const original = terrains[index]!
          if (
            terrain.scoreA !== original.scoreA ||
            terrain.scoreB !== original.scoreB ||
            terrain.gagnant !== original.gagnant
          ) {
            await db.terrains.update(terrain.id, {
              scoreA: terrain.scoreA,
              scoreB: terrain.scoreB,
              gagnant: terrain.gagnant,
            })
          }
        }),
      )

      set((s) => {
        s.partieEnCours = active
        s.terrainsEnCours = terrainsNormalises as Terrain[]
        s.byeJoueurId = byeId
      })
    },

    reouvrirDernierePartie: async (concoursId) => {
      const concours = await db.concours.get(concoursId)
      if (!concours) throw new Error('Concours introuvable')
      if (concours.statut !== 'termine') throw new Error('Seul un concours terminé peut être réouvert')

      const parties = await db.parties.where('concoursId').equals(concoursId).toArray()
      if (parties.length === 0) {
        await db.concours.update(concoursId, { statut: 'inscription', partieCourante: 0 })
        set((s) => {
          if (s.courant?.id === concoursId) {
            s.courant.statut = 'inscription'
            s.courant.partieCourante = 0
          }
          const c = s.concours.find((x) => x.id === concoursId)
          if (c) {
            c.statut = 'inscription'
            c.partieCourante = 0
          }
        })
        return
      }

      const dernierePartie = [...parties].sort((a, b) => b.numero - a.numero)[0]!
      const partieCourante = Math.max(0, dernierePartie.numero - 1)

      await db.transaction('rw', db.concours, db.parties, async () => {
        await db.parties.update(dernierePartie.id, { statut: 'en_cours' })
        await db.concours.update(concoursId, { statut: 'en_cours', partieCourante })
      })

      set((s) => {
        if (s.courant?.id === concoursId) {
          s.courant.statut = 'en_cours'
          s.courant.partieCourante = partieCourante
          s.partieEnCours = { ...dernierePartie, statut: 'en_cours' }
          s.byeJoueurId = dernierePartie.byeJoueurId ?? null
        }
        const c = s.concours.find((x) => x.id === concoursId)
        if (c) {
          c.statut = 'en_cours'
          c.partieCourante = partieCourante
        }
      })

      await get().chargerPartieEnCours(concoursId)
    },
  }))
)
