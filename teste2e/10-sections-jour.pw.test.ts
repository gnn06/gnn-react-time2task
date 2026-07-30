import { test, expect, Page } from '@playwright/test';
import { uniqueTitle, creerTache, getTaskRowIndex, setInlineStatus, affecterCreneau, filtrerParStatut, filtrerParSlots } from './helpers/tasks';
import { mockSnapToday } from './helpers/snapdates';
import { setTaskSlotExpr, deleteE2ETasks, resetViewConf } from './helpers/tasks-api';
import { waitForAppReady } from './helpers/api';

// Sections jour rollingDays / weekDays des deux vues. Chaque test fixe le `today` STOCKÉ en
// mockant GET /SnapDates (RLS interdit l'écriture) AVANT le chargement de la page. Slots ciblés
// par data-slot-path ; cellules par data-testid lcell-<row>-<col> (liste) / tcell-<row>-<col>
// (arbre). Hypothèse : le compte E2E ne porte pas de tâche non-E2E sur les weekdays testés.

const WD = (day: string) => `this_month this_week ${day}`;

async function ouvrirApp(page: Page, weekday: string): Promise<void> {
    await mockSnapToday(page, weekday);
    await page.goto('');
    await expect(page.getByRole('button', { name: 'login' })).not.toBeVisible();
    await waitForAppReady(page);
}

async function ouvrirVue(page: Page, mode: 'List' | 'Tree'): Promise<void> {
    await page.getByRole('combobox', { name: 'slot-view-select' }).click();
    await page.getByRole('option', { name: mode }).click();
}

async function setNiveauMax(page: Page, label: 'Month' | 'Week' | 'Day' | 'Hour'): Promise<void> {
    await page.getByRole('combobox', { name: 'slot-level-max-select' }).click();
    await page.getByRole('option', { name: label }).click();
}

test.describe('Sections jour rollingDays / weekDays', () => {

    // Isolation : les tâches créées polluent l'occupation des slots des tests suivants ;
    // le niveau max / la vue changés dans l'UI persistent → restaurer la conf par défaut.
    test.afterEach(async () => {
        await deleteE2ETasks();
        await resetViewConf();
    });

    // Crée une tâche (UI) et lui affecte un créneau via API (fiable pour les ancres
    // today/tomorrow et les créneaux mixtes que le picker ne compose pas sûrement).
    async function tacheAvecCreneau(page: Page, title: string, slotExpr: string): Promise<void> {
        await creerTache(page, title);
        await setTaskSlotExpr(title, slotExpr);
    }

    // --- Vue LISTE ---

    test('liste, today mercredi — rollingDays et weekDays sur le present', async ({ page }) => {
        await ouvrirApp(page, 'mercredi');
        await ouvrirVue(page, 'List');

        await expect(page.getByTestId('lcell-rolling-jour-present').locator('[data-slot-path="today"]')).toBeVisible();
        await expect(page.getByTestId('lcell-rolling-jour-future').locator('[data-slot-path="tomorrow"]')).toBeVisible();
        await expect(page.getByTestId('lcell-weekdays-jour-present').locator(`[data-slot-path="${WD('mercredi')}"]`)).toBeVisible();
    });

    test('liste, weekDays — seuls les jours Past/Future porteurs de tâche s\'affichent', async ({ page }) => {
        await ouvrirApp(page, 'mercredi');
        const tMardi    = uniqueTitle('wd-mardi');
        const tVendredi = uniqueTitle('wd-vendredi');
        await creerTache(page, tMardi);
        await affecterCreneau(page, tMardi, WD('mardi'));
        await creerTache(page, tVendredi);
        await affecterCreneau(page, tVendredi, WD('vendredi'));
        await ouvrirVue(page, 'List');

        // mardi en Past, vendredi en Future
        await expect(page.getByTestId('lcell-weekdays-jour-past').locator(`[data-slot-path="${WD('mardi')}"]`)).toContainText(tMardi);
        await expect(page.getByTestId('lcell-weekdays-jour-future').locator(`[data-slot-path="${WD('vendredi')}"]`)).toContainText(tVendredi);
        // lundi (Past) et jeudi (Future) vides → masqués
        await expect(page.getByTestId('lcell-weekdays-jour-past').locator(`[data-slot-path="${WD('lundi')}"]`)).toHaveCount(0);
        await expect(page.getByTestId('lcell-weekdays-jour-future').locator(`[data-slot-path="${WD('jeudi')}"]`)).toHaveCount(0);
    });

    test('liste, weekDays — le Present reste affiché même vide', async ({ page }) => {
        await ouvrirApp(page, 'mercredi');
        await ouvrirVue(page, 'List');

        await expect(page.getByTestId('row-weekdays-jour')).toBeVisible();
        await expect(page.getByTestId('lcell-weekdays-jour-present').locator(`[data-slot-path="${WD('mercredi')}"]`)).toBeVisible();
        // Past et Future : aucun autre weekday (cellules vides)
        for (const wd of ['lundi', 'mardi']) {
            await expect(page.getByTestId('lcell-weekdays-jour-past').locator(`[data-slot-path="${WD(wd)}"]`)).toHaveCount(0);
        }
        for (const wd of ['jeudi', 'vendredi']) {
            await expect(page.getByTestId('lcell-weekdays-jour-future').locator(`[data-slot-path="${WD(wd)}"]`)).toHaveCount(0);
        }
    });

    test('liste, week-end — la ligne weekDays est omise, rollingDays reste', async ({ page }) => {
        await ouvrirApp(page, 'samedi');
        await ouvrirVue(page, 'List');

        await expect(page.getByTestId('row-rolling-jour')).toBeVisible();
        await expect(page.getByTestId('row-weekdays-jour')).toHaveCount(0);
    });

    test('liste, ligne heure — une tâche sur today matin s\'affiche au niveau heure', async ({ page }) => {
        await ouvrirApp(page, 'mercredi');
        const tache = uniqueTitle('hour-today-matin');
        await tacheAvecCreneau(page, tache, 'today matin');
        await page.reload();
        await waitForAppReady(page);
        await ouvrirVue(page, 'List');

        // La ligne heure rollingDays est affichée et porte la tâche (dans l'une de ses cellules ;
        // la colonne exacte matin→Past/Present dépend de l'heure système, non asserté).
        await expect(page.getByTestId('row-rolling-heure')).toBeVisible();
        await expect(page.locator('[data-testid^="lcell-rolling-heure-"]').filter({ hasText: tache })).toHaveCount(1);
        // Placée au slot le plus précis : pas de doublon dans la case jour de today.
        await expect(page.getByTestId('lcell-rolling-jour-present')).not.toContainText(tache);
    });

    // --- Vue ARBRE ---

    test('arbre, today mercredi — today/tomorrow alignés sous leur colonne', async ({ page }) => {
        await ouvrirApp(page, 'mercredi');
        // Le tree n'affiche rollingDays que s'il porte une tâche today/tomorrow.
        const tToday    = uniqueTitle('rd-today');
        const tTomorrow = uniqueTitle('rd-tomorrow');
        await tacheAvecCreneau(page, tToday, 'today');
        await tacheAvecCreneau(page, tTomorrow, 'tomorrow');
        await page.reload();
        await waitForAppReady(page);
        await ouvrirVue(page, 'Tree');

        // today aligné sous la colonne mercredi, tomorrow sous jeudi
        await expect(page.getByTestId('tcell-rolling-jour-mercredi')).toContainText(tToday);
        await expect(page.getByTestId('tcell-rolling-jour-jeudi')).toContainText(tTomorrow);
        // rollingDays sous la semaine courante uniquement : une seule cellule today
        await expect(page.getByTestId('tcell-rolling-jour-mercredi')).toHaveCount(1);
    });

    test('arbre, tâche mixte (colonnes différentes) — sous son weekday et sous today', async ({ page }) => {
        await ouvrirApp(page, 'mercredi');
        const tMixte = uniqueTitle('mixte-jeudi');
        await tacheAvecCreneau(page, tMixte, 'today jeudi');
        await page.reload();
        await waitForAppReady(page);
        await ouvrirVue(page, 'Tree');

        // weekDays : sous la colonne jeudi ; rollingDays : dans la cellule today (colonne mercredi)
        await expect(page.getByTestId('tcell-weekdays-jour-jeudi')).toContainText(tMixte);
        await expect(page.getByTestId('tcell-rolling-jour-mercredi')).toContainText(tMixte);
    });

    test('arbre, tâche mixte sur le même jour réel — familles non fusionnées', async ({ page }) => {
        await ouvrirApp(page, 'mercredi');
        const tMixte = uniqueTitle('mixte-mercredi');
        await tacheAvecCreneau(page, tMixte, 'today mercredi');
        await page.reload();
        await waitForAppReady(page);
        await ouvrirVue(page, 'Tree');

        // Les deux occurrences tombent dans la même colonne mercredi, sur deux lignes distinctes
        await expect(page.getByTestId('tcell-weekdays-jour-mercredi')).toContainText(tMixte);
        await expect(page.getByTestId('tcell-rolling-jour-mercredi')).toContainText(tMixte);
    });

    test('arbre, week-end — today et tomorrow empilés dans la colonne overflow', async ({ page }) => {
        await ouvrirApp(page, 'samedi');
        const tToday    = uniqueTitle('of-today');
        const tTomorrow = uniqueTitle('of-tomorrow');
        await tacheAvecCreneau(page, tToday, 'today');
        await tacheAvecCreneau(page, tTomorrow, 'tomorrow');
        await page.reload();
        await waitForAppReady(page);
        await ouvrirVue(page, 'Tree');

        // samedi/dimanche hors colonnes weekday → today et tomorrow dans la colonne overflow
        const overflow = page.getByTestId('tcell-rolling-jour-overflow');
        await expect(overflow).toContainText(tToday);
        await expect(overflow).toContainText(tTomorrow);
    });

    // --- Vérité unique : le filtre pilote AUSSI la vue (SlotPanel ≡ TaskPanel) ---

    for (const vue of ['List', 'Tree'] as const) {
        test(`${vue.toLowerCase()}, vérité unique — le filtre statut masque la tâche dans la vue`, async ({ page }) => {
            await ouvrirApp(page, 'mercredi');
            const tMardi = uniqueTitle('vu-mardi'); // passera "en cours"
            const tJeudi = uniqueTitle('vu-jeudi'); // reste "A faire"
            await creerTache(page, tMardi);
            await affecterCreneau(page, tMardi, WD('mardi'));
            await setInlineStatus(page, tMardi, 'en cours');
            await creerTache(page, tJeudi);
            await affecterCreneau(page, tJeudi, WD('jeudi'));
            await ouvrirVue(page, vue);

            // Avant filtre : les deux tâches sont visibles dans la vue
            await expect(page.locator(`[data-slot-path="${WD('mardi')}"]`)).toContainText(tMardi);
            await expect(page.locator(`[data-slot-path="${WD('jeudi')}"]`)).toContainText(tJeudi);

            await filtrerParStatut(page, 'en cours');

            // Après filtre : mardi reste (vue + liste des tâches), jeudi disparaît des deux
            await expect(page.locator(`[data-slot-path="${WD('mardi')}"]`)).toContainText(tMardi);
            await expect(page.getByText(tJeudi)).toHaveCount(0);
            expect(await getTaskRowIndex(page, tMardi)).toBeGreaterThanOrEqual(0);
            expect(await getTaskRowIndex(page, tJeudi)).toBe(-1);
        });
    }

    // --- Filtrage par slot : cas cross-famille today + mercredi ---

    test('filtrer par deux slots today et mercredi (cross-famille)', async ({ page }) => {
        await ouvrirApp(page, 'mercredi');
        const tToday    = uniqueTitle('slotf-today');
        const tMercredi = uniqueTitle('slotf-mercredi');
        const tJeudi    = uniqueTitle('slotf-jeudi'); // témoin, hors filtre
        await tacheAvecCreneau(page, tToday, 'today');
        await tacheAvecCreneau(page, tMercredi, WD('mercredi'));
        await tacheAvecCreneau(page, tJeudi, WD('jeudi'));
        await page.reload();
        await waitForAppReady(page);
        await ouvrirVue(page, 'Tree');

        // Filtre union sur les 2 familles du même jour réel : today (relatifPresent) + mercredi (relatifParent)
        await filtrerParSlots(page, ['today', WD('mercredi')]);

        // today et mercredi restent visibles (vue + task-list), jeudi disparaît des deux
        await expect(page.getByText(tToday)).toBeVisible();
        await expect(page.getByText(tMercredi)).toBeVisible();
        await expect(page.getByText(tJeudi)).toHaveCount(0);
        expect(await getTaskRowIndex(page, tToday)).toBeGreaterThanOrEqual(0);
        expect(await getTaskRowIndex(page, tMercredi)).toBeGreaterThanOrEqual(0);
        expect(await getTaskRowIndex(page, tJeudi)).toBe(-1);
    });

    // --- Bubbling : réduire le niveau max fait remonter la tâche (elle reste visible) ---

    for (const vue of ['List', 'Tree'] as const) {
        test(`${vue.toLowerCase()}, bubbling — réduire le niveau max fait remonter la tâche`, async ({ page }) => {
            await ouvrirApp(page, 'mercredi');
            const tache = uniqueTitle('bubble-mardi');
            await creerTache(page, tache);
            await affecterCreneau(page, tache, WD('mardi'));
            await ouvrirVue(page, vue);

            // Niveau jour : la tâche est dans la cellule mardi, pas encore sous this_week
            await expect(page.locator(`[data-slot-path="${WD('mardi')}"]`)).toContainText(tache);
            await expect(page.locator('[data-slot-path="this_month this_week"]')).not.toContainText(tache);

            // Niveau semaine : la ligne jour disparaît, la tâche remonte sous this_week (reste visible)
            await setNiveauMax(page, 'Week');

            await expect(page.locator(`[data-slot-path="${WD('mardi')}"]`)).toHaveCount(0);
            await expect(page.locator('[data-slot-path="this_month this_week"]')).toContainText(tache);
        });
    }
});
