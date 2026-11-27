import { vi, describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { DndContext } from '@dnd-kit/core';

import { configureTestStorePreloaded } from '../features/test-store';

// snapDates : this_week = lundi 2024-12-30 ; next_week = 2025-01-06 ; today = 2025-01-03
vi.mock('../features/apiSlice', async (importOriginal) => ({
    ...(await importOriginal()),
    useGetSnapDatesQuery: () => ({
        data: [
            { slotid: 'this_month', date: '2025-01' },
            { slotid: 'this_week',  date: '2024-12-30' },
            { slotid: 'today',      date: '2025-01-03' },
        ],
        isSuccess: true,
    }),
}));

import Slot from './slot';

const renderSlot = (slot) => render(
    <Provider store={configureTestStorePreloaded({ user: { id: 12 } })}>
        <DndContext><Slot slot={slot} tasks={[]} /></DndContext>
    </Provider>
);

describe('Slot — date affichée dans le titre', () => {
    test('jour de la semaine courante : date de cette semaine', () => {
        renderSlot({ id: 'mardi', path: 'this_month this_week mardi', inner: [] });
        expect(screen.getByText(/2024-12-31/)).toBeInTheDocument();
    });

    test('jour de next_week : date de la semaine suivante (et non celle de la semaine courante)', () => {
        renderSlot({ id: 'mardi', path: 'this_month next_week mardi', inner: [] });
        expect(screen.getByText(/2025-01-07/)).toBeInTheDocument();
        expect(screen.queryByText(/2024-12-31/)).not.toBeInTheDocument();
    });

    test('jour de following_week + 1', () => {
        renderSlot({ id: 'lundi', path: 'this_month following_week + 1 lundi', inner: [] });
        expect(screen.getByText(/2025-01-20/)).toBeInTheDocument();
    });

    test('niveau heure : aucune date', () => {
        renderSlot({ id: 'matin', path: 'this_month next_week mardi matin', inner: [] });
        expect(screen.queryByText(/\d{4}-\d{2}/)).not.toBeInTheDocument();
    });
});
