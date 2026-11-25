import { vi, describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import taskSlice, { login, logout, setTaskFilter, setFilterSlot, setFilterGeneric, setSlotViewFilterConfLevel } from './taskSlice';
import { saveFilterConfThunk, loadFilterConfThunk } from './filterConfThunk';

vi.spyOn(console, 'error').mockImplementation(() => {});

vi.mock('./apiSlice', () => ({
    apiSlice: {
        endpoints: {
            upsertUserConf: { initiate: vi.fn() },
            getUserConf: { initiate: vi.fn() },
            getActivities: { initiate: vi.fn() },
        },
        reducer: {},
        reducerPath: 'api',
        middleware: () => (next) => (action) => next(action),
    },
}));

const mockPredicate = () => true;
const mockImprecisePredicate = () => false;
vi.mock('../components/task-filter', () => ({
    createFilterConfig: vi.fn((activities, level) => [
        { key: 'status', type: 'multiselect', options: ['todo', 'done'] },
        { key: 'activity', type: 'multiselect', options: [...activities.map(a => a.id), null] },
        { key: 'isRepeat', type: 'slotexpr', options: [true, false], predicate: mockPredicate },
        { key: 'isImprecise', type: 'slotexpr', options: [true, false], predicate: level === 2 ? mockImprecisePredicate : mockPredicate },
    ]),
}));

import { apiSlice } from './apiSlice';
import { createFilterConfig } from '../components/task-filter';

const makeStore = () => configureStore({
    reducer: { tasks: taskSlice, [apiSlice.reducerPath]: apiSlice.reducer },
    middleware: (gdm) => gdm({ serializableCheck: false }).concat(apiSlice.middleware),
});

/** initiate() renvoie un thunk dont le dispatch donne une promesse avec unsubscribe, comme RTK Query */
const queryResult = (result) => () => {
    const promise = Promise.resolve(result);
    promise.unsubscribe = vi.fn();
    return promise;
};

describe('saveFilterConfThunk', () => {
    let store;
    beforeEach(() => {
        vi.clearAllMocks();
        store = makeStore();
        store.dispatch(login({ id: 'user123', email: 'a@b.c' }));
        apiSlice.endpoints.upsertUserConf.initiate.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
    });

    it('enregistre expression, slots et filtres sous la clé filterconf', async () => {
        store.dispatch(setTaskFilter({ filter: 'lundi' }));
        store.dispatch(setFilterSlot('this_week mardi'));
        store.dispatch(setFilterGeneric({ status: ['todo'], isRepeat: mockPredicate }));

        await store.dispatch(saveFilterConfThunk());

        expect(apiSlice.endpoints.upsertUserConf.initiate).toHaveBeenCalledWith({
            userId: 'user123',
            conf: 'filterconf',
            value: { filterConf: { expression: 'lundi', slots: ['this_week mardi'], genericFilters: { status: ['todo'], isRepeat: true } } },
        });
    });

    it('n’appelle pas l’API sans utilisateur connecté', async () => {
        store.dispatch(logout());
        await store.dispatch(saveFilterConfThunk());
        expect(apiSlice.endpoints.upsertUserConf.initiate).not.toHaveBeenCalled();
    });

    it('gère une erreur d’API sans lever', async () => {
        apiSlice.endpoints.upsertUserConf.initiate.mockReturnValue({ unwrap: vi.fn().mockRejectedValue(new Error('KO')) });
        await expect(store.dispatch(saveFilterConfThunk())).resolves.not.toThrow();
        expect(console.error).toHaveBeenCalled();
    });
});

describe('loadFilterConfThunk', () => {
    let store;
    beforeEach(() => {
        vi.clearAllMocks();
        store = makeStore();
        apiSlice.endpoints.getActivities.initiate.mockReturnValue(queryResult({ data: [{ id: 1, label: 'A' }] }));
    });

    it('restaure le filtre depuis la conf persistée, prédicats reconstruits', async () => {
        apiSlice.endpoints.getUserConf.initiate.mockReturnValue(queryResult({
            data: { filterConf: { expression: 'lundi', slots: ['today'], genericFilters: { status: ['todo'], isRepeat: true, activity: [1, 99] } } },
        }));

        await store.dispatch(loadFilterConfThunk('user123'));

        const { currentFilter } = store.getState().tasks;
        expect(currentFilter.expression).toBe('lundi');
        expect(currentFilter.slots).toEqual(['today']);
        expect(currentFilter.genericFilters).toEqual({ status: ['todo'], isRepeat: mockPredicate, activity: [1] });
        expect(apiSlice.endpoints.getUserConf.initiate).toHaveBeenCalledWith({ userId: 'user123', conf: 'filterconf' }, { forceRefetch: true });
    });

    it('construit les prédicats avec le niveau max de la vue déjà chargé', async () => {
        store.dispatch(setSlotViewFilterConfLevel({ level: 2 }));
        apiSlice.endpoints.getUserConf.initiate.mockReturnValue(queryResult({
            data: { filterConf: { genericFilters: { isImprecise: true } } },
        }));

        await store.dispatch(loadFilterConfThunk('user123'));

        expect(createFilterConfig).toHaveBeenCalledWith([{ id: 1, label: 'A' }], 2);
        expect(store.getState().tasks.currentFilter.genericFilters.isImprecise).toBe(mockImprecisePredicate);
    });

    it('ne change rien quand aucune conf n’est persistée', async () => {
        apiSlice.endpoints.getUserConf.initiate.mockReturnValue(queryResult({ data: null }));
        const before = store.getState().tasks.currentFilter;

        await store.dispatch(loadFilterConfThunk('user123'));

        expect(store.getState().tasks.currentFilter).toEqual(before);
    });

    it('ne change rien et loggue en cas d’erreur de chargement', async () => {
        apiSlice.endpoints.getUserConf.initiate.mockReturnValue(queryResult({ error: new Error('KO') }));
        const before = store.getState().tasks.currentFilter;

        await store.dispatch(loadFilterConfThunk('user123'));

        expect(store.getState().tasks.currentFilter).toEqual(before);
        expect(console.error).toHaveBeenCalled();
    });

    it('restaure quand même (sans filtre activité) si les activités sont indisponibles', async () => {
        apiSlice.endpoints.getActivities.initiate.mockReturnValue(queryResult({ error: new Error('KO') }));
        apiSlice.endpoints.getUserConf.initiate.mockReturnValue(queryResult({
            data: { filterConf: { genericFilters: { status: ['done'], activity: [1] } } },
        }));

        await store.dispatch(loadFilterConfThunk('user123'));

        expect(store.getState().tasks.currentFilter.genericFilters).toEqual({ status: ['done'] });
    });
});
