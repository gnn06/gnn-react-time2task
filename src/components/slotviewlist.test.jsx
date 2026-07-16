import { vi, describe, test, expect, afterEach, beforeAll } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// Slot dépend de Redux/dnd/api ; on le stub pour tester la seule responsabilité de
// SlotViewList : structure des lignes (sections rollingDays / weekDays, ordre B,
// cellules week-end, lignes heure conditionnelles). Le placement des tâches (bubbling)
// est couvert au niveau data (slot-view.test.js, task.test.js).
vi.mock('./slot', () => ({
    default: ({ slot }) => (
        <span data-testid="slot" data-path={slot.path} data-inner={(slot.inner ?? []).map(s => s.id).join(',')}>
            {slot.path}
        </span>
    )
}));

import SlotViewList from './slotviewlist';

beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-12-20')); // mercredi, aligné sur SNAP_WED
});

const CONF = { collapse: [], remove: [], levelMin: null, levelMaxIncluded: null, view: 'list' };
// this_week = lundi 2023-12-18 ; today stocké = mercredi 2023-12-20 → tomorrow = jeudi.
const SNAP_WED = [{ slotid: 'this_week', date: '2023-12-18' }, { slotid: 'today', date: '2023-12-20' }];
// today stocké = vendredi → tomorrow = samedi (hors plage).
const SNAP_FRI = [{ slotid: 'this_week', date: '2023-12-18' }, { slotid: 'today', date: '2023-12-22' }];
// today stocké = samedi → today ET tomorrow hors plage.
const SNAP_SAT = [{ slotid: 'this_week', date: '2023-12-18' }, { slotid: 'today', date: '2023-12-23' }];

const paths = () => screen.getAllByTestId('slot').map(el => el.getAttribute('data-path'));
const innerOf = (path) => screen.getAllByTestId('slot').find(el => el.getAttribute('data-path') === path)?.getAttribute('data-inner');
const headerTexts = () => screen.getAllByText(/rollingDays|weekDays|Mois|Semaine|rollingHours|weekHours/).map(el => el.textContent.replace(/[‹\s]/g, ''));
const rowKeys = () => screen.getAllByTestId(/^row-/).map(el => el.getAttribute('data-testid').replace('row-', ''));

afterEach(() => cleanup());

describe('SlotViewList — sections rollingDays / weekDays', () => {
    test('sans tâche : lignes rollingDays et weekDays présentes, mercredi/jeudi mappés', () => {
        render(<SlotViewList tasks={[]} conf={CONF} snapDates={SNAP_WED} />);
        expect(screen.getByText(/rollingDays/)).toBeInTheDocument();
        expect(screen.getByText(/weekDays/)).toBeInTheDocument();
        const p = paths();
        expect(p).toContain('today');
        expect(p).toContain('tomorrow');
        expect(p).toContain('this_month this_week mercredi');
        expect(p).toContain('this_month this_week jeudi');
    });

    test('ordre B : rollingDays → weekDays → Semaine → Mois (du plus profond au plus superficiel)', () => {
        render(<SlotViewList tasks={[]} conf={CONF} snapDates={SNAP_WED} />);
        const h = headerTexts();
        expect(h.indexOf('rollingDays')).toBeLessThan(h.indexOf('weekDays'));
        expect(h.indexOf('weekDays')).toBeLessThan(h.indexOf('Semaine'));
        expect(h.indexOf('Semaine')).toBeLessThan(h.indexOf('Mois'));
    });

    test('week-end (today=vendredi) : weekDays present=vendredi, future vide', () => {
        render(<SlotViewList tasks={[]} conf={CONF} snapDates={SNAP_FRI} />);
        expect(screen.getByText(/weekDays/)).toBeInTheDocument();
        const p = paths();
        expect(p).toContain('this_month this_week vendredi');
        expect(p).not.toContain('this_month this_week samedi');
    });

    test('week-end (today=samedi) : Present/Future vides, Past = les 5 weekdays passés (ligne weekDays affichée)', () => {
        render(<SlotViewList tasks={[]} conf={CONF} snapDates={SNAP_SAT} />);
        expect(screen.getByText(/rollingDays/)).toBeInTheDocument();
        expect(screen.getByText(/weekDays/)).toBeInTheDocument();
        const p = paths();
        expect(p).toContain('this_month this_week lundi');
        expect(p).toContain('this_month this_week vendredi');
    });

    test('ligne heure rolling (primaire) toujours affichée même sans tâche ; weekHours (secondaire) seulement si tâches', () => {
        render(<SlotViewList tasks={[]} conf={CONF} snapDates={SNAP_WED} />);
        // rollingDays = type de jour PRINCIPAL de la vue list → sa ligne heure est structurelle.
        expect(screen.getByText(/rollingHours/)).toBeInTheDocument();
        // weekDays = type SECONDAIRE → pas de ligne heure sans tâche heure weekday.
        expect(screen.queryByText(/weekHours/)).not.toBeInTheDocument();
        cleanup();
        render(<SlotViewList tasks={[{ id: 1, title: 'a', slotExpr: 'today matin' }]} conf={CONF} snapDates={SNAP_WED} />);
        expect(screen.getByText(/rollingHours/)).toBeInTheDocument();
        expect(paths()).toContain('today matin');
    });

    test('une seule ligne heure par section : matin et aprem cohabitent dans la même ligne (Present/Future)', () => {
        render(<SlotViewList tasks={[
            { id: 1, title: 'a', slotExpr: 'today matin' },
            { id: 2, title: 'b', slotExpr: 'today aprem' },
        ]} conf={CONF} snapDates={SNAP_WED} />);
        expect(rowKeys().filter(k => k === 'rolling-heure')).toHaveLength(1);
        const p = paths();
        expect(p).toContain('today matin');
        expect(p).toContain('today aprem');
    });

    test('entrelacement heure : rolling puis weekDays', () => {
        render(<SlotViewList tasks={[
            { id: 1, title: 'a', slotExpr: 'today matin' },
            { id: 2, title: 'b', slotExpr: 'this_week mercredi matin' },
        ]} conf={CONF} snapDates={SNAP_WED} />);
        const p = paths();
        expect(p).toContain('today matin');
        expect(p).toContain('this_month this_week mercredi matin');
        // rollingDays (jour) avant weekDays (jour), puis heure rolling avant heure weekDays
        expect(p.indexOf('today matin')).toBeLessThan(p.indexOf('this_month this_week mercredi matin'));
    });

    test('niveau heure (rollingHours) au-dessus du niveau jour (rollingDays/weekDays)', () => {
        render(<SlotViewList tasks={[{ id: 1, title: 'a', slotExpr: 'today matin' }]} conf={CONF} snapDates={SNAP_WED} />);
        const h = headerTexts();
        expect(h.indexOf('rollingHours')).toBeLessThan(h.indexOf('rollingDays'));
    });

    test('rollingDays précède toujours weekDays (garanti par construction, pas par le hasard des données)', () => {
        render(<SlotViewList tasks={[]} conf={CONF} snapDates={SNAP_WED} />);
        const keys = rowKeys();
        expect(keys.indexOf('rolling-jour')).toBeLessThan(keys.indexOf('weekdays-jour'));
    });

    test('rolling précède weekdays au niveau heure quand les deux ont des tâches', () => {
        render(<SlotViewList tasks={[
            { id: 1, title: 'a', slotExpr: 'today matin' },
            { id: 2, title: 'b', slotExpr: 'this_week mercredi matin' },
            { id: 3, title: 'c', slotExpr: 'today aprem' },
            { id: 4, title: 'd', slotExpr: 'this_week mercredi aprem' },
        ]} conf={CONF} snapDates={SNAP_WED} />);
        const keys = rowKeys();
        expect(keys.indexOf('rolling-heure')).toBeLessThan(keys.indexOf('weekdays-heure'));
        expect(keys.indexOf('rolling-jour')).toBeLessThan(keys.indexOf('weekdays-jour'));
    });

    test('niveau max = jour (3) : pas de ligne heure, mais les cases today/mercredi restent sans inner pour que les tâches heure y bubblent (ne disparaissent pas)', () => {
        render(<SlotViewList tasks={[
            { id: 1, title: 'a', slotExpr: 'today matin' },
            { id: 2, title: 'b', slotExpr: 'this_week mercredi aprem' },
        ]} conf={{ ...CONF, levelMaxIncluded: 3 }} snapDates={SNAP_WED} />);
        expect(rowKeys()).not.toContain('rolling-heure');
        expect(rowKeys()).not.toContain('weekdays-heure');
        // inner vide : findTaskBySlotExpr (task.js) ne doit pas exclure ces tâches heure de la
        // case jour, faute de quoi elles disparaîtraient (aucune ligne heure pour les recevoir).
        expect(innerOf('today')).toBe('');
        expect(innerOf('this_month this_week mercredi')).toBe('');
    });

    test('niveau max = heure (4, sans restriction) : les cases today/mercredi gardent matin/aprem en inner', () => {
        render(<SlotViewList tasks={[
            { id: 1, title: 'a', slotExpr: 'today matin' },
            { id: 2, title: 'b', slotExpr: 'this_week mercredi aprem' },
        ]} conf={CONF} snapDates={SNAP_WED} />);
        expect(innerOf('today')).toBe('matin,aprem');
        expect(innerOf('this_month this_week mercredi')).toBe('matin,aprem');
    });

    test('niveau max = semaine (2) : pas de lignes rollingDays / weekDays', () => {
        render(<SlotViewList tasks={[]} conf={{ ...CONF, levelMaxIncluded: 2 }} snapDates={SNAP_WED} />);
        expect(screen.queryByText(/rollingDays/)).not.toBeInTheDocument();
        expect(screen.queryByText(/weekDays/)).not.toBeInTheDocument();
    });

    test('tâche sur un jour passé (mardi aprem, today=mercredi) : pas de ligne heure weekDays (secondaire), bubble sur weekDays', () => {
        render(<SlotViewList tasks={[
            { id: 1, title: 'a', slotExpr: 'this_week mardi aprem' },
        ]} conf={CONF} snapDates={SNAP_WED} />);
        // Section secondaire : la tâche du jour passé ne crée pas de ligne 'weekdays-heure'.
        expect(screen.queryByText(/weekHours/)).not.toBeInTheDocument();
        const keys = rowKeys();
        expect(keys).not.toContain('weekdays-heure');
        // La ligne weekDays reste affichée avec la case mardi (Past) : la tâche y bubble.
        expect(keys).toContain('weekdays-jour');
        expect(paths()).toContain('this_month this_week mardi');
    });

    test('tâche sur un jour futur (vendredi aprem, today=mercredi) : symétrique, pas de ligne heure weekDays non plus', () => {
        render(<SlotViewList tasks={[
            { id: 1, title: 'a', slotExpr: 'this_week vendredi aprem' },
        ]} conf={CONF} snapDates={SNAP_WED} />);
        expect(screen.queryByText(/weekHours/)).not.toBeInTheDocument();
        expect(rowKeys()).not.toContain('weekdays-heure');
        expect(paths()).toContain('this_month this_week vendredi');
    });

    test('tâche sur tomorrow aprem (jour futur rolling) : la ligne heure rolling (primaire) reste toujours affichée', () => {
        render(<SlotViewList tasks={[
            { id: 1, title: 'a', slotExpr: 'tomorrow aprem' },
        ]} conf={CONF} snapDates={SNAP_WED} />);
        // rollingHours (primaire) toujours présente ; weekHours (secondaire) absente.
        expect(screen.getByText(/rollingHours/)).toBeInTheDocument();
        expect(screen.queryByText(/weekHours/)).not.toBeInTheDocument();
        expect(rowKeys()).toContain('rolling-heure');
        expect(paths()).toContain('tomorrow');
    });
});
