import { vi, describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import taskSlice from './taskSlice';
import { loadAllUserConfThunk } from './loadConfThunk';

vi.spyOn(console, 'error').mockImplementation(() => {});

vi.mock('./apiSlice', () => ({
    apiSlice: {
        endpoints: { getUserConfs: { initiate: vi.fn() } },
        reducer: {},
        reducerPath: 'api',
        middleware: () => (next) => (action) => next(action),
    },
}));

const calls = [];
vi.mock('./userConfThunk', () => ({
    VIEW_CONF_KEY: 'slotviewconf',
    restoreViewConfThunk: vi.fn((value) => async () => { calls.push(['view', value]); }),
}));
vi.mock('./filterConfThunk', () => ({
    FILTER_CONF_KEY: 'filterconf',
    restoreFilterConfThunk: vi.fn((value) => async () => { calls.push(['filter', value]); }),
}));

import { apiSlice } from './apiSlice';

const queryResult = (result) => () => {
    const promise = Promise.resolve(result);
    promise.unsubscribe = vi.fn();
    return promise;
};

const makeStore = () => configureStore({
    reducer: { tasks: taskSlice, [apiSlice.reducerPath]: apiSlice.reducer },
    middleware: (gdm) => gdm({ serializableCheck: false }).concat(apiSlice.middleware),
});

describe('loadAllUserConfThunk', () => {
    let store;
    beforeEach(() => {
        vi.clearAllMocks();
        calls.length = 0;
        store = makeStore();
    });

    it('charge vue et filtres en UN seul appel', async () => {
        apiSlice.endpoints.getUserConfs.initiate.mockReturnValue(queryResult({ data: {} }));

        await store.dispatch(loadAllUserConfThunk('user123'));

        expect(apiSlice.endpoints.getUserConfs.initiate).toHaveBeenCalledTimes(1);
        expect(apiSlice.endpoints.getUserConfs.initiate).toHaveBeenCalledWith(
            { userId: 'user123', confs: ['slotviewconf', 'filterconf'] },
            { forceRefetch: true }
        );
    });

    it('restaure la vue avant les filtres (les prédicats dépendent du niveau de la vue)', async () => {
        const view = { slotViewFilterConf: { view: 'tree' } };
        const filter = { filterConf: { expression: 'x' } };
        apiSlice.endpoints.getUserConfs.initiate.mockReturnValue(queryResult({ data: { slotviewconf: view, filterconf: filter } }));

        await store.dispatch(loadAllUserConfThunk('user123'));

        expect(calls).toEqual([['view', view], ['filter', filter]]);
    });

    it('marque la conf comme chargée une fois restaurée', async () => {
        apiSlice.endpoints.getUserConfs.initiate.mockReturnValue(queryResult({ data: {} }));
        expect(store.getState().tasks.userConfLoaded).toBe(false);

        await store.dispatch(loadAllUserConfThunk('user123'));

        expect(store.getState().tasks.userConfLoaded).toBe(true);
    });

    it('marque la conf comme chargée même en cas d’erreur, pour ne pas bloquer l’écran', async () => {
        apiSlice.endpoints.getUserConfs.initiate.mockReturnValue(queryResult({ error: new Error('KO') }));

        await store.dispatch(loadAllUserConfThunk('user123'));

        expect(store.getState().tasks.userConfLoaded).toBe(true);
        expect(console.error).toHaveBeenCalled();
        expect(calls).toEqual([]);
    });

    it('marque la conf comme chargée même si une restauration lève', async () => {
        const { restoreViewConfThunk } = await import('./userConfThunk');
        restoreViewConfThunk.mockReturnValueOnce(async () => { throw new Error('boom'); });
        apiSlice.endpoints.getUserConfs.initiate.mockReturnValue(queryResult({ data: { slotviewconf: {} } }));

        await expect(store.dispatch(loadAllUserConfThunk('user123'))).resolves.not.toThrow();

        expect(store.getState().tasks.userConfLoaded).toBe(true);
    });
});
