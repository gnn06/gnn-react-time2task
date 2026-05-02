import { Page, expect } from '@playwright/test';

/**
 * Attend que le spinner global (cloud) apparaisse puis disparaisse.
 * Indique que toutes les requêtes RTK Query en cours sont terminées.
 *
 * Si la requête est très rapide et que le spinner n'est pas détecté,
 * on considère que l'opération est terminée.
 */
export async function waitForApiIdle(page: Page): Promise<void> {
    const spinner = page.getByTestId('global-spinner');
    try {
        await expect(spinner).toBeVisible({ timeout: 2000 });
    } catch {
        // La requête s'est terminée avant que le spinner soit détecté
    }
    await expect(spinner).not.toBeVisible({ timeout: 10000 });
}

/**
 * Attend la disparition de l'overlay de chargement initial (AppLoader).
 * À appeler après un login pour s'assurer que les données initiales sont prêtes.
 */
export async function waitForAppReady(page: Page): Promise<void> {
    await expect(page.getByTestId('app-loader')).not.toBeVisible({ timeout: 15000 });
}
