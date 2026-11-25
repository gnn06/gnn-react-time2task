import { setFilterConf } from "./taskSlice";
import { apiSlice } from './apiSlice';
import { createFilterConfig } from '../components/task-filter';
import { serializeFilterConf, restoreFilterConf } from '../data/filter-conf';

export const FILTER_CONF_KEY = 'filterconf';

export const saveFilterConfThunk = () => async (dispatch, getState) => {
    const state = getState();
    const userId = state.tasks.user?.id;
    if (!userId) return;

    try {
        await dispatch(
            apiSlice.endpoints.upsertUserConf.initiate({
                userId,
                conf: FILTER_CONF_KEY,
                value: { filterConf: serializeFilterConf(state.tasks.currentFilter) },
            })
        ).unwrap();
    } catch (err) {
        console.error('Échec persistance filtres :', err);
    }
};

/**
 * Restaure les filtres depuis la valeur persistée (lue par loadAllUserConfThunk). À appeler après la
 * restauration de la vue : les prédicats (isImprecise) dépendent du niveau max de la vue, et la
 * validité du filtre activité dépend des activités existantes.
 * Sans valeur persistée, le filtre courant est conservé.
 */
export const restoreFilterConfThunk = (value) => async (dispatch, getState) => {
    if (!value) return;

    const activitiesPromise = dispatch(apiSlice.endpoints.getActivities.initiate());
    const { data: activities } = await activitiesPromise;
    activitiesPromise.unsubscribe();

    const levelMaxIncluded = getState().tasks.slotViewFilterConf.levelMaxIncluded;
    const filterConfig = createFilterConfig(activities ?? [], levelMaxIncluded);
    dispatch(setFilterConf(restoreFilterConf(value.filterConf ?? value, filterConfig)));
};
