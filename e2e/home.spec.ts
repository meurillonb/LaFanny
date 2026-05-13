import { test, expect } from '@playwright/test'

test.describe('Page d\'accueil', () => {
  test('affiche le titre LaFanny', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('LaFanny')).toBeVisible()
  })

  test('affiche le lien Nouveau concours', async ({ page }) => {
    await page.goto('/')
    // Le header contient un lien "Nouveau" vers /concours/nouveau
    await expect(page.getByRole('link', { name: /nouveau/i }).first()).toBeVisible()
  })

  test('navigation vers Joueurs', async ({ page }) => {
    await page.goto('/')
    // MUI BottomNavigation rend des <button>, pas des <a>
    await page.getByRole('button', { name: /joueurs/i }).click()
    await expect(page).toHaveURL('/joueurs')
  })

  test('navigation vers Classement', async ({ page }) => {
    await page.goto('/')
    // L'onglet "Classement" pointe vers /concours
    await page.getByRole('button', { name: /classement/i }).click()
    await expect(page).toHaveURL('/concours')
  })
})
