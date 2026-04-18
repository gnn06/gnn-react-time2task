import { test, expect } from '@playwright/test';
import { uniqueTitle } from './helpers/tasks';

test.describe('Création de tâche', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('');
        await expect(page.getByRole('button', { name: 'login' })).not.toBeVisible();
    });

    const boutonCreer = (page: any) => page.getByRole('button', { name: /Créer Tâche/i }).first();

    test('le bouton Créer Tâche ouvre la dialog', async ({ page }) => {
        await boutonCreer(page).click();

        const dialog = page.getByTestId('confirm-dialog');
        await expect(dialog).toBeVisible();
        await expect(page.getByLabel('Titre de la tâche')).toBeVisible();
    });

    test('annuler ferme la dialog sans créer de tâche', async ({ page }) => {
        await boutonCreer(page).click();
        await page.getByLabel('Titre de la tâche').fill(uniqueTitle('annulation'));
        await page.getByRole('button', { name: 'Annuler' }).click();

        await expect(page.getByTestId('confirm-dialog')).not.toBeVisible();
    });

    // Logique dupliquée dans helpers/tasks.ts::creerTache — garder les deux en sync
    test('confirmer crée la tâche et l\'affiche dans la table', async ({ page }) => {
        const title = uniqueTitle('création');

        await boutonCreer(page).click();
        await page.getByLabel('Titre de la tâche').fill(title);

        const postDone = page.waitForResponse(
            resp => resp.url().includes('/tasks') && resp.request().method() === 'POST',
            { timeout: 15000 }
        );
        await page.getByRole('button', { name: 'Confirmer' }).click();
        await postDone;

        await expect(page.getByTestId('confirm-dialog')).not.toBeVisible();
        await expect(async () => {
            const found = await page.evaluate((t) =>
                Array.from(document.querySelectorAll('input[placeholder="Titre"]'))
                    .some(el => (el as HTMLInputElement).value === t)
            , title);
            expect(found).toBe(true);
        }).toPass({ timeout: 15000, intervals: [300, 500, 1000, 2000] });
    });
});
