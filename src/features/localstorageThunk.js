import { localRetrieveAccessToken, localRetrieveUser } from "../services/browser-storage";
import { login, accessToken as setAccessToken } from "./taskSlice";

export const loadLocalStorageThunk = () => async (dispatch) => {
    const user = localRetrieveUser();
    dispatch(login(user));
    const token = localRetrieveAccessToken();
    dispatch(setAccessToken(token));
}