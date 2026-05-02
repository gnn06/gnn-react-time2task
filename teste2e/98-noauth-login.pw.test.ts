import { test, expect } from '@playwright/test';
import { login, logout } from './helpers/login';

test.describe('Authentification', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('');
    });

    test('affichage du formulaire de login', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'email' })).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'password' })).toBeVisible();
    });

    test('accès direct sans session affiche le login', async ({ page }) => {
        // Le HashRouter rend Login directement quand userId est vide.
        // Pas de redirection HTTP : la condition est vérifiée côté React.
        await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
        await expect(page.getByText('Time2Task')).not.toBeVisible();
    });

    test('login réussi affiche l\'interface principale', async ({ page }) => {
        await login(page);

        await expect(page.getByText('Time2Task')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Login' })).not.toBeVisible();
        await expect(page.getByRole('button', { name: /Créer Tâche/i }).first()).toBeVisible();
    });

    test('logout redirige vers le formulaire de login', async ({ page }) => {
        await login(page);
        await logout(page);

        await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
        await expect(page.getByText('Time2Task')).not.toBeVisible();
    });

    test('impossibilité d\'accéder à l\'app après logout', async ({ page }) => {
        await login(page);
        await logout(page);

        // Recharger la page : sans session persistée, le login doit réapparaître
        await page.reload();

        await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    });
});
