import { Page, expect } from '@playwright/test';
import { waitForAppReady } from './api';

const TEST_EMAIL    = process.env.E2E_EMAIL    ?? 'e2e@gorsini.fr';
const TEST_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e';

/**
 * Effectue le login avec les credentials de test et attend que l'interface
 * principale soit prête (auth + chargement initial des données).
 */
export async function login(page: Page): Promise<void> {
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible();

    await page.getByRole('textbox', { name: 'email' }).fill(TEST_EMAIL);
    await page.getByRole('textbox', { name: 'password' }).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('button', { name: 'login' })).not.toBeVisible({ timeout: 10000 });
    await waitForAppReady(page);
}

/**
 * Raccourci : navigate + login en une seule étape.
 * Utiliser dans beforeEach pour les tests qui nécessitent une session active.
 */
export async function gotoAppAndLogin(page: Page): Promise<void> {
    await page.goto('');
    await login(page);
}

/**
 * Déconnecte l'utilisateur et attend le retour au formulaire de login.
 */
export async function logout(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Se déconnecter' }).click();
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible({ timeout: 10000 });
}
