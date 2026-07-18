import moment from 'moment';
import { Page } from '@playwright/test';

// Le today STOCKÉ (table SnapDates) pilote les colonnes/sections des vues, pas l'horloge.
// La table est protégée par une RLS qui interdit l'écriture côté client (ANON_KEY) ; on ne
// peut donc pas la seeder. On force plutôt la RÉPONSE de GET /SnapDates via page.route, ce
// qui suffit : getCurrentWeekdayId lit ce que renvoie getSnapDates. À appeler AVANT le
// chargement de la page (la 1re requête SnapDates doit être interceptée). L'interception est
// portée par la page/contexte du test et disparaît en fin de test — aucune restauration.

const WEEKDAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

// Trois SnapDates cohérents pour un `today` donné : this_month (mois du today),
// this_week (lundi isoWeek du today), today. getCurrentWeekdayId = diff(today, this_week).
function snapPayload(today: moment.Moment): Array<{ slotid: string; date: string }> {
    const monday = today.clone().startOf('isoWeek');
    return [
        { slotid: 'this_month', date: today.clone().startOf('month').format('YYYY-MM') },
        { slotid: 'this_week',  date: monday.format('YYYY-MM-DD') },
        { slotid: 'today',      date: today.format('YYYY-MM-DD') },
    ];
}

/** Force le today stocké sur le <weekday> (lundi..dimanche) de la semaine réelle courante. */
export async function mockSnapToday(page: Page, weekday: string): Promise<void> {
    const offset = WEEKDAYS.indexOf(weekday);
    if (offset === -1) throw new Error(`weekday inconnu : ${weekday}`);
    const today = moment().startOf('isoWeek').add(offset, 'days');
    const body = JSON.stringify(snapPayload(today));
    await page.route(
        (url) => url.pathname.endsWith('/SnapDates'),
        (route) => {
            if (route.request().method() !== 'GET') return route.continue();
            return route.fulfill({ status: 200, contentType: 'application/json', body });
        },
    );
}
