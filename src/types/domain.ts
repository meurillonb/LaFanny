// ── Joueurs ──────────────────────────────────────────────────
export type Genre = 'M' | 'F'

/** Rôle préférentiel du joueur sur le terrain */
export type RoleJoueur = 'pointeur' | 'tireur' | 'milieu'

/** Niveau estimé du joueur */
export type NiveauJoueur = 'debutant' | 'intermediaire' | 'confirme' | 'expert'

export interface Joueur {
  id: string
  nom: string
  prenom: string | null
  genre: Genre
  /** Rôle préférentiel — null si non renseigné */
  role: RoleJoueur | null
  /** Niveau estimé — null si non renseigné */
  niveau: NiveauJoueur | null
  actif: boolean
  presentSessionSuivante: boolean
  createdAt: string
}

// ── Concours ─────────────────────────────────────────────────
export type FormatConcours = 'EXT' | 'INT'
export type StatutConcours = 'inscription' | 'en_cours' | 'termine'

export interface Concours {
  id: string
  date: string
  format: FormatConcours
  statut: StatutConcours
  partieCourante: number
  nbTerrains: number
  createdAt: string
}

// ── Format du tirage ─────────────────────────────────────────
export interface FormatMatch {
  doublettes: number
  triplettes: number
  terrains: number
  bye: boolean
  joueurByeId?: string
}

// ── Inscriptions ─────────────────────────────────────────────
export interface Inscription {
  id: string
  concoursId: string
  joueurId: string
  nOrdre: number
  presentSessionSuivante: boolean
}

// ── Parties & Terrains ───────────────────────────────────────
export type StatutPartie = 'tirage' | 'en_cours' | 'termine'
export type Gagnant = 'A' | 'B' | null

export interface Partie {
  id: string
  concoursId: string
  numero: 1 | 2 | 3 | 4
  statut: StatutPartie
  byeJoueurId?: string
}

export interface Terrain {
  id: string
  partieId: string
  numero: number
  equipeA: string[]
  equipeB: string[]
  scoreA: number | null
  scoreB: number | null
  gagnant: Gagnant
}

// ── Classement ───────────────────────────────────────────────
export interface LigneClassement {
  joueurId: string
  nomJoueur: string
  partiesGagnees: number
  scoreTotal: number
  classement: number
  gainBrut: number
  gainFinal: number
  isBye?: boolean
}

// ── Paramètres ───────────────────────────────────────────────
export interface GainRow {
  sommePercue: number
  partClub?: number
  gains: number[]
}

export interface Parametres {
  terrainsExt: number
  terrainsInt: number
  gainsEte: Record<number, GainRow>
  gainsHiver: Record<number, GainRow>
}

// ── Tirage / historique ──────────────────────────────────────
export interface HistoriqueJoueur {
  joueurId: string
  partenairesIds: string[]
  adversairesIds: string[]
  byeCount: number
}
