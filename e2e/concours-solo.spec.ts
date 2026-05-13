import { test, expect } from '@playwright/test'

async function seedSoloPartie(page) {
  await page.evaluate(async () => {
    const openDb = () => new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('LaFanny')
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })

    const db = await openDb()
    const tx = db.transaction(
      ['joueurs', 'concours', 'inscriptions', 'parties', 'terrains', 'parametres'],
      'readwrite',
    )

    const joueurs = tx.objectStore('joueurs')
    const concours = tx.objectStore('concours')
    const inscriptions = tx.objectStore('inscriptions')
    const parties = tx.objectStore('parties')
    const terrains = tx.objectStore('terrains')
    const parametres = tx.objectStore('parametres')

    parametres.put({ id: 1, terrainsExt: 12, terrainsInt: 11, gainsEte: {}, gainsHiver: {} })

    joueurs.put({
      id: 'j1',
      nom: 'Solo',
      prenom: 'A',
      genre: 'M',
      role: null,
      niveau: null,
      actif: true,
      presentSessionSuivante: false,
      createdAt: '2026-05-13T00:00:00.000Z',
    })
    joueurs.put({
      id: 'j2',
      nom: 'Solo',
      prenom: 'B',
      genre: 'M',
      role: null,
      niveau: null,
      actif: true,
      presentSessionSuivante: false,
      createdAt: '2026-05-13T00:00:00.000Z',
    })

    concours.put({
      id: 'c-solo',
      date: '2026-05-13',
      format: 'EXT',
      statut: 'en_cours',
      partieCourante: 0,
      nbTerrains: 1,
      createdAt: '2026-05-13T00:00:00.000Z',
    })

    inscriptions.put({
      id: 'i1',
      concoursId: 'c-solo',
      joueurId: 'j1',
      nOrdre: 1,
      presentSessionSuivante: false,
    })
    inscriptions.put({
      id: 'i2',
      concoursId: 'c-solo',
      joueurId: 'j2',
      nOrdre: 2,
      presentSessionSuivante: false,
    })

    const partieId = 'p-solo'
    parties.put({
      id: partieId,
      concoursId: 'c-solo',
      numero: 1,
      statut: 'en_cours',
    })

    terrains.put({
      id: 't-solo',
      partieId,
      numero: 1,
      equipeA: ['j1', 'j2'],
      equipeB: [],
      scoreA: null,
      scoreB: null,
      gagnant: null,
    })

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })

    db.close()
  })
}

test.describe('Score solo', () => {
  test('affiche 13-7 quand une équipe n a pas d adversaire', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/aucun tournoi/i)).toBeVisible()

    await seedSoloPartie(page)

    await page.goto('/concours/c-solo')

    const terrainCard = page.locator('.MuiCard-root').filter({ hasText: 'Terrain 1' }).first()
    await expect(terrainCard).toBeVisible()
    await expect(terrainCard).toContainText('13')
    await expect(terrainCard).toContainText('7')
    await expect(page.getByRole('button', { name: /valider la partie/i })).toBeEnabled()
  })
})