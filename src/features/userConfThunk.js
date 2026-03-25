import { setSlotViewFilterConfView, setSlotViewFilterConf } from "./taskSlice";
import { apiSlice } from './apiSlice';

const selectConf = (state) => state.tasks.slotViewFilterConf;

export const saveUserConfThunk = () => async (dispatch, getState) => {
    const state = getState();
    const userId = state.tasks.user?.id;
    if (!userId) return;

    try {
        await dispatch(
            apiSlice.endpoints.upsertUserConf.initiate({
            userId,
            conf: 'slotviewconf',
            value: { slotViewFilterConf: selectConf(state) },
            })
        ).unwrap();
    } catch (err) {
        console.error('Échec persistance conf :', err);
    }
    
};

export const loadUserConfThunk = (userId) => async (dispatch) => {
  const promise = dispatch(
    apiSlice.endpoints.getUserConf.initiate(
      { userId, conf: 'slotviewconf' },
      { forceRefetch: true }
    )
  );
  const { data, error } = await promise;
  promise.unsubscribe();

  if (error) {
    console.error('Échec chargement conf :', error);
    return;
  }
  if (data) {
    // L'API retourne { slotViewFilterConf: {...} }, on extrait la configuration
    const conf = data.slotViewFilterConf || data;
    dispatch(setSlotViewFilterConf({conf}));
  }
};