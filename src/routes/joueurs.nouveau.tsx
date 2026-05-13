import React, { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@mui/material'
import { useJoueurStore } from '@/stores/joueurStore'
import type { Genre, NiveauJoueur, RoleJoueur } from '@/types/domain'

export const Route = createFileRoute('/joueurs/nouveau')({
  component: NouveauJoueurPage,
})

function NouveauJoueurPage() {
  const navigate = useNavigate()
  const { add } = useJoueurStore()
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [genre, setGenre] = useState<Genre>('M')
  const [role, setRole] = useState<RoleJoueur | null>(null)
  const [niveau, setNiveau] = useState<NiveauJoueur | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nom.trim()) return
    await add({ nom: nom.trim(), prenom: prenom.trim() || null, genre, role, niveau, actif: true, presentSessionSuivante: false })
    await navigate({ to: '/joueurs' })
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl text-secondary">Ajouter un joueur</h1>

      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm opacity-70">Nom *</span>
          <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Dupont"
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E1E1E] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            required />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm opacity-70">Prénom</span>
          <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Jean"
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E1E1E] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-sm opacity-70">Genre</span>
          <div className="grid grid-cols-2 gap-2">
            {(['M', 'F'] as Genre[]).map((g) => (
              <button key={g} type="button" onClick={() => setGenre(g)}
                className={`py-2 rounded-full border text-sm font-display transition-colors ${genre === g ? 'border-primary bg-primary text-white' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E1E1E]'}`}>
                {g === 'M' ? '👨 Homme' : '👩 Femme'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm opacity-70">Rôle</span>
          <div className="grid grid-cols-3 gap-2">
            {([{ value: 'pointeur', label: '�� Pointeur' }, { value: 'tireur', label: '🏹 Tireur' }, { value: 'milieu', label: '⚡ Milieu' }] as { value: RoleJoueur; label: string }[]).map(({ value, label }) => (
              <button key={value} type="button" onClick={() => setRole(role === value ? null : value)}
                className={`py-2 rounded-full border text-xs font-display transition-colors ${role === value ? 'border-primary bg-primary text-white' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E1E1E]'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm opacity-70">Niveau</span>
          <div className="grid grid-cols-2 gap-2">
            {([{ value: 'debutant', label: '🌱 Débutant' }, { value: 'intermediaire', label: '📈 Intermédiaire' }, { value: 'confirme', label: '⭐ Confirmé' }, { value: 'expert', label: '🏆 Expert' }] as { value: NiveauJoueur; label: string }[]).map(({ value, label }) => (
              <button key={value} type="button" onClick={() => setNiveau(niveau === value ? null : value)}
                className={`py-2 rounded-full border text-xs font-display transition-colors ${niveau === value ? 'border-primary bg-primary text-white' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E1E1E]'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" variant="contained" fullWidth>Ajouter le joueur</Button>
      </form>
    </div>
  )
}
