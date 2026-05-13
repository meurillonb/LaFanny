import React, { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@mui/material'
import { useConcoursStore } from '@/stores/concoursStore'
import { useParametresStore } from '@/stores/parametresStore'
import type { FormatConcours } from '@/types/domain'

export const Route = createFileRoute('/concours/nouveau')({
  component: NouveauConcoursPage,
})

function NouveauConcoursPage() {
  const navigate = useNavigate()
  const { creer } = useConcoursStore()
  const { terrainsExt, terrainsInt, load: loadParametres } = useParametresStore()
  const [format, setFormat] = useState<FormatConcours>('EXT')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0] ?? '')

  // Charge les paramètres depuis Dexie avant d'afficher le formulaire
  useEffect(() => { void loadParametres() }, [loadParametres])

  const nbTerrains = format === 'EXT' ? terrainsExt : terrainsInt

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const c = await creer({ date, format, nbTerrains })
    await navigate({ to: '/concours/$concoursId', params: { concoursId: c.id } })
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl text-secondary">Nouveau concours</h1>

      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm opacity-70">Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E1E1E] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-sm opacity-70">Lieu</span>
          <div className="grid grid-cols-2 gap-2">
            {(['EXT', 'INT'] as FormatConcours[]).map((f) => (
              <button key={f} type="button" onClick={() => setFormat(f)}
                className={`py-2 rounded-full border text-sm font-display transition-colors ${format === f ? 'border-primary bg-primary text-white' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E1E1E]'}`}>
                {f === 'EXT' ? '🌞 Extérieur' : '🏠 Intérieur'}
              </button>
            ))}
          </div>
          <p className="text-xs opacity-50">{nbTerrains} terrain(s) disponible(s)</p>
        </div>

        <Button type="submit" variant="contained" fullWidth>Créer le concours</Button>
      </form>
    </div>
  )
}
