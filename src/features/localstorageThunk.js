import { localRetrieveAccessToken, localRetrieveUser } from "../services/browser-storage";
import { login } from "./taskSlice";

export const loadLocalStorageThunk = () => async (dispatch) => {
    const user = localRetrieveUser();
    dispatch(login(user));
    const accessToken = localRetrieveAccessToken();
    dispatch({ type: 'auth/setAccessToken', payload: accessToken });
}