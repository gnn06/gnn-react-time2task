import { test, expect, Page } from '@playwright/test';
import { uniqueTitle, creerTache, getTaskRowIndex, setInlineStatus, TEST_ACTIVITY } from './helpers/tasks';


const taskRows = (page: Page) =>
    page.locator('tr').filter({ has: page.locator('input[placeholder="Titre"]') });

async function affecterCreneau(page: Page, title: string, slotPath: string): Promise<void> {
    const idx = await getTaskRowIndex(page, title);
    await taskRows(page).nth(idx).getByRole('button', { name: 'Choix créneau' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('dialog').locator(`[data-slot-path="${slotPath}"] div.title`).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    await page.waitForLoadState('networkidle');
}

async function closeFiltresMenu(page: Page): Promise<void> {
    // Use backdrop click as escape does not work
    await page.locator('.MuiBackdrop-root').first().click();
    await expect(page.getByRole('menu')).toHaveCount(0, { timeout: 5000 });
}

test.describe('Filtrage des tâches', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('');
        await expect(page.getByRole('button', { name: 'login' })).not.toBeVisible();
    });

    test('filtrer par statut', async ({ page }) => {
        const titleEnCours = uniqueTitle('filtre-statut-encours');
        const titleAFaire  = uniqueTitle('filtre-statut-afaire');

        await creerTache(page, titleEnCours);
        await setInlineStatus(page, titleEnCours, 'en cours');
        await creerTache(page, titleAFaire);  // statut initial : "A faire"

        // Ouvrir Filtres > status > cocher "en cours"
        await page.getByRole('button', { name: /Filtres/ }).click();
        await page.getByRole('menuitem', { name: 'status' }).hover();
        // use getByRole ('checkBox') instead of 'menuitem'
        await expect(page.getByRole('checkbox', { name: 'en cours' })).toBeVisible();
        await page.getByRole('checkbox', { name: 'en cours' }).click();
        await closeFiltresMenu(page);

        // "en cours" doit être visible, "A faire" doit disparaître
        await expect(async () => {
            const idxEnCours = await getTaskRowIndex(page, titleEnCours);
            const idxAFaire  = await getTaskRowIndex(page, titleAFaire);
            expect(idxEnCours).toBeGreaterThanOrEqual(0);
            expect(idxAFaire).toBe(-1);
        }).toPass({ timeout: 5000 });
    });

    test('filtrer par activité', async ({ page }) => {
        const titleAvecActivite  = uniqueTitle('filtre-activite-avec');
        const titleSansActivite  = uniqueTitle('filtre-activite-sans');

        await creerTache(page, titleSansActivite);  // pas d'activité
        await creerTache(page, titleAvecActivite);

        // Assigner TEST_ACTIVITY inline
        const taskRows = page.locator('tr').filter({ has: page.locator('input[placeholder="Titre"]') });
        const idx = await getTaskRowIndex(page, titleAvecActivite);
        const row = taskRows.nth(idx);
        const activityCombobox = row.getByRole('combobox', { name: 'activité' });
        await activityCombobox.click();
        await activityCombobox.pressSequentially(TEST_ACTIVITY);
        const option = page.getByRole('option', { name: TEST_ACTIVITY }).first();
        await expect(option).toBeVisible();
        await option.click();
        await page.waitForLoadState('networkidle');
        await expect(async () => {
            const i = await getTaskRowIndex(page, titleAvecActivite);
            expect(i).toBeGreaterThanOrEqual(0);
            await expect(taskRows.nth(i)).toContainText(TEST_ACTIVITY);
        }).toPass({ timeout: 10000 });

        // Ouvrir Filtres > activité > cocher TEST_ACTIVITY
        await page.getByRole('button', { name: /Filtres/ }).click();
        await page.getByRole('menuitem', { name: 'activité' }).hover();
        await expect(page.getByRole('checkbox', { name: TEST_ACTIVITY })).toBeVisible();
        await page.getByRole('checkbox', { name: TEST_ACTIVITY }).click();
        await closeFiltresMenu(page);

        // Tâche avec activité visible, tâche sans activité masquée
        await expect(async () => {
            const idxAvec  = await getTaskRowIndex(page, titleAvecActivite);
            const idxSans  = await getTaskRowIndex(page, titleSansActivite);
            expect(idxAvec).toBeGreaterThanOrEqual(0);
            expect(idxSans).toBe(-1);
        }).toPass({ timeout: 5000 });
    });

    test('réinitialiser les filtres', async ({ page }) => {
        const titleEnCours = uniqueTitle('filtre-reset-encours');
        const titleAFaire  = uniqueTitle('filtre-reset-afaire');

        await creerTache(page, titleEnCours);
        await setInlineStatus(page, titleEnCours, 'en cours');
        await creerTache(page, titleAFaire);

        // Appliquer filtre statut "en cours"
        await page.getByRole('button', { name: /Filtres/ }).click();
        await page.getByRole('menuitem', { name: 'status' }).hover();
        await expect(page.getByRole('checkbox', { name: 'en cours' })).toBeVisible();
        await page.getByRole('checkbox', { name: 'en cours' }).click();
        await closeFiltresMenu(page);

        // Vérifier que titleAFaire est masqué
        await expect(async () => {
            expect(await getTaskRowIndex(page, titleAFaire)).toBe(-1);
        }).toPass({ timeout: 5000 });

        // Réinitialiser via l'icône Clear du bouton Filtres
        await page.getByTestId('ClearIcon').click();

        // Les deux tâches doivent réapparaître
        await expect(async () => {
            expect(await getTaskRowIndex(page, titleEnCours)).toBeGreaterThanOrEqual(0);
            expect(await getTaskRowIndex(page, titleAFaire)).toBeGreaterThanOrEqual(0);
        }).toPass({ timeout: 5000 });
    });

    test('filtrer par créneau', async ({ page }) => {
        const titleMardi = uniqueTitle('filtre-creneau-mardi');
        const titleJeudi = uniqueTitle('filtre-creneau-jeudi');

        await creerTache(page, titleMardi);
        await creerTache(page, titleJeudi);
        await affecterCreneau(page, titleMardi, 'this_month this_week mardi');
        await affecterCreneau(page, titleJeudi, 'this_month this_week jeudi');

        // Ouvrir le picker créneau et sélectionner "mardi"
        await page.getByRole('button', { name: 'filtre-créneau' }).click();
        await page.getByTestId('slot-picker-popper')
                  .locator('[data-slot-path="this_month this_week mardi"]')
                  .click();

        // Seule la tâche "mardi" reste visible, "jeudi" est masquée
        await expect(async () => {
            expect(await getTaskRowIndex(page, titleMardi)).toBeGreaterThanOrEqual(0);
            expect(await getTaskRowIndex(page, titleJeudi)).toBe(-1);
        }).toPass({ timeout: 5000 });
    });

    test('réinitialiser le filtre créneau', async ({ page }) => {
        const titleAvecCreneau = uniqueTitle('filtre-creneau-reset-avec');
        const titleSansCreneau = uniqueTitle('filtre-creneau-reset-sans');

        await creerTache(page, titleSansCreneau);
        await creerTache(page, titleAvecCreneau);
        await affecterCreneau(page, titleAvecCreneau, 'this_month this_week mardi');

        // Appliquer le filtre créneau
        await page.getByRole('button', { name: 'filtre-créneau' }).click();
        await page.getByTestId('slot-picker-popper')
                  .locator('[data-slot-path="this_month this_week mardi"]')
                  .click();

        // Vérifier que titleSansCreneau est masqué
        await expect(async () => {
            expect(await getTaskRowIndex(page, titleSansCreneau)).toBe(-1);
        }).toPass({ timeout: 5000 });

        // Réinitialiser via l'icône Clear du bouton filtre-créneau
        await page.getByRole('button', { name: 'filtre-créneau' })
                  .locator('[data-testid="ClearIcon"]')
                  .click();

        // Les deux tâches doivent réapparaître
        await expect(async () => {
            expect(await getTaskRowIndex(page, titleAvecCreneau)).toBeGreaterThanOrEqual(0);
            expect(await getTaskRowIndex(page, titleSansCreneau)).toBeGreaterThanOrEqual(0);
        }).toPass({ timeout: 5000 });
    });
});
