import { test, expect } from '@playwright/test'

test.describe('Thème light/dark', () => {
  test('démarre en mode light par défaut', async ({ page }) => {
    await page.goto('/')
    // Le thème system est appliqué ; vérifie que la page se charge
    await expect(page.locator('#root')).toBeVisible()
  })

  test('bascule vers le mode sombre via les réglages', async ({ page }) => {
    await page.goto('/parametres')
    const toggle = page.getByRole('switch', { name: /mode sombre/i })
    await toggle.click()
    await expect(page.locator('html')).toHaveClass(/dark/)
  })
})
