import { vi, describe, test, expect, afterEach, beforeAll } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// Slot dépend de Redux/dnd/api ; on le stub pour tester la seule responsabilité de
// SlotViewList : structure des lignes (sections rollingDays / weekDays, ordre B,
// cellules week-end, lignes heure conditionnelles). Le placement des tâches (bubbling)
// est couvert au niveau data (slot-view.test.js, task.test.js).
vi.mock('./slot', () => ({
    default: ({ slot }) => <span data-testid="slot" data-path={slot.path}>{slot.path}</span>
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
const headerTexts = () => screen.getAllByText(/rollingDays|weekDays|Mois|Semaine|Matin|Aprem/).map(el => el.textContent.replace(/[‹\s]/g, ''));
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

    test('lignes heure émises seulement si tâches (today matin → ligne Matin rolling)', () => {
        const { rerender } = render(<SlotViewList tasks={[]} conf={CONF} snapDates={SNAP_WED} />);
        expect(screen.queryByText(/Matin/)).not.toBeInTheDocument();
        rerender(<SlotViewList tasks={[{ id: 1, title: 'a', slotExpr: 'today matin' }]} conf={CONF} snapDates={SNAP_WED} />);
        expect(screen.getByText(/Matin/)).toBeInTheDocument();
        expect(paths()).toContain('today matin');
    });

    test('entrelacement heure : rolling Matin puis weekDays Matin', () => {
        render(<SlotViewList tasks={[
            { id: 1, title: 'a', slotExpr: 'today matin' },
            { id: 2, title: 'b', slotExpr: 'this_week mercredi matin' },
        ]} conf={CONF} snapDates={SNAP_WED} />);
        const p = paths();
        expect(p).toContain('today matin');
        expect(p).toContain('this_month this_week mercredi matin');
        // rollingDays (jour) avant weekDays (jour), puis Matin rolling avant Matin weekDays
        expect(p.indexOf('today matin')).toBeLessThan(p.indexOf('this_month this_week mercredi matin'));
    });

    test('niveau heure (Matin) au-dessus du niveau jour (rollingDays/weekDays)', () => {
        render(<SlotViewList tasks={[{ id: 1, title: 'a', slotExpr: 'today matin' }]} conf={CONF} snapDates={SNAP_WED} />);
        const h = headerTexts();
        expect(h.indexOf('Matin')).toBeLessThan(h.indexOf('rollingDays'));
    });

    test('rollingDays précède toujours weekDays (garanti par construction, pas par le hasard des données)', () => {
        render(<SlotViewList tasks={[]} conf={CONF} snapDates={SNAP_WED} />);
        const keys = rowKeys();
        expect(keys.indexOf('rolling-jour')).toBeLessThan(keys.indexOf('weekdays-jour'));
    });

    test('rolling précède weekdays à chaque niveau heure quand les deux ont des tâches', () => {
        render(<SlotViewList tasks={[
            { id: 1, title: 'a', slotExpr: 'today matin' },
            { id: 2, title: 'b', slotExpr: 'this_week mercredi matin' },
            { id: 3, title: 'c', slotExpr: 'today aprem' },
            { id: 4, title: 'd', slotExpr: 'this_week mercredi aprem' },
        ]} conf={CONF} snapDates={SNAP_WED} />);
        const keys = rowKeys();
        expect(keys.indexOf('rolling-matin')).toBeLessThan(keys.indexOf('weekdays-matin'));
        expect(keys.indexOf('rolling-aprem')).toBeLessThan(keys.indexOf('weekdays-aprem'));
        expect(keys.indexOf('rolling-jour')).toBeLessThan(keys.indexOf('weekdays-jour'));
    });

    test('niveau max = semaine (2) : pas de lignes rollingDays / weekDays', () => {
        render(<SlotViewList tasks={[]} conf={{ ...CONF, levelMaxIncluded: 2 }} snapDates={SNAP_WED} />);
        expect(screen.queryByText(/rollingDays/)).not.toBeInTheDocument();
        expect(screen.queryByText(/weekDays/)).not.toBeInTheDocument();
    });
});
