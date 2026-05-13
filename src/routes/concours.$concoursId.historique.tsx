import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  Alert,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { History, Replay } from '@mui/icons-material'
import { db } from '@/lib/db'
import { construireStatsConcours } from '@/lib/concoursStats'
import { useConcoursStore } from '@/stores/concoursStore'
import type { Concours, Inscription, Joueur, Partie, Terrain } from '@/types/domain'

export const Route = createFileRoute('/concours/$concoursId/historique')({
  component: ConcoursHistoriquePage,
})

function ConcoursHistoriquePage() {
  const { concoursId } = Route.useParams()
  const navigate = useNavigate()
  const { reouvrirDernierePartie } = useConcoursStore()

  const [concours, setConcours] = useState<Concours | null>(null)
  const [joueurs, setJoueurs] = useState<Joueur[]>([])
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [parties, setParties] = useState<Partie[]>([])
  const [terrains, setTerrains] = useState<Terrain[]>([])
  const [loading, setLoading] = useState(true)
  const [reopenBusy, setReopenBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const charger = async () => {
      setLoading(true)
      setError(null)
      try {
        const c = await db.concours.get(concoursId)
        if (!c) {
          setError('Concours introuvable')
          return
        }

        const ins = await db.inscriptions.where('concoursId').equals(concoursId).toArray()
        const joueurIds = ins.map((i) => i.joueurId)
        const js = joueurIds.length > 0
          ? (await db.joueurs.bulkGet(joueurIds)).filter((j): j is NonNullable<typeof j> => j != null)
          : []
        const ps = await db.parties.where('concoursId').equals(concoursId).toArray()
        const ts = ps.length > 0
          ? await db.terrains.where('partieId').anyOf(ps.map((p) => p.id)).toArray()
          : []

        if (!active) return
        setConcours(c)
        setInscriptions(ins)
        setJoueurs(js)
        setParties(ps)
        setTerrains(ts)
      } catch {
        if (!active) return
        setError('Erreur de chargement des statistiques')
      } finally {
        if (active) setLoading(false)
      }
    }

    void charger()
    return () => { active = false }
  }, [concoursId])

  const stats = useMemo(
    () => construireStatsConcours(joueurs, inscriptions, parties, terrains),
    [joueurs, inscriptions, parties, terrains],
  )

  const handleReopen = async () => {
    if (!concours || concours.statut !== 'termine') return
    setReopenBusy(true)
    setError(null)
    try {
      await reouvrirDernierePartie(concours.id)
      await navigate({ to: '/concours/$concoursId', params: { concoursId: concours.id } })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de réouvrir le concours')
    } finally {
      setReopenBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <CircularProgress />
      </div>
    )
  }

  if (error || !concours) {
    return (
      <div className="flex flex-col gap-4">
        <Alert severity="error">{error ?? 'Concours introuvable'}</Alert>
        <Button component={Link} to="/concours" variant="outlined">Retour aux concours</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Typography variant="h5" sx={{ fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase' }}>
            Historique détaillé
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {new Date(concours.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
        </div>
        <Chip icon={<History />} label={`${stats.partiesTerminees}/${Math.max(stats.totalParties, 4)} parties terminées`} color="primary" />
      </div>

      {error && <Alert severity="error">{error}</Alert>}

      {concours.statut === 'termine' && (
        <Alert
          severity="info"
          action={(
            <Button
              color="inherit"
              size="small"
              startIcon={<Replay />}
              disabled={reopenBusy}
              onClick={() => void handleReopen()}
            >
              Réouvrir
            </Button>
          )}
        >
          Concours archivé. Vous pouvez consulter l'historique complet ou réouvrir la dernière partie.
        </Alert>
      )}

      <Card className="shadow-sm dark:border dark:border-gray-800 overflow-x-auto">
        <div className="px-4 py-3">
          <Typography variant="subtitle1">Classement cumulé</Typography>
        </div>
        <Divider />
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Joueur</TableCell>
              <TableCell align="right">Gagnées</TableCell>
              <TableCell align="right">Jouées</TableCell>
              <TableCell align="right">Points +</TableCell>
              <TableCell align="right">Points -</TableCell>
              <TableCell align="right">Diff</TableCell>
              <TableCell align="right">Byes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.classement.map((ligne) => (
              <TableRow key={ligne.joueurId}>
                <TableCell>{ligne.classement}</TableCell>
                <TableCell>{ligne.nomJoueur}</TableCell>
                <TableCell align="right">{ligne.partiesGagnees}</TableCell>
                <TableCell align="right">{ligne.partiesJouees}</TableCell>
                <TableCell align="right">{ligne.pointsPour}</TableCell>
                <TableCell align="right">{ligne.pointsContre}</TableCell>
                <TableCell align="right">{ligne.diffPoints}</TableCell>
                <TableCell align="right">{ligne.byes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex flex-col gap-3">
        {stats.historique.map((partie) => (
          <Card key={partie.id} className="shadow-sm dark:border dark:border-gray-800">
            <div className="px-4 py-3 flex items-center justify-between gap-2">
              <Typography variant="subtitle2">Partie {partie.numero}</Typography>
              <Chip
                size="small"
                color={partie.statut === 'termine' ? 'success' : 'warning'}
                label={partie.statut === 'termine' ? 'Terminée' : 'En cours'}
              />
            </div>
            <Divider />
            <div className="px-4 py-3 flex flex-col gap-2">
              {partie.byeJoueur && (
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Bye: {partie.byeJoueur}
                </Typography>
              )}
              {partie.terrains.length === 0 && (
                <Typography variant="body2" sx={{ opacity: 0.6 }}>Aucun terrain enregistré</Typography>
              )}
              {partie.terrains.map((terrain) => (
                <div key={terrain.id} className="rounded-lg bg-gray-50 dark:bg-gray-800/60 px-3 py-2">
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Terrain {terrain.numero}
                  </Typography>
                  <Typography variant="body2">
                    {terrain.equipeA.join(' / ')}
                    {'  '}
                    {terrain.scoreA ?? '-'} - {terrain.scoreB ?? '-'}
                    {'  '}
                    {terrain.equipeB.length > 0 ? terrain.equipeB.join(' / ') : 'Exempt'}
                  </Typography>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Button
        variant="outlined"
        onClick={() => void navigate({ to: '/concours/$concoursId', params: { concoursId } })}
      >
        Retour au concours
      </Button>
    </div>
  )
}
