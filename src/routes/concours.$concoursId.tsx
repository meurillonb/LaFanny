import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, createFileRoute, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Alert,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { Add, Female, History, Male, Remove, Replay } from '@mui/icons-material'
import { useConcoursStore } from '@/stores/concoursStore'
import { useJoueurStore } from '@/stores/joueurStore'
import { useParametresStore } from '@/stores/parametresStore'
import { calculerFormat } from '@/lib/format'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Genre, Joueur, Terrain } from '@/types/domain'

export const Route = createFileRoute('/concours/$concoursId')({
  component: ConcoursDetailPage,
})

// ── Composants de terrain ────────────────────────────────────

interface TerrainCardProps {
  terrain: Terrain
  joueurMap: Map<string, { label: string; genre: Genre }>
  onSaveScore: (id: string, scoreA: number, scoreB: number) => Promise<void>
}

function JoueurLine({ ids, joueurMap }: { ids: string[]; joueurMap: Map<string, { label: string; genre: Genre }> }) {
  return (
    <div className="flex flex-col gap-0.5">
      {ids.map((id) => {
        const j = joueurMap.get(id)
        return (
          <div key={id} className="flex items-center gap-1">
            {j?.genre === 'F'
              ? <Female sx={{ fontSize: 14, color: 'rgb(244 114 182)', flexShrink: 0 }} />
              : <Male sx={{ fontSize: 14, color: '#64748b', flexShrink: 0 }} />
            }
            <span className="text-sm">{j?.label ?? id}</span>
          </div>
        )
      })}
    </div>
  )
}

function TerrainCard({ terrain, joueurMap, onSaveScore }: TerrainCardProps) {
  const isSolo = terrain.equipeA.length === 0 || terrain.equipeB.length === 0
  const [scoreAInput, setScoreAInput] = useState(String(terrain.scoreA ?? 0))
  const [scoreBInput, setScoreBInput] = useState(String(terrain.scoreB ?? 0))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setScoreAInput(String(terrain.scoreA ?? 0))
    setScoreBInput(String(terrain.scoreB ?? 0))
  }, [terrain.scoreA, terrain.scoreB])

  const parsedScoreA = Number(scoreAInput)
  const parsedScoreB = Number(scoreBInput)
  const inputsValides = Number.isInteger(parsedScoreA)
    && Number.isInteger(parsedScoreB)
    && parsedScoreA >= 0
    && parsedScoreA <= 13
    && parsedScoreB >= 0
    && parsedScoreB <= 13
    && !(parsedScoreA === 13 && parsedScoreB === 13)

  const handleSave = async () => {
    if (!inputsValides) {
      setError('Saisir deux scores entiers entre 0 et 13, sans 13-13.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await onSaveScore(terrain.id, parsedScoreA, parsedScoreB)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible d\'enregistrer ce score')
    } finally {
      setSaving(false)
    }
  }

  const ajusterScoreA = (delta: number) => {
    const base = Number.isInteger(parsedScoreA) ? parsedScoreA : 0
    setScoreAInput(String(Math.max(0, Math.min(13, base + delta))))
  }

  const ajusterScoreB = (delta: number) => {
    const base = Number.isInteger(parsedScoreB) ? parsedScoreB : 0
    setScoreBInput(String(Math.max(0, Math.min(13, base + delta))))
  }

  return (
    <Card className="shadow-sm dark:border dark:border-gray-800">
      <div className="px-4 py-3 flex flex-col gap-3">
        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          Terrain {terrain.numero}
        </Typography>

        {/* Équipe A */}
        <div
          className={`flex items-center justify-between rounded-xl p-3 transition-colors ${
            terrain.gagnant === 'A'
              ? 'bg-green-100 dark:bg-green-900/40'
              : 'bg-gray-50 dark:bg-gray-800/60'
          }`}
        >
          <div className="flex-1">
            <JoueurLine ids={terrain.equipeA} joueurMap={joueurMap} />
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              size="small"
              sx={{ width: 40, height: 40 }}
              onClick={() => ajusterScoreA(-1)}
              disabled={isSolo || saving || parsedScoreA <= 0}
            >
              <Remove fontSize="small" />
            </IconButton>
            <TextField
              label="Score A"
              type="number"
              size="small"
              value={scoreAInput}
              disabled={isSolo || saving}
              onChange={(e) => setScoreAInput(e.target.value)}
              slotProps={{ htmlInput: { min: 0, max: 13, inputMode: 'numeric' } }}
              sx={{ width: 92 }}
            />
            <IconButton
              size="small"
              sx={{ width: 40, height: 40 }}
              onClick={() => ajusterScoreA(1)}
              disabled={isSolo || saving || parsedScoreA >= 13}
            >
              <Add fontSize="small" />
            </IconButton>
          </div>
        </div>

        <Typography variant="caption" sx={{ textAlign: 'center', opacity: 0.4 }}>vs</Typography>

        {/* Équipe B */}
        <div
          className={`flex items-center justify-between rounded-xl p-3 transition-colors ${
            terrain.gagnant === 'B'
              ? 'bg-green-100 dark:bg-green-900/40'
              : 'bg-gray-50 dark:bg-gray-800/60'
          }`}
        >
          <div className="flex-1">
            <JoueurLine ids={terrain.equipeB} joueurMap={joueurMap} />
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              size="small"
              sx={{ width: 40, height: 40 }}
              onClick={() => ajusterScoreB(-1)}
              disabled={isSolo || saving || parsedScoreB <= 0}
            >
              <Remove fontSize="small" />
            </IconButton>
            <TextField
              label="Score B"
              type="number"
              size="small"
              value={scoreBInput}
              disabled={isSolo || saving}
              onChange={(e) => setScoreBInput(e.target.value)}
              slotProps={{ htmlInput: { min: 0, max: 13, inputMode: 'numeric' } }}
              sx={{ width: 92 }}
            />
            <IconButton
              size="small"
              sx={{ width: 40, height: 40 }}
              onClick={() => ajusterScoreB(1)}
              disabled={isSolo || saving || parsedScoreB >= 13}
            >
              <Add fontSize="small" />
            </IconButton>
          </div>
        </div>

        {terrain.gagnant === null && !isSolo && (
          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            Saisir le score final. Le gagnant sera déduit automatiquement quand une équipe atteint 13.
          </Typography>
        )}

        {terrain.gagnant !== null && (
          <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
            Gagnant provisoire: équipe {terrain.gagnant} · départage général sur la différence de points.
          </Typography>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!isSolo && (
          <Button variant="outlined" onClick={() => void handleSave()} disabled={saving || !inputsValides}>
            {saving ? 'Enregistrement...' : 'Enregistrer le score'}
          </Button>
        )}
      </div>
    </Card>
  )
}

// ── Page principale ──────────────────────────────────────────

function ConcoursDetailPage() {
  const { concoursId } = Route.useParams()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  const {
    courant,
    inscrits,
    partieEnCours,
    terrainsEnCours,
    byeJoueurId,
    setCourant,
    chargerInscrits,
    chargerPartieEnCours,
    inscrire,
    tirerPartie,
    saisirScore,
    validerPartie,
    reouvrirDernierePartie,
  } = useConcoursStore()

  const { joueurs, load: loadJoueurs } = useJoueurStore()
  const { terrainsExt, terrainsInt, load: loadParametres } = useParametresStore()
  const [selection, setSelection] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const selectionInitialized = useRef(false)

  // Charge le concours, les joueurs et les paramètres au montage
  useEffect(() => {
    void setCourant(concoursId)
    void loadJoueurs()
    void loadParametres()
  }, [concoursId, setCourant, loadJoueurs, loadParametres])

  // Charge inscriptions et partie en cours quand le concours est connu
  useEffect(() => {
    if (!courant?.id) return
    void chargerInscrits(courant.id)
    void chargerPartieEnCours(courant.id)
  }, [courant?.id, chargerInscrits, chargerPartieEnCours])

  // Pré-sélectionne les joueurs présents (une seule fois)
  useEffect(() => {
    if (selectionInitialized.current || joueurs.length === 0) return
    selectionInitialized.current = true
    setSelection(new Set(joueurs.filter((j) => j.presentSessionSuivante).map((j) => j.id)))
  }, [joueurs])

  // ── Format live — utilise toujours les paramètres courants (pas le snapshot du concours) ──
  const nbTerrainsEffectif = courant?.format === 'EXT' ? terrainsExt : terrainsInt
  const selectedJoueurs: Joueur[] = useMemo(
    () => joueurs.filter((j) => selection.has(j.id)),
    [joueurs, selection],
  )
  const formatResult = useMemo(
    () => (courant ? calculerFormat(selectedJoueurs.length, nbTerrainsEffectif) : null),
    [courant, selectedJoueurs.length, nbTerrainsEffectif],
  )

  // ── Joueur map pour les noms ─────────────────────────────────
  const joueurMap = useMemo(() => {
    const map = new Map<string, { label: string; genre: Genre }>()
    for (const j of inscrits) {
      map.set(j.id, {
        label: j.prenom ? `${j.prenom} ${j.nom}` : j.nom,
        genre: j.genre,
      })
    }
    return map
  }, [inscrits])

  // ── Handlers ────────────────────────────────────────────────
  const handleToggle = useCallback(
    (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelection((prev) => {
        const next = new Set(prev)
        if (e.target.checked) next.add(id)
        else next.delete(id)
        return next
      })
    },
    [],
  )

  const handleTirage = async () => {
    if (!courant) return
    setLoading(true)
    setErrorMessage(null)
    try {
      await inscrire(courant.id, Array.from(selection))
      await tirerPartie()
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Échec du tirage')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveScore = useCallback(
    async (terrainId: string, scoreA: number, scoreB: number) => {
      await saisirScore(terrainId, scoreA, scoreB)
    },
    [saisirScore],
  )

  const handleValiderPartie = async () => {
    if (!partieEnCours) return
    setLoading(true)
    setErrorMessage(null)
    try {
      await validerPartie(partieEnCours.id)
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Validation impossible')
    } finally {
      setLoading(false)
    }
  }

  const handleTirerSuivante = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      await tirerPartie()
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Impossible de tirer la partie suivante')
    } finally {
      setLoading(false)
    }
  }

  const handleReouvrir = async () => {
    if (!courant) return
    setLoading(true)
    setErrorMessage(null)
    try {
      await reouvrirDernierePartie(courant.id)
      await navigate({ to: '/concours/$concoursId', params: { concoursId: courant.id } })
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Réouverture impossible')
    } finally {
      setLoading(false)
    }
  }

  if (pathname.endsWith('/historique')) {
    return <Outlet />
  }

  // ── Chargement ───────────────────────────────────────────────
  if (!courant) {
    return (
      <div className="flex justify-center py-16">
        <CircularProgress />
      </div>
    )
  }

  const dateStr = new Date(courant.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // ── Vue INSCRIPTION ──────────────────────────────────────────
  if (courant.statut === 'inscription') {
    const formatOk = formatResult?.ok === true ? formatResult.format : null
    const formatError = formatResult?.ok === false ? formatResult.error : null

    return (
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <Typography variant="h5" sx={{ fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase' }}>
            {dateStr}
          </Typography>
          <div className="flex items-center gap-2">
            <StatusBadge statut={courant.statut} />
            <Button
              variant="outlined"
              size="small"
              startIcon={<History fontSize="small" />}
              onClick={() => void navigate({ to: '/concours/$concoursId/historique', params: { concoursId } })}
            >
              Historique
            </Button>
          </div>
        </div>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {/* Liste joueurs */}
        <Card className="shadow-sm dark:border dark:border-gray-800">
          <div className="px-4 py-3">
            <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
              Joueurs ({joueurs.length})
            </Typography>
          </div>
          <Divider />
          {joueurs.map((joueur) => (
            <div key={joueur.id}>
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                  {joueur.genre === 'F'
                    ? <Female sx={{ fontSize: 16, color: 'rgb(244 114 182)', flexShrink: 0 }} />
                    : <Male sx={{ fontSize: 16, color: '#64748b', flexShrink: 0 }} />
                  }
                  <Typography variant="body2">
                    {joueur.prenom ? `${joueur.prenom} ${joueur.nom}` : joueur.nom}
                  </Typography>
                  
                </div>
                <Switch
                  checked={selection.has(joueur.id)}
                  onChange={handleToggle(joueur.id)}
                  size="small"
                />
              </div>
              <Divider />
            </div>
          ))}
        </Card>

        {/* Résumé format */}
        <Card className="shadow-sm dark:border dark:border-gray-800">
          <div className="px-4 py-3">
            {formatOk ? (
              <Typography variant="body2">
                <strong>{selectedJoueurs.length}</strong> joueurs sélectionnés ·{' '}
                <strong>{formatOk.terrains}</strong> terrains ·{' '}
                <strong>{formatOk.doublettes}</strong> doublettes + <strong>{formatOk.triplettes}</strong> triplettes
                {formatOk.bye && ' · 1 bye'}
              </Typography>
            ) : formatError ? (
              <Typography variant="body2" color="error">
                ⚠️ {formatError.message}
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ opacity: 0.5 }}>
                Sélectionnez des joueurs pour voir le format
              </Typography>
            )}
          </div>
        </Card>

        {/* Bouton tirage */}
        <Button
          variant="contained"
          fullWidth
          disabled={!formatOk || loading}
          onClick={() => void handleTirage()}
          sx={{ borderRadius: 3 }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Lancer le tirage →'}
        </Button>
      </div>
    )
  }

  // ── Vue TERMINÉ ──────────────────────────────────────────────
  if (courant.statut === 'termine') {
    return (
      <div className="flex flex-col gap-4">
        <Typography variant="h5" sx={{ fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase' }}>
          {dateStr}
        </Typography>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <Card className="shadow-sm dark:border dark:border-gray-800">
          <div className="px-4 py-6 text-center flex flex-col gap-3">
            <Typography variant="h6">✅ Concours terminé</Typography>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              4 parties jouées
            </Typography>
          </div>
        </Card>
        <Button
          variant="outlined"
          startIcon={<History />}
          onClick={() => void navigate({ to: '/concours/$concoursId/historique', params: { concoursId } })}
        >
          Consulter l'historique détaillé
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={<Replay />}
          disabled={loading}
          onClick={() => void handleReouvrir()}
        >
          Réouvrir la dernière partie
        </Button>
      </div>
    )
  }

  // ── Vue EN COURS — pas de partie active (besoin de tirer) ────
  if (!partieEnCours) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <Typography variant="h5" sx={{ fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase' }}>
            {dateStr}
          </Typography>
          <div className="flex items-center gap-2">
            <StatusBadge statut={courant.statut} />
            <Button
              variant="outlined"
              size="small"
              startIcon={<History fontSize="small" />}
              onClick={() => void navigate({ to: '/concours/$concoursId/historique', params: { concoursId } })}
            >
              Historique
            </Button>
          </div>
        </div>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <Card className="shadow-sm dark:border dark:border-gray-800">
          <div className="px-4 py-4 text-center">
            <Typography>
              Partie <strong>{courant.partieCourante}</strong>/4 terminée
            </Typography>
          </div>
        </Card>
        {courant.partieCourante < 4 && (
          <Button
            variant="contained"
            fullWidth
            disabled={loading}
            onClick={() => void handleTirerSuivante()}
            sx={{ borderRadius: 3 }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              `Tirer la partie ${courant.partieCourante + 1} →`
            )}
          </Button>
        )}
      </div>
    )
  }

  // ── Vue EN COURS — partie active ─────────────────────────────
  const allHaveWinner = terrainsEnCours.length > 0 && terrainsEnCours.every((t) => t.gagnant !== null)

  return (
    <div className="flex flex-col gap-4">
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <Typography variant="h5" sx={{ fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase' }}>
          {dateStr}
        </Typography>
        <div className="flex items-center gap-2">
          <Chip label={`Partie ${partieEnCours.numero}/4`} color="primary" />
          <Button
            variant="outlined"
            size="small"
            startIcon={<History fontSize="small" />}
            onClick={() => void navigate({ to: '/concours/$concoursId/historique', params: { concoursId } })}
          >
            Historique
          </Button>
        </div>
      </div>

      {/* Joueur Bye */}
      {byeJoueurId && (
        <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }} className="shadow-sm">
          <div className="px-4 py-3">
            <Typography variant="body2">
              🎯 <strong>Exempt (Bye) :</strong>{' '}
              {joueurMap.get(byeJoueurId)?.label ?? byeJoueurId}
            </Typography>
          </div>
        </Card>
      )}

      {/* Terrains */}
      {terrainsEnCours.map((terrain) => (
        <TerrainCard key={terrain.id} terrain={terrain} joueurMap={joueurMap} onSaveScore={handleSaveScore} />
      ))}

      {/* Bouton Valider */}
      <Button
        variant="contained"
        fullWidth
        disabled={!allHaveWinner || loading}
        onClick={() => void handleValiderPartie()}
        sx={{ borderRadius: 3 }}
      >
        {loading ? <CircularProgress size={20} color="inherit" /> : 'Valider la partie'}
      </Button>
    </div>
  )
}
