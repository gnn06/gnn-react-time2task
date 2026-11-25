import { loadUserConfThunk } from './userConfThunk';
import { loadFilterConfThunk } from './filterConfThunk';

/**
 * Charge toute la conf utilisateur. L'ordre compte : les filtres sont reconstruits
 * avec le niveau max de la vue, qui doit donc être chargé en premier.
 */
export const loadAllUserConfThunk = (userId) => async (dispatch) => {
    await dispatch(loadUserConfThunk(userId));
    await dispatch(loadFilterConfThunk(userId));
};
