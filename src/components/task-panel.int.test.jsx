import { vi, test, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import taskReducer from '../features/taskSlice';
import { apiSlice } from '../features/apiSlice';
import TaskContainer from './task-container';

// On monte le vrai TaskPanel : c'est l'ordre rendu que ce test verrouille.
// SlotPanel dispose les tâches en cellules (tri par order local) et n'est pas concerné.
vi.mock('./slot-panel', () => ({ default: () => <div>SlotPanel</div> }));
vi.mock('react-resizable-panels', () => ({
    Group:     ({ children }) => <div>{children}</div>,
    Panel:     ({ children }) => <div>{children}</div>,
    Separator: () => <hr />,
}));

// Réponse API brute (PostgREST) : servie dans le désordre, et avec des `ordre` qui
// contredisent le tri attendu — seul le créneau doit décider.
const ROWS = [
    { id: 1, Sujet: 'lundi matin',  slotExpr: 'this_month this_week lundi matin',  Etat: 'à faire', ordre: 1, Activity: null },
    { id: 2, Sujet: 'today aprem',  slotExpr: 'this_month this_week today aprem',  Etat: 'à faire', ordre: 2, Activity: null },
    { id: 3, Sujet: 'mardi',        slotExpr: 'this_month this_week mardi',        Etat: 'à faire', ordre: 3, Activity: null },
    { id: 4, Sujet: 'today matin',  slotExpr: 'this_month this_week today matin',  Etat: 'à faire', ordre: 4, Activity: null },
    { id: 5, Sujet: 'tomorrow',     slotExpr: 'this_month this_week tomorrow',     Etat: 'à faire', ordre: 5, Activity: null },
    { id: 6, Sujet: 'today',        slotExpr: 'this_month this_week today',        Etat: 'à faire', ordre: 6, Activity: null },
];

const server = setupServer(
    http.get(import.meta.env.VITE_API_URL + 'tasks',      () => HttpResponse.json(ROWS)),
    http.get(import.meta.env.VITE_API_URL + 'Activities', () => HttpResponse.json([])),
    http.get(import.meta.env.VITE_API_URL + 'SnapDates',  () => HttpResponse.json([])),
);

beforeAll(() => server.listen());
afterEach(() => { server.resetHandlers(); vi.restoreAllMocks(); });
afterAll(() => server.close());

function makeStore() {
    return configureStore({
        reducer: { tasks: taskReducer, [apiSlice.reducerPath]: apiSlice.reducer },
        middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware),
    });
}

test('le taskPanel affiche les today avant les weekdays, heure par heure', async () => {
    render(<Provider store={makeStore()}><TaskContainer /></Provider>);

    await waitFor(() => expect(screen.getByText(/6 tâche\(s\)/)).toBeInTheDocument());

    // les titres, dans l'ordre où le DOM les rend (la dernière ligne est la ligne de création)
    const titles = screen.getAllByPlaceholderText('Titre').map(input => input.value).filter(Boolean);

    expect(titles).toEqual([
        'today matin',
        'today aprem',
        'today',        // sans heure : ferme le bloc today
        'tomorrow',
        'lundi matin',
        'mardi',
    ]);
});
