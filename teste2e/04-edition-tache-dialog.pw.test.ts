import { test, expect } from '@playwright/test';
import { uniqueTitle, creerTache, getTaskRowIndex, openEditDialog, TEST_ACTIVITY } from './helpers/tasks';
import { waitForApiIdle } from './helpers/api';


const taskRows = (page: any) =>
    page.locator('tr').filter({ has: page.locator('input[placeholder="Titre"]') });

test.describe('Édition de tâche via la dialog', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('');
        await expect(page.getByRole('button', { name: 'login' })).not.toBeVisible();
    });

    test('ouverture de la dialog via le menu contextuel', async ({ page }) => {
        const title = uniqueTitle('dialog-ouverture');
        await creerTache(page, title);
        await openEditDialog(page, title);

        const dialog = page.getByTestId('confirm-dialog');
        await expect(dialog.getByLabel('Titre de la tâche')).toHaveValue(title);
        await expect(dialog.getByRole('combobox', { name: 'statut' })).toBeVisible();
        await expect(dialog.getByRole('combobox', { name: 'activité' })).toBeVisible();
    });

    test('modification du titre', async ({ page }) => {
        const originalTitle = uniqueTitle('dialog-titre-avant');
        const newTitle      = uniqueTitle('dialog-titre-après');
        await creerTache(page, originalTitle);
        await openEditDialog(page, originalTitle);

        await page.getByTestId('confirm-dialog').getByLabel('Titre de la tâche').fill(newTitle);
        await page.getByRole('button', { name: 'Confirmer' }).click();
        await waitForApiIdle(page);

        await expect(async () => {
            const found = await page.evaluate((t) =>
                Array.from(document.querySelectorAll('input[placeholder="Titre"]'))
                    .some(el => (el as HTMLInputElement).value === t)
            , newTitle);
            expect(found).toBe(true);
        }).toPass({ timeout: 10000 });
    });

    test('modification du statut', async ({ page }) => {
        const title = uniqueTitle('dialog-statut');
        await creerTache(page, title);
        await openEditDialog(page, title);

        const dialog = page.getByTestId('confirm-dialog');
        await dialog.getByRole('combobox', { name: 'statut' }).click();
        await page.getByRole('option', { name: 'en cours' }).click();
        await page.getByRole('button', { name: 'Confirmer' }).click();
        await waitForApiIdle(page);

        await expect(async () => {
            const idx = await getTaskRowIndex(page, title);
            expect(idx).toBeGreaterThanOrEqual(0);
            await expect(taskRows(page).nth(idx)).toContainText('en cours');
        }).toPass({ timeout: 10000 });
    });

    test('modification de l\'activité', async ({ page }) => {
        const title = uniqueTitle('dialog-activité');
        await creerTache(page, title);
        await openEditDialog(page, title);

        const dialog = page.getByTestId('confirm-dialog');
        const activityCombobox = dialog.getByRole('combobox', { name: 'activité' });
        await activityCombobox.click();
        await activityCombobox.pressSequentially(TEST_ACTIVITY);

        // TEST_ACTIVITY est créée par globalSetup → onChange synchrone, pas handleCreate async
        const option = page.getByRole('option', { name: TEST_ACTIVITY }).first();
        await expect(option).toBeVisible();
        await option.click();

        await page.getByRole('button', { name: 'Confirmer' }).click();
        await waitForApiIdle(page);

        await expect(async () => {
            const idx = await getTaskRowIndex(page, title);
            expect(idx).toBeGreaterThanOrEqual(0);
            await expect(taskRows(page).nth(idx)).toContainText(TEST_ACTIVITY);
        }).toPass({ timeout: 10000 });
    });

    test('annuler ne modifie pas la tâche', async ({ page }) => {
        const title    = uniqueTitle('dialog-annulation');
        const badTitle = uniqueTitle('dialog-ne-doit-pas-apparaître');
        await creerTache(page, title);
        await openEditDialog(page, title);

        await page.getByTestId('confirm-dialog').getByLabel('Titre de la tâche').fill(badTitle);
        await page.getByRole('button', { name: 'Annuler' }).click();
        await expect(page.getByTestId('confirm-dialog')).not.toBeVisible();

        const found = await page.evaluate((t) =>
            Array.from(document.querySelectorAll('input[placeholder="Titre"]'))
                .some(el => (el as HTMLInputElement).value === t)
        , title);
        expect(found).toBe(true);
    });
});
