import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import ShiftAction from './action-shift';
import tasksReducer from '../features/taskSlice';

vi.mock('../features/apiSlice.js', () => ({
    useGetSnapDatesQuery: () => ({ data: [], isSuccess: true }),
    useUpdateSnapDateMutation: () => [vi.fn(), { isLoading: false, error: null }],
    useUpdateTaskMutation: () => [vi.fn(), { error: null }],
    useGetTasksQuery: () => ({ data: [] }),
    useGetActivitiesQuery: () => ({ data: [] }),
}));

const createMockStore = () => configureStore({
    reducer: { tasks: tasksReducer },
    preloadedState: {
        tasks: {
            user: { id: 'user123' },
            currentActivity: 'activity1',
        },
    },
});

const wrapper = ({ children }) => (
    <Provider store={createMockStore()}>{children}</Provider>
);

describe('ShiftAction', () => {
    it('affiche un libellé de bouton générique valable pour tous les niveaux (jour/semaine/mois)', () => {
        render(<ShiftAction />, { wrapper });

        expect(screen.getByRole('button', { name: /Démarrer Créneau/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Démarrer Semaine/i })).not.toBeInTheDocument();
    });

    it("propose le niveau 'day' comme sélection par défaut à l'ouverture du dialog", () => {
        render(<ShiftAction />, { wrapper });

        fireEvent.click(screen.getByRole('button', { name: /Démarrer Créneau/i }));

        const dialog = screen.getByTestId('confirm-dialog');
        expect(within(dialog).getByText('day')).toBeInTheDocument();
    });

    it("ne mentionne plus de vocabulaire propre au niveau semaine (next/following) dans le texte explicatif", () => {
        render(<ShiftAction />, { wrapper });

        fireEvent.click(screen.getByRole('button', { name: /Démarrer Créneau/i }));

        const dialog = screen.getByTestId('confirm-dialog');
        expect(within(dialog).queryByText(/following devient next/i)).not.toBeInTheDocument();
    });
});
