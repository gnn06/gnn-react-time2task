import { describe, test, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';

import SlotSelect from './slot-select';

// snapDates : this_week = lundi 2024-12-30 ; next_week = 2025-01-06 ; today = 2025-01-03
const SNAP_DATES = [
    { slotid: 'this_month', date: '2025-01' },
    { slotid: 'this_week',  date: '2024-12-30' },
    { slotid: 'today',      date: '2025-01-03' },
];

const renderSlot = (slot, snapDates = SNAP_DATES) => render(
    <SlotSelect slot={slot} selection={new Map()} snapDates={snapDates} />
);

describe('SlotSelect — date affichée dans le titre', () => {
    test.each([
        ['mois courant',                  { id: 'this_month',  path: 'this_month' },                                 '2025-01'],
        ['mois suivant',                  { id: 'next_month',  path: 'next_month' },                                 '2025-02'],
        ['semaine suivante',              { id: 'next_week',   path: 'this_month next_week' },                       '2025-01-06'],
        ['jour de la semaine courante',   { id: 'mardi',       path: 'this_month this_week mardi' },                 '2024-12-31'],
        ['jour de la semaine suivante',   { id: 'mardi',       path: 'this_month next_week mardi' },                 '2025-01-07'],
        ['jour d\'une semaine décalée',   { id: 'lundi',       path: 'this_month following_week + 1 lundi' },        '2025-01-20'],
        ['semaine décalée',               { id: 'following_week + 1', path: 'this_month following_week + 1' },       '2025-01-20'],
        ['today',                         { id: 'today',       path: 'this_month this_week today' },                 '2025-01-03'],
        ['tomorrow',                      { id: 'tomorrow',    path: 'this_month this_week tomorrow' },              '2025-01-04'],
    ])('%s', (_, slot, expected) => {
        renderSlot({ ...slot, inner: [] });
        expect(screen.getByText(new RegExp(expected))).toBeInTheDocument();
    });

    test.each([
        ['matin', 'this_month this_week mardi matin'],
        ['aprem', 'this_month next_week mardi aprem'],
    ])('niveau heure (%s) : aucune date', (id, path) => {
        renderSlot({ id, path, inner: [] });
        expect(screen.queryByText(/\d{4}-\d{2}/)).not.toBeInTheDocument();
    });

    describe('sans snapDates (pas encore chargées) : dates calculées depuis les valeurs par défaut', () => {
        beforeAll(() => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2025, 0, 3, 13, 35, 45)); // vendredi 2025-01-03 → this_week = 2024-12-30
        });
        afterAll(() => vi.useRealTimers());

        test.each([undefined, []])('snapDates = %j', (snapDates) => {
            renderSlot({ id: 'mardi', path: 'this_month next_week mardi', inner: [] }, snapDates);
            expect(screen.getByText(/2025-01-07/)).toBeInTheDocument();
        });
    });
});
