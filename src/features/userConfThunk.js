import { setSlotViewFilterConf } from "./taskSlice";
import { apiSlice } from './apiSlice';

export const VIEW_CONF_KEY = 'slotviewconf';

const selectConf = (state) => state.tasks.slotViewFilterConf;

export const saveUserConfThunk = () => async (dispatch, getState) => {
    const state = getState();
    const userId = state.tasks.user?.id;
    if (!userId) return;

    try {
        await dispatch(
            apiSlice.endpoints.upsertUserConf.initiate({
            userId,
            conf: VIEW_CONF_KEY,
            value: { slotViewFilterConf: selectConf(state) },
            })
        ).unwrap();
    } catch (err) {
        console.error('Échec persistance conf :', err);
    }

};

/**
 * Restaure la conf de vue depuis la valeur persistée (lue par loadAllUserConfThunk).
 * Sans valeur persistée, la conf par défaut est conservée.
 */
export const restoreViewConfThunk = (value) => async (dispatch) => {
  if (!value) return;
  // La valeur persistée est { slotViewFilterConf: {...} }, on extrait la configuration
  const conf = value.slotViewFilterConf || value;
  dispatch(setSlotViewFilterConf({conf}));
};
