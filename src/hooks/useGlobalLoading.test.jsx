import { vi, describe, test, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import taskReducer from '../features/taskSlice';
import { selectAnyPending, useGlobalLoading } from './useGlobalLoading';

vi.mock('./useAppInitialized', () => ({
    useAppInitialized: vi.fn(),
}));

import { useAppInitialized } from './useAppInitialized';

function makeStore(apiState = { queries: {}, mutations: {} }) {
    return configureStore({
        reducer: {
            tasks: taskReducer,
            api: () => apiState,
        },
    });
}

function renderWithStore(store) {
    return renderHook(() => useGlobalLoading(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
}

describe('selectAnyPending', () => {

    test('retourne false quand queries et mutations sont vides', () => {
        expect(selectAnyPending({ api: { queries: {}, mutations: {} } })).toBe(false);
    });

    test('retourne true quand une query est pending', () => {
        const state = { api: { queries: { q1: { status: 'pending' } }, mutations: {} } };
        expect(selectAnyPending(state)).toBe(true);
    });

    test('retourne true quand une mutation est pending', () => {
        const state = { api: { queries: {}, mutations: { m1: { status: 'pending' } } } };
        expect(selectAnyPending(state)).toBe(true);
    });

    test('retourne false quand toutes les queries sont fulfilled', () => {
        const state = {
            api: {
                queries: { q1: { status: 'fulfilled' }, q2: { status: 'fulfilled' } },
                mutations: { m1: { status: 'fulfilled' } },
            },
        };
        expect(selectAnyPending(state)).toBe(false);
    });

    test('gère les entrées null/undefined dans le state', () => {
        const state = { api: { queries: { q1: null, q2: undefined }, mutations: {} } };
        expect(selectAnyPending(state)).toBe(false);
    });
});

describe('useGlobalLoading', () => {

    test('retourne false quand appInitialized est false (démarrage)', () => {
        useAppInitialized.mockReturnValue(false);
        const store = makeStore({ queries: { q1: { status: 'pending' } }, mutations: {} });

        const { result } = renderWithStore(store);
        expect(result.current).toBe(false);
    });

    test('retourne false quand appInitialized est true mais aucune requête pending', () => {
        useAppInitialized.mockReturnValue(true);
        const store = makeStore({ queries: { q1: { status: 'fulfilled' } }, mutations: {} });

        const { result } = renderWithStore(store);
        expect(result.current).toBe(false);
    });

    test('retourne true quand appInitialized et une requête est pending', () => {
        useAppInitialized.mockReturnValue(true);
        const store = makeStore({ queries: { q1: { status: 'pending' } }, mutations: {} });

        const { result } = renderWithStore(store);
        expect(result.current).toBe(true);
    });

    test('retourne true quand appInitialized et une mutation est pending', () => {
        useAppInitialized.mockReturnValue(true);
        const store = makeStore({ queries: {}, mutations: { m1: { status: 'pending' } } });

        const { result } = renderWithStore(store);
        expect(result.current).toBe(true);
    });
});
