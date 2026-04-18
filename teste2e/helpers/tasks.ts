import { Page, expect } from '@playwright/test';

export const TEST_PREFIX = 'E2E-TEST';
export const TEST_ACTIVITY = 'E2E-activité'; // créée par globalSetup

export function uniqueTitle(label: string): string {
    return `${TEST_PREFIX} ${label} ${Date.now()}`;
}

/**
 * Retourne l'index (parmi les tr de tâches) dont l'input Titre vaut `title`.
 * Les tr de tâches sont ceux qui contiennent un input[placeholder="Titre"].
 */
export async function getTaskRowIndex(page: Page, title: string): Promise<number> {
    return page.evaluate((t) => {
        const inputs = Array.from(document.querySelectorAll('input[placeholder="Titre"]'));
        return inputs.findIndex(el => (el as HTMLInputElement).value === t);
    }, title);
}

/**
 * Crée une tâche via l'UI et attend qu'elle apparaisse dans la table.
 */
export async function creerTache(page: Page, title: string): Promise<void> {
    await page.getByRole('button', { name: /Créer Tâche/i }).first().click();
    await page.getByLabel('Titre de la tâche').fill(title);

    const postDone = page.waitForResponse(
        resp => resp.url().includes('/tasks') && resp.request().method() === 'POST',
        { timeout: 15000 }
    );
    await page.getByRole('button', { name: 'Confirmer' }).click();
    await postDone;

    await expect(async () => {
        const found = await page.evaluate((t) =>
            Array.from(document.querySelectorAll('input[placeholder="Titre"]'))
                .some(el => (el as HTMLInputElement).value === t)
        , title);
        expect(found).toBe(true);
    }).toPass({ timeout: 15000, intervals: [300, 500, 1000, 2000] });
}

/**
 * Change le statut d'une tâche inline depuis la table.
 */
export async function setInlineStatus(page: Page, title: string, status: string): Promise<void> {
    const taskRows = page.locator('tr').filter({ has: page.locator('input[placeholder="Titre"]') });
    const idx = await getTaskRowIndex(page, title);
    expect(idx).toBeGreaterThanOrEqual(0);
    await taskRows.nth(idx).getByRole('combobox', { name: 'statut' }).click();
    await page.getByRole('option', { name: status }).click();
    await page.waitForLoadState('networkidle');
    await expect(async () => {
        const i = await getTaskRowIndex(page, title);
        expect(i).toBeGreaterThanOrEqual(0);
        await expect(taskRows.nth(i)).toContainText(status);
    }).toPass({ timeout: 10000 });
}

/**
 * Ouvre la dialog d'édition pour la tâche dont le titre est `title`.
 */
export async function openEditDialog(page: Page, title: string): Promise<void> {
    const idx = await getTaskRowIndex(page, title);
    expect(idx).toBeGreaterThanOrEqual(0);
    const taskRows = page.locator('tr').filter({ has: page.locator('input[placeholder="Titre"]') });
    await taskRows.nth(idx).getByRole('button', { name: 'menu-tâche' }).click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();
    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
}
