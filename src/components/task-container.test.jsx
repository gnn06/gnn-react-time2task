import { vi, test, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import taskReducer, { editTask, setSlotViewFilterConfView } from '../features/taskSlice';
import { apiSlice } from '../features/apiSlice';
import TaskContainer from './task-container';

let capturedSlotPanelTasks, capturedTaskPanelTasks;
vi.mock('./slot-panel', () => ({ default: ({ tasks }) => { capturedSlotPanelTasks = tasks; return <div>SlotPanel</div> } }));
vi.mock('./task-panel',  () => ({ default: ({ tasks }) => { capturedTaskPanelTasks = tasks; return <div>TaskPanel</div>  } }));
vi.mock('react-resizable-panels', () => ({
    Group:     ({ children }) => <div>{children}</div>,
    Panel:     ({ children }) => <div>{children}</div>,
    Separator: () => <hr />,
}));

const TASK = { id: 42, title: 'tâche test', nextAction: '', url: '', slotExpr: '', status: 'à faire', activity: null, favorite: false, order: 1 };

const deleteSpy = vi.fn();

const server = setupServer(
    http.get(import.meta.env.VITE_API_URL + 'Activities', () => HttpResponse.json([])),
    http.delete(import.meta.env.VITE_API_URL + 'tasks', () => {
        deleteSpy();
        return HttpResponse.json({});
    }),
);

beforeAll(() => server.listen());
beforeEach(() => { capturedSlotPanelTasks = undefined; capturedTaskPanelTasks = undefined; });
afterEach(() => { server.resetHandlers(); deleteSpy.mockReset(); vi.restoreAllMocks(); });
afterAll(() => server.close());

function makeStore() {
    const store = configureStore({
        reducer: { tasks: taskReducer, [apiSlice.reducerPath]: apiSlice.reducer },
        middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware),
    });
    return store;
}

test('confirmer la suppression appelle deleteTask et ferme le dialog', async () => {
    const store = makeStore();
    await store.dispatch(apiSlice.util.upsertQueryData('getTasks', { userId: '', activity: null }, [TASK]));
    store.dispatch(editTask(TASK));

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<Provider store={store}><TaskContainer /></Provider>);

    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /supprimer/i }));

    expect(window.confirm).toHaveBeenCalledWith('Supprimer la tâche ?');
    await waitFor(() => expect(deleteSpy).toHaveBeenCalledOnce());
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
});

test('les deux panneaux reçoivent le même ensemble de tâches (vérité unique)', async () => {
    const WEEKDAY_TASK = { ...TASK, id: 1, slotExpr: 'this_month this_week lundi' };
    const TODAY_TASK   = { ...TASK, id: 2, slotExpr: 'today' };
    const store = makeStore();
    store.dispatch(setSlotViewFilterConfView({ view: 'list' }));
    await store.dispatch(apiSlice.util.upsertQueryData('getTasks', { userId: '', activity: null }, [WEEKDAY_TASK, TODAY_TASK]));
    await store.dispatch(apiSlice.util.upsertQueryData('getSnapDates', undefined, []));

    render(<Provider store={store}><TaskContainer /></Provider>);

    await waitFor(() => expect(capturedSlotPanelTasks).toBeDefined());

    const slotIds = capturedSlotPanelTasks.map(t => t.id).sort();
    const taskIds = capturedTaskPanelTasks.map(t => t.id).sort();

    // le filtre est la vérité unique : SlotPanel et TaskPanel affichent le même ensemble
    expect(slotIds).toEqual([1, 2]);
    expect(slotIds).toEqual(taskIds);
});

test('annuler la suppression ne ferme pas le dialog et ne supprime pas', async () => {
    const store = makeStore();
    await store.dispatch(apiSlice.util.upsertQueryData('getTasks', { userId: '', activity: null }, [TASK]));
    store.dispatch(editTask(TASK));

    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<Provider store={store}><TaskContainer /></Provider>);

    fireEvent.click(screen.getByRole('button', { name: /supprimer/i }));

    expect(window.confirm).toHaveBeenCalledWith('Supprimer la tâche ?');
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
});
