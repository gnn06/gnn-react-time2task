import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

import { setTaskFilter, setFilterGeneric, setFilterSlot } from './taskSlice';
import { saveFilterConfThunk } from './filterConfThunk';

export const FILTER_CONF_SAVE_DELAY = 500;

/**
 * Persiste les filtres à chaque changement de la partie persistée (expression, slots, genericFilters),
 * quel que soit le composant qui le provoque. Le délai regroupe les changements rapprochés.
 * setFilterConf (restauration) n'est volontairement pas écouté.
 *
 * ÉCART CONNU : la persistance de la vue (saveUserConfThunk) est déclenchée explicitement par les
 * composants (slot-panel.jsx), alors que celle des filtres passe par ce listener. Le listener a été
 * choisi car les filtres sont modifiés à plusieurs endroits (barre de recherche, menu Filtres,
 * sélecteur de créneau) et que la saisie nécessite un debounce.
 * À harmoniser plus tard : soit tout en listener, soit tout en appel explicite.
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
