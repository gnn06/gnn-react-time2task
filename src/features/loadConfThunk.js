import { apiSlice } from './apiSlice';
import { setUserConfLoaded } from './taskSlice';
import { VIEW_CONF_KEY, restoreViewConfThunk } from './userConfThunk';
import { FILTER_CONF_KEY, restoreFilterConfThunk } from './filterConfThunk';

/**
 * Charge toute la conf utilisateur (vue + filtres) en un seul appel, puis la restaure.
 * L'ordre compte : les filtres sont reconstruits avec le niveau max de la vue, restaurée en premier.
 * userConfLoaded passe à true quoi qu'il arrive (erreur comprise) pour ne pas bloquer l'AppLoader.
 */
export const loadAllUserConfThunk = (userId) => async (dispatch) => {
    try {
        const promise = dispatch(
            apiSlice.endpoints.getUserConfs.initiate(
                { userId, confs: [VIEW_CONF_KEY, FILTER_CONF_KEY] },
                { forceRefetch: true }
            )
        );
        const { data, error } = await promise;
        promise.unsubscribe();

        if (error) {
            console.error('Échec chargement conf :', error);
            return;
        }
        await dispatch(restoreViewConfThunk(data?.[VIEW_CONF_KEY]));
        await dispatch(restoreFilterConfThunk(data?.[FILTER_CONF_KEY]));
    } catch (err) {
        console.error('Échec restauration conf :', err);
    } finally {
        dispatch(setUserConfLoaded(true));
    }
};
