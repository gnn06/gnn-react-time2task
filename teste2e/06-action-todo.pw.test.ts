import { test, expect } from '@playwright/test';
import { uniqueTitle, creerTache, getTaskRowIndex, setInlineStatus } from './helpers/tasks';
import { waitForApiIdle } from './helpers/api';


const taskRows = (page: any) =>
    page.locator('tr').filter({ has: page.locator('input[placeholder="Titre"]') });

test.describe('Action Todo', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('');
        await expect(page.getByRole('button', { name: 'login' })).not.toBeVisible();
    });

    test('ouverture de la confirmation Todo', async ({ page }) => {
        const title = uniqueTitle('todo-ouverture');
        await creerTache(page, title);
        await setInlineStatus(page, title, 'en cours');

        await page.getByRole('button', { name: 'Todo' }).click();

        const dialog = page.getByTestId('confirm-dialog');
        await expect(dialog).toBeVisible();
        // Le message indique combien de tâches seront affectées (au moins 1 : la nôtre)
        await expect(dialog).toContainText("vont être passées à 'à faire'");
    });

    test('confirmation de l\'action Todo passe les tâches à "A faire"', async ({ page }) => {
        const title = uniqueTitle('todo-confirmation');
        await creerTache(page, title);
        await setInlineStatus(page, title, 'en cours');

        await page.getByRole('button', { name: 'Todo' }).click();
        await expect(page.getByTestId('confirm-dialog')).toBeVisible();
        await page.getByRole('button', { name: 'Confirmer' }).click();
        await waitForApiIdle(page);

        await expect(async () => {
            const idx = await getTaskRowIndex(page, title);
            expect(idx).toBeGreaterThanOrEqual(0);
            await expect(taskRows(page).nth(idx)).toContainText('A faire');
        }).toPass({ timeout: 10000 });
    });

    test('annulation de l\'action Todo ne modifie pas les tâches', async ({ page }) => {
        const title = uniqueTitle('todo-annulation');
        await creerTache(page, title);
        await setInlineStatus(page, title, 'en cours');

        await page.getByRole('button', { name: 'Todo' }).click();
        await expect(page.getByTestId('confirm-dialog')).toBeVisible();
        await page.getByRole('button', { name: 'Annuler' }).click();
        await expect(page.getByTestId('confirm-dialog')).not.toBeVisible();

        // La tâche doit rester "en cours"
        const idx = await getTaskRowIndex(page, title);
        expect(idx).toBeGreaterThanOrEqual(0);
        await expect(taskRows(page).nth(idx)).toContainText('en cours');
    });
});
