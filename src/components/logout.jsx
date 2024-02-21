import { useDispatch, useSelector } from "react-redux";
import Button from "./button";
import { supabase } from '../extserv/supabase'
import { removeAccessToken, removeUser } from "../extserv/browser-storage";
import { logout } from "../features/taskSlice";

export default function Logout() {

    const dispatch = useDispatch();
    const email = useSelector(state => state.tasks.user.email);

    async function logoutHandler() {
        await supabase.auth.signOut()
        removeUser()
        removeAccessToken()
        dispatch(logout())
    }

    return <div><div>{email}</div><Button clickToto={logoutHandler} label="Se déconnecter" /></div>
}