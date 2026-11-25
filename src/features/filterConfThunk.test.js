import { vi, describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import taskSlice, { login, logout, setTaskFilter, setFilterSlot, setFilterGeneric, setSlotViewFilterConfLevel } from './taskSlice';
import { saveFilterConfThunk, restoreFilterConfThunk } from './filterConfThunk';

vi.spyOn(console, 'error').mockImplementation(() => {});

vi.mock('./apiSlice', () => ({
    apiSlice: {
        endpoints: {
            upsertUserConf: { initiate: vi.fn() },
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

describe('restoreFilterConfThunk', () => {
    let store;
    beforeEach(() => {
        vi.clearAllMocks();
        store = makeStore();
        apiSlice.endpoints.getActivities.initiate.mockReturnValue(queryResult({ data: [{ id: 1, label: 'A' }] }));
    });

    it('restaure le filtre depuis la valeur persistée, prédicats reconstruits', async () => {
        const value = { filterConf: { expression: 'lundi', slots: ['today'], genericFilters: { status: ['todo'], isRepeat: true, activity: [1, 99] } } };

        await store.dispatch(restoreFilterConfThunk(value));

        const { currentFilter } = store.getState().tasks;
        expect(currentFilter.expression).toBe('lundi');
        expect(currentFilter.slots).toEqual(['today']);
        expect(currentFilter.genericFilters).toEqual({ status: ['todo'], isRepeat: mockPredicate, activity: [1] });
    });

    it('construit les prédicats avec le niveau max de la vue déjà restauré', async () => {
        store.dispatch(setSlotViewFilterConfLevel({ level: 2 }));

        await store.dispatch(restoreFilterConfThunk({ filterConf: { genericFilters: { isImprecise: true } } }));

        expect(createFilterConfig).toHaveBeenCalledWith([{ id: 1, label: 'A' }], 2);
        expect(store.getState().tasks.currentFilter.genericFilters.isImprecise).toBe(mockImprecisePredicate);
    });

    it.each([['null', null], ['undefined', undefined]])('ne change rien quand aucune valeur n’est persistée (%s)', async (_, value) => {
        const before = store.getState().tasks.currentFilter;

        await store.dispatch(restoreFilterConfThunk(value));

        expect(store.getState().tasks.currentFilter).toEqual(before);
        expect(apiSlice.endpoints.getActivities.initiate).not.toHaveBeenCalled();
    });

    it('restaure quand même (sans filtre activité) si les activités sont indisponibles', async () => {
        apiSlice.endpoints.getActivities.initiate.mockReturnValue(queryResult({ error: new Error('KO') }));

        await store.dispatch(restoreFilterConfThunk({ filterConf: { genericFilters: { status: ['done'], activity: [1] } } }));

        expect(store.getState().tasks.currentFilter.genericFilters).toEqual({ status: ['done'] });
    });
});
