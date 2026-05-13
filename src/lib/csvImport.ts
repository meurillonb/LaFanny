import type { Joueur, Genre, RoleJoueur, NiveauJoueur } from '@/types/domain'

export interface CsvRow {
  nom: string
  prenom: string
  genre: string
  role: string
  niveau: string
  actif: string
  presentSessionSuivante: string
}

export interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
  joueurs: Omit<Joueur, 'id' | 'createdAt'>[]
}

const GENRES_VALIDES = new Set<string>(['M', 'F'])
const ROLES_VALIDES = new Set<string>(['pointeur', 'tireur', 'milieu', ''])
const NIVEAUX_VALIDES = new Set<string>(['debutant', 'intermediaire', 'confirme', 'expert', ''])

/** Parse un fichier CSV (séparateur virgule ou point-virgule) en tableau de joueurs */
export function parseCsvJoueurs(content: string): ImportResult {
  const lines = content.trim().split(/\r?\n/)
  if (lines.length < 2) {
    return { imported: 0, skipped: 0, errors: ['Fichier vide ou sans données'], joueurs: [] }
  }

  // Détection du séparateur
  const sep = lines[0]!.includes(';') ? ';' : ','

  // Normalisation des en-têtes (insensible à la casse, sans BOM)
  const headers = lines[0]!
    .replace(/^\uFEFF/, '') // BOM UTF-8
    .split(sep)
    .map((h) => h.trim().toLowerCase().replace(/"/g, ''))

  const COL = {
    nom:    headers.indexOf('nom'),
    prenom: headers.indexOf('prenom'),
    genre:  headers.indexOf('genre'),
    role:   headers.indexOf('role'),
    niveau: headers.indexOf('niveau'),
    actif:  headers.indexOf('actif'),
    present: headers.indexOf('presentsessionsuivante'),
  }

  if (COL.nom === -1) {
    return { imported: 0, skipped: 0, errors: ['Colonne "nom" introuvable dans le fichier CSV'], joueurs: [] }
  }

  const joueurs: Omit<Joueur, 'id' | 'createdAt'>[] = []
  const errors: string[] = []
  let skipped = 0

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!.trim()
    if (!line) continue

    const cells = line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ''))
    const get = (col: number) => (col >= 0 ? (cells[col] ?? '') : '')

    const nom = get(COL.nom).toUpperCase().trim()
    if (!nom) { skipped++; continue }

    const genre = get(COL.genre).toUpperCase() as Genre
    if (COL.genre >= 0 && !GENRES_VALIDES.has(genre)) {
      errors.push(`Ligne ${i + 1} : genre "${get(COL.genre)}" invalide (M ou F attendu) — ignorée`)
      skipped++
      continue
    }

    const roleRaw = get(COL.role).toLowerCase()
    if (!ROLES_VALIDES.has(roleRaw)) {
      errors.push(`Ligne ${i + 1} : rôle "${roleRaw}" invalide — pointeur/tireur/milieu attendu`)
    }

    const niveauRaw = get(COL.niveau).toLowerCase()
    if (!NIVEAUX_VALIDES.has(niveauRaw)) {
      errors.push(`Ligne ${i + 1} : niveau "${niveauRaw}" invalide — debutant/intermediaire/confirme/expert attendu`)
    }

    joueurs.push({
      nom,
      prenom: get(COL.prenom) || null,
      genre: GENRES_VALIDES.has(genre) ? genre : 'M',
      role:   (ROLES_VALIDES.has(roleRaw) && roleRaw ? roleRaw as RoleJoueur : null),
      niveau: (NIVEAUX_VALIDES.has(niveauRaw) && niveauRaw ? niveauRaw as NiveauJoueur : null),
      actif:  get(COL.actif).toLowerCase() !== 'false',
      presentSessionSuivante: get(COL.present).toLowerCase() !== 'false',
    })
  }

  return { imported: joueurs.length, skipped, errors, joueurs }
}
