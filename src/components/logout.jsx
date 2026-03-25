import { useDispatch, useSelector } from "react-redux";
import { supabase } from '../services/supabase'
import { localRemoveAccessToken, localRemoveUser } from "../services/browser-storage";
import { logout } from "../features/taskSlice";
import { Button } from "@mui/material";

export default function Logout() {

    const dispatch = useDispatch();
    const email = useSelector(state => state.tasks.user.email);

    async function logoutHandler() {
        await supabase.auth.signOut()
        localRemoveUser()
        localRemoveAccessToken()
        dispatch(logout())
    }

    return <><span>{email}</span> <Button variant="outlined" size="small" onClick={logoutHandler}>Se déconnecter</Button>
    </>
}