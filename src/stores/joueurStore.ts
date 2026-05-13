import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Joueur } from '@/types/domain'
import { db } from '@/lib/db'

export interface ImportStats { imported: number; skipped: number }

interface JoueurState {
  joueurs: Joueur[]
  loading: boolean
  load: () => Promise<void>
  add: (j: Omit<Joueur, 'id' | 'createdAt'>) => Promise<void>
  update: (id: string, patch: Partial<Joueur>) => Promise<void>
  remove: (id: string) => Promise<void>
  setPresent: (id: string, present: boolean) => Promise<void>
  /** Import une liste de joueurs CSV — ignore les doublons (même nom) */
  importJoueurs: (rows: Omit<Joueur, 'id' | 'createdAt'>[]) => Promise<ImportStats>
}

export const useJoueurStore = create<JoueurState>()(
  immer((set, get) => ({
    joueurs: [],
    loading: false,

    load: async () => {
      set((s) => { s.loading = true })
      const tous = await db.joueurs.toArray()
      const actifs = tous.filter((j) => j.actif)
      set((s) => { s.joueurs = actifs; s.loading = false })
    },

    add: async (j) => {
      const joueur: Joueur = { ...j, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
      await db.joueurs.add({ ...joueur, _dirty: true })
      set((s) => { s.joueurs.push(joueur) })
    },

    update: async (id, patch) => {
      await db.joueurs.update(id, { ...patch, _dirty: true })
      set((s) => {
        const idx = s.joueurs.findIndex((j) => j.id === id)
        if (idx !== -1) Object.assign(s.joueurs[idx]!, patch)
      })
    },

    remove: async (id) => {
      await db.joueurs.update(id, { actif: false, _dirty: true })
      set((s) => { s.joueurs = s.joueurs.filter((j) => j.id !== id) })
    },

    setPresent: async (id, present) => {
      await db.joueurs.update(id, { presentSessionSuivante: present, _dirty: true })
      set((s) => {
        const j = s.joueurs.find((x) => x.id === id)
        if (j) j.presentSessionSuivante = present
      })
    },

    importJoueurs: async (rows) => {
      // Noms existants pour éviter les doublons
      const existing = new Set(
        get().joueurs.map((j) => j.nom.toUpperCase().trim())
      )
      const toAdd: Joueur[] = []
      let skipped = 0

      for (const row of rows) {
        if (existing.has(row.nom.toUpperCase().trim())) {
          skipped++
          continue
        }
        const joueur: Joueur = {
          ...row,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        toAdd.push(joueur)
        existing.add(joueur.nom.toUpperCase().trim())
      }

      if (toAdd.length > 0) {
        await db.joueurs.bulkAdd(toAdd.map((j) => ({ ...j, _dirty: true })))
        set((s) => { s.joueurs.push(...toAdd) })
      }

      return { imported: toAdd.length, skipped }
    },
  }))
)
