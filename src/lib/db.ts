import Dexie, { type EntityTable } from 'dexie'
import type { Joueur, Concours, Inscription, Partie, Terrain, LigneClassement, Parametres } from '@/types/domain'

export interface LocalJoueur extends Joueur { _syncedAt?: number; _dirty?: boolean }
export interface LocalTerrain extends Terrain { _dirty?: boolean }

export interface SyncQueueItem {
  id?: number
  table: string
  operation: 'insert' | 'update' | 'delete'
  recordId: string
  payload: unknown
  createdAt: number
}

export interface LocalParametres extends Parametres { id: 1 }

class LaFannyDB extends Dexie {
  joueurs!:      EntityTable<LocalJoueur,   'id'>
  concours!:     EntityTable<Concours,      'id'>
  inscriptions!: EntityTable<Inscription,   'id'>
  parties!:      EntityTable<Partie,        'id'>
  terrains!:     EntityTable<LocalTerrain,  'id'>
  classements!:  EntityTable<LigneClassement, 'joueurId'>
  parametres!:   EntityTable<LocalParametres, 'id'>
  syncQueue!:    EntityTable<SyncQueueItem, 'id'>

  constructor() {
    super('LaFanny')
    this.version(1).stores({
      joueurs:      'id, nom, actif, presentSessionSuivante',
      concours:     'id, date, statut, saison',
      inscriptions: 'id, concoursId, joueurId',
      parties:      'id, concoursId, numero, statut',
      terrains:     'id, partieId, numero',
      classements:  'joueurId, concoursId, classement',
      parametres:   'id',
      syncQueue:    '++id, table, createdAt',
    })
    // v2 : ajout des champs role et niveau sur les joueurs
    this.version(2).stores({
      joueurs: 'id, nom, actif, presentSessionSuivante, role, niveau',
    })
  }
}

export const db = new LaFannyDB()

export async function seedParametresDefaut(): Promise<void> {
  const existing = await db.parametres.get(1)
  if (!existing) {
    await db.parametres.put({ id: 1, terrainsExt: 12, terrainsInt: 11, gainsEte: {}, gainsHiver: {} })
  }
}
