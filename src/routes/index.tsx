import React, { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Card, CardContent, Typography, Box } from '@mui/material'
import { EmojiEvents, Group, Add, PlayArrow, ChevronRight, Bolt } from '@mui/icons-material'
import { useConcoursStore } from '@/stores/concoursStore'
import type { Concours, StatutConcours } from '@/types/domain'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function StatutBadge({ statut }: { statut: StatutConcours }) {
  const styles: Record<StatutConcours, string> = {
    inscription: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    en_cours:    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    termine:     'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  }
  const labels: Record<StatutConcours, string> = {
    inscription: 'Inscriptions',
    en_cours:    'En cours',
    termine:     'Terminé',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${styles[statut]}`}>
      {statut === 'en_cours' && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}
      {labels[statut]}
    </span>
  )
}

function Avatar({ label, size = 'md', color = 'primary' }: { label: string; size?: 'sm' | 'md' | 'lg'; color?: 'primary' | 'secondary' }) {
  const sizes = { sm: 'h-9 w-9 text-sm', md: 'h-14 w-14 text-lg', lg: 'h-16 w-16 text-xl' }
  const colors = {
    primary:   'bg-primary/10 text-primary dark:bg-primary/20',
    secondary: 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-gray-300',
  }
  return (
    <span className={`flex items-center justify-center rounded-full font-display font-bold select-none ${sizes[size]} ${colors[color]}`}>
      {label}
    </span>
  )
}

function TournoiCard({ concours }: { concours: Concours }) {
  const formatLabel = concours.format === 'EXT' ? '⛳ Extérieur' : '🏠 Intérieur'
  return (
    <Link to="/concours/$concoursId" params={{ concoursId: concours.id }}>
      <article className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer bg-white shadow-md hover:shadow-lg dark:bg-[#1E1E1E] dark:border dark:border-gray-800 transition-all duration-200">
        <span className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 dark:bg-primary/20">
          <EmojiEvents className="text-primary" fontSize="small" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-gray-800 dark:text-gray-100 text-sm uppercase tracking-wide truncate">
            {new Date(concours.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-400 dark:text-gray-500">{formatLabel}</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500">
              <Group sx={{ fontSize: 12 }} />
              {concours.nbTerrains} terrains
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatutBadge statut={concours.statut} />
          <ChevronRight sx={{ fontSize: 16, color: 'text.disabled' }} />
        </div>
      </article>
    </Link>
  )
}

function MatchRapide() {
  const [scoreA, setScoreA] = useState(0)
  const [scoreB, setScoreB] = useState(0)
  const scoreMax = 13
  const isFinished = scoreA === scoreMax || scoreB === scoreMax
  const gagnant = scoreA === scoreMax ? 'Équipe A' : scoreB === scoreMax ? 'Équipe B' : null

  return (
    <section>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Bolt color="primary" fontSize="small" />
        <Typography variant="overline" sx={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, color: 'text.secondary' }}>
          Match Rapide
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            {/* Équipe A */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flex: 1 }}>
              <Avatar label="A" size="md" color="primary" />
              <Typography variant="caption" color="text.secondary">Équipe A</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <button
                  onClick={() => setScoreA((s) => Math.max(0, s - 1))}
                  disabled={isFinished}
                  className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 enabled:hover:bg-primary/10 enabled:hover:text-primary transition-colors text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Retirer un point Équipe A"
                >
                  −
                </button>
                <Typography variant="h4" sx={{ fontFamily: 'Oswald, sans-serif', minWidth: '2ch', textAlign: 'center' }}>{scoreA}</Typography>
                <button
                  onClick={() => setScoreA((s) => Math.min(scoreMax, s + 1))}
                  disabled={isFinished || scoreA >= scoreMax}
                  className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 enabled:hover:bg-primary/10 enabled:hover:text-primary transition-colors text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Ajouter un point Équipe A"
                >
                  +
                </button>
              </Box>
            </Box>
            {/* VS */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 20, color: 'text.disabled' }}>VS</Typography>
              {scoreA !== scoreB && <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>{scoreA > scoreB ? '◄' : '►'}</Typography>}
            </Box>
            {/* Équipe B */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flex: 1 }}>
              <Avatar label="B" size="md" color="secondary" />
              <Typography variant="caption" color="text.secondary">Équipe B</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <button
                  onClick={() => setScoreB((s) => Math.max(0, s - 1))}
                  disabled={isFinished}
                  className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 enabled:hover:bg-secondary/10 enabled:hover:text-secondary transition-colors text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Retirer un point Équipe B"
                >
                  −
                </button>
                <Typography variant="h4" sx={{ fontFamily: 'Oswald, sans-serif', minWidth: '2ch', textAlign: 'center' }}>{scoreB}</Typography>
                <button
                  onClick={() => setScoreB((s) => Math.min(scoreMax, s + 1))}
                  disabled={isFinished || scoreB >= scoreMax}
                  className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 enabled:hover:bg-secondary/10 enabled:hover:text-secondary transition-colors text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Ajouter un point Équipe B"
                >
                  +
                </button>
              </Box>
            </Box>
          </Box>
          {isFinished && (
            <Typography variant="body2" color="success.main" sx={{ mt: 2, textAlign: 'center', fontWeight: 700 }}>
              Partie terminée: {gagnant} gagne {scoreMax} à {Math.min(scoreA, scoreB)}
            </Typography>
          )}
          <Box sx={{ mt: 2.5 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<PlayArrow />}
              sx={{ height: 48, fontFamily: 'Oswald, sans-serif', fontSize: '1rem', letterSpacing: '0.05em' }}
              onClick={() => { setScoreA(0); setScoreB(0) }}
            >
              {isFinished ? 'Nouvelle partie' : 'Démarrer Match'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </section>
  )
}

function HomePage() {
  const { concours, load } = useConcoursStore()
  useEffect(() => { load() }, [load])

  const actifs = concours.filter((c) => c.statut !== 'termine').slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Typography variant="h5" sx={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700 }}>Bonjour 👋</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Prêt pour une nouvelle mène ?</Typography>
      </div>

      <section>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEvents color="primary" fontSize="small" />
            <Typography variant="overline" sx={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, color: 'text.secondary' }}>
              Tournois en cours
            </Typography>
          </Box>
          <Button component={Link as React.ElementType} to="/concours/nouveau" variant="contained" size="small" startIcon={<Add />}>
            Nouveau
          </Button>
        </Box>

        {actifs.length === 0 ? (
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4, textAlign: 'center' }}>
              <span className="text-3xl">🎯</span>
              <Typography variant="body2" color="text.secondary">Aucun tournoi en cours.</Typography>
              <Button component={Link as React.ElementType} to="/concours/nouveau" variant="contained" startIcon={<Add />}>
                Créer un tournoi
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">{actifs.map((c) => <TournoiCard key={c.id} concours={c} />)}</div>
        )}
      </section>

      <MatchRapide />
      <div className="h-2" />
    </div>
  )
}
