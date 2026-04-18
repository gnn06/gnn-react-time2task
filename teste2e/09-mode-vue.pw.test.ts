import { test, expect } from '@playwright/test';

test.describe('Mode de vue et configuration du slot panel', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('');
        await expect(page.getByRole('button', { name: 'login' })).not.toBeVisible();
    });

    test('passer en vue liste (list)', async ({ page }) => {
        await page.getByRole('combobox', { name: 'slot-view-select' }).click();
        await page.getByRole('option', { name: 'List' }).click();

        // La vue liste affiche les colonnes Past / Present / Future
        await expect(page.getByText('Past')).toBeVisible();
        await expect(page.getByText('Present')).toBeVisible();
        await expect(page.getByText('Future')).toBeVisible();
    });

    test('passer en vue arbre (tree)', async ({ page }) => {
        // S'assurer d'abord qu'on est en liste pour que le changement soit significatif
        await page.getByRole('combobox', { name: 'slot-view-select' }).click();
        await page.getByRole('option', { name: 'List' }).click();
        await expect(page.getByText('Past')).toBeVisible();

        await page.getByRole('combobox', { name: 'slot-view-select' }).click();
        await page.getByRole('option', { name: 'Tree' }).click();

        // La vue arbre n'affiche pas les colonnes Past / Present / Future
        await expect(page.getByText('Past')).not.toBeVisible();
    });

    test('activer l\'affichage des répétitions', async ({ page }) => {
        const checkbox = page.getByLabel('voir les répétitions');
        await expect(checkbox).toBeVisible();

        const etatInitial = await checkbox.isChecked();

        // Toggle
        await checkbox.click();
        await expect(checkbox).toBeChecked({ checked: !etatInitial });

        // Le slot panel reste fonctionnel après le toggle
        await expect(page.getByRole('combobox', { name: 'slot-view-select' })).toBeVisible();

        // Restaurer l'état initial
        await checkbox.click();
        await expect(checkbox).toBeChecked({ checked: etatInitial });
    });
});
