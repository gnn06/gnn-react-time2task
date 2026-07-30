import { vi, describe, test, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// Slot dépend de Redux/dnd/api ; on le stub pour tester la seule responsabilité de
// SlotViewTree : structure de la grille + section rollingDays (présence, alignement,
// overflow). Le placement des tâches (bubbling/duplication) est couvert au niveau data
// (findTaskBySlotExpr, slot-view.test.js / task.test.js).
vi.mock('./slot', () => ({
    default: ({ slot }) => <span data-testid="slot" data-path={slot.path}>{slot.path}</span>
}));

import SlotViewTree from './slotviewtree';

const CONF = { collapse: [], remove: [], levelMin: null, levelMaxIncluded: null, view: 'tree' };
// this_week = lundi 2023-12-18 ; today stocké = mercredi 2023-12-20.
const SNAP_WED = [{ slotid: 'this_week', date: '2023-12-18' }, { slotid: 'today', date: '2023-12-20' }];
// today stocké = vendredi 2023-12-22.
const SNAP_FRI = [{ slotid: 'this_week', date: '2023-12-18' }, { slotid: 'today', date: '2023-12-22' }];
// today stocké = samedi 2023-12-23 : today ET tomorrow (dimanche) débordent → double overflow.
const SNAP_SAT = [{ slotid: 'this_week', date: '2023-12-18' }, { slotid: 'today', date: '2023-12-23' }];

const paths = () => screen.getAllByTestId('slot').map(el => el.getAttribute('data-path'));

afterEach(() => cleanup());

describe('SlotViewTree — section rollingDays', () => {
    test('sans tâche today/tomorrow : pas de section rollingDays', () => {
        render(<SlotViewTree tasks={[{ id: 1, title: 'a', slotExpr: 'this_week mardi' }]} conf={CONF} snapDates={SNAP_WED} />);
        expect(screen.queryByText(/rollingDays/)).not.toBeInTheDocument();
        expect(paths()).not.toContain('today');
    });

    test('une tâche today : section rollingDays avec le nœud today', () => {
        render(<SlotViewTree tasks={[{ id: 1, title: 'a', slotExpr: 'today' }]} conf={CONF} snapDates={SNAP_WED} />);
        expect(screen.getByText(/rollingDays/)).toBeInTheDocument();
        expect(paths()).toContain('today');
    });

    test('tâche tomorrow un vendredi : débordement → nœud tomorrow rendu (colonne overflow)', () => {
        render(<SlotViewTree tasks={[{ id: 1, title: 'a', slotExpr: 'tomorrow' }]} conf={CONF} snapDates={SNAP_FRI} />);
        expect(screen.getByText(/rollingDays/)).toBeInTheDocument();
        expect(paths()).toContain('tomorrow');
    });

    test('double débordement week-end : today ET tomorrow rendus dans la colonne overflow', () => {
        render(<SlotViewTree tasks={[
            { id: 1, title: 'a', slotExpr: 'today' },
            { id: 2, title: 'b', slotExpr: 'tomorrow' },
        ]} conf={CONF} snapDates={SNAP_SAT} />);
        expect(screen.getByText(/rollingDays/)).toBeInTheDocument();
        const p = paths();
        expect(p).toContain('today');
        expect(p).toContain('tomorrow');
    });

    test('niveau max = semaine (2) : pas de section rollingDays', () => {
        render(<SlotViewTree tasks={[{ id: 1, title: 'a', slotExpr: 'today' }]} conf={{ ...CONF, levelMaxIncluded: 2 }} snapDates={SNAP_WED} />);
        expect(screen.queryByText(/rollingDays/)).not.toBeInTheDocument();
    });

    test('type principal (weekDays) : lignes heure affichées même sans tâche ; rolling (secondaire) seulement si tâches', () => {
        const { container } = render(<SlotViewTree tasks={[{ id: 1, title: 'a', slotExpr: 'this_week mardi' }]} conf={CONF} snapDates={SNAP_WED} />);
        const headers = [...container.querySelectorAll('div')]
            .filter(d => /sideways/.test(d.getAttribute('style') || ''))
            .map(d => d.textContent.replace(/[‹\s]+$/, ''));
        // weekHours (primaire) présent bien qu'aucune tâche n'ait de créneau heure.
        expect(headers).toContain('weekHours');
        // rollingHours (secondaire) absent sans tâche today/tomorrow heure.
        expect(headers).not.toContain('rollingHours');
    });

    test('titres homogènes avec la vue list : weekHours / rollingHours', () => {
        const { container } = render(<SlotViewTree tasks={[
            { id: 1, title: 'a', slotExpr: 'this_week mercredi matin' },
            { id: 2, title: 'b', slotExpr: 'today aprem' },
        ]} conf={CONF} snapDates={SNAP_WED} />);
        const headers = [...container.querySelectorAll('div')]
            .filter(d => /sideways/.test(d.getAttribute('style') || ''))
            .map(d => d.textContent.replace(/[‹\s]+$/, ''));
        // Les lignes heure portent le libellé de famille (pas Matin/Aprem).
        expect(headers).not.toContain('Matin');
        expect(headers).not.toContain('Aprem');
        expect(headers).toContain('weekHours');
        expect(headers).toContain('rollingHours');
    });

    test('ordre des lignes : weekDays, rollingDays, puis les heures weekDay, puis les heures rollingDay', () => {
        const { container } = render(<SlotViewTree tasks={[
            { id: 1, title: 'a', slotExpr: 'this_week mercredi matin' },
            { id: 2, title: 'b', slotExpr: 'today aprem' },
        ]} conf={CONF} snapDates={SNAP_WED} />);

        // Labels des en-têtes de ligne dans l'ordre du DOM (chevrons retirés).
        const headers = [...container.querySelectorAll('div')]
            .filter(d => /sideways/.test(d.getAttribute('style') || ''))
            .map(d => d.textContent.replace(/[‹\s]+$/, ''));

        // La section rollingDays n'existe que sous la semaine courante → en-tête unique.
        const rolling = headers.indexOf('rollingDays');
        expect(rolling).toBeGreaterThan(-1);

        // Ligne jour weekDay immédiatement suivie de la ligne jour rollingDay,
        // puis les heures weekDay (Matin/Aprem), puis les heures rollingDay (Aprem).
        expect(headers.slice(rolling - 1, rolling + 4))
            .toEqual(['weekDays', 'rollingDays', 'weekHours', 'weekHours', 'rollingHours']);
    });
});
