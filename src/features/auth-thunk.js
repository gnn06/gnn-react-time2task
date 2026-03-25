import { supabase } from '../services/supabase'

import { accessToken, login } from './taskSlice'
import { loadUserConfThunk } from './userConfThunk';
import { localStoreAccessToken, localStoreUser } from '../services/browser-storage'

export const loginThunk = (email, password) => async (dispatch) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // 1. Stocker le token
  localStoreAccessToken(data.session.access_token);
  dispatch(accessToken(data.session.access_token));

  // 2. Stocker l'user
  localStoreUser(data.user.id, data.user.email);
  dispatch(login(data.user));

  // 3. Charger la conf depuis l'API
  await dispatch(loadUserConfThunk(data.user.id));
};