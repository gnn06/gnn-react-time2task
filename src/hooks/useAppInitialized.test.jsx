import { vi, describe, test, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import taskReducer from '../features/taskSlice';
import { useAppInitialized } from './useAppInitialized';

vi.mock('../features/apiSlice', () => ({
    useGetTasksQuery: vi.fn(),
    useGetActivitiesQuery: vi.fn(),
}));

import { useGetTasksQuery, useGetActivitiesQuery } from '../features/apiSlice';

function makeStore(userId = '') {
    const store = configureStore({ reducer: { tasks: taskReducer } });
    if (userId) {
        store.dispatch({ type: 'tasks/login', payload: { id: userId, email: 'u@t.com', accessToken: 'tok' } });
    }
    return store;
}

function renderWithStore(store) {
    return renderHook(() => useAppInitialized(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
}

describe('useAppInitialized', () => {

    test('retourne true quand userId est vide (écran de login)', () => {
        useGetTasksQuery.mockReturnValue({ isLoading: false });
        useGetActivitiesQuery.mockReturnValue({ isLoading: false });

        const { result } = renderWithStore(makeStore(''));
        expect(result.current).toBe(true);
    });

    test('retourne false quand getTasks est en isLoading', () => {
        useGetTasksQuery.mockReturnValue({ isLoading: true });
        useGetActivitiesQuery.mockReturnValue({ isLoading: false });

        const { result } = renderWithStore(makeStore('user-1'));
        expect(result.current).toBe(false);
    });

    test('retourne false quand getActivities est en isLoading', () => {
        useGetTasksQuery.mockReturnValue({ isLoading: false });
        useGetActivitiesQuery.mockReturnValue({ isLoading: true });

        const { result } = renderWithStore(makeStore('user-1'));
        expect(result.current).toBe(false);
    });

    test('retourne true quand les deux queries sont terminées', () => {
        useGetTasksQuery.mockReturnValue({ isLoading: false });
        useGetActivitiesQuery.mockReturnValue({ isLoading: false });

        const { result } = renderWithStore(makeStore('user-1'));
        expect(result.current).toBe(true);
    });
});
