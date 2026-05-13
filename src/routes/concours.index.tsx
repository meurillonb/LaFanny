import React, { useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Card } from '@mui/material'
import { Add, FolderCopy } from '@mui/icons-material'
import { useConcoursStore } from '@/stores/concoursStore'
import { StatusBadge } from '@/components/ui/StatusBadge'

export const Route = createFileRoute('/concours/')({
  component: ConcoursPage,
})

function ConcoursPage() {
  const { concours, load } = useConcoursStore()
  useEffect(() => { void load() }, [load])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-secondary">Concours</h1>
        <div className="flex items-center gap-2">
          <Button component={Link as React.ElementType} to="/concours/archives" variant="outlined" size="small" startIcon={<FolderCopy />}>
            Archives
          </Button>
          <Button component={Link as React.ElementType} to="/concours/nouveau" variant="contained" size="small" startIcon={<Add />}>
            Nouveau
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {concours.map((c) => (
          <Link key={c.id} to="/concours/$concoursId" params={{ concoursId: c.id }}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-display text-sm text-secondary uppercase">{c.date}</p>
                  <p className="text-xs opacity-60">{c.format === 'EXT' ? '🌞 Extérieur' : '🏠 Intérieur'} · partie {c.partieCourante}/4</p>
                </div>
                <StatusBadge statut={c.statut} />
              </div>
            </Card>
          </Link>
        ))}
        {concours.length === 0 && (
          <p className="text-center opacity-50 py-8">Aucun concours</p>
        )}
      </div>
    </div>
  )
}
