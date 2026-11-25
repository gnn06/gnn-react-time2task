import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import taskSlice, { login, setTaskFilter, setFilterGeneric, setFilterSlot, setFilterConf, setFilterIsMulti, setFilterTaskId } from './taskSlice';
import { createFilterConfListener, FILTER_CONF_SAVE_DELAY } from './filterConfListener';

vi.mock('./filterConfThunk', () => ({
    saveFilterConfThunk: vi.fn(() => ({ type: 'filterConf/saveStub' })),
}));
import { saveFilterConfThunk } from './filterConfThunk';

const makeStore = () => {
    const listener = createFilterConfListener();
    const store = configureStore({
        reducer: { tasks: taskSlice },
        middleware: (gdm) => gdm({ serializableCheck: false }).prepend(listener.middleware),
    });
    store.dispatch(login({ id: 'user123', email: 'a@b.c' }));
    return store;
};

describe('filterConfListener', () => {
    let store;
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        store = makeStore();
    });
    afterEach(() => vi.useRealTimers());

    it.each([
        ['setTaskFilter',    () => setTaskFilter({ filter: 'lundi' })],
        ['setFilterGeneric', () => setFilterGeneric({ status: ['todo'] })],
        ['setFilterSlot',    () => setFilterSlot('today')],
    ])('%s déclenche la sauvegarde après le délai', async (_, makeAction) => {
        store.dispatch(makeAction());
        expect(saveFilterConfThunk).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(FILTER_CONF_SAVE_DELAY);

        expect(saveFilterConfThunk).toHaveBeenCalledTimes(1);
    });

    it('regroupe plusieurs changements rapprochés en une seule sauvegarde', async () => {
        store.dispatch(setTaskFilter({ filter: 'l' }));
        await vi.advanceTimersByTimeAsync(FILTER_CONF_SAVE_DELAY / 2);
        store.dispatch(setTaskFilter({ filter: 'lu' }));
        await vi.advanceTimersByTimeAsync(FILTER_CONF_SAVE_DELAY / 2);
        expect(saveFilterConfThunk).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(FILTER_CONF_SAVE_DELAY);

        expect(saveFilterConfThunk).toHaveBeenCalledTimes(1);
    });

    it('la restauration (setFilterConf) ne déclenche pas de sauvegarde', async () => {
        store.dispatch(setFilterConf({ expression: 'x', slots: [], genericFilters: {} }));
        await vi.advanceTimersByTimeAsync(FILTER_CONF_SAVE_DELAY * 2);
        expect(saveFilterConfThunk).not.toHaveBeenCalled();
    });

    it('les filtres non persistés (isMulti, taskId) ne déclenchent pas de sauvegarde', async () => {
        store.dispatch(setFilterIsMulti({ filter: true }));
        store.dispatch(setFilterTaskId(5));
        await vi.advanceTimersByTimeAsync(FILTER_CONF_SAVE_DELAY * 2);
        expect(saveFilterConfThunk).not.toHaveBeenCalled();
    });
});
