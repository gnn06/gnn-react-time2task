import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import taskReducer, { login } from '../features/taskSlice';
import { apiSlice } from '../features/apiSlice';
import AppMenu from './appmenu';

vi.mock('react-router', () => ({
    Link: ({ children, to }) => <a href={to}>{children}</a>,
}));
vi.mock('./logout',    () => ({ default: () => <button>Logout</button> }));
vi.mock('./changelog', () => ({ RELEASE: '01/01/2025' }));

vi.mock('../services/supabase', () => ({
    supabase: { auth: { refreshSession: vi.fn() } }
}));

vi.mock('../services/browser-storage', () => ({
    localStoreAccessToken: vi.fn(),
    localRemoveUser: vi.fn(),
    localRemoveAccessToken: vi.fn(),
    localRetrieveUser: vi.fn(),
    localRetrieveAccessToken: vi.fn(),
    localStoreUser: vi.fn(),
}));

function makeStore() {
    return configureStore({
        reducer: {
            tasks: taskReducer,
            [apiSlice.reducerPath]: apiSlice.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(apiSlice.middleware),
    });
}

describe('AppMenu — intégration useGlobalLoading', () => {

    beforeEach(() => {
        vi.spyOn(global, 'fetch').mockReturnValue(new Promise(() => {}));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('spinner visible quand app initialisée et une mutation est en cours', async () => {
        const store = makeStore();

        await store.dispatch(apiSlice.util.upsertQueryData('getTasks',      { userId: 'user-1', activity: null }, []));
        await store.dispatch(apiSlice.util.upsertQueryData('getActivities', undefined, []));
        store.dispatch(login({ id: 'user-1', email: 'u@t.com', accessToken: 'tok' }));

        render(<Provider store={store}><AppMenu /></Provider>);

        store.dispatch(apiSlice.endpoints.updateTask.initiate({ id: 1, title: 'test' }));

        await waitFor(() => {
            expect(screen.getByTestId('global-spinner')).toBeInTheDocument();
        });
    });

    test('spinner absent pendant le démarrage même avec des queries en pending', async () => {
        const store = makeStore();
        store.dispatch(login({ id: 'user-1', email: 'u@t.com', accessToken: 'tok' }));

        render(<Provider store={store}><AppMenu /></Provider>);

        // Attendre que les queries soient bien dispatched et en pending
        await waitFor(() => {
            const queries = Object.values(store.getState().api.queries);
            if (!queries.some(q => q?.status === 'pending')) throw new Error('queries not pending yet');
        });

        // Malgré les queries en pending, appInitialized est false → pas de spinner
        expect(screen.queryByTestId('global-spinner')).not.toBeInTheDocument();
    });
});
