import { test, expect } from '@playwright/test'

test.describe('Gestion des joueurs', () => {
  test('affiche la page joueurs', async ({ page }) => {
    await page.goto('/joueurs')
    await expect(page.getByRole('heading', { name: /joueurs/i })).toBeVisible()
  })

  test('affiche le bouton Ajouter', async ({ page }) => {
    await page.goto('/joueurs')
    // MUI Button avec component={Link} se rend comme <a> — chercher par texte
    await expect(page.getByText(/ajouter/i).first()).toBeVisible()
  })

  test('affiche un message quand aucun joueur', async ({ page }) => {
    await page.goto('/joueurs')
    await expect(page.getByText(/aucun joueur/i)).toBeVisible()
  })
})
