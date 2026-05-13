import type { Joueur, FormatMatch, Terrain, HistoriqueJoueur, Gagnant } from '@/types/domain'

// ── Utilitaires ──────────────────────────────────────────────

function shuffleFisherYates<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

function choisirJoueurBye(joueurs: Joueur[], historique: HistoriqueJoueur[]): Joueur {
  const byeMap = new Map<string, number>()
  for (const h of historique) byeMap.set(h.joueurId, h.byeCount)

  let minBye = Infinity
  for (const j of joueurs) {
    const count = byeMap.get(j.id) ?? 0
    if (count < minBye) minBye = count
  }
  const candidats = joueurs.filter((j) => (byeMap.get(j.id) ?? 0) === minBye)
  return candidats[Math.floor(Math.random() * candidats.length)]!
}

type EquipesPaires = { equipeA: Joueur[]; equipeB: Joueur[] }[]

function formerEquipes(joueurs: Joueur[], format: FormatMatch): EquipesPaires {
  const shuffled = shuffleFisherYates(joueurs)
  const terrains: EquipesPaires = []
  let idx = 0

  for (let i = 0; i < format.doublettes; i++) {
    terrains.push({
      equipeA: [shuffled[idx++]!, shuffled[idx++]!],
      equipeB: [shuffled[idx++]!, shuffled[idx++]!],
    })
  }
  for (let i = 0; i < format.triplettes; i++) {
    terrains.push({
      equipeA: [shuffled[idx++]!, shuffled[idx++]!, shuffled[idx++]!],
      equipeB: [shuffled[idx++]!, shuffled[idx++]!, shuffled[idx++]!],
    })
  }
  return terrains
}

function validerContrainteFemmes(terrains: EquipesPaires): boolean {
  for (const t of terrains) {
    if (t.equipeA.filter((j) => j.genre === 'F').length > 1) return false
    if (t.equipeB.filter((j) => j.genre === 'F').length > 1) return false
  }
  return true
}

function scorerTirage(terrains: EquipesPaires, historique: HistoriqueJoueur[]): number {
  const histMap = new Map<string, Set<string>>()
  for (const h of historique) histMap.set(h.joueurId, new Set(h.partenairesIds))

  let score = 0
  for (const t of terrains) {
    const checkTeam = (equipe: Joueur[]) => {
      for (let i = 0; i < equipe.length; i++) {
        for (let j = i + 1; j < equipe.length; j++) {
          if (histMap.get(equipe[i]!.id)?.has(equipe[j]!.id)) score++
        }
      }
    }
    checkTeam(t.equipeA)
    checkTeam(t.equipeB)
  }
  return score
}

// ── API publique ─────────────────────────────────────────────

/**
 * Tire aléatoirement les équipes pour une partie.
 * Mute `format.joueurByeId` si un bye est nécessaire.
 * Garantit max 1 femme par équipe (Monte-Carlo, 100 tentatives).
 * Minimise les rematches entre partenaires déjà rencontrés.
 */
export function tirerPartie(
  joueurs: Joueur[],
  format: FormatMatch,
  historique: HistoriqueJoueur[],
): Terrain[] {
  let joueursDispos = joueurs

  if (format.bye) {
    const byeJoueur = choisirJoueurBye(joueurs, historique)
    format.joueurByeId = byeJoueur.id
    joueursDispos = joueurs.filter((j) => j.id !== byeJoueur.id)
  }

  let meilleurTirage: EquipesPaires | null = null
  let meilleurScore = Infinity
  const MAX = 100

  for (let i = 0; i < MAX; i++) {
    const essai = formerEquipes(joueursDispos, format)
    if (!validerContrainteFemmes(essai)) continue
    const score = scorerTirage(essai, historique)
    if (score < meilleurScore) {
      meilleurScore = score
      meilleurTirage = essai
    }
    if (score === 0) break
  }

  // Fallback sans contrainte femmes (cas impossible en théorie, sécurité)
  if (!meilleurTirage) {
    for (let i = 0; i < MAX; i++) {
      const essai = formerEquipes(joueursDispos, format)
      const score = scorerTirage(essai, historique)
      if (score < meilleurScore) {
        meilleurScore = score
        meilleurTirage = essai
      }
    }
  }

  return (meilleurTirage ?? []).map((t, i) => ({
    id: crypto.randomUUID(),
    partieId: '',
    numero: i + 1,
    equipeA: t.equipeA.map((j) => j.id),
    equipeB: t.equipeB.map((j) => j.id),
    scoreA: null,
    scoreB: null,
    gagnant: null as Gagnant,
  }))
}

/**
 * Met à jour l'historique cumulatif avec les terrains d'une partie.
 * @param byeJoueurId ID du joueur exempt — son byeCount est incrémenté.
 */
export function construireHistorique(
  terrains: Terrain[],
  historiquePrecedent: HistoriqueJoueur[],
  byeJoueurId?: string,
): HistoriqueJoueur[] {
  const histMap = new Map<string, HistoriqueJoueur>()
  for (const h of historiquePrecedent) {
    histMap.set(h.joueurId, {
      ...h,
      partenairesIds: [...h.partenairesIds],
      adversairesIds: [...h.adversairesIds],
    })
  }

  const getHist = (id: string): HistoriqueJoueur => {
    if (!histMap.has(id)) {
      histMap.set(id, { joueurId: id, partenairesIds: [], adversairesIds: [], byeCount: 0 })
    }
    return histMap.get(id)!
  }

  for (const terrain of terrains) {
    for (const idA of terrain.equipeA) {
      const h = getHist(idA)
      for (const p of terrain.equipeA) {
        if (p !== idA && !h.partenairesIds.includes(p)) h.partenairesIds.push(p)
      }
      for (const adv of terrain.equipeB) {
        if (!h.adversairesIds.includes(adv)) h.adversairesIds.push(adv)
      }
    }
    for (const idB of terrain.equipeB) {
      const h = getHist(idB)
      for (const p of terrain.equipeB) {
        if (p !== idB && !h.partenairesIds.includes(p)) h.partenairesIds.push(p)
      }
      for (const adv of terrain.equipeA) {
        if (!h.adversairesIds.includes(adv)) h.adversairesIds.push(adv)
      }
    }
  }

  if (byeJoueurId) {
    const h = getHist(byeJoueurId)
    h.byeCount++
  }

  return Array.from(histMap.values())
}
