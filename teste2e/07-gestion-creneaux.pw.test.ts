import { test, expect, Page } from '@playwright/test';
import { uniqueTitle, creerTache, getTaskRowIndex } from './helpers/tasks';
import { waitForApiIdle } from './helpers/api';


const taskRows = (page: Page) =>
    page.locator('tr').filter({ has: page.locator('input[placeholder="Titre"]') });

/**
 * Retourne l'indicateur de créneau d'une tâche : "E", "1", "M" ou "R"
 */
async function getTaskIndicator(page: Page, title: string): Promise<string> {
    const idx = await getTaskRowIndex(page, title);
    expect(idx).toBeGreaterThanOrEqual(0);
    return (await taskRows(page).nth(idx).locator('span.font-bold').textContent()) ?? '';
}

/**
 * Ouvre la dialog de sélection de créneau pour une tâche
 */
async function openSlotDialog(page: Page, title: string): Promise<void> {
    const idx = await getTaskRowIndex(page, title);
    expect(idx).toBeGreaterThanOrEqual(0);
    await taskRows(page).nth(idx).getByRole('button', { name: 'Choix créneau' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
}

/**
 * Vérifie que la tâche est présente dans le panneau de créneau.
 * slotPath : chemin complet du créneau, ex: 'this_month this_week lundi'
 * Utilise data-slot-path sur le conteneur Slot pour cibler sans ambiguïté.
 */
async function expectTaskInSlotPanel(page: Page, taskTitle: string, slotPath: string): Promise<void> {
    await expect(
        page.locator(`[data-slot-path="${slotPath}"]`)
            .filter({ has: page.locator('div.grow').filter({ hasText: taskTitle }) })
            .first()
    ).toBeVisible({ timeout: 20000 });
}

async function clickSlot(dialog: ReturnType<Page['getByRole']>, slotPath: string): Promise<void> {
    // On clique sur div.title (texte du créneau, en haut de la carte) plutôt que sur la carte entière,
    // pour éviter que le click ne soit intercepté par les boutons d'action qui apparaissent au hover.
    await dialog.locator(`[data-slot-path="${slotPath}"] div.title`).click();
}

test.describe('Gestion des créneaux', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('');
        await expect(page.getByRole('button', { name: 'login' })).not.toBeVisible();
    });

    test('affecter un créneau à une tâche sans créneau', async ({ page }) => {
        const title = uniqueTitle('créneau-affecter-mardi');
        await creerTache(page, title);

        // Affecter "this_week lundi"
        await openSlotDialog(page, title);
        const dialog = page.getByRole('dialog');
        await clickSlot(dialog, 'this_month this_week mardi');
        await dialog.getByRole('button', { name: 'Confirm' }).click();
        await waitForApiIdle(page);

        await expectTaskInSlotPanel(page, title, 'this_month this_week mardi');
    });

    test('changer le créneau d\'une tâche (lundi → mardi)', async ({ page }) => {
        const title = uniqueTitle('créneau-changer-mardi');
        await creerTache(page, title);

        // Affectation initiale : lundi
        await openSlotDialog(page, title);
        const dialog1 = page.getByRole('dialog');
        await clickSlot(dialog1, 'this_month this_week lundi');
        await dialog1.getByRole('button', { name: 'Confirm' }).click();
        await waitForApiIdle(page);

        await expectTaskInSlotPanel(page, title, 'this_month this_week lundi');

        // Changer vers mardi : désélectionner lundi, sélectionner mardi
        await openSlotDialog(page, title);
        const dialog2 = page.getByRole('dialog');
        await clickSlot(dialog2, 'this_month this_week lundi');  // désélectionne (isInside → handleDelete)
        await clickSlot(dialog2, 'this_month this_week mardi');  // sélectionne (handleAdd)
        
        await dialog2.getByRole('button', { name: 'Confirm' }).click();
        await waitForApiIdle(page);

        await expectTaskInSlotPanel(page, title, 'this_month this_week mardi');
    });

    test('affecter plusieurs créneaux (mercredi + jeudi)', async ({ page }) => {
        const title = uniqueTitle('créneau-multi');
        await creerTache(page, title);

        await openSlotDialog(page, title);
        const dialog = page.getByRole('dialog');
        await clickSlot(dialog, 'this_month this_week mercredi');
        await clickSlot(dialog, 'this_month this_week jeudi');
        await dialog.getByRole('button', { name: 'Confirm' }).click();
        await waitForApiIdle(page);

        await expectTaskInSlotPanel(page, title, 'this_month this_week mercredi');
        await expectTaskInSlotPanel(page, title, 'this_month this_week jeudi');
    });

    test('ajouter une répétition sur un créneau (this_week)', async ({ page }) => {
        const title = uniqueTitle('créneau-répétition');
        await creerTache(page, title);

        await openSlotDialog(page, title);
        const dialog = page.getByRole('dialog');

        // Sélectionner this_week
        await clickSlot(dialog, 'this_month this_week');
        
        // puis activer la répétition (icône Loop visible au hover)
        const thisWeekCard = dialog.locator('[data-slot-path="this_month this_week"]');
        await thisWeekCard.hover(); // hover pour afficher les boutons d'action
        await dialog.getByRole('button').nth(4).click(); // cliquer sur le bouton d'action "Ajouter une répétition" (le 5ème bouton, index 4)

        await dialog.getByRole('button', { name: 'Confirm' }).click();
        await waitForApiIdle(page);

        await expectTaskInSlotPanel(page, title, 'this_month this_week');
        await expectTaskInSlotPanel(page, title, 'this_month next_week');

    });
});
