import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Parametres } from '@/types/domain'
import { db, seedParametresDefaut } from '@/lib/db'
import { TERRAINS_EXT_DEFAULT, TERRAINS_INT_DEFAULT } from '@/utils/constants'

interface ParametresState extends Parametres {
  load: () => Promise<void>
  setTerrainsExt: (n: number) => Promise<void>
  setTerrainsInt: (n: number) => Promise<void>
}

export const useParametresStore = create<ParametresState>()(
  immer((set) => ({
    terrainsExt: TERRAINS_EXT_DEFAULT,
    terrainsInt: TERRAINS_INT_DEFAULT,
    gainsEte: {},
    gainsHiver: {},

    load: async () => {
      await seedParametresDefaut()
      const p = await db.parametres.get(1)
      if (p) set((s) => { s.terrainsExt = p.terrainsExt; s.terrainsInt = p.terrainsInt; s.gainsEte = p.gainsEte; s.gainsHiver = p.gainsHiver })
    },

    setTerrainsExt: async (n) => {
      await db.parametres.update(1, { terrainsExt: n })
      set((s) => { s.terrainsExt = n })
    },

    setTerrainsInt: async (n) => {
      await db.parametres.update(1, { terrainsInt: n })
      set((s) => { s.terrainsInt = n })
    },
  }))
)
