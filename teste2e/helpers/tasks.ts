import { Page, expect } from '@playwright/test';
import { waitForApiIdle } from './api';

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
    await page.getByRole('button', { name: 'Confirmer' }).click();
    await waitForApiIdle(page);

    await expect(async () => {
        const found = await page.evaluate((t) =>
            Array.from(document.querySelectorAll('input[placeholder="Titre"]'))
                .some(el => (el as HTMLInputElement).value === t)
        , title);
        expect(found).toBe(true);
    }).toPass({ timeout: 3000 });
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
    await waitForApiIdle(page);

    await expect(async () => {
        const i = await getTaskRowIndex(page, title);
        expect(i).toBeGreaterThanOrEqual(0);
        await expect(taskRows.nth(i)).toContainText(status);
    }).toPass({ timeout: 3000 });
}

/**
 * Affecte un créneau (par son data-slot-path) à une tâche via la dialog de sélection.
 */
export async function affecterCreneau(page: Page, title: string, slotPath: string): Promise<void> {
    const taskRows = page.locator('tr').filter({ has: page.locator('input[placeholder="Titre"]') });
    const idx = await getTaskRowIndex(page, title);
    expect(idx).toBeGreaterThanOrEqual(0);
    await taskRows.nth(idx).getByRole('button', { name: 'Choix créneau' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('dialog').locator(`[data-slot-path="${slotPath}"] div.title`).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    await waitForApiIdle(page);
}

/**
 * Applique un filtre par slot(s) via le picker « filtre-créneau ». setFilterSlot accumule
 * jusqu'à 2 slots (union) ; on clique chaque data-slot-path dans le popper. Le popper reste
 * ouvert (le filtre est réactif) — il n'occulte pas les assertions de visibilité/task-list.
 */
export async function filtrerParSlots(page: Page, slotPaths: string[]): Promise<void> {
    await page.getByRole('button', { name: 'filtre-créneau' }).click();
    const popper = page.getByTestId('slot-picker-popper');
    await expect(popper).toBeVisible();
    for (const path of slotPaths) {
        await popper.locator(`[data-slot-path="${path}"]`).first().click();
    }
}

/**
 * Applique un filtre par statut depuis le menu Filtres, puis referme le menu.
 */
export async function filtrerParStatut(page: Page, status: string): Promise<void> {
    await page.getByRole('button', { name: /Filtres/ }).click();
    await page.getByRole('menuitem', { name: 'status' }).hover();
    await expect(page.getByRole('checkbox', { name: status })).toBeVisible();
    await page.getByRole('checkbox', { name: status }).click();
    // Fermeture par clic sur le backdrop (Échap ne fonctionne pas sur ce menu).
    await page.locator('.MuiBackdrop-root').first().click();
    await expect(page.getByRole('menu')).toHaveCount(0, { timeout: 5000 });
}

/**
 * Ouvre la dialog d'édition pour la tâche dont le titre est `title`.
 */
export async function openEditDialog(page: Page, title: string): Promise<void> {
    const idx = await getTaskRowIndex(page, title);
    expect(idx).toBeGreaterThanOrEqual(0);
    const taskRows = page.locator('tr').filter({ has: page.locator('input[placeholder="Titre"]') });
    await taskRows.nth(idx).getByRole('button', { name: 'éditer-tâche' }).click();
    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
}
