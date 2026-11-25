import { setFilterConf } from "./taskSlice";
import { apiSlice } from './apiSlice';
import { createFilterConfig } from '../components/task-filter';
import { serializeFilterConf, restoreFilterConf } from '../data/filter-conf';

const CONF_KEY = 'filterconf';

export const saveFilterConfThunk = () => async (dispatch, getState) => {
    const state = getState();
    const userId = state.tasks.user?.id;
    if (!userId) return;

    try {
        await dispatch(
            apiSlice.endpoints.upsertUserConf.initiate({
                userId,
                conf: CONF_KEY,
                value: { filterConf: serializeFilterConf(state.tasks.currentFilter) },
            })
        ).unwrap();
    } catch (err) {
        console.error('Échec persistance filtres :', err);
    }
};

/**
 * À appeler après loadUserConfThunk : les prédicats (isImprecise) dépendent du niveau max de la vue,
 * et la validité du filtre activité dépend des activités existantes.
 */
export const loadFilterConfThunk = (userId) => async (dispatch, getState) => {
    const confPromise = dispatch(
        apiSlice.endpoints.getUserConf.initiate({ userId, conf: CONF_KEY }, { forceRefetch: true })
    );
    const { data, error } = await confPromise;
    confPromise.unsubscribe();

    if (error) {
        console.error('Échec chargement filtres :', error);
        return;
    }
    if (!data) return;

    const activitiesPromise = dispatch(apiSlice.endpoints.getActivities.initiate());
    const { data: activities } = await activitiesPromise;
    activitiesPromise.unsubscribe();

    const levelMaxIncluded = getState().tasks.slotViewFilterConf.levelMaxIncluded;
    const filterConfig = createFilterConfig(activities ?? [], levelMaxIncluded);
    dispatch(setFilterConf(restoreFilterConf(data.filterConf ?? data, filterConfig)));
};
