import React, { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, Typography, Switch, FormControlLabel } from '@mui/material'
import { useParametresStore } from '@/stores/parametresStore'
import { useUIStore } from '@/stores/uiStore'

export const Route = createFileRoute('/parametres')({
  component: ParametresPage,
})

function ParametresPage() {
  const { themeMode, setThemeMode } = useUIStore()
  const { terrainsExt, terrainsInt, load, setTerrainsExt, setTerrainsInt } = useParametresStore()
  useEffect(() => { void load() }, [load])

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="h5" sx={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700 }}>Réglages</Typography>

      <Card>
        <CardContent className="flex flex-col gap-3">
          <Typography variant="subtitle1" sx={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600 }}>Terrains</Typography>
          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-70">Terrains Extérieur</span>
            <input type="number" min={1} max={20} value={terrainsExt}
              onChange={(e) => void setTerrainsExt(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E1E1E] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-70">Terrains Intérieur</span>
            <input type="number" min={1} max={20} value={terrainsInt}
              onChange={(e) => void setTerrainsInt(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E1E1E] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600, mb: 1.5 }}>Apparence</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={themeMode === 'dark'}
                onChange={(e) => setThemeMode(e.target.checked ? 'dark' : 'light')}
                slotProps={{ input: { 'aria-label': 'Mode sombre' } }}
              />
            }
            label="Mode sombre"
          />
        </CardContent>
      </Card>
    </div>
  )
}
