import { vi, describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import taskReducer from '../features/taskSlice';
import App from './App';

vi.mock('../hooks/useAppInitialized', () => ({
    useAppInitialized: vi.fn(),
}));

vi.mock('../features/userConfThunk', () => ({ loadUserConfThunk: vi.fn(() => ({ type: 'noop' })) }));
vi.mock('../features/localstorageThunk', () => ({ loadLocalStorageThunk: vi.fn(() => ({ type: 'noop' })) }));

vi.mock('./login', () => ({ default: () => <div>Login</div> }));
vi.mock('./appmenu', () => ({ default: () => <div>AppMenu</div> }));
vi.mock('./task-container', () => ({ default: () => <div>TaskContainer</div> }));
vi.mock('./main-bar', () => ({ default: () => <div>Mainbar</div> }));

import { useAppInitialized } from '../hooks/useAppInitialized';

function makeStore(userId = 'user-1') {
    const store = configureStore({ reducer: { tasks: taskReducer } });
    if (userId) {
        store.dispatch({ type: 'tasks/login', payload: { id: userId, email: 'u@t.com', accessToken: 'tok' } });
    }
    return store;
}

function renderApp(store) {
    render(<Provider store={store}><App /></Provider>);
}

describe('App — AppLoader', () => {

    test('affiche AppLoader quand useAppInitialized retourne false', () => {
        useAppInitialized.mockReturnValue(false);
        renderApp(makeStore());

        expect(screen.getByTestId('app-loader')).toBeInTheDocument();
    });

    test('n\'affiche pas AppLoader quand useAppInitialized retourne true', () => {
        useAppInitialized.mockReturnValue(true);
        renderApp(makeStore());

        expect(screen.queryByTestId('app-loader')).not.toBeInTheDocument();
    });
});
