import { test, expect } from '@playwright/test';
import { uniqueTitle, creerTache, getTaskRowIndex, TEST_ACTIVITY } from './helpers/tasks';
import { waitForApiIdle } from './helpers/api';


const taskRows = (page: any) =>
    page.locator('tr').filter({ has: page.locator('input[placeholder="Titre"]') });

test.describe('Édition inline depuis la table de tâches', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('');
        await expect(page.getByRole('button', { name: 'login' })).not.toBeVisible();
    });

    test('modification du titre inline', async ({ page }) => {
        const originalTitle = uniqueTitle('inline-titre-avant');
        const newTitle      = uniqueTitle('inline-titre-après');
        await creerTache(page, originalTitle);

        const idx = await getTaskRowIndex(page, originalTitle);
        const row = taskRows(page).nth(idx);

        // InputEdit : uncontrolled input, sauvegarde sur Enter ou blur
        const titleInput = row.locator('input[placeholder="Titre"]');
        await titleInput.click();
        await titleInput.fill(newTitle);
        await titleInput.press('Enter');
        await waitForApiIdle(page);

        await expect(async () => {
            const found = await page.evaluate((t) =>
                Array.from(document.querySelectorAll('input[placeholder="Titre"]'))
                    .some(el => (el as HTMLInputElement).value === t)
            , newTitle);
            expect(found).toBe(true);
        }).toPass({ timeout: 10000 });
    });

    test('modification du statut inline', async ({ page }) => {
        const title = uniqueTitle('inline-statut');
        await creerTache(page, title);    // statut initial : "A faire"

        const idx = await getTaskRowIndex(page, title);
        const row = taskRows(page).nth(idx);

        await row.getByRole('combobox', { name: 'statut' }).click();
        await page.getByRole('option', { name: 'en cours' }).click();
        await waitForApiIdle(page);

        await expect(async () => {
            const i = await getTaskRowIndex(page, title);
            expect(i).toBeGreaterThanOrEqual(0);
            await expect(taskRows(page).nth(i)).toContainText('en cours');
        }).toPass({ timeout: 10000 });
    });

    test('modification de l\'activité inline', async ({ page }) => {
        const title = uniqueTitle('inline-activité');
        await creerTache(page, title);

        const idx = await getTaskRowIndex(page, title);
        const row = taskRows(page).nth(idx);

        // ActivityInput inline : isValidNewOption=false → pas d'option "Create",
        // TEST_ACTIVITY existe grâce au globalSetup
        const activityCombobox = row.getByRole('combobox', { name: 'activité' });
        await activityCombobox.click();
        await activityCombobox.pressSequentially(TEST_ACTIVITY);

        const option = page.getByRole('option', { name: TEST_ACTIVITY }).first();
        await expect(option).toBeVisible();
        await option.click();
        await waitForApiIdle(page);

        await expect(async () => {
            const i = await getTaskRowIndex(page, title);
            expect(i).toBeGreaterThanOrEqual(0);
            await expect(taskRows(page).nth(i)).toContainText(TEST_ACTIVITY);
        }).toPass({ timeout: 10000 });
    });
});
