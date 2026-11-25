import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

import { setTaskFilter, setFilterGeneric, setFilterSlot } from './taskSlice';
import { saveFilterConfThunk } from './filterConfThunk';

export const FILTER_CONF_SAVE_DELAY = 500;

/**
 * Persiste les filtres à chaque changement de la partie persistée (expression, slots, genericFilters),
 * quel que soit le composant qui le provoque. Le délai regroupe les changements rapprochés.
 * setFilterConf (restauration) n'est volontairement pas écouté.
 */
export function createFilterConfListener() {
    const listener = createListenerMiddleware();
    listener.startListening({
        matcher: isAnyOf(setTaskFilter, setFilterGeneric, setFilterSlot),
        effect: async (_action, listenerApi) => {
            listenerApi.cancelActiveListeners();
            await listenerApi.delay(FILTER_CONF_SAVE_DELAY);
            listenerApi.dispatch(saveFilterConfThunk());
        },
    });
    return listener;
}
