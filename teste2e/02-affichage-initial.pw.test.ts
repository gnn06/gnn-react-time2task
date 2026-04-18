import { test, expect } from '@playwright/test';

test.describe('Affichage initial', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('');
        await expect(page.getByRole('button', { name: 'login' })).not.toBeVisible();
    });

    test('layout deux colonnes : panel slots et panel tâches visibles', async ({ page }) => {
        // Panel gauche — slot panel
        await expect(page.getByRole('combobox', { name: 'slot-view-select' })).toBeVisible();

        // Panel droit — task panel
        await expect(page.getByRole('button', { name: /Créer Tâche/i }).first()).toBeVisible();
    });

    test('panel slots : contrôles de configuration visibles', async ({ page }) => {
        await expect(page.getByLabel('voir les répétitions')).toBeVisible();
        await expect(page.getByLabel('Slot strict')).toBeVisible();
        await expect(page.getByRole('combobox', { name: 'slot-view-select' })).toBeVisible();
    });

    test('panel tâches : barre de commandes visible', async ({ page }) => {
        await expect(page.getByRole('button', { name: /Créer Tâche/i }).first()).toBeVisible();
        await expect(page.getByRole('button', { name: 'Todo' })).toBeVisible();
        await expect(page.getByRole('button', { name: /Démarrer Semaine/i })).toBeVisible();
    });

    test('panel tâches : table ou message vide affiché après chargement', async ({ page }) => {
        // Soit la table est présente (avec ses en-têtes), soit le message d'état vide.
        // On utilise toPass() car React peut ne pas avoir re-rendu immédiatement après networkidle.
        const tableHeader = page.getByRole('columnheader', { name: 'Titre' });
        const emptyMessage = page.getByText(/Créer des tâches/i);

        await expect(async () => {
            const hasTable = await tableHeader.isVisible();
            const hasEmpty = await emptyMessage.isVisible();
            expect(hasTable || hasEmpty).toBeTruthy();
        }).toPass({ timeout: 10000 });
    });
});
