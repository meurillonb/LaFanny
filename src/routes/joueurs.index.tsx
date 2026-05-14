import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Alert, Button, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Drawer, FormControl, FormLabel, IconButton, Switch, Typography,
} from '@mui/material'
import { Add, CheckCircle, Close, Delete, FileUpload, Female, Male, RadioButtonUnchecked, Save } from '@mui/icons-material'
import { useJoueurStore } from '@/stores/joueurStore'
import { parseCsvJoueurs } from '@/lib/csvImport'
import type { Genre, Joueur, NiveauJoueur, RoleJoueur } from '@/types/domain'

export const Route = createFileRoute('/joueurs/')({
  component: JoueursPage,
})

/* ─── petit composant de bouton de sélection parmi une liste ─────────────── */
function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2 rounded-full border text-xs font-display transition-colors ${
        active
          ? 'border-primary bg-primary text-white'
          : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E1E1E]'
      }`}
    >
      {children}
    </button>
  )
}

/* ─── formulaire d'édition réutilisé dans le Drawer ─────────────────────── */
interface EditFormState {
  nom: string
  prenom: string
  genre: Genre
  role: RoleJoueur | null
  niveau: NiveauJoueur | null
}

function EditJoueurDrawer({
  joueur,
  onClose,
  onSave,
}: {
  joueur: Joueur | null
  onClose: () => void
  onSave: (state: EditFormState) => Promise<void>
}) {
  const [form, setForm] = useState<EditFormState>({
    nom: '',
    prenom: '',
    genre: 'M',
    role: null,
    niveau: null,
  })
  const [saving, setSaving] = useState(false)

  /* Pré-remplissage à l'ouverture */
  useEffect(() => {
    if (joueur) {
      setForm({
        nom: joueur.nom,
        prenom: joueur.prenom ?? '',
        genre: joueur.genre,
        role: joueur.role ?? null,
        niveau: joueur.niveau ?? null,
      })
    }
  }, [joueur])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nom.trim()) return
    setSaving(true)
    try {
      await onSave({ ...form, nom: form.nom.trim(), prenom: form.prenom.trim() })
    } finally {
      setSaving(false)
    }
  }

  const field = (label: string, content: React.ReactNode) => (
    <FormControl fullWidth>
      <FormLabel sx={{ mb: 0.5, fontSize: '0.8rem', fontWeight: 500 }}>{label}</FormLabel>
      {content}
    </FormControl>
  )

  return (
    <Drawer
      anchor="bottom"
      open={joueur !== null}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20, px: 2, pt: 1, pb: 4, maxHeight: '90dvh', overflowY: 'auto' } } }}
    >
      {/* Poignée */}
      <div className="flex justify-center mb-2">
        <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
      </div>

      <div className="flex items-center justify-between mb-3">
        <Typography variant="h6" sx={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700 }}>
          Modifier le joueur
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <Close />
        </IconButton>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
        {field(
          'Nom *',
          <input
            type="text"
            value={form.nom}
            onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
            required
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2A2A2A] px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary"
          />,
        )}

        {field(
          'Prénom',
          <input
            type="text"
            value={form.prenom}
            onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2A2A2A] px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary"
          />,
        )}

        {field(
          'Genre',
          <div className="grid grid-cols-2 gap-2">
            {(['M', 'F'] as Genre[]).map((g) => (
              <ToggleBtn key={g} active={form.genre === g} onClick={() => setForm((f) => ({ ...f, genre: g }))}>
                {g === 'M' ? '👨 Homme' : '👩 Femme'}
              </ToggleBtn>
            ))}
          </div>,
        )}

        {field(
          'Rôle',
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { value: 'pointeur', label: '🎯 Pointeur' },
                { value: 'tireur', label: '🏹 Tireur' },
                { value: 'milieu', label: '⚡ Milieu' },
              ] as { value: RoleJoueur; label: string }[]
            ).map(({ value, label }) => (
              <ToggleBtn
                key={value}
                active={form.role === value}
                onClick={() => setForm((f) => ({ ...f, role: f.role === value ? null : value }))}
              >
                {label}
              </ToggleBtn>
            ))}
          </div>,
        )}

        {field(
          'Niveau',
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: 'debutant', label: '🌱 Débutant' },
                { value: 'intermediaire', label: '📈 Intermédiaire' },
                { value: 'confirme', label: '⭐ Confirmé' },
                { value: 'expert', label: '🏆 Expert' },
              ] as { value: NiveauJoueur; label: string }[]
            ).map(({ value, label }) => (
              <ToggleBtn
                key={value}
                active={form.niveau === value}
                onClick={() => setForm((f) => ({ ...f, niveau: f.niveau === value ? null : value }))}
              >
                {label}
              </ToggleBtn>
            ))}
          </div>,
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
          sx={{ mt: 1, borderRadius: 3, py: 1.2 }}
        >
          Enregistrer
        </Button>
      </form>
    </Drawer>
  )
}

/* ─── Page principale ────────────────────────────────────────────────────── */
function JoueursPage() {
  const { joueurs, loading, load, update, removeMany, setPresent, importJoueurs } = useJoueurStore()

  /* Tri alphabétique par prénom puis nom */
  const joueursTries = useMemo(
    () =>
      [...joueurs].sort((a, b) => {
        const prenomCmp = (a.prenom ?? a.nom).localeCompare(b.prenom ?? b.nom, 'fr', { sensitivity: 'base' })
        if (prenomCmp !== 0) return prenomCmp
        return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })
      }),
    [joueurs],
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [importFeedback, setImportFeedback] = useState<{
    type: 'success' | 'error' | 'warning'
    message: string
  } | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    rows: ReturnType<typeof parseCsvJoueurs>['joueurs']
    stats: { total: number; new: number; skipped: number }
    errors: string[]
  } | null>(null)
  /* Joueur en cours d'édition dans le Drawer */
  const [editingJoueur, setEditingJoueur] = useState<Joueur | null>(null)

  /* Mode suppression */
  const [deleteMode, setDeleteMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const exitDeleteMode = () => {
    setDeleteMode(false)
    setSelectedIds(new Set())
  }

  const handleDeleteConfirmed = async () => {
    await removeMany([...selectedIds])
    setDeleteConfirmOpen(false)
    exitDeleteMode()
  }

  useEffect(() => { void load() }, [load])

  /* ── Sauvegarde édition ── */
  const handleSaveEdit = async (form: EditFormState) => {
    if (!editingJoueur) return
    await update(editingJoueur.id, {
      nom: form.nom,
      prenom: form.prenom || null,
      genre: form.genre,
      role: form.role,
      niveau: form.niveau,
    })
    setEditingJoueur(null)
  }

  /* ── Import CSV ── */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!fileInputRef.current) return
    fileInputRef.current.value = ''
    if (!file) return

    setImporting(true)
    try {
      const text = await file.text()
      const result = parseCsvJoueurs(text)

      if (result.joueurs.length === 0 && result.errors.length > 0) {
        setImportFeedback({ type: 'error', message: result.errors.join('\n') })
        return
      }

      const existingNoms = new Set(joueurs.map((j) => j.nom.toUpperCase().trim()))
      const newCount = result.joueurs.filter((r) => !existingNoms.has(r.nom.toUpperCase().trim())).length
      const skippedCount = result.joueurs.length - newCount

      setConfirmDialog({
        open: true,
        rows: result.joueurs,
        stats: { total: result.joueurs.length, new: newCount, skipped: skippedCount },
        errors: result.errors,
      })
    } catch (err) {
      setImportFeedback({ type: 'error', message: `Erreur de lecture : ${String(err)}` })
    } finally {
      setImporting(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!confirmDialog) return
    setImporting(true)
    setConfirmDialog(null)
    try {
      const { imported, skipped } = await importJoueurs(confirmDialog.rows)
      setImportFeedback({
        type: skipped > 0 ? 'warning' : 'success',
        message: `${imported} joueur(s) importé(s)${skipped > 0 ? `, ${skipped} doublon(s) ignoré(s)` : ''}.`,
      })
    } catch (err) {
      setImportFeedback({ type: 'error', message: `Erreur d'import : ${String(err)}` })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* En-tête */}
      {!deleteMode ? (
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
            Joueurs
            <span className="ml-2 text-sm font-normal text-gray-400">({joueurs.length})</span>
          </h1>
          <div className="flex gap-2 items-center">
            <Button
              variant="outlined"
              size="small"
              startIcon={importing ? <CircularProgress size={14} /> : <FileUpload />}
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              Importer
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              component={Link as React.ElementType}
              to="/joueurs/nouveau"
              variant="contained"
              size="small"
              startIcon={<Add />}
            >
              Ajouter
            </Button>
            {joueurs.length > 0 && (
              <IconButton size="small" color="error" onClick={() => setDeleteMode(true)} aria-label="Mode suppression">
                <Delete fontSize="small" />
              </IconButton>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-sm font-medium text-primary"
            onClick={() =>
              setSelectedIds(
                selectedIds.size === joueursTries.length
                  ? new Set()
                  : new Set(joueursTries.map((j) => j.id)),
              )
            }
          >
            {selectedIds.size === joueursTries.length ? 'Désélectionner tout' : 'Tout sélectionner'}
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedIds.size > 0 ? `${selectedIds.size} sélectionné(s)` : 'Appuyer pour sélectionner'}
          </span>
          <button type="button" className="text-sm font-medium text-primary" onClick={exitDeleteMode}>
            Annuler
          </button>
        </div>
      )}

      {/* Feedback import */}
      {importFeedback && (
        <Alert severity={importFeedback.type} onClose={() => setImportFeedback(null)} sx={{ borderRadius: 2 }}>
          {importFeedback.message}
        </Alert>
      )}

      {loading && <p className="text-sm opacity-50">Chargement…</p>}

      {/* Liste des joueurs */}
      <div className="flex flex-col gap-2">
        {joueursTries.map((j) => {
          const isSelected = selectedIds.has(j.id)
          return (
            <div
              key={j.id}
              className={[
                'flex items-center justify-between rounded-xl px-4 py-2 shadow-sm dark:border dark:border-gray-800 transition-colors',
                deleteMode ? 'cursor-pointer' : '',
                deleteMode && isSelected ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-[#1E1E1E]',
              ].join(' ')}
              onClick={deleteMode ? () => toggleSelect(j.id) : undefined}
            >
              {/* Checkbox mode suppression */}
              {deleteMode && (
                <span className="mr-2 flex-shrink-0">
                  {isSelected
                    ? <CheckCircle sx={{ fontSize: 22, color: 'error.main' }} />
                    : <RadioButtonUnchecked sx={{ fontSize: 22, color: 'text.disabled' }} />
                  }
                </span>
              )}

              {/* Zone joueur */}
              <button
                type="button"
                className={`flex items-center gap-2 min-w-0 flex-1 text-left py-1 rounded-lg transition-colors${deleteMode ? ' pointer-events-none' : ' hover:bg-gray-50 dark:hover:bg-white/5'}`}
                onClick={deleteMode ? undefined : () => setEditingJoueur(j)}
                aria-label={`Modifier ${j.prenom ?? ''} ${j.nom}`}
              >
                {j.genre === 'F'
                  ? <Female sx={{ fontSize: 16, color: 'rgb(244 114 182)', flexShrink: 0 }} />
                  : <Male sx={{ fontSize: 16, color: '#64748b', flexShrink: 0 }} />
                }
                <span className="font-medium truncate">
                  {j.prenom ? `${j.prenom} ${j.nom}` : j.nom}
                </span>
                {j.role && (
                  <Chip
                    size="small"
                    label={j.role}
                    variant="outlined"
                    sx={{ fontSize: '0.65rem', height: 18, flexShrink: 0 }}
                  />
                )}
              </button>

              {/* Switch présent/absent */}
              {!deleteMode && (
                <Switch
                  size="small"
                  checked={j.presentSessionSuivante}
                  onChange={(e) => { void setPresent(j.id, e.target.checked) }}
                  color="success"
                  slotProps={{ input: { 'aria-label': `${j.prenom ?? j.nom} présent` } }}
                  sx={{ ml: 1, flexShrink: 0 }}
                />
              )}
            </div>
          )
        })}

        {!loading && joueurs.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="text-4xl">👥</span>
            <p className="text-sm text-gray-400">Aucun joueur enregistré</p>
            <Button variant="outlined" size="small" startIcon={<FileUpload />} onClick={() => fileInputRef.current?.click()}>
              Importer depuis CSV
            </Button>
          </div>
        )}
      </div>

      {/* Barre de suppression */}
      {deleteMode && selectedIds.size > 0 && (
        <div className="sticky bottom-4 z-10">
          <Button
            variant="contained"
            color="error"
            fullWidth
            startIcon={<Delete />}
            onClick={() => setDeleteConfirmOpen(true)}
            sx={{ borderRadius: 3, py: 1.2, fontFamily: 'Oswald, sans-serif', fontSize: '1rem', letterSpacing: '0.05em', boxShadow: 4 }}
          >
            Supprimer {selectedIds.size} joueur{selectedIds.size > 1 ? 's' : ''}
          </Button>
        </div>
      )}

      {/* Drawer d'édition */}
      <EditJoueurDrawer
        joueur={editingJoueur}
        onClose={() => setEditingJoueur(null)}
        onSave={handleSaveEdit}
      />

      {/* Dialog confirmation import */}
      <Dialog
        open={confirmDialog?.open === true}
        onClose={() => setConfirmDialog(null)}
        slotProps={{ paper: { sx: { borderRadius: 3, mx: 2 } } }}
      >
        <DialogTitle sx={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700 }}>
          Confirmer l'import
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog?.stats.new} nouveau(x) joueur(s) à importer
            {(confirmDialog?.stats.skipped ?? 0) > 0 && (
              <> · <strong>{confirmDialog?.stats.skipped} doublon(s)</strong> ignoré(s)</>
            )}
          </DialogContentText>
          {(confirmDialog?.errors.length ?? 0) > 0 && (
            <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 2, fontSize: '0.75rem' }}>
              {confirmDialog?.errors.slice(0, 3).join('\n')}
              {(confirmDialog?.errors.length ?? 0) > 3 && ` (+${(confirmDialog?.errors.length ?? 0) - 3} autres)`}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setConfirmDialog(null)} color="inherit">Annuler</Button>
          <Button
            onClick={handleConfirmImport}
            variant="contained"
            disabled={(confirmDialog?.stats.new ?? 0) === 0}
          >
            Importer {confirmDialog?.stats.new} joueur(s)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog confirmation suppression */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: 3, mx: 2 } } }}
      >
        <DialogTitle sx={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700 }}>
          Supprimer les joueurs ?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedIds.size} joueur{selectedIds.size > 1 ? 's seront supprimés' : ' sera supprimé'} définitivement.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">Annuler</Button>
          <Button onClick={() => void handleDeleteConfirmed()} variant="contained" color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
