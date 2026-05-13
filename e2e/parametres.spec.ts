import { test, expect } from '@playwright/test'

test.describe('Paramètres', () => {
  test('affiche les champs terrains', async ({ page }) => {
    await page.goto('/parametres')
    await expect(page.getByText(/terrains extérieur/i)).toBeVisible()
    await expect(page.getByText(/terrains intérieur/i)).toBeVisible()
  })

  test('valeur par défaut terrains ext = 12', async ({ page }) => {
    await page.goto('/parametres')
    const input = page.locator('input').first()
    await expect(input).toHaveValue('12')
  })
})
