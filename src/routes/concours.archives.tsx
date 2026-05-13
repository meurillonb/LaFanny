import { useEffect, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Alert, Button, Card, Chip, CircularProgress, Divider, Typography } from '@mui/material'
import { FolderCopy, Replay } from '@mui/icons-material'
import { db } from '@/lib/db'
import { useConcoursStore } from '@/stores/concoursStore'
import type { Concours } from '@/types/domain'

export const Route = createFileRoute('/concours/archives')({
  component: ConcoursArchivesPage,
})

function ConcoursArchivesPage() {
  const navigate = useNavigate()
  const { reouvrirDernierePartie } = useConcoursStore()

  const [archives, setArchives] = useState<Concours[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const charger = async () => {
      setLoading(true)
      setError(null)
      try {
        const termines = await db.concours.where('statut').equals('termine').reverse().sortBy('date')
        if (active) setArchives(termines.reverse())
      } catch {
        if (active) setError('Impossible de charger les archives')
      } finally {
        if (active) setLoading(false)
      }
    }
    void charger()
    return () => { active = false }
  }, [])

  const handleReopen = async (concoursId: string) => {
    setBusyId(concoursId)
    setError(null)
    try {
      await reouvrirDernierePartie(concoursId)
      await navigate({ to: '/concours/$concoursId', params: { concoursId } })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Réouverture impossible')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Typography variant="h5" sx={{ fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase' }}>
          Archives concours
        </Typography>
        <Chip icon={<FolderCopy />} label={`${archives.length} terminé(s)`} />
      </div>

      {error && <Alert severity="error">{error}</Alert>}

      {archives.length === 0 && (
        <Card className="shadow-sm dark:border dark:border-gray-800">
          <div className="px-4 py-6 text-center">
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Aucun concours archivé pour le moment.
            </Typography>
          </div>
        </Card>
      )}

      {archives.map((concours) => (
        <Card key={concours.id} className="shadow-sm dark:border dark:border-gray-800">
          <div className="px-4 py-3 flex items-start justify-between gap-2">
            <div>
              <Typography variant="subtitle1">
                {new Date(concours.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.65 }}>
                {concours.format === 'EXT' ? 'Extérieur' : 'Intérieur'} · {concours.partieCourante}/4 parties
              </Typography>
            </div>
            <Chip size="small" color="success" label="Terminé" />
          </div>
          <Divider />
          <div className="px-4 py-3 flex gap-2">
            <Button
              variant="outlined"
              fullWidth
              onClick={() => void navigate({ to: '/concours/$concoursId/historique', params: { concoursId: concours.id } })}
            >
              Consulter
            </Button>
            <Button
              variant="contained"
              color="warning"
              fullWidth
              startIcon={<Replay />}
              disabled={busyId === concours.id}
              onClick={() => void handleReopen(concours.id)}
            >
              Réouvrir
            </Button>
          </div>
        </Card>
      ))}

      <Button component={Link} to="/concours" variant="text">Retour aux concours</Button>
    </div>
  )
}
