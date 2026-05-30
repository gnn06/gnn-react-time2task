import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import taskReducer from '../features/taskSlice';
import { login } from '../features/taskSlice';
import { apiSlice } from '../features/apiSlice';
import App from './App';

vi.mock('../services/supabase', () => ({
    supabase: {
        auth: {
            refreshSession: vi.fn(),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        }
    }
}));

vi.mock('../services/browser-storage', () => ({
    localStoreAccessToken: vi.fn(),
    localRemoveUser: vi.fn(),
    localRemoveAccessToken: vi.fn(),
    localRetrieveUser: vi.fn(),
    localRetrieveAccessToken: vi.fn(),
    localStoreUser: vi.fn(),
}));

vi.mock('../features/userConfThunk', () => ({ loadUserConfThunk: vi.fn(() => ({ type: 'noop' })) }));

vi.mock('./login', () => ({ default: () => <div>Login</div> }));
vi.mock('./appmenu', () => ({ default: () => <div>AppMenu</div> }));
vi.mock('./task-container', () => ({ default: () => <div>TaskContainer</div> }));
vi.mock('./main-bar', () => ({ default: () => <div>Mainbar</div> }));

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

describe('App — intégration useAppInitialized + AppLoader', () => {

    beforeEach(() => {
        vi.spyOn(global, 'fetch').mockReturnValue(new Promise(() => {}));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('AppLoader est affiché pendant le chargement initial des données', async () => {
        const store = makeStore();
        store.dispatch(login({ id: 'user-1', email: 'u@t.com', accessToken: 'tok' }));

        render(<Provider store={store}><App /></Provider>);

        await waitFor(() => {
            expect(screen.getByTestId('app-loader')).toBeInTheDocument();
        });
    });

    test('AppLoader est absent quand tasks et activités sont déjà en cache', async () => {
        const store = makeStore();

        await store.dispatch(apiSlice.util.upsertQueryData('getTasks', { userId: 'user-1', activity: null }, []));
        await store.dispatch(apiSlice.util.upsertQueryData('getActivities', undefined, []));

        store.dispatch(login({ id: 'user-1', email: 'u@t.com', accessToken: 'tok' }));

        render(<Provider store={store}><App /></Provider>);

        expect(screen.queryByTestId('app-loader')).not.toBeInTheDocument();
    });
});
